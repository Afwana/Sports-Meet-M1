import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import { MongoServerError } from "mongodb";

export async function GET() {
  await connectDB();

  const games = await Games.find({ isActive: true }).sort({
    category: 1,
    name: 1,
  });

  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (body.category !== "Sports" && body.category !== "Games") {
      body.ageCategory = "Open";
    }

    const game = await Games.create(body);

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("CREATE GAME ERROR:", error);

    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A game with the same Name, Category, Type, Gender and Age Category already exists.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create game.",
      },
      { status: 500 },
    );
  }
}
