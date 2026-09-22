import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import GroupResult from "@/models/GroupResult";
import Games from "@/models/Games";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export async function GET() {
  try {
    // const employee = await getCurrentEmployee();

    // if (!employee) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Unauthorized",
    //     },
    //     { status: 401 },
    //   );
    // }

    await connectDB();

    /*
     * Get all active Group games.
     */
    const games = await Games.find({
      type: "Group",
      isActive: true,
    })
      .select("_id name category")
      .sort({ name: 1 })
      .lean();

    /*
     * Get Group Results.
     *
     * team is inside positions[], so the correct
     * populate path is positions.team.
     */
    const results = await GroupResult.find({})
      .populate({
        path: "positions.team",
        select: "_id name",
      })
      .lean();

    const resultMap = new Map(
      results.map((result) => [String(result.game), result]),
    );

    /*
     * Return every active Group game.
     * Games without a published result are also returned.
     */
    const data = games.map((game) => {
      const result = resultMap.get(String(game._id));

      const positions = {
        first: null as null | {
          groupId: string;
          groupName: string;
          teamName: string;
          points: number;
        },

        second: null as null | {
          groupId: string;
          groupName: string;
          teamName: string;
          points: number;
        },

        third: null as null | {
          groupId: string;
          groupName: string;
          teamName: string;
          points: number;
        },
      };

      if (result?.positions) {
        for (const item of result.positions) {
          const team = item.team as unknown as {
            _id?: unknown;
            name?: string;
          };

          const value = {
            groupId: String(item.group),
            groupName: item.groupName ?? "",
            teamName: team?.name ?? "",
            points: item.points ?? 0,
          };

          if (item.position === 1) {
            positions.first = value;
          }

          if (item.position === 2) {
            positions.second = value;
          }

          if (item.position === 3) {
            positions.third = value;
          }
        }
      }

      return {
        gameId: String(game._id),
        gameName: game.name,
        category: game.category,
        hasResult: Boolean(result),
        positions,
      };
    });

    return NextResponse.json({
      success: true,
      results: data,
    });
  } catch (error) {
    console.error("GET GROUP RESULTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load group results.",
      },
      { status: 500 },
    );
  }
}
