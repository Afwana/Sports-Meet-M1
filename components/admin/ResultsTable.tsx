"use client";

import { getPageRange } from "@/lib/getPageRange";
import { Button, Input, Pagination, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Individual";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
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
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Group";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
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

  /* INDIVIDUAL RESULT */
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

  /* GROUP RESULT */
  const group = result as GroupPosition;

  return (
    <div className="flex min-w-40 flex-col">
      <span className="font-medium">{group.groupName}</span>

      <span className="text-xs text-default-500">{group.teamName}</span>
    </div>
  );
}

const ROWS_PER_PAGE = 10;

export default function ResultsTable({
  results,
  onEdit,
  onDelete,
}: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredResults = useMemo(() => {
    return results.filter((result) =>
      result.gameName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [results, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / ROWS_PER_PAGE),
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredResults.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredResults]);

  const start =
    filteredResults.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredResults.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <Table aria-label="Game results table" className="w-full">
      <div className="m-2">
        <Input
          aria-label="Search results"
          placeholder="Search results..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-10"
          variant="secondary"
        />
      </div>
      <Table.ScrollContainer>
        <Table.Content aria-label="label">
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

          <Table.Body items={paginatedItems}>
            {(row) => {
              const index =
                (page - 1) * ROWS_PER_PAGE +
                paginatedItems.findIndex((item) => item.gameId === row.gameId);

              return (
                <Table.Row key={row.gameId} id={row.gameId}>
                  {/* SL.NO */}
                  <Table.Cell>{index + 1}</Table.Cell>

                  {/* GAME */}
                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="font-medium">{row.gameName}</span>

                      <span className="text-xs text-default-500">
                        {row.category} | {row.gender} | {row.ageCategory}
                      </span>
                    </div>
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
      <Table.Footer className="flex flex-col items-center gap-3 p-3 md:flex-row md:justify-between">
        <Pagination size="sm">
          <Pagination.Summary>
            {start} to {end} of {filteredResults.length}
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
                  <span className="px-2 text-default-400 select-none">…</span>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </Table.Footer>
    </Table>
  );
}
