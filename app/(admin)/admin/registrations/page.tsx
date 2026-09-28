/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CategoryGamesTable,
  gameLabel,
  ItemCategoryEntry,
} from "@/components/admin/ItemRegistrationsList";
import {
  Button,
  Card,
  Key,
  Label,
  ListBox,
  Select,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { FaPrint } from "react-icons/fa6";
import { toast } from "sonner";

const ALL_GAMES = "all";

export default function AdminRegistrationsPage() {
  const [report, setReport] = useState<ItemCategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGameId, setSelectedGameId] = useState(ALL_GAMES);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/registrations/item-print", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load registrations.");
          return;
        }

        const rows: ItemCategoryEntry[] = data.report || [];
        setReport(rows);
        if (rows.length > 0) setSelectedCategory(rows[0].category);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load registrations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentCategory = useMemo(
    () => report.find((r) => r.category === selectedCategory) || null,
    [report, selectedCategory],
  );

  const visibleGames = useMemo(() => {
    if (!currentCategory) return [];
    if (selectedGameId === ALL_GAMES) return currentCategory.games;
    return currentCategory.games.filter(
      (g: any) => g.gameId === selectedGameId,
    );
  }, [currentCategory, selectedGameId]);

  const openPrint = (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    window.open(`/admin/registrations/item-print?${query}`, "_blank");
  };

  const gameSelected = !!currentCategory && selectedGameId !== ALL_GAMES;

  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 md:p-6 dark:bg-black">
      <Card className="w-full min-h-[calc(100vh-115px)] p-5">
        <Card.Header className="flex flex-col lg:flex-row lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Registrations</h1>

            <p className="text-slate-500 text-sm">
              All games with their registered participants.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              isDisabled={!currentCategory}
              onPress={() =>
                openPrint({ mode: "category", category: selectedCategory })
              }
            >
              <FaPrint />
              Print {selectedCategory || "Category"} Registrations
            </Button>

            <Button
              variant="primary"
              isDisabled={report.length === 0}
              onPress={() => openPrint({ mode: "all" })}
            >
              <FaPrint />
              Print All Registrations
            </Button>

            <Button
              variant="secondary"
              isDisabled={!gameSelected}
              onPress={() =>
                openPrint({
                  mode: "game",
                  category: selectedCategory,
                  gameId: selectedGameId,
                })
              }
            >
              <FaPrint />
              Print Selected Game
            </Button>
          </div>
        </Card.Header>

        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md">Loading registrations...</Spinner>
            </div>
          ) : report.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-slate-500">
              No registrations yet.
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:max-w-xl">
                <div>
                  <Label className="mb-2">Category</Label>

                  <Select
                    aria-label="select category"
                    value={selectedCategory}
                    onChange={(value: Key | null) => {
                      if (!value) return;
                      setSelectedCategory(String(value));
                      setSelectedGameId(ALL_GAMES);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        {report.map((c) => (
                          <ListBox.Item
                            key={c.category}
                            id={c.category}
                            textValue={c.category}
                          >
                            {c.category}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Game</Label>

                  <Select
                    aria-label="select game"
                    value={selectedGameId}
                    onChange={(value: Key | null) => {
                      if (!value) return;
                      setSelectedGameId(String(value));
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item
                          key={ALL_GAMES}
                          id={ALL_GAMES}
                          textValue="All games"
                        >
                          All games
                        </ListBox.Item>

                        {(currentCategory?.games || []).map((game: any) => (
                          <ListBox.Item
                            key={game.gameId}
                            id={game.gameId}
                            textValue={gameLabel(game)}
                          >
                            {gameLabel(game)}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              {/* Results */}
              <div className="mt-8 overflow-x-auto">
                {visibleGames.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-16 text-center text-slate-500">
                    No registrations under {selectedCategory}.
                  </div>
                ) : (
                  <CategoryGamesTable games={visibleGames} />
                )}
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
