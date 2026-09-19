import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Teams from "@/models/Teams";

export async function GET() {
  try {
    await connectDB();

    const teams = await Teams.find({
      isActive: true,
    })
      .select("_id name color logo")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Teams fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load teams.",
      },
      { status: 500 },
    );
  }
}
