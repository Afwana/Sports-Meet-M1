import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import Fixture from "@/models/Fixture";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import IndividualRegistration from "@/models/IndividualRegistration";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";

interface IncomingEntry {
  entryType: "Employee" | "Group";
  employee?: string;
  group?: string;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid fixture ID" },
        { status: 400 },
      );
    }

    const existing = await Fixture.findById(id);

    if (!existing) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      roundNumber,
      roundName,
      fixtureName,
      fixtureNumber,
      venue,
      scheduledAt,
      status,
      entries,
    } = body as {
      roundNumber: number;
      roundName: string;
      fixtureName: string;
      fixtureNumber: number;
      venue?: string;
      scheduledAt?: string | null;
      status?: string;
      entries: IncomingEntry[];
    };

    if (!roundNumber || !roundName || !fixtureName || !fixtureNumber) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const duplicate = await Fixture.findOne({
      _id: { $ne: existing._id },
      game: existing.game,
      roundNumber,
      fixtureNumber,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: "That fixture number already exists in this round",
        },
        { status: 409 },
      );
    }

    const game = await Games.findById(existing.game);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
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
            { error: "Employee ID is missing" },
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
              error: `${employee.employeeName} is not registered for this game`,
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
            { error: "Group ID is missing" },
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

    existing.roundNumber = roundNumber;
    existing.roundName = roundName;
    existing.fixtureName = fixtureName;
    existing.fixtureNumber = fixtureNumber;
    existing.venue = venue ?? "";
    existing.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    existing.status = status ?? "Scheduled";
    existing.entries = fixtureEntries;

    await existing.save();

    const populated = await Fixture.findById(existing._id)
      .populate("game", "name type")
      .populate("entries.employee", "_id employeeCode employeeName")
      .populate("entries.group", "_id groupName participants")
      .populate("entries.team", "_id name")
      .lean();

    return NextResponse.json(populated);
  } catch (error) {
    console.error("PATCH fixture error:", error);

    return NextResponse.json(
      { error: "Failed to update fixture" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid fixture ID" },
        { status: 400 },
      );
    }

    const fixture = await Fixture.findById(id);

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    await fixture.deleteOne();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE fixture error:", error);

    return NextResponse.json(
      { error: "Failed to delete fixture" },
      { status: 500 },
    );
  }
}
