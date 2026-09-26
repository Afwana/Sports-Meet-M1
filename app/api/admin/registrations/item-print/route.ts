/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Games from "@/models/Games";
import IndividualRegistration from "@/models/IndividualRegistration";
import GroupRegistration from "@/models/GroupRegistration";

const CATEGORY_ORDER = ["Sports", "Off Stage", "Stage", "Games"];

export async function GET() {
  await getCurrentAdmin();

  try {
    await connectDB();

    const [games, individualRegs, groupRegs] = await Promise.all([
      //   Teams.find({}).select("_id name").lean(),
      Games.find({}).select("_id name type category").lean(),
      IndividualRegistration.find({})
        .select("employeeCode employeeName teamId games")
        .lean(),
      GroupRegistration.find({})
        .populate("participants", "employeeName employeeCode")
        .select("game participants")
        .lean(),
    ]);

    const gameMap = new Map(games.map((g) => [String(g._id), g]));
    // const teamMap = new Map(teams.map((t) => [String(t._id), t.name]));

    const itemMap = new Map<
      string,
      {
        gameId: string;
        gameName: string;
        category: string;
        type: string;
        participants: string[];
      }
    >();

    const ensureGame = (gameId: string) => {
      if (!itemMap.has(gameId)) {
        const game = gameMap.get(gameId)!;

        itemMap.set(gameId, {
          gameId,
          gameName: game.name,
          category: game.category,
          type: game.type,
          participants: [],
        });
      }

      return itemMap.get(gameId)!;
    };

    // Individual registrations
    for (const reg of individualRegs) {
      for (const g of reg.games || []) {
        const gameId = String(g.gameId);

        if (!gameMap.has(gameId)) continue;

        ensureGame(gameId).participants.push(
          `${reg.employeeName} (${reg.employeeCode})`,
        );
      }
    }

    // Group registrations
    for (const reg of groupRegs) {
      const gameId = String(reg.game);

      if (!gameMap.has(gameId)) continue;

      const game = ensureGame(gameId);

      const members = (reg.participants || []).map(
        (p: any) => `${p.employeeName} (${p.employeeCode})`,
      );

      //   const teamName = teamMap.get(String(reg.team)) || "Unknown Team";

      game.participants.push(`${members.join(", ")}`);
    }

    const report = CATEGORY_ORDER.map((category) => ({
      category,
      games: [...itemMap.values()]
        .filter((g) => g.category === category)
        .sort((a, b) => a.gameName.localeCompare(b.gameName)),
    })).filter((c) => c.games.length);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load item report.",
      },
      { status: 500 },
    );
  }
}
