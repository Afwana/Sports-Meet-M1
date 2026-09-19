/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import Games from "@/models/Games";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { getAgeCategory } from "@/lib/getAgeCategory";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        { success: false, message: "Only captains can access employees." },
        { status: 403 },
      );
    }

    const gameId = req.nextUrl.searchParams.get("gameId");
    const editGroupId = req.nextUrl.searchParams.get("editGroupId");

    if (!gameId) {
      return NextResponse.json(
        { success: false, message: "Game ID required." },
        { status: 400 },
      );
    }

    // Get selected game
    const game = await Games.findById(gameId).lean();

    if (!game) {
      return NextResponse.json(
        { success: false, message: "Game not found." },
        { status: 404 },
      );
    }

    // Already assigned employees in THIS game
    const query: any = {
      game: gameId,
      team: captain.teamId,
    };

    if (editGroupId) {
      query._id = { $ne: editGroupId };
    }

    const groups = await GroupRegistration.find(query)
      .select("participants")
      .lean();

    const assigned = groups.flatMap((g: any) =>
      g.participants.map((id: any) => id.toString()),
    );

    // Base employee query
    let employees = await Employee.find({
      teamId: captain.teamId,
      _id: { $nin: assigned },
    })
      .select("_id employeeName employeeCode gender dateOfBirth team teamId")
      .sort({ employeeName: 1 })
      .lean();

    employees = employees.filter((emp: any) => {
      // Gender
      if (
        game.gender &&
        game.gender !== "Both" &&
        emp.gender?.toLowerCase() !== game.gender.toLowerCase()
      ) {
        return false;
      }

      // Age category
      if (
        game.category === "Sports" &&
        game.ageCategory !== "Open" &&
        getAgeCategory(emp.dateOfBirth) !== game.ageCategory
      ) {
        return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to load employees." },
      { status: 500 },
    );
  }
}
