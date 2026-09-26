"use client";

import {
  Button,
  Card,
  Checkbox,
  Label,
  ListBox,
  Select,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TeamRow = {
  teamId: string;
  teamName: string;
  employees: {
    id: string;
    employeeName: string;
    employeeCode: string;
  }[];
  selectedEmployees: string[];
};

export default function MarathonPointsCard({
  gameId,
  onCompleted,
}: {
  gameId: string;
  onCompleted: () => void;
}) {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((t) => t.teamId === selectedTeamId),
    [teams, selectedTeamId],
  );

  const totalSelected = teams.reduce(
    (sum, t) => sum + t.selectedEmployees.length,
    0,
  );

  const toggleEmployee = (employeeId: string) => {
    setTeams((current) =>
      current.map((team) => {
        if (team.teamId !== selectedTeamId) return team;

        const exists = team.selectedEmployees.includes(employeeId);

        return {
          ...team,
          selectedEmployees: exists
            ? team.selectedEmployees.filter((id) => id !== employeeId)
            : [...team.selectedEmployees, employeeId],
        };
      }),
    );
  };

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/admin/results/marathon/${gameId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        setTeams(data.teams);

        if (data.teams.length) {
          setSelectedTeamId(data.teams[0].teamId);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [gameId]);

  const addPoints = async () => {
    const payload = {
      teams: teams.map((team) => ({
        teamId: team.teamId,
        teamName: team.teamName,
        selectedEmployees: team.selectedEmployees,
      })),
    };

    const res = await fetch(`/api/admin/results/marathon/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Marathon points added.");
    onCompleted();
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h3 className="text-lg font-semibold text-black">
          Marathon Team Participation
        </h3>
        <p className="text-sm text-slate-300">
          Select only the employees who actually participated.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-3">
        <div className="w-full md:w-1/4 space-y-2">
          <Label className="text-black">Select Team</Label>

          <Select
            value={selectedTeamId}
            onChange={(value) => {
              if (typeof value === "string") setSelectedTeamId(value);
            }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
              <ListBox className="text-black">
                {teams.map((team) => (
                  <ListBox.Item
                    key={team.teamId}
                    id={team.teamId}
                    textValue={team.teamName}
                  >
                    {team.teamName}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <Button size="md" onPress={addPoints} isDisabled={totalSelected === 0}>
          Add Points
        </Button>
      </div>

      {/* Team Progress */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {teams.map((team) => {
          const isActive = team.teamId === selectedTeamId;

          return (
            <button
              key={team.teamId}
              type="button"
              onClick={() => setSelectedTeamId(team.teamId)}
              className={`rounded-xl border p-3 text-left transition ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-slate-200 hover:border-primary/50 hover:bg-default-50"
              }`}
            >
              <div className="font-semibold text-black">{team.teamName}</div>

              <div className="mt-1 text-xs text-slate-300">
                Selected {team.selectedEmployees.length} /{" "}
                {team.employees.length}
              </div>

              <div className="mt-2 text-sm font-semibold text-primary text-slate-600">
                {team.selectedEmployees.length} pts
              </div>
            </button>
          );
        })}
      </div>

      {selectedTeam && (
        <Card className="border border-slate-200 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-semibold text-black">
                {selectedTeam.teamName}
              </h4>
              <p className="text-sm text-slate-300">
                Registered: {selectedTeam.employees.length} • Selected:{" "}
                {selectedTeam.selectedEmployees.length}
              </p>
            </div>

            <div className="rounded-full bg-primary/10 px-4 py-2 text-lg font-semibold text-slate-600">
              {selectedTeam.selectedEmployees.length} pts
            </div>
          </div>

          {selectedTeam.employees.length === 0 ? (
            <p className="text-sm text-slate-300">
              No registered participants.
            </p>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {selectedTeam.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="rounded-xl border border-slate-200 p-3 transition hover:border-primary hover:bg-default-50"
                >
                  <Checkbox
                    isSelected={selectedTeam.selectedEmployees.includes(
                      employee.id,
                    )}
                    onChange={() => toggleEmployee(employee.id)}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <div className="flex flex-col">
                        <span className="font-medium text-black">
                          {employee.employeeName}
                        </span>
                        <span className="text-xs text-slate-300">
                          {employee.employeeCode}
                        </span>
                      </div>
                    </Checkbox.Content>
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </Card>
  );
}
