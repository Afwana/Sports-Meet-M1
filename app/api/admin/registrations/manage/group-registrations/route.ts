import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { getAgeCategory } from "@/lib/getAgeCategory";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import GroupRegistration from "@/models/GroupRegistration";
import IndividualRegistration from "@/models/IndividualRegistration";
import Games from "@/models/Games";

function getGroupNumber(groupName: string) {
  const match = groupName.match(/Group\s+([A-Z]+)$/i);

  if (!match) return 0;

  let number = 0;

  for (const letter of match[1].toUpperCase()) {
    number = number * 26 + (letter.charCodeAt(0) - 64);
  }

  return number;
}

function numberToGroupName(number: number) {
  let name = "";

  while (number > 0) {
    number--;
    name = String.fromCharCode(65 + (number % 26)) + name;
    number = Math.floor(number / 26);
  }

  return `Group ${name}`;
}

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

    const registrations = await GroupRegistration.find({
      team: teamId,
      game: gameId,
    })
      .populate("game", "name maxParticipants")
      .populate("participants", "employeeName employeeCode")
      .sort({ createdAt: 1 })
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

    if (!gameId || !teamId || !Array.isArray(participants)) {
      return NextResponse.json(
        {
          success: false,
          message: "Game, team and participants are required.",
        },
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

    if (game.type !== "Group") {
      return NextResponse.json(
        { success: false, message: "Invalid group game." },
        { status: 400 },
      );
    }

    if (participants.length < game.minParticipants) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum ${game.minParticipants} participants required.`,
        },
        { status: 400 },
      );
    }

    if (
      game.maxParticipants !== null &&
      participants.length > game.maxParticipants
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${game.maxParticipants} participants allowed.`,
        },
        { status: 400 },
      );
    }

    const existingGroups = await GroupRegistration.find({
      game: game._id,
      team: team._id,
    });

    if (existingGroups.length >= game.maxTeamsPerCompetitionTeam) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${game.maxTeamsPerCompetitionTeam} groups allowed.`,
        },
        { status: 400 },
      );
    }

    const unique = [...new Set(participants.map(String))];

    const employees = await Employee.find({
      _id: { $in: unique },
      teamId: team._id,
    });

    if (employees.length !== unique.length) {
      return NextResponse.json(
        { success: false, message: "Invalid participants." },
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
            { success: false, message: `${emp.employeeName} is not eligible.` },
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
      for (const employeeId of unique) {
        const individualRegistrations = await IndividualRegistration.find({
          employee: employeeId,
        }).lean();

        const individualGameIds = individualRegistrations.flatMap(
          (registration) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            registration.games.map((g: any) => g.gameId),
        );

        const groupRegistrations = await GroupRegistration.find({
          participants: employeeId,
        })
          .select("game")
          .lean();

        const groupGameIds = groupRegistrations.map(
          (registration) => registration.game,
        );

        const gamesInCategory = await Games.countDocuments({
          _id: { $in: [...individualGameIds, ...groupGameIds] },
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

    const conflict = await GroupRegistration.findOne({
      game: game._id,
      team: team._id,
      participants: { $in: unique },
    });

    if (conflict) {
      return NextResponse.json(
        {
          success: false,
          message: "Some employees are already in another group.",
        },
        { status: 400 },
      );
    }

    const highest = existingGroups.reduce(
      (max, g) => Math.max(max, getGroupNumber(g.groupName)),
      0,
    );

    const registration = await GroupRegistration.create({
      game: game._id,
      team: team._id,
      groupName: numberToGroupName(highest + 1),
      participants: unique,
    });

    const populated = await GroupRegistration.findById(registration._id)
      .populate("game", "name")
      .populate("participants", "employeeName employeeCode");

    return NextResponse.json(
      { success: true, registration: populated },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create group." },
      { status: 500 },
    );
  }
}
