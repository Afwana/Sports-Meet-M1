import IndividualResult from "@/models/IndividualResult";
import GroupResult from "@/models/GroupResult";
import Teams from "@/models/Teams";

type TeamTally = {
  first: number;
  second: number;
  third: number;
  totalPoints: number;
};

/**
 * Ranks every active team by total points (tie-broken by golds, then
 * silvers, then bronzes) and returns the rank (1-based) for the given
 * teamId, or null if the team isn't found / isn't active.
 *
 * Mirrors the scoring logic in /api/results/points-table so the captain
 * dashboard and the public/points table always agree.
 */
export async function getTeamRank(
  teamId: string | null | undefined,
): Promise<number | null> {
  if (!teamId) return null;

  const teams = await Teams.find({ isActive: true }).select("_id").lean();

  const teamMap = new Map<string, TeamTally>();

  for (const team of teams) {
    teamMap.set(String(team._id), {
      first: 0,
      second: 0,
      third: 0,
      totalPoints: 0,
    });
  }

  const [individualResults, groupResults] = await Promise.all([
    IndividualResult.find({}).select("positions").lean(),
    GroupResult.find({}).select("positions").lean(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addPoints = (positions: any[]) => {
    for (const pos of positions ?? []) {
      const id = pos?.team ? String(pos.team) : null;

      if (!id || !teamMap.has(id)) continue;

      const data = teamMap.get(id)!;

      data.totalPoints += pos.points ?? 0;

      if (pos.position === 1) data.first++;
      if (pos.position === 2) data.second++;
      if (pos.position === 3) data.third++;
    }
  };

  for (const result of individualResults) addPoints(result.positions);
  for (const result of groupResults) addPoints(result.positions);

  const sorted = Array.from(teamMap.entries()).sort(([, a], [, b]) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.first !== a.first) return b.first - a.first;
    if (b.second !== a.second) return b.second - a.second;
    return b.third - a.third;
  });

  const index = sorted.findIndex(([id]) => id === String(teamId));

  return index === -1 ? null : index + 1;
}
