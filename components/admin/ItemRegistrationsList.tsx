"use client";

import { Button, Table } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import InlineResultForm from "./InlineResultForm";

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

interface CategoryGamesTableProps {
  games: ItemGameEntry[];
  showActions?: boolean;
}
export function CategoryGamesTable({
  games,
  showActions = false,
}: CategoryGamesTableProps) {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const columns = [
    { id: "slno", name: "SL. NO" },
    { id: "game", name: "Game Name" },
    { id: "participants", name: "Participants" },
    ...(showActions ? [{ id: "actions", name: "Actions" }] : []),
  ];

  const rows = games.map((game, index) => ({ ...game, index: index + 1 }));

  return (
    <Table className="bg-transparent p-0 shadow-md">
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Game registrations table"
          className="w-full rounded-none"
        >
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column isRowHeader={column.id === "game"}>
                {column.name}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={rows} className="rounded-none">
            {(game) => {
              const isExpanded = expandedGameId === game.gameId;

              return (
                <Table.Row key={game.gameId} id={game.gameId}>
                  <Table.Cell className="align-top text-black">
                    {game.index}
                  </Table.Cell>

                  <Table.Cell className="align-top text-black">
                    <p className="font-semibold">{game.gameName}</p>
                    <p className="text-xs text-slate-500">
                      {game.type} · {game.gender} · {game.ageCategory}
                    </p>
                  </Table.Cell>

                  <Table.Cell className="align-top text-black">
                    <div className="flex flex-col gap-3 py-1">
                      {Object.entries(game.teams)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([teamName, data]) => (
                          <div key={teamName} className="mb-3">
                            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-600">
                              {teamName}
                            </p>

                            {game.type === "Individual" ? (
                              <ul className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-5">
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
                                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-5">
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
                    {isExpanded && (
                      <InlineResultForm
                        game={game}
                        onClose={() => setExpandedGameId(null)}
                      />
                    )}
                  </Table.Cell>

                  {showActions ? (
                    <Table.Cell className="align-top">
                      <Button
                        size="sm"
                        variant={isExpanded ? "tertiary" : "primary"}
                        onPress={() =>
                          setExpandedGameId(isExpanded ? null : game.gameId)
                        }
                      >
                        {!isExpanded && <Plus size={16} />}
                        {isExpanded ? "Close" : "Add Result"}
                      </Button>
                    </Table.Cell>
                  ) : null}
                </Table.Row>
              );
            }}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
