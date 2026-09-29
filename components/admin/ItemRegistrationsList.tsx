"use client";

import { Button, Table } from "@heroui/react";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import InlineResultForm from "./InlineResultForm";

export interface ItemGameEntry {
  gameId: string;
  gameName: string;
  category: string;
  type: string;
  gender: string;
  ageCategory: string;
  // Game limits — only present in the admin registrations report.
  minParticipants?: number;
  maxParticipants?: number | null;
  maxParticipantsPerTeam?: number | null;
  maxTeamsPerCompetitionTeam?: number;
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
  onManageRegistrations?: (game: ItemGameEntry) => void;
}
export function CategoryGamesTable({
  games,
  showActions = false,
  onManageRegistrations,
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
                    {Object.keys(game.teams).length === 0 && (
                      <p className="py-1 text-sm text-slate-400">
                        No registrations yet.
                      </p>
                    )}
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
                      <div className="flex flex-col items-start gap-2">
                        {onManageRegistrations && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => onManageRegistrations(game)}
                          >
                            <ClipboardList size={16} />
                            Manage Registrations
                          </Button>
                        )}

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
                      </div>
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
