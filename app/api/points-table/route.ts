/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import Teams from "@/models/Teams";

type TeamPoints = {
  teamId: string;
  teamName: string;
  first: number;
  second: number;
  third: number;
  totalPoints: number;
};

export async function GET() {
  try {
    await connectDB();

    const teams = await Teams.find({ isActive: true })
      .select("_id name")
      .lean();

    const teamMap = new Map<string, TeamPoints>();

    for (const team of teams) {
      teamMap.set(String(team._id), {
        teamId: String(team._id),
        teamName: team.name,
        first: 0,
        second: 0,
        third: 0,
        totalPoints: 0,
      });
    }

    const [individualResults, groupResults] = await Promise.all([
      IndividualResult.find({})
        .select("positions")
        .populate({ path: "positions.team", select: "_id name" })
        .lean(),

      GroupResult.find({})
        .select("positions")
        .populate({ path: "positions.team", select: "_id name" })
        .lean(),
    ]);

    const addTeamPoints = (positions: any[] = []) => {
      for (const pos of positions) {
        const team = pos.team as any;

        if (!team?._id) continue;

        const teamId = String(team._id);

        if (!teamMap.has(teamId)) {
          teamMap.set(teamId, {
            teamId,
            teamName: team.name ?? "Unknown Team",
            first: 0,
            second: 0,
            third: 0,
            totalPoints: 0,
          });
        }

        const data = teamMap.get(teamId)!;

        data.totalPoints += pos.points ?? 0;

        if (pos.position === 1) data.first++;
        if (pos.position === 2) data.second++;
        if (pos.position === 3) data.third++;
      }
    };

    individualResults.forEach((r: any) => addTeamPoints(r.positions));
    groupResults.forEach((r: any) => addTeamPoints(r.positions));

    const pointTable = Array.from(teamMap.values())
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints)
          return b.totalPoints - a.totalPoints;
        if (b.first !== a.first) return b.first - a.first;
        if (b.second !== a.second) return b.second - a.second;
        return b.third - a.third;
      })
      .map((team, index) => ({
        rank: index + 1,
        teamId: team.teamId,
        teamName: team.teamName,
        first: team.first,
        second: team.second,
        third: team.third,
        totalPoints: team.totalPoints,
      }));

    return NextResponse.json({
      success: true,
      pointTable,
    });
    return NextResponse.json({
      success: true,
      pointTable,
    });
  } catch (error) {
    console.error("PUBLIC POINT TABLE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load point table.",
      },
      { status: 500 },
    );
  }
}
