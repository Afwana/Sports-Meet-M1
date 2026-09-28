"use client";

export interface ItemGameEntry {
  gameId: string;
  gameName: string;
  category: string;
  type: string;
  gender: string;
  ageCategory: string;
  teams: Record<
    string,
    {
      individuals: string[];
      groups: {
        groupName: string;
        members: string[];
      }[];
    }
  >;
}

export interface ItemCategoryEntry {
  category: string;
  games: ItemGameEntry[];
}

export function gameLabel(game: ItemGameEntry) {
  return `${game.gameName} (${game.gender} · ${game.ageCategory})`;
}

export function CategoryGamesTable({ games }: { games: ItemGameEntry[] }) {
  return (
    <table className="w-full border-collapse text-sm text-black">
      <thead>
        <tr className="bg-slate-100 text-left">
          <th className="w-12 border border-slate-300 px-3 py-2">SL. NO</th>
          <th className="w-56 border border-slate-300 px-3 py-2">Game Name</th>
          <th className="border border-slate-300 px-3 py-2">Participants</th>
        </tr>
      </thead>

      <tbody>
        {games.map((game, index) => (
          <tr key={game.gameId} className="break-inside-avoid align-top">
            <td className="border border-slate-300 px-3 py-2">{index + 1}</td>

            <td className="border border-slate-300 px-3 py-2">
              <p className="font-semibold">{game.gameName}</p>
              <p className="text-xs text-slate-500">
                {game.type} · {game.gender} · {game.ageCategory}
              </p>
            </td>

            <td className="border border-slate-300 px-3 py-2">
              <div className="flex flex-col gap-3">
                {Object.entries(game.teams)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([teamName, data]) => (
                    <div key={teamName}>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                        {teamName}
                      </p>

                      {game.type === "Individual" ? (
                        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                          {data.individuals.map((member, i) => (
                            <li key={i}>{member}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {data.groups.map((group, i) => (
                            <div key={i}>
                              <p className="text-xs font-semibold text-slate-700">
                                {group.groupName}
                              </p>
                              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
                                {group.members.map((member, j) => (
                                  <li key={j}>{member}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
