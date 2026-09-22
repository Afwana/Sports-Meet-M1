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

  // const published = await MarathonResult.findOne({
  //   game: gameId,
  //   published: true,
  // }).lean();

  const teams = await Teams.find({ isActive: true }).select("_id name").lean();

  const registrations = await IndividualRegistration.find({
    "games.gameId": gameId,
  })
    .populate({
      path: "employee",
      select: "_id employeeName employeeCode",
    })
    .select("teamId employee")
    .lean();

  const published = await MarathonResult.findOne({
    game: gameId,
  }).lean();

  const selectedMap = new Map();

  if (published) {
    for (const team of published.teams) {
      selectedMap.set(
        String(team.team),
        team.selectedEmployees?.map(String) ?? [],
      );
    }
  }

  const teamsData = teams.map((team) => {
    const employees = registrations
      .filter((r) => String(r.teamId) === String(team._id))
      .map((r) => ({
        id: String(r.employee._id),
        employeeName: r.employee.employeeName,
        employeeCode: r.employee.employeeCode,
      }));

    return {
      teamId: String(team._id),
      teamName: team.name,
      employees,
      selectedEmployees: selectedMap.get(String(team._id)) ?? [],
    };
  });

  return NextResponse.json({
    success: true,
    teams: teamsData,
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

  // const teams = await Teams.find({ isActive: true }).select("_id name").lean();

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

  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = body.teams.map((team: any) => ({
    team: team.teamId,
    teamName: team.teamName,
    selectedEmployees: team.selectedEmployees,
    participants: team.selectedEmployees.length,
    points: team.selectedEmployees.length,
  }));

  await MarathonResult.findOneAndUpdate(
    { game: gameId },
    {
      game: gameId,
      published: true,
      teams: results,
    },
    {
      upsert: true,
      new: true,
    },
  );

  return NextResponse.json({
    success: true,

    message: "Marathon participation points published.",
  });
}
