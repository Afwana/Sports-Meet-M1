import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { getAgeCategory } from "@/lib/getAgeCategory";
import IndividualRegistration from "@/models/IndividualRegistration";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import Games from "@/models/Games";

export async function GET(req: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
  }

  try {
    await connectDB();

    const gameId = req.nextUrl.searchParams.get("gameId");
    const teamId = req.nextUrl.searchParams.get("teamId");

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, message: "Game and team are required." },
        { status: 400 },
      );
    }

    const registrations = await IndividualRegistration.find({
      teamId,
      "games.gameId": gameId,
    })
      .populate("employee", "employeeName employeeCode")
      .sort({ employeeName: 1 })
      .lean();

    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to load registrations." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
  }

  try {
    await connectDB();

    const { gameId, teamId, participants } = await req.json();

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, message: "Game and team are required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { success: false, message: "Select at least one employee." },
        { status: 400 },
      );
    }

    const team = await Teams.findById(teamId);
    const game = await Games.findById(gameId);

    if (!team || !game) {
      return NextResponse.json(
        { success: false, message: "Invalid game or team." },
        { status: 404 },
      );
    }

    if (game.type !== "Individual") {
      return NextResponse.json(
        { success: false, message: "Invalid individual game." },
        { status: 400 },
      );
    }

    const uniqueParticipants = [...new Set(participants.map(String))];

    if (
      game.maxParticipantsPerTeam !== null &&
      game.maxParticipantsPerTeam !== undefined &&
      uniqueParticipants.length > game.maxParticipantsPerTeam
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${game.maxParticipantsPerTeam} participants allowed from this team.`,
        },
        { status: 400 },
      );
    }

    const employees = await Employee.find({
      _id: { $in: uniqueParticipants },
      teamId: team._id,
    });

    if (employees.length !== uniqueParticipants.length) {
      return NextResponse.json(
        { success: false, message: "Invalid employees selected." },
        { status: 400 },
      );
    }

    if (
      (game.category === "Sports" || game.category === "Games") &&
      game.ageCategory !== "Open"
    ) {
      for (const emp of employees) {
        if (getAgeCategory(emp.dateOfBirth) !== game.ageCategory) {
          return NextResponse.json(
            {
              success: false,
              message: `${emp.employeeName} is not eligible for ${game.ageCategory}.`,
            },
            { status: 400 },
          );
        }
      }
    }

    const categoryLimits = {
      Stage: 2,
      "Off Stage": 4,
      Sports: 3,
    };

    const limit = categoryLimits[game.category as keyof typeof categoryLimits];

    if (limit) {
      for (const employeeId of uniqueParticipants) {
        const registrations = await IndividualRegistration.find({
          employee: employeeId,
        }).lean();

        const registeredGameIds = registrations.flatMap((r) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          r.games.map((g: any) => g.gameId),
        );

        const gamesInCategory = await Games.countDocuments({
          _id: { $in: registeredGameIds },
          category: game.category,
        });

        if (gamesInCategory >= limit) {
          const employee =
            await Employee.findById(employeeId).select("employeeName");

          return NextResponse.json(
            {
              success: false,
              message: `${employee?.employeeName} has already registered for ${limit} ${game.category} items.`,
            },
            { status: 400 },
          );
        }
      }
    }

    if (game.maxParticipants) {
      const totalRegistered = await IndividualRegistration.countDocuments({
        "games.gameId": game._id,
      });

      if (totalRegistered + uniqueParticipants.length > game.maxParticipants) {
        return NextResponse.json(
          { success: false, message: "Game has reached maximum participants." },
          { status: 400 },
        );
      }
    }

    const existing = await IndividualRegistration.find({
      employee: { $in: uniqueParticipants },
      "games.gameId": game._id,
    });

    if (existing.length) {
      return NextResponse.json(
        { success: false, message: "Some employees are already registered." },
        { status: 400 },
      );
    }

    const inserted = await IndividualRegistration.insertMany(
      employees.map((emp) => ({
        employee: emp._id,
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        teamId: team._id,
        games: [{ gameId: game._id, gameName: game.name }],
      })),
    );

    const registrations = await IndividualRegistration.populate(inserted, {
      path: "employee",
      select: "employeeName employeeCode",
    });

    return NextResponse.json({ success: true, registrations }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create registration." },
      { status: 500 },
    );
  }
}
