import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Teams from "@/models/Teams";
import Games from "@/models/Games";
import IndividualRegistration from "@/models/IndividualRegistration";
import GroupRegistration from "@/models/GroupRegistration";

const CATEGORY_ORDER = ["Sports", "Off Stage", "Stage", "Games"];
const GENDER_ORDER = ["Both", "Male", "Female"];
const AGE_ORDER = ["Open", "Junior", "Senior"];

export async function GET() {
  try {
    await connectDB();
    await getCurrentAdmin();

    const [teams, games, individualRegs, groupRegs] = await Promise.all([
      Teams.find({}).select("_id name").sort({ name: 1 }).lean(),
      Games.find({}).select("_id name type category gender ageCategory").lean(),
      IndividualRegistration.find({})
        .select("employeeCode employeeName teamId games")
        .lean(),
      GroupRegistration.find({})
        .populate("participants", "employeeName employeeCode")
        .select("groupName game team participants")
        .lean(),
    ]);

    const gameMap = new Map(games.map((g) => [String(g._id), g]));

    // gameId -> rows registered under that game, per team
    // teamId -> gameId -> { individual: [...], group: [...] }
    const teamGameRows = new Map<
      string,
      Map<
        string,
        {
          individual: { employeeCode: string; employeeName: string }[];
          group: {
            groupName: string;
            participants: { employeeName: string; employeeCode: string }[];
          }[];
        }
      >
    >();

    const ensureTeamGame = (teamId: string, gameId: string) => {
      if (!teamGameRows.has(teamId)) teamGameRows.set(teamId, new Map());
      const gameEntries = teamGameRows.get(teamId)!;

      if (!gameEntries.has(gameId)) {
        gameEntries.set(gameId, { individual: [], group: [] });
      }

      return gameEntries.get(gameId)!;
    };

    for (const reg of individualRegs) {
      const teamId = String(reg.teamId);

      for (const g of reg.games || []) {
        const gameId = String(g.gameId);
        if (!gameMap.has(gameId)) continue;

        ensureTeamGame(teamId, gameId).individual.push({
          employeeCode: reg.employeeCode,
          employeeName: reg.employeeName,
        });
      }
    }

    for (const reg of groupRegs) {
      const teamId = String(reg.team);
      const gameId = String(reg.game);
      if (!gameMap.has(gameId)) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const participants = (reg.participants || []).map((p: any) => ({
        employeeName: p.employeeName,
        employeeCode: p.employeeCode,
      }));

      ensureTeamGame(teamId, gameId).group.push({
        groupName: reg.groupName,
        participants,
      });
    }

    const report = teams
      .map((team) => {
        const teamId = String(team._id);
        const gameEntries = teamGameRows.get(teamId);

        if (!gameEntries || gameEntries.size === 0) {
          return { teamId, teamName: team.name, categories: [] };
        }

        const categories = CATEGORY_ORDER.map((category) => {
          const genders = GENDER_ORDER.map((gender) => {
            const ageCategories = AGE_ORDER.map((ageCategory) => {
              const gamesInGroup = [...gameEntries.entries()]
                .filter(([gameId]) => {
                  const game = gameMap.get(gameId)!;
                  return (
                    game.category === category &&
                    game.gender === gender &&
                    game.ageCategory === ageCategory
                  );
                })
                .map(([gameId, rows]) => {
                  const game = gameMap.get(gameId)!;
                  return {
                    gameId,
                    gameName: game.name,
                    type: game.type,
                    individual: rows.individual,
                    group: rows.group,
                  };
                })
                .filter((g) => g.individual.length > 0 || g.group.length > 0);

              return { ageCategory, games: gamesInGroup };
            }).filter((a) => a.games.length > 0);

            return { gender, ageCategories };
          }).filter((g) => g.ageCategories.length > 0);

          return { category, genders };
        }).filter((c) => c.genders.length > 0);

        return { teamId, teamName: team.name, categories };
      })
      .filter((team) => team.categories.length > 0);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Registrations print-data error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load registrations report.",
      },
      { status: 500 },
    );
  }
}
