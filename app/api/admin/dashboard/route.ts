import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Games from "@/models/Games";

export async function GET() {
  try {
    await connectDB();

    await getCurrentAdmin();

    const [totalEmployees, totalTeams, totalGames] = await Promise.all([
      Employee.countDocuments({}),
      Teams.countDocuments({}),
      Games.countDocuments({}),
    ]);

    const resultPositions = 0;

    return NextResponse.json({
      success: true,
      totalEmployees,
      totalTeams,
      totalGames,
      resultPositions,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard.",
      },
      { status: 500 },
    );
  }
}
