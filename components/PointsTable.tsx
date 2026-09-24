"use client";

import { Card, Spinner, Table } from "@heroui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PointTableRow = {
  rank: number;
  teamId: string;
  teamName: string;
  first: number;
  second: number;
  third: number;
  totalPoints: number;
};

const columns = [
  {
    key: "rank",
    label: "RANK",
  },
  {
    key: "team",
    label: "TEAM",
  },
  {
    key: "first",
    label: "1st",
  },
  {
    key: "second",
    label: "2nd",
  },
  {
    key: "third",
    label: "3rd",
  },
  {
    key: "points",
    label: "TOTAL POINTS",
  },
];

export default function PointsTable() {
  const [rows, setRows] = useState<PointTableRow[]>([]);

  const [loading, setLoading] = useState(true);

  const loadPointTable = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/results/points-table");

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load point table.");
        return;
      }

      setRows(data.pointTable ?? []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load point table.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPointTable();
  }, []);

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title className="text-black">Point Table</Card.Title>

          <Card.Description>
            Current team standings based on published results.
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <Table aria-label="Point table">
            <Table.ScrollContainer>
              <Table.Content>
                <Table.Header columns={columns}>
                  {(column) => (
                    <Table.Column
                      key={column.key}
                      isRowHeader={column.key === "rank"}
                    >
                      {column.label}
                    </Table.Column>
                  )}
                </Table.Header>

                <Table.Body items={rows}>
                  {(row) => (
                    <Table.Row key={row.teamId} id={row.teamId}>
                      <Table.Cell className="text-black">
                        <span className="font-semibold">{row.rank}</span>
                      </Table.Cell>

                      <Table.Cell className="text-black">
                        <span className="font-medium">{row.teamName}</span>
                      </Table.Cell>

                      <Table.Cell className="text-black">
                        {row.first}
                      </Table.Cell>

                      <Table.Cell className="text-black">
                        {row.second}
                      </Table.Cell>

                      <Table.Cell className="text-black">
                        {row.third}
                      </Table.Cell>

                      <Table.Cell className="text-black">
                        <span className="font-bold">{row.totalPoints}</span>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        )}
      </Card.Content>
    </Card>
  );
}
