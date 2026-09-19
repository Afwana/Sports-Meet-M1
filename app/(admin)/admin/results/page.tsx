"use client";

import ResultsTable, { type ResultRow } from "@/components/admin/ResultsTable";

import { Button, Card, Label, ListBox, Select, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Game {
  _id: string;
  name: string;
  category: "Sports" | "Arts";
  type: "Individual" | "Group";
  icon: string;
  minParticipants?: number;
  maxParticipants?: number;
  maxTeamsPerCompetitionTeam?: number;
  isActive: boolean;
}

interface Participant {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  team: string;
  teamId: string;
}

interface ResultPosition {
  position: number;
  employee: string;
  team: string;
  points: number;
}

interface ExistingResult {
  _id: string;
  game: string;
  positions: ResultPosition[];
}

type ResultCategory = "Individual" | "Group";

type GroupItem = {
  groupId: string;
  groupName: string;
  teamId: string;
  teamName: string;
  participantCount: number;
};

interface ExistingGroupResult {
  _id: string;
  game: string;
  positions: {
    position: number;
    group: string;
    groupName: string;
    team: string;
    points: number;
  }[];
}

const positions = [
  {
    position: 1,
    label: "Winner (1st)",
  },
  {
    position: 2,
    label: "Second (2nd)",
  },
  {
    position: 3,
    label: "Third (3rd)",
  },
];

export default function AdminResultsPage() {
  const router = useRouter();
  const [category, setCategory] = useState<ResultCategory>("Individual");

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [selectedPositions, setSelectedPositions] = useState<
    Record<number, string>
  >({});

  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [saving, setSaving] = useState(false);

  const [loadedResult, setLoadedResult] = useState<ExistingResult | null>(null);

  const [results, setResults] = useState<ResultRow[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const [groupItems, setGroupItems] = useState<GroupItem[]>([]);

  const [selectedGroupPositions, setSelectedGroupPositions] = useState<
    Record<number, string>
  >({});

  const [loadedGroupResult, setLoadedGroupResult] =
    useState<ExistingGroupResult | null>(null);

  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true);

        const res = await fetch("/api/admin/games");

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load games.");
          return;
        }

        const gameList: Game[] = Array.isArray(data) ? data : data.games || [];

        setGames(gameList);
      } catch (error) {
        console.error("Failed to load games:", error);

        toast.error("Failed to load games.");
      } finally {
        setLoadingGames(false);
      }
    };

    loadGames();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter(
      (game) => game.type === category && game.isActive === true,
    );
  }, [games, category]);

  /* Load participants and existing result for game */
  const loadGameParticipants = async (gameId: string) => {
    if (!gameId) {
      return;
    }

    try {
      setLoadingParticipants(true);

      setParticipants([]);
      setSelectedPositions({});
      setLoadedResult(null);

      const res = await fetch(
        `/api/admin/results/individual/${gameId}/registrations`,
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load participants.");
        return;
      }

      setParticipants(data.participants || []);

      if (data.result) {
        const existing: Record<number, string> = {};

        data.result.positions.forEach((item: ResultPosition) => {
          existing[item.position] = String(item.employee);
        });

        setSelectedPositions(existing);
        setLoadedResult(data.result);
      }
    } catch (error) {
      console.error("Failed to load participants:", error);

      toast.error("Failed to load participants.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const loadGameGroups = async (gameId: string) => {
    if (!gameId) {
      return;
    }

    try {
      setLoadingGroups(true);

      setGroupItems([]);
      setSelectedGroupPositions({});
      setLoadedGroupResult(null);

      const response = await fetch(
        `/api/admin/results/group/${gameId}/registrations`,
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load groups.");
        return;
      }

      setGroupItems(data.groups ?? []);

      if (data.result) {
        const existing: Record<number, string> = {};

        data.result.positions.forEach(
          (item: { position: number; group: string }) => {
            existing[item.position] = String(item.group);
          },
        );

        setSelectedGroupPositions(existing);

        setLoadedGroupResult(data.result);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);

      toast.error("Failed to load groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleGameChange = (value: string) => {
    setSelectedGameId(value);

    if (category === "Individual") {
      loadGameParticipants(value);
    } else if (category === "Group") {
      loadGameGroups(value);
    } else {
      setParticipants([]);
      setSelectedPositions({});
      setLoadedResult(null);
    }
  };

  const handlePositionChange = (position: number, employeeId: string) => {
    setSelectedPositions((current) => ({
      ...current,
      [position]: employeeId,
    }));
  };

  const handleGroupPositionChange = (position: number, groupId: string) => {
    setSelectedGroupPositions((current) => ({
      ...current,
      [position]: groupId,
    }));
  };

  const saveResult = async () => {
    if (!selectedGameId) {
      toast.error("Please select a game.");
      return;
    }

    const resultPositions = positions
      .filter((item) => selectedPositions[item.position])
      .map((item) => ({
        position: item.position,
        employeeId: selectedPositions[item.position],
      }));

    if (resultPositions.length === 0) {
      toast.error("Please select at least one position.");
      return;
    }

    const selectedEmployeeIds = resultPositions.map((item) => item.employeeId);

    if (new Set(selectedEmployeeIds).size !== selectedEmployeeIds.length) {
      toast.error("The same employee cannot occupy multiple positions.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `/api/admin/results/individual/${selectedGameId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            positions: resultPositions,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save result.");
        return;
      }

      toast.success(
        loadedResult
          ? "Result updated successfully."
          : "Result saved successfully.",
      );

      setLoadedResult(data.result);

      await loadResults();
      router.refresh();
    } catch (error) {
      console.error("Failed to save result:", error);

      toast.error("Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  const saveGroupResult = async () => {
    if (!selectedGameId) {
      toast.error("Please select a game.");
      return;
    }

    const resultPositions = positions
      .filter((item) => selectedGroupPositions[item.position])
      .map((item) => ({
        position: item.position,

        groupId: selectedGroupPositions[item.position],
      }));

    if (resultPositions.length === 0) {
      toast.error("Please select at least one position.");
      return;
    }

    const selectedGroupIds = resultPositions.map((item) => item.groupId);

    if (new Set(selectedGroupIds).size !== selectedGroupIds.length) {
      toast.error("The same group cannot occupy multiple positions.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/results/group/${selectedGameId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            positions: resultPositions,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to save group result.");
        return;
      }

      toast.success(
        loadedGroupResult
          ? "Group result updated successfully."
          : "Group result saved successfully.",
      );

      setLoadedGroupResult(data.result);

      await loadResults();
      router.refresh();
    } catch (error) {
      console.error("Failed to save group result:", error);

      toast.error("Failed to save group result.");
    } finally {
      setSaving(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoadingResults(true);

      const res = await fetch("/api/admin/results");

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load results.");
        return;
      }

      setResults(data.results ?? []);
    } catch (error) {
      console.error("Failed to load results:", error);

      toast.error("Failed to load results.");
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleEdit = (row: ResultRow) => {
    setCategory(row.type);
    setSelectedGameId(row.gameId);

    if (row.type === "Individual") {
      const existing: Record<number, string> = {};

      if (row.positions.first) {
        existing[1] = row.positions.first.employeeId;
      }

      if (row.positions.second) {
        existing[2] = row.positions.second.employeeId;
      }

      if (row.positions.third) {
        existing[3] = row.positions.third.employeeId;
      }

      setSelectedPositions(existing);
      setSelectedGroupPositions({});
      setLoadedGroupResult(null);

      loadGameParticipants(row.gameId);
    } else {
      const existing: Record<number, string> = {};

      if (row.positions.first) {
        existing[1] = row.positions.first.groupId;
      }

      if (row.positions.second) {
        existing[2] = row.positions.second.groupId;
      }

      if (row.positions.third) {
        existing[3] = row.positions.third.groupId;
      }

      setSelectedGroupPositions(existing);
      setSelectedPositions({});
      setLoadedResult(null);

      loadGameGroups(row.gameId);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (row: ResultRow) => {
    if (!row.resultId) {
      toast.error("No saved result exists for this game.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the result for "${row.gameName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/results/individual/${row.gameId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete result.");
        return;
      }

      toast.success("Result deleted successfully.");

      if (selectedGameId === row.gameId) {
        setSelectedPositions({});
        setLoadedResult(null);
      }

      await loadResults();
      router.refresh();
    } catch (error) {
      console.error("Failed to delete result:", error);

      toast.error("Failed to delete result.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-blue-50 p-6 dark:bg-black">
      <Card className="min-h-[calc(100vh-115px)] w-full p-5">
        <Card.Header>
          <div>
            <Card.Title className="text-lg font-semibold">Results</Card.Title>

            <Card.Description>
              Select a game and assign competition result positions.
            </Card.Description>
          </div>
        </Card.Header>

        <Card.Content>
          <div className="space-y-8">
            {/* RESULT FORM */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* CATEGORY */}
                <div className="space-y-2">
                  <Label>Select Category</Label>

                  <Select
                    value={category}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        setCategory(value as ResultCategory);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="Individual" textValue="Individual">
                          Individual
                          <ListBox.ItemIndicator />
                        </ListBox.Item>

                        <ListBox.Item id="Group" textValue="Group">
                          Group
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* GAME */}
                <div className="space-y-2">
                  <Label>Select {category} Game</Label>

                  {loadingGames ? (
                    <div className="flex items-center gap-2 py-2">
                      <Spinner size="sm" />

                      <span className="text-sm text-default-500">
                        Loading games...
                      </span>
                    </div>
                  ) : filteredGames.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-default-300 p-5 text-sm text-default-500">
                      No active {category.toLowerCase()} games found.
                    </div>
                  ) : (
                    <Select
                      value={selectedGameId}
                      onChange={(value) => {
                        if (typeof value === "string") {
                          handleGameChange(value);
                        }
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover>
                        <ListBox>
                          {filteredGames.map((game) => (
                            <ListBox.Item
                              key={game._id}
                              id={game._id}
                              textValue={game.name}
                            >
                              {game.name}

                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                </div>
              </div>

              {/* GROUP */}
              {category === "Group" && selectedGameId && (
                <>
                  {loadingGroups ? (
                    <div className="flex justify-center py-10">
                      <Spinner />
                    </div>
                  ) : groupItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-default-300 p-8 text-center text-default-500">
                      No groups are registered for this game.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {positions.map(({ position, label }) => (
                          <div key={position} className="space-y-2">
                            <Label>{label}</Label>

                            <Select
                              value={selectedGroupPositions[position] || ""}
                              onChange={(value) => {
                                if (typeof value === "string") {
                                  handleGroupPositionChange(position, value);
                                }
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>

                              <Select.Popover>
                                <ListBox>
                                  {groupItems.map((group) => (
                                    <ListBox.Item
                                      key={group.groupId}
                                      id={group.groupId}
                                      textValue={`${group.groupName} ${group.teamName}`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {group.groupName}
                                        </span>

                                        <span className="text-xs text-default-500">
                                          {group.teamName} •{" "}
                                          {group.participantCount} members
                                        </span>
                                      </div>

                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button onPress={saveGroupResult} isDisabled={saving}>
                          {saving ? (
                            <>
                              <Spinner size="sm" />
                              {loadedGroupResult ? "Updating..." : "Saving..."}
                            </>
                          ) : loadedGroupResult ? (
                            "Update Result"
                          ) : (
                            "Save Result"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* INDIVIDUAL RESULT */}
              {category === "Individual" && selectedGameId && (
                <>
                  {loadingParticipants ? (
                    <div className="flex justify-center py-10">
                      <Spinner />
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-default-300 p-8 text-center text-default-500">
                      No employees are registered for this game.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {positions.map(({ position, label }) => (
                          <div key={position} className="space-y-2">
                            <Label>{label}</Label>

                            <Select
                              value={selectedPositions[position] || ""}
                              onChange={(value) => {
                                if (typeof value === "string") {
                                  handlePositionChange(position, value);
                                }
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>

                              <Select.Popover>
                                <ListBox>
                                  {participants.map((employee) => (
                                    <ListBox.Item
                                      key={employee.employeeId}
                                      id={employee.employeeId}
                                      textValue={`${employee.employeeName} ${employee.employeeCode}`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {employee.employeeName}
                                        </span>

                                        <span className="text-xs text-default-500">
                                          {employee.employeeCode} •{" "}
                                          {employee.team}
                                        </span>
                                      </div>

                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button onPress={saveResult} isDisabled={saving}>
                          {saving ? (
                            <>
                              <Spinner size="sm" />
                              {loadedResult ? "Updating..." : "Saving..."}
                            </>
                          ) : loadedResult ? (
                            "Update Result"
                          ) : (
                            "Save Result"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ALL RESULTS TABLE */}
            <div className="border-t border-default-200 pt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">All Results</h2>

                <p className="text-sm text-default-500">
                  Manage results of all games.
                </p>
              </div>

              {loadingResults ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : (
                <ResultsTable
                  results={results}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
