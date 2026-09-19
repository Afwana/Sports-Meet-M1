import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import GroupRegistration from "@/models/GroupRegistration";
import Games from "@/models/Games";
import Settings from "@/models/Settings";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { getAgeCategory } from "@/lib/getAgeCategory";

function getGroupNumber(groupName: string) {
  const match = groupName.match(/Group\s+([A-Z]+)$/i);

  if (!match) return 0;

  const letters = match[1].toUpperCase();

  let number = 0;

  for (const letter of letters) {
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
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        { success: false, message: "Only captains can access registrations." },
        { status: 403 },
      );
    }

    const gameId = req.nextUrl.searchParams.get("gameId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      team: captain.teamId,
    };

    // Filter only when gameId is passed
    if (gameId) {
      filter.game = gameId;
    }

    const registrations = await GroupRegistration.find(filter)
      .populate("game", "name maxParticipants")
      .populate("participants", "employeeName employeeCode")
      .sort({ game: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to load registrations." },
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
        { success: false, message: "Only captains can create groups." },
        { status: 403 },
      );
    }

    const settings = await Settings.findOne().lean();

    if (!settings?.registrationOpen) {
      return NextResponse.json(
        { success: false, message: "Registration is closed." },
        { status: 400 },
      );
    }

    const { gameId, participants } = await req.json();

    const team = await Teams.findById(captain.teamId);
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

    if (participants.length > game.maxParticipants) {
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
      team: captain.teamId,
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
      teamId: captain.teamId,
    });

    if (employees.length !== unique.length) {
      return NextResponse.json(
        { success: false, message: "Invalid participants." },
        { status: 400 },
      );
    }

    if (game.category === "Sports" && game.ageCategory !== "Open") {
      for (const emp of employees) {
        if (getAgeCategory(emp.dateOfBirth) !== game.ageCategory) {
          return NextResponse.json(
            {
              success: false,
              message: `${emp.employeeName} is not eligible.`,
            },
            { status: 400 },
          );
        }
      }
    }

    const conflict = await GroupRegistration.findOne({
      game: game._id,
      team: captain.teamId,
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
      team: captain.teamId,
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
