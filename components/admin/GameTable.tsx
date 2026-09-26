"use client";

import { Game } from "@/types/game";
import {
  Button,
  Input,
  Table,
  Switch,
  ButtonGroup,
  Card,
  Pagination,
} from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import GameFormModal from "./GameFormModal";
import { iconMap } from "@/utils/iconMap";
import DeleteGameModal from "./DeleteGameModal";
import { getPageRange } from "@/lib/getPageRange";

interface Props {
  games: Game[];
}

const newGame: Game = {
  _id: "",
  name: "",
  category: "Sports",
  type: "Individual",
  gender: "Male",
  icon: "FaCircle",
  minParticipants: 1,
  maxParticipants: 1,
  ageCategory: "Open",
  maxParticipantsPerTeam: 1,
  maxTeamsPerCompetitionTeam: 1,
  isActive: true,
};

const columns = [
  { id: "game", name: "Game" },
  { id: "category", name: "Category" },
  { id: "gender", name: "Gender" },
  { id: "type", name: "Type" },
  { id: "ageCategory", name: "Age Category" },
  { id: "active", name: "Active" },
  { id: "actions", name: "Actions" },
];

const ROWS_PER_PAGE = 10;

export default function GameTable({ games }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [gameList, setGameList] = useState(games);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    return gameList.filter((game) =>
      game.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [gameList, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGames.length / ROWS_PER_PAGE),
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredGames.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredGames]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredGames.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <div>
      <Card className="w-full p-5 min-h-[calc(100vh-115px)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Games</h1>

          <p className="text-slate-500 text-sm">
            Manage Individual and Group games.
          </p>
        </div>
        <Card.Header>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Input
              aria-label="Search games"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3 h-10"
              variant="secondary"
            />

            <ButtonGroup variant="primary" className="h-10">
              <Button
                isIconOnly
                aria-label="Show QR code"
                onPress={() => setEditingGame(newGame)}
              >
                <Plus size={18} />
              </Button>
              <Button onPress={() => setEditingGame(newGame)}>
                <ButtonGroup.Separator />
                Add Game
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        <Card.Content>
          <Table className="bg-transparent shadow-md p-0">
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Games Table"
                className="w-full rounded-none"
              >
                <Table.Header columns={columns}>
                  {(column) => (
                    <Table.Column isRowHeader={column.id === "game"}>
                      {column.name}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={paginatedItems} className="rounded-none">
                  {(game) => {
                    const Icon = iconMap[game.icon as keyof typeof iconMap];

                    return (
                      <Table.Row key={game._id} id={game._id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3 text-black">
                            {Icon ? (
                              <Icon
                                size={22}
                                className="text-blue-600 shrink-0"
                              />
                            ) : (
                              <span className="text-gray-400">•</span>
                            )}
                            {game.name}
                          </div>
                        </Table.Cell>

                        <Table.Cell className="text-black">
                          {game.category}
                        </Table.Cell>

                        <Table.Cell className="text-black">
                          {game.gender}
                        </Table.Cell>

                        <Table.Cell className="text-black">
                          {game.type}
                        </Table.Cell>

                        <Table.Cell className="text-black">
                          {game.ageCategory}
                        </Table.Cell>

                        <Table.Cell>
                          <Switch isSelected={game.isActive} size="sm">
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch.Content>
                          </Switch>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="tertiary"
                              aria-label={`Edit ${game.name}`}
                              onPress={() => setEditingGame(game)}
                            >
                              <Pencil size={16} color="black" />
                            </Button>

                            <Button
                              isIconOnly
                              size="sm"
                              variant="danger"
                              aria-label={`Delete ${game.name}`}
                              onPress={() => setDeletingGame(game)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  }}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
            <Table.Footer className="flex flex-col items-center gap-3 p-3 md:flex-row md:justify-between">
              <Pagination size="sm">
                <Pagination.Summary>
                  {start} to {end} of {filteredGames.length} results
                </Pagination.Summary>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={page === 1}
                      onPress={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <Pagination.PreviousIcon />
                    </Pagination.Previous>
                  </Pagination.Item>
                  {pageRange.map((p, idx) =>
                    typeof p === "number" ? (
                      <Pagination.Item key={p}>
                        <Pagination.Link
                          isActive={p === page}
                          onPress={() => setPage(p)}
                        >
                          {p}
                        </Pagination.Link>
                      </Pagination.Item>
                    ) : (
                      <Pagination.Item key={`${p}-${idx}`}>
                        <span className="px-2 text-slate-400 select-none">
                          …
                        </span>
                      </Pagination.Item>
                    ),
                  )}
                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={page === totalPages}
                      onPress={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </Table.Footer>
          </Table>
        </Card.Content>
      </Card>
      <GameFormModal
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSaved={(savedGame) => {
          setGameList((prev) => {
            const exists = prev.some((g) => g._id === savedGame._id);

            if (exists) {
              return prev.map((g) => (g._id === savedGame._id ? savedGame : g));
            }

            return [...prev, savedGame];
          });

          setEditingGame(null);
        }}
      />

      <DeleteGameModal
        game={deletingGame}
        onClose={() => setDeletingGame(null)}
        onDeleted={(id) => {
          setGameList((prev) => prev.filter((game) => game._id !== id));
          setDeletingGame(null);
        }}
      />
    </div>
  );
}
