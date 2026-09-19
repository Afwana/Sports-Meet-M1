"use client";

import { Button, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";

type IndividualPosition = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  teamName: string;
};

type GroupPosition = {
  groupId: string;
  groupName: string;
  teamName: string;
};

type IndividualResultRow = {
  gameId: string;
  gameName: string;
  type: "Individual";
  resultId: string | null;

  positions: {
    first: IndividualPosition | null;
    second: IndividualPosition | null;
    third: IndividualPosition | null;
  };
};

type GroupResultRow = {
  gameId: string;
  gameName: string;
  type: "Group";
  resultId: string | null;

  positions: {
    first: GroupPosition | null;
    second: GroupPosition | null;
    third: GroupPosition | null;
  };
};

export type ResultRow = IndividualResultRow | GroupResultRow;

type PositionResult = IndividualPosition | GroupPosition | null;

interface ResultsTableProps {
  results: ResultRow[];
  onEdit: (row: ResultRow) => void;
  onDelete: (row: ResultRow) => void;
}

const columns = [
  {
    key: "slno",
    label: "SL.NO",
  },
  {
    key: "game",
    label: "GAME",
  },
  {
    key: "type",
    label: "TYPE",
  },
  {
    key: "first",
    label: "WINNER (1st)",
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
    key: "actions",
    label: "ACTIONS",
  },
];

function PositionCell({
  result,
  type,
}: {
  result: PositionResult;
  type: "Individual" | "Group";
}) {
  if (!result) {
    return <span className="text-default-400">—</span>;
  }

  /*
   * INDIVIDUAL RESULT
   */
  if (type === "Individual") {
    const individual = result as IndividualPosition;

    return (
      <div className="flex min-w-40 flex-col">
        <span className="font-medium">{individual.employeeName}</span>

        <span className="text-xs text-default-500">{individual.teamName}</span>

        <span className="text-[11px] text-default-400">
          {individual.employeeCode}
        </span>
      </div>
    );
  }

  /*
   * GROUP RESULT
   */
  const group = result as GroupPosition;

  return (
    <div className="flex min-w-40 flex-col">
      <span className="font-medium">{group.groupName}</span>

      <span className="text-xs text-default-500">{group.teamName}</span>
    </div>
  );
}

export default function ResultsTable({
  results,
  onEdit,
  onDelete,
}: ResultsTableProps) {
  return (
    <Table aria-label="Game results table" className="w-full">
      <Table.ScrollContainer>
        <Table.Content>
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column
                key={column.key}
                isRowHeader={column.key === "slno"}
              >
                {column.label}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={results}>
            {(row) => {
              const index = results.findIndex(
                (item) => item.gameId === row.gameId,
              );

              return (
                <Table.Row key={row.gameId}>
                  {/* SL.NO */}
                  <Table.Cell>{index + 1}</Table.Cell>

                  {/* GAME */}
                  <Table.Cell>
                    <span className="font-medium">{row.gameName}</span>
                  </Table.Cell>

                  {/* TYPE */}
                  <Table.Cell>
                    <span
                      className={
                        row.type === "Individual"
                          ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                          : "rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary"
                      }
                    >
                      {row.type}
                    </span>
                  </Table.Cell>

                  {/* WINNER */}
                  <Table.Cell>
                    <PositionCell
                      result={row.positions.first}
                      type={row.type}
                    />
                  </Table.Cell>

                  {/* SECOND */}
                  <Table.Cell>
                    <PositionCell
                      result={row.positions.second}
                      type={row.type}
                    />
                  </Table.Cell>

                  {/* THIRD */}
                  <Table.Cell>
                    <PositionCell
                      result={row.positions.third}
                      type={row.type}
                    />
                  </Table.Cell>

                  {/* ACTIONS */}
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="outline"
                        aria-label={`Edit ${row.gameName}`}
                        onPress={() => onEdit(row)}
                        isDisabled={!row.resultId}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        isIconOnly
                        size="sm"
                        variant="danger"
                        aria-label={`Delete ${row.gameName}`}
                        onPress={() => onDelete(row)}
                        isDisabled={!row.resultId}
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
    </Table>
  );
}
