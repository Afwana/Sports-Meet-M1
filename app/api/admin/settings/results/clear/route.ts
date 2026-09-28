import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import MarathonResult from "@/models/MarathonResult";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function DELETE() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const [individualResults, groupResults, marathonResults] =
      await Promise.all([
        IndividualResult.deleteMany({}),
        GroupResult.deleteMany({}),
        MarathonResult.deleteMany({}),
      ]);

    return NextResponse.json({
      success: true,
      message:
        "All individual, group and marathon results cleared successfully.",
      deleted: {
        individualResults: individualResults.deletedCount ?? 0,
        groupResults: groupResults.deletedCount ?? 0,
        marathonResults: marathonResults.deletedCount ?? 0,
      },
    });
  } catch (error) {
    console.error("CLEAR ALL RESULTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear all results.",
      },
      { status: 500 },
    );
  }
}
