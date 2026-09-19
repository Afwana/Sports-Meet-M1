import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import Games from "@/models/Games";

export async function GET() {
  try {
    await connectDB();

    const captain = await getCurrentEmployee();

    if (!captain.isCaptain) {
      return NextResponse.json(
        {
          success: false,
          message: "Only captains can access group games.",
        },
        { status: 403 },
      );
    }

    const games = await Games.find({
      type: "Group",
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(games);
  } catch (error) {
    console.error("Group games error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load group games.",
      },
      { status: 500 },
    );
  }
}
