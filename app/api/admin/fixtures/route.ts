/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Fixture from "@/models/Fixture";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import IndividualRegistration from "@/models/IndividualRegistration";
// import CompetitionTeam from "@/models/Teams";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";

interface IncomingEntry {
  entryType: "Employee" | "Group";
  employee?: string;
  group?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const gameId = request.nextUrl.searchParams.get("gameId");
    const roundNumber = request.nextUrl.searchParams.get("roundNumber");

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 },
      );
    }

    const filter: Record<string, unknown> = {
      game: gameId,
    };

    if (roundNumber) {
      filter.roundNumber = Number(roundNumber);
    }

    const fixtures = await Fixture.find(filter)
      .populate("game", "name type")
      .populate("entries.employee", "_id employeeCode employeeName")
      .populate("entries.group", "_id groupName participants")
      .populate("entries.team", "_id name")
      .sort({
        roundNumber: 1,
        fixtureNumber: 1,
      })
      .lean();

    const serialized = fixtures.map((fixture) => ({
      ...fixture,
      _id: fixture._id.toString(),

      game: fixture.game
        ? {
            _id: fixture.game._id.toString(),
            name: fixture.game.name,
            type: fixture.game.type,
          }
        : null,

      entries: fixture.entries.map((entry: any) => ({
        ...entry,
        _id: entry._id.toString(),

        employee: entry.employee
          ? {
              _id: entry.employee._id.toString(),
              employeeCode: entry.employee.employeeCode,
              employeeName: entry.employee.employeeName,
            }
          : null,

        group: entry.group
          ? {
              _id: entry.group._id.toString(),
              groupName: entry.group.groupName,
              participantCount: entry.group.participants?.length ?? 0,
            }
          : null,

        team: entry.team
          ? {
              _id: entry.team._id.toString(),
              name: entry.team.name,
            }
          : null,
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET fixtures error:", error);

    return NextResponse.json(
      { error: "Failed to load fixtures" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      gameId,
      roundNumber,
      roundName,
      fixtureName,
      fixtureNumber,
      venue,
      scheduledAt,
      status,
      entries,
    } = body as {
      gameId: string;
      roundNumber: number;
      roundName: string;
      fixtureName: string;
      fixtureNumber: number;
      venue?: string;
      scheduledAt?: string | null;
      status?: string;
      entries: IncomingEntry[];
    };

    if (
      !gameId ||
      !roundNumber ||
      !roundName ||
      !fixtureName ||
      !fixtureNumber
    ) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const game = await Games.findById(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const existingFixture = await Fixture.findOne({
      game: game._id,
      roundNumber,
      fixtureNumber,
    });

    if (existingFixture) {
      return NextResponse.json(
        {
          error: `Fixture ${fixtureNumber} already exists in ${roundName}`,
        },
        { status: 409 },
      );
    }

    if (!Array.isArray(entries) || entries.length < 2) {
      return NextResponse.json(
        {
          error: "A fixture must contain at least two registered entries",
        },
        { status: 400 },
      );
    }

    const fixtureEntries = [];

    for (const entry of entries) {
      if (entry.entryType === "Employee") {
        if (!entry.employee) {
          return NextResponse.json(
            { error: "Employee entry is missing employee ID" },
            { status: 400 },
          );
        }

        const employee = await Employee.findById(entry.employee).lean();

        if (!employee) {
          return NextResponse.json(
            { error: "Employee not found" },
            { status: 404 },
          );
        }

        const registration = await IndividualRegistration.findOne({
          employee: employee._id,
          "games.gameId": game._id,
        }).lean();

        if (!registration) {
          return NextResponse.json(
            {
              error: `${employee.employeeName} is not registered for ${game.name}`,
            },
            { status: 400 },
          );
        }

        if (!employee.teamId) {
          return NextResponse.json(
            {
              error: `${employee.employeeName} has no assigned team`,
            },
            { status: 400 },
          );
        }

        fixtureEntries.push({
          entryType: "Employee",
          employee: employee._id,
          group: null,
          team: employee.teamId,
        });
      }

      if (entry.entryType === "Group") {
        if (!entry.group) {
          return NextResponse.json(
            { error: "Group entry is missing group ID" },
            { status: 400 },
          );
        }

        const group = await GroupRegistration.findOne({
          _id: entry.group,
          game: game._id,
        }).lean();

        if (!group) {
          return NextResponse.json(
            {
              error: "Group registration not found for this game",
            },
            { status: 404 },
          );
        }

        fixtureEntries.push({
          entryType: "Group",
          employee: null,
          group: group._id,
          team: group.team,
        });
      }
    }

    const fixture = await Fixture.create({
      game: game._id,
      roundNumber,
      roundName,
      fixtureName,
      fixtureNumber,
      venue: venue ?? "",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: status ?? "Scheduled",
      entries: fixtureEntries,
    });

    const populated = await Fixture.findById(fixture._id)
      .populate("game", "name type")
      .populate("entries.employee", "_id employeeCode employeeName")
      .populate("entries.group", "_id groupName participants")
      .populate("entries.team", "_id name")
      .lean();

    return NextResponse.json(populated, {
      status: 201,
    });
  } catch (error) {
    console.error("POST fixture error:", error);

    if (error instanceof Error && error.message.includes("E11000")) {
      return NextResponse.json(
        {
          error: "That fixture number already exists in this round",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create fixture" },
      { status: 500 },
    );
  }
}
