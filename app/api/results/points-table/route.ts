import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
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
    const employee = await getCurrentEmployee();

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const currentTeamId = employee.teamId ? String(employee.teamId) : null;

    const teams = await Teams.find({
      isActive: true,
    })
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
        .populate({
          path: "positions.team",
          select: "_id name",
        })
        .lean(),

      GroupResult.find({})
        .select("positions")
        .populate({
          path: "positions.team",
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
      for (const position of positions) {
        const team = position.team as {
          _id?: unknown;
          name?: string;
        };

        if (!team?._id) {
          continue;
        }

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

        const teamData = teamMap.get(teamId)!;

        teamData.totalPoints += position.points ?? 0;

        if (position.position === 1) {
          teamData.first += 1;
        }

        if (position.position === 2) {
          teamData.second += 1;
        }

        if (position.position === 3) {
          teamData.third += 1;
        }
      }
    };

    for (const result of individualResults) {
      addTeamPoints(result.positions ?? []);
    }

    for (const result of groupResults) {
      addTeamPoints(result.positions ?? []);
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
      isYourTeam: currentTeamId !== null && team.teamId === currentTeamId,
    }));

    const yourTeam = pointTable.find((team) => team.isYourTeam) ?? null;

    return NextResponse.json({
      success: true,
      yourTeam,
      pointTable,
    });
  } catch (error) {
    console.error("GET POINT TABLE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load point table.",
      },
      { status: 500 },
    );
  }
}
