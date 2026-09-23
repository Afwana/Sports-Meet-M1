import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

type IndividualPosition = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  teamName: string;
};

type GroupPosition = {
  groupId: string;
  groupName: string;
  teamName: string;
};

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const games = await Games.find({
      isActive: true,
    })
      .select("_id name type category gender ageCategory")
      .sort({ name: 1 })
      .lean();

    const [individualResults, groupResults] = await Promise.all([
      IndividualResult.find({})
        .populate({
          path: "positions.employee",
          select: "_id employeeName employeeCode",
        })
        .populate({
          path: "positions.team",
          select: "_id name",
        })
        .lean(),

      GroupResult.find({})
        .populate({
          path: "positions.team",
          select: "_id name",
        })
        .lean(),
    ]);

    const individualResultMap = new Map(
      individualResults.map((result) => [String(result.game), result]),
    );

    const groupResultMap = new Map(
      groupResults.map((result) => [String(result.game), result]),
    );

    const gamesWithResults = games.filter((game) => {
      const gameId = String(game._id);

      return individualResultMap.has(gameId) || groupResultMap.has(gameId);
    });

    const rows = gamesWithResults.map((game) => {
      if (game.type === "Individual") {
        const result = individualResultMap.get(String(game._id));

        const positions = {
          first: null as null | IndividualPosition,

          second: null as null | IndividualPosition,

          third: null as null | IndividualPosition,
        };

        if (result?.positions) {
          for (const item of result.positions) {
            const employee = item.employee as unknown as {
              _id?: unknown;
              employeeName?: string;
              employeeCode?: string;
            };

            const team = item.team as unknown as {
              _id?: unknown;
              name?: string;
            };

            const value = {
              employeeId: String(employee?._id ?? item.employee),

              employeeName: employee?.employeeName ?? "",

              employeeCode: employee?.employeeCode ?? "",

              teamName: team?.name ?? "",
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
          type: "Individual" as const,
          category: game.category,
          gender: game.gender,
          ageCategory: game.ageCategory,
          resultId: result ? String(result._id) : null,
          positions,
        };
      }

      const result = groupResultMap.get(String(game._id));

      const positions = {
        first: null as null | GroupPosition,

        second: null as null | GroupPosition,

        third: null as null | GroupPosition,
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
        type: "Group" as const,
        category: game.category,
        gender: game.gender,
        ageCategory: game.ageCategory,
        resultId: result ? String(result._id) : null,
        positions,
      };
    });

    return NextResponse.json({
      success: true,
      results: rows,
    });
  } catch (error) {
    console.error("GET RESULTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load results.",
      },
      { status: 500 },
    );
  }
}
