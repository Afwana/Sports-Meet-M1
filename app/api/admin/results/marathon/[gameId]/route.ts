import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

import Games from "@/models/Games";
import Teams from "@/models/Teams";
import IndividualRegistration from "@/models/IndividualRegistration";
import MarathonResult from "@/models/MarathonResult";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  await connectDB();

  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { gameId } = await params;

  const game = await Games.findById(gameId);

  if (!game) {
    return NextResponse.json(
      { success: false, message: "Game not found." },
      { status: 404 },
    );
  }

  const published = await MarathonResult.findOne({
    game: gameId,
    published: true,
  }).lean();

  const teams = await Teams.find({ isActive: true }).select("_id name").lean();

  const registrations = await IndividualRegistration.find({
    "games.gameId": gameId,
  })
    .select("teamId")
    .lean();

  const counts = new Map<string, number>();

  for (const registration of registrations) {
    const id = String(registration.teamId);

    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return NextResponse.json({
    success: true,

    published: !!published,

    teams: teams.map((team) => ({
      teamId: String(team._id),

      teamName: team.name,

      participants: counts.get(String(team._id)) ?? 0,

      points: counts.get(String(team._id)) ?? 0,
    })),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  await connectDB();

  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { gameId } = await params;

  const game = await Games.findById(gameId);

  if (!game) {
    return NextResponse.json(
      { success: false, message: "Game not found." },
      { status: 404 },
    );
  }

  const teams = await Teams.find({ isActive: true }).select("_id name").lean();

  const registrations = await IndividualRegistration.find({
    "games.gameId": gameId,
  })
    .select("teamId")
    .lean();

  const counts = new Map<string, number>();

  for (const registration of registrations) {
    const id = String(registration.teamId);

    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const teamResults = teams.map((team) => ({
    team: team._id,

    teamName: team.name,

    participants: counts.get(String(team._id)) ?? 0,

    points: counts.get(String(team._id)) ?? 0,
  }));

  await MarathonResult.findOneAndUpdate(
    {
      game: gameId,
    },
    {
      game: gameId,

      published: true,

      teams: teamResults,
    },
    {
      upsert: true,

      returnDocument: "after",
    },
  );

  return NextResponse.json({
    success: true,

    message: "Marathon participation points published.",
  });
}
