import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import { MongoServerError } from "mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (body.category !== "Sports" && body.category !== "Games") {
      body.ageCategory = "Open";
    }

    const game = await Games.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "Game not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Game PATCH error:", error);

    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another game with the same Name, Category, Type, Gender and Age Category already exists.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update game.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const game = await Games.findByIdAndDelete(id);

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          message: "Game not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error.",
      },
      { status: 500 },
    );
  }
}
