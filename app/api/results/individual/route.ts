import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import Result from "@/models/IndividualResult";

export async function GET() {
  try {
    await connectDB();

    const games = await Games.find({
      type: "Individual",
      isActive: true,
    })
      .select("_id name category type gender ageCategory")
      .sort({ name: 1 })
      .lean();

    const results = await Result.find({})
      .populate({
        path: "positions.employee",
        select: "_id employeeName employeeCode",
      })
      .populate({
        path: "positions.team",
        select: "_id name",
      })
      .lean();

    const resultMap = new Map(
      results.map((result) => [String(result.game), result]),
    );

    const data = games.map((game) => {
      const result = resultMap.get(String(game._id));

      const positions = {
        first: null as null | {
          employeeId: string;
          employeeName: string;
          employeeCode: string;
          teamName: string;
          points: number;
        },

        second: null as null | {
          employeeId: string;
          employeeName: string;
          employeeCode: string;
          teamName: string;
          points: number;
        },

        third: null as null | {
          employeeId: string;
          employeeName: string;
          employeeCode: string;
          teamName: string;
          points: number;
        },
      };

      if (result?.positions) {
        for (const item of result.positions) {
          const employeeData = item.employee as unknown as {
            _id?: unknown;
            employeeName?: string;
            employeeCode?: string;
          };

          const teamData = item.team as unknown as {
            _id?: unknown;
            name?: string;
          };

          const value = {
            employeeId: String(employeeData?._id ?? item.employee),
            employeeName: employeeData?.employeeName ?? "",
            employeeCode: employeeData?.employeeCode ?? "",
            teamName: teamData?.name ?? "",
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
        type: game.type,
        category: game.category,
        gender: game.gender,
        ageCategory: game.ageCategory,
        hasResult: Boolean(result),
        positions,
      };
    });

    return NextResponse.json({
      success: true,
      results: data,
    });
  } catch (error) {
    console.error("GET INDIVIDUAL RESULTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load individual results.",
      },
      { status: 500 },
    );
  }
}
