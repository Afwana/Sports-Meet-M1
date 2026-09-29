/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { getAgeCategory } from "@/lib/getAgeCategory";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import Games from "@/models/Games";

export async function GET(req: NextRequest) {
  if (!(await requireAdminApi())) {
    return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
  }

  try {
    await connectDB();

    const gameId = req.nextUrl.searchParams.get("gameId");
    const teamIdParam = req.nextUrl.searchParams.get("teamId");
    const editGroupId = req.nextUrl.searchParams.get("editGroupId");

    if (!gameId) {
      return NextResponse.json(
        { success: false, message: "Game ID required." },
        { status: 400 },
      );
    }

    const game = await Games.findById(gameId).lean();

    if (!game) {
      return NextResponse.json(
        { success: false, message: "Game not found." },
        { status: 404 },
      );
    }

    let teamId = teamIdParam;

    if (!teamId && editGroupId) {
      const editing = await GroupRegistration.findById(editGroupId)
        .select("team")
        .lean();

      teamId = editing ? String(editing.team) : null;
    }

    if (!teamId) {
      return NextResponse.json(
        { success: false, message: "Team is required." },
        { status: 400 },
      );
    }

    const query: any = { game: gameId, team: teamId };

    if (editGroupId) {
      query._id = { $ne: editGroupId };
    }

    const groups = await GroupRegistration.find(query)
      .select("participants")
      .lean();

    const assigned = groups.flatMap((g: any) =>
      g.participants.map((id: any) => id.toString()),
    );

    let employees = await Employee.find({
      teamId,
      _id: { $nin: assigned },
    })
      .select("_id employeeName employeeCode gender dateOfBirth team teamId")
      .sort({ employeeName: 1 })
      .lean();

    employees = employees.filter((emp: any) => {
      if (game.gender && game.gender !== "Both" && emp.gender !== game.gender) {
        return false;
      }

      if (game.category === "Sports" || game.category === "Games") {
        if (
          game.ageCategory &&
          game.ageCategory !== "Open" &&
          getAgeCategory(emp.dateOfBirth) !== game.ageCategory
        ) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to load employees." },
      { status: 500 },
    );
  }
}
