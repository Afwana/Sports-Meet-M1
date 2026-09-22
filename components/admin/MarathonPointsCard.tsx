"use client";

import { Button, Card, Spinner, Table } from "@heroui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TeamRow = {
  teamId: string;
  teamName: string;
  participantCount: number;
};

const columns = [
  { id: "team", name: "TEAM" },
  { id: "participants", name: "PARTICIPANTS" },
  { id: "points", name: "POINTS" },
];

export default function MarathonPointsCard({
  gameId,
  onCompleted,
}: {
  gameId: string;
  onCompleted: () => void;
}) {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, [gameId]);

  const addPoints = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/results/marathon/${gameId}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Marathon points added.");

      onCompleted();
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Marathon Team Participation</h3>
        <p className="text-sm text-default-500">
          Each participant earns 1 point for their team.
        </p>
      </div>

      <Table aria-label="Marathon teams">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Points Table"
            className="w-full rounded-none"
          >
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column isRowHeader={column.id === "team"}>
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>

            <Table.Body>
              {teams.map((team) => (
                <Table.Row key={team.teamId} id={team.teamId}>
                  <Table.Cell>{team.teamName}</Table.Cell>
                  <Table.Cell>{team.participantCount}</Table.Cell>
                  <Table.Cell>{team.participantCount}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <div className="flex justify-end">
        <Button onPress={addPoints} isDisabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" />
              Adding...
            </>
          ) : (
            "Add Points"
          )}
        </Button>
      </div>
    </Card>
  );
}
