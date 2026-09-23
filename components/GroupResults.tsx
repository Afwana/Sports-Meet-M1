/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { getPageRange } from "@/lib/getPageRange";
import { Card, Pagination, Spinner, Table } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type GroupPosition = {
  groupId: string;
  groupName: string;
  teamName: string;
  points: number;
} | null;

type GroupResultRow = {
  gameId: string;
  gameName: string;
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Individual" | "Group";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
  hasResult: boolean;
  positions: {
    first: GroupPosition;
    second: GroupPosition;
    third: GroupPosition;
  };
};

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
    key: "winner",
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
];

function PositionCell({ result }: { result: GroupPosition }) {
  if (!result) {
    return <span className="text-default-400">—</span>;
  }

  return (
    <div className="flex min-w-40 flex-col">
      <span className="font-medium">{result.groupName}</span>

      <span className="text-xs text-default-500">{result.teamName}</span>
    </div>
  );
}

const ROWS_PER_PAGE = 6;

export default function GroupResults() {
  const [results, setResults] = useState<GroupResultRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const loadResults = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/results/group");

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load group results.");
        return;
      }

      const publishedResults = (data.results ?? []).filter(
        (result: GroupResultRow) => result.hasResult,
      );

      setResults(publishedResults);
    } catch (error) {
      console.error("Failed to load group results:", error);

      toast.error("Failed to load group results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const totalPages = Math.ceil(results.length / ROWS_PER_PAGE);

  // const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return results.slice(start, start + ROWS_PER_PAGE);
  }, [page, results]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, results.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>Group Results</Card.Title>

          <Card.Description>
            View the winners and results of group events.
          </Card.Description>
        </div>
      </Card.Header>

      <Card.Content>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <Table aria-label="Group results">
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

                <Table.Body items={paginatedItems}>
                  {(row) => {
                    const index = results.findIndex(
                      (item) => item.gameId === row.gameId,
                    );

                    return (
                      <Table.Row key={row.gameId}>
                        <Table.Cell>{index + 1}</Table.Cell>

                        <Table.Cell>
                          <div className="flex flex-col">
                            <span className="font-medium">{row.gameName}</span>

                            <span className="text-xs text-default-500">
                              {row.category} | {row.gender} | {row.ageCategory}
                            </span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {row.hasResult ? (
                            <PositionCell result={row.positions.first} />
                          ) : (
                            <span className="text-sm text-default-400">
                              Result not published
                            </span>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          {row.hasResult ? (
                            <PositionCell result={row.positions.second} />
                          ) : (
                            <span className="text-default-400">—</span>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          {row.hasResult ? (
                            <PositionCell result={row.positions.third} />
                          ) : (
                            <span className="text-default-400">—</span>
                          )}
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
                  {start} to {end} of {results.length} results
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
                        <span className="px-2 text-default-400 select-none">
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
        )}
      </Card.Content>
    </Card>
  );
}
