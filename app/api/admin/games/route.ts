import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";

export async function GET() {
  await connectDB();

  const games = await Games.find({ isActive: true }).sort({
    category: 1,
    name: 1,
  });

  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();

  if (body.category !== "Sports") {
    body.ageCategory = "Open";
  }

  const game = await Games.create(body);

  return NextResponse.json(game, { status: 201 });
}
