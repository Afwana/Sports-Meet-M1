import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualRegistration from "@/models/IndividualRegistration";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import Games from "@/models/Games";
import Settings from "@/models/Settings";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { getAgeCategory } from "@/lib/getAgeCategory";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        {
          success: false,
          message: "Only captains can access registrations.",
        },
        { status: 403 },
      );
    }

    const gameId = req.nextUrl.searchParams.get("gameId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      teamId: captain.teamId,
    };

    if (gameId) {
      filter["games.gameId"] = gameId;
    }

    const registrations = await IndividualRegistration.find(filter)
      .populate("employee", "employeeName employeeCode")
      .sort({ employeeName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load registrations.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        {
          success: false,
          message: "Only captains can create registrations.",
        },
        { status: 403 },
      );
    }

    const settings = await Settings.findOne().lean();

    if (!settings?.registrationOpen) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration is currently closed.",
        },
        { status: 400 },
      );
    }

    const { gameId, participants } = await req.json();

    if (!gameId) {
      return NextResponse.json(
        {
          success: false,
          message: "Game ID is required.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Select at least one employee.",
        },
        { status: 400 },
      );
    }

    const team = await Teams.findById(captain.teamId);
    const game = await Games.findById(gameId);

    if (!team || !game) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid game or team.",
        },
        { status: 404 },
      );
    }

    if (game.type !== "Individual") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid individual game.",
        },
        { status: 400 },
      );
    }

    const uniqueParticipants = [...new Set(participants.map(String))];

    if (uniqueParticipants.length > game.maxParticipantsPerTeam) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${game.maxParticipantsPerTeam} participants allowed from your team.`,
        },
        { status: 400 },
      );
    }

    const employees = await Employee.find({
      _id: { $in: uniqueParticipants },
      teamId: captain.teamId,
    });

    if (employees.length !== uniqueParticipants.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employees selected.",
        },
        { status: 400 },
      );
    }

    if (game.category === "Sports" && game.ageCategory !== "Open") {
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
    };

    const limit = categoryLimits[game.category as keyof typeof categoryLimits];

    if (limit) {
      for (const employeeId of participants) {
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

    const totalRegistered = await IndividualRegistration.countDocuments({
      "games.gameId": game._id,
    });

    if (totalRegistered + uniqueParticipants.length > game.maxParticipants) {
      return NextResponse.json(
        {
          success: false,
          message: "Game has reached maximum participants.",
        },
        { status: 400 },
      );
    }

    const existing = await IndividualRegistration.find({
      employee: { $in: uniqueParticipants },
      "games.gameId": game._id,
    });

    if (existing.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Some employees are already registered.",
        },
        { status: 400 },
      );
    }

    const registrations = await IndividualRegistration.insertMany(
      employees.map((emp) => ({
        employee: emp._id,
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        teamId: captain.teamId,
        team: captain.team,
        games: [
          {
            gameId: game._id,
            gameName: game.name,
          },
        ],
      })),
    );

    return NextResponse.json(
      {
        success: true,
        registrations,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create registration.",
      },
      { status: 500 },
    );
  }
}
