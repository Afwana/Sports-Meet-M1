"use client";

import { Button, Label, ListBox, Select, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import MarathonPointsCard from "./MarathonPointsCard";
import { ItemGameEntry } from "./ItemRegistrationsList";

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
}

interface ExistingResult {
  _id: string;
  positions: ResultPosition[];
}

type GroupItem = {
  groupId: string;
  groupName: string;
  teamId: string;
  teamName: string;
  participantCount: number;
};

interface ExistingGroupResult {
  _id: string;
  positions: { position: number; group: string }[];
}

type PointConfiguration = {
  type: "Individual" | "Group";
  positions: { position: number; points: number }[];
};

function positionLabel(position: number) {
  if (position === 1) return "Winner (1st)";
  if (position === 2) return "Second (2nd)";
  if (position === 3) return "Third (3rd)";
  return `${position}th`;
}

export default function InlineResultForm({
  game,
  onClose,
}: {
  game: ItemGameEntry;
  onClose: () => void;
}) {
  const isMarathon =
    game.gameName.toLowerCase() === "marathon" &&
    game.type === "Individual" &&
    game.category === "Games";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [positionOptions, setPositionOptions] = useState<
    { position: number; label: string }[]
  >([]);

  // Individual
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<
    Record<number, string>
  >({});
  const [existingResult, setExistingResult] = useState<ExistingResult | null>(
    null,
  );

  // Group
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroupPositions, setSelectedGroupPositions] = useState<
    Record<number, string>
  >({});
  const [existingGroupResult, setExistingGroupResult] =
    useState<ExistingGroupResult | null>(null);

  useEffect(() => {
    if (isMarathon) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const [configRes, dataRes] = await Promise.all([
          fetch("/api/admin/point-configurations"),
          game.type === "Individual"
            ? fetch(
                `/api/admin/results/individual/${game.gameId}/registrations`,
              )
            : fetch(`/api/admin/results/group/${game.gameId}/registrations`),
        ]);

        const configData = await configRes.json();
        const data = await dataRes.json();

        if (!configRes.ok) {
          toast.error(
            configData.message || "Failed to load point configuration.",
          );
        } else {
          const configurations: PointConfiguration[] =
            configData.configurations || [];

          const config = configurations.find((c) => c.type === game.type);

          setPositionOptions(
            (config?.positions || []).map((p) => ({
              position: p.position,
              label: positionLabel(p.position),
            })),
          );
        }

        if (!dataRes.ok) {
          toast.error(data.message || "Failed to load registrations.");
          return;
        }

        if (game.type === "Individual") {
          setParticipants(data.participants || []);

          if (data.result) {
            const existing: Record<number, string> = {};

            data.result.positions.forEach((item: ResultPosition) => {
              existing[item.position] = String(item.employee);
            });

            setSelectedPositions(existing);
            setExistingResult(data.result);
          }
        } else {
          setGroups(data.groups || []);

          if (data.result) {
            const existing: Record<number, string> = {};

            data.result.positions.forEach(
              (item: { position: number; group: string }) => {
                existing[item.position] = String(item.group);
              },
            );

            setSelectedGroupPositions(existing);
            setExistingGroupResult(data.result);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load result form.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [game.gameId, game.type, isMarathon]);

  const saveIndividualResult = async () => {
    const resultPositions = positionOptions
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

      const res = await fetch(`/api/admin/results/individual/${game.gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: resultPositions }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save result.");
        return;
      }

      toast.success(
        existingResult
          ? "Result updated successfully."
          : "Result saved successfully.",
      );

      setExistingResult(data.result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  const saveGroupResult = async () => {
    const resultPositions = positionOptions
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

      const res = await fetch(`/api/admin/results/group/${game.gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: resultPositions }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save group result.");
        return;
      }

      toast.success(
        existingGroupResult
          ? "Group result updated successfully."
          : "Group result saved successfully.",
      );

      setExistingGroupResult(data.result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save group result.");
    } finally {
      setSaving(false);
    }
  };

  const employeeName = useMemo(() => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => map.set(p.employeeId, p));
    return map;
  }, [participants]);

  return (
    <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold text-black">
          {isMarathon
            ? "Marathon Participation"
            : existingResult || existingGroupResult
              ? "Update Result"
              : "Add Result"}{" "}
          — {game.gameName}
        </h4>

        <Button size="sm" variant="tertiary" onPress={onClose}>
          Close
        </Button>
      </div>

      {isMarathon ? (
        <MarathonPointsCard gameId={game.gameId} onCompleted={onClose} />
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : game.type === "Individual" ? (
        participants.length === 0 ? (
          <p className="text-sm text-slate-500">
            No employees are registered for this game.
          </p>
        ) : positionOptions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Please add point configuration for Individual games.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {positionOptions.map(({ position, label }) => (
                <div key={position} className="space-y-2">
                  <Label className="text-black">{label}</Label>

                  <Select
                    aria-label={`select participant for ${label}`}
                    value={selectedPositions[position] || ""}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        setSelectedPositions((current) => ({
                          ...current,
                          [position]: value,
                        }));
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox className="text-black">
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
                              <span className="text-xs text-slate-500">
                                {employee.employeeCode} • {employee.team}
                              </span>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  {selectedPositions[position] &&
                    employeeName.get(selectedPositions[position]) && (
                      <p className="text-xs text-slate-500">
                        {employeeName.get(selectedPositions[position])!.team}
                      </p>
                    )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onPress={saveIndividualResult} isDisabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    {existingResult ? "Updating..." : "Saving..."}
                  </>
                ) : existingResult ? (
                  "Update Result"
                ) : (
                  "Save Result"
                )}
              </Button>
            </div>
          </div>
        )
      ) : groups.length === 0 ? (
        <p className="text-sm text-slate-500">
          No groups are registered for this game.
        </p>
      ) : positionOptions.length === 0 ? (
        <p className="text-sm text-slate-500">
          Please add point configuration for Group games.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {positionOptions.map(({ position, label }) => (
              <div key={position} className="space-y-2">
                <Label className="text-black">{label}</Label>

                <Select
                  aria-label={`select group for ${label}`}
                  value={selectedGroupPositions[position] || ""}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      setSelectedGroupPositions((current) => ({
                        ...current,
                        [position]: value,
                      }));
                    }
                  }}
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover>
                    <ListBox className="text-black">
                      {groups.map((group) => (
                        <ListBox.Item
                          key={group.groupId}
                          id={group.groupId}
                          textValue={`${group.groupName} ${group.teamName}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {group.groupName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {group.teamName} • {group.participantCount}{" "}
                              members
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
                  {existingGroupResult ? "Updating..." : "Saving..."}
                </>
              ) : existingGroupResult ? (
                "Update Result"
              ) : (
                "Save Result"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
