import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Games from "@/models/Games";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import MarathonResult from "@/models/MarathonResult";

export async function GET() {
  try {
    await connectDB();

    await getCurrentAdmin();

    const [
      totalEmployees,
      totalTeams,
      totalGames,
      individualGameIds,
      groupGameIds,
      marathonGameIds,
    ] = await Promise.all([
      Employee.countDocuments({}),
      Teams.countDocuments({}),
      Games.countDocuments({}),
      IndividualResult.distinct("game"),
      GroupResult.distinct("game"),
      MarathonResult.distinct("game"),
    ]);

    // A game is "completed" once a result has been added for it.
    const resultGameIds = [
      ...new Set(
        [...individualGameIds, ...groupGameIds, ...marathonGameIds].map(String),
      ),
    ];

    const completedGames = await Games.countDocuments({
      _id: { $in: resultGameIds },
    });

    return NextResponse.json({
      success: true,
      totalEmployees,
      totalTeams,
      totalGames,
      completedGames,
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
