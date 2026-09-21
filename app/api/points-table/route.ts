import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import Teams from "@/models/Teams";
import MarathonResult from "@/models/MarathonResult";

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

    const [individualResults, groupResults, marathonResults] =
      await Promise.all([
        IndividualResult.find({})
          .select("positions")
          .populate({ path: "positions.team", select: "_id name" })
          .lean(),

        GroupResult.find({})
          .select("positions")
          .populate({ path: "positions.team", select: "_id name" })
          .lean(),
        MarathonResult.find({
          published: true,
        })
          .select("teams")
          .populate({
            path: "teams.team",
            select: "_id name",
          })
          .lean(),
      ]);

    const addTeamPoints = (
      positions: Array<{
        position: number;
        team: unknown;
        points: number;
      }>,
    ) => {
      for (const pos of positions) {
        const team = pos.team as {
          _id?: unknown;
          name?: string;
        };

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

    for (const result of individualResults) {
      addTeamPoints(result.positions ?? []);
    }

    for (const result of groupResults) {
      addTeamPoints(result.positions ?? []);
    }

    // Marathon participation points
    for (const marathon of marathonResults) {
      for (const row of marathon.teams) {
        const team = row.team as {
          _id?: unknown;
          name?: string;
        };

        if (!team?._id) continue;

        const teamId = String(team._id);

        if (!teamMap.has(teamId)) {
          teamMap.set(teamId, {
            teamId,
            teamName: team.name ?? row.teamName,
            first: 0,
            second: 0,
            third: 0,
            totalPoints: 0,
          });
        }

        teamMap.get(teamId)!.totalPoints += row.points;
      }
    }

    const sortedTeams = Array.from(teamMap.values()).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      if (b.first !== a.first) {
        return b.first - a.first;
      }

      if (b.second !== a.second) {
        return b.second - a.second;
      }

      return b.third - a.third;
    });

    const pointTable = sortedTeams.map((team, index) => ({
      rank: index + 1,
      ...team,
    }));

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
