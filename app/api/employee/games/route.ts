import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";

export async function GET() {
  try {
    await connectDB();

    const games = await Games.find({
      isActive: true,
    })
      .sort({
        category: 1,
        name: 1,
        gender: 1,
      })
      .lean();

    return NextResponse.json(games);
  } catch (error) {
    console.error("Employee games GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load games.",
      },
      { status: 500 },
    );
  }
}
