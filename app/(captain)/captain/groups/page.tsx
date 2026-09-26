"use client";

import { getPageRange } from "@/lib/getPageRange";
import { GroupRegistration } from "@/types/registration";
import { Card, Input, Pagination, Spinner, Table } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

interface Game {
  _id: string;
  name: string;
  maxParticipants: number;
}

const columns = [
  { id: "slNo", name: "SL. NO" },
  { id: "game", name: "GAME NAME" },
  { id: "groupName", name: "GROUP NAME" },
  { id: "participants", name: "PARTICIPANTS" },
];

const ROWS_PER_PAGE = 10;

export default function CaptainGroupsPage() {
  const [registrations, setRegistrations] = useState<GroupRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadRegistrations = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/captain/group-registrations");
      const data = await res.json();

      if (data.success) {
        setRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const gameMatch = registration.game.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const groupMatch = registration.groupName
        .toLowerCase()
        .includes(search.toLowerCase());

      const participantMatch = registration.participants.some((p) =>
        p.employeeName.toLowerCase().includes(search.toLowerCase()),
      );

      return gameMatch || groupMatch || participantMatch;
    });
  }, [registrations, search]);

  const groupedGames = useMemo(() => {
    const grouped = filteredRegistrations.reduce(
      (acc, registration) => {
        const gameId = registration.game._id;

        if (!acc[gameId]) {
          acc[gameId] = {
            game: registration.game,
            groups: [],
          };
        }

        acc[gameId].groups.push(registration);

        return acc;
      },
      {} as Record<string, { game: Game; groups: GroupRegistration[] }>,
    );

    return Object.values(grouped);
  }, [filteredRegistrations]);

  const totalPages = Math.max(
    1,
    Math.ceil(groupedGames.length / ROWS_PER_PAGE),
  );

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    const games = groupedGames.slice(start, start + ROWS_PER_PAGE);

    return games.flatMap((gameGroup, gameIndex) =>
      gameGroup.groups.map((group, groupIndex) => ({
        ...group,
        showGame: groupIndex === 0,
        slNo: start + gameIndex + 1,
        gameName: gameGroup.game.name,
      })),
    );
  }, [groupedGames, page]);

  const start = groupedGames.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, groupedGames.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <>
      <div className="min-h-[calc(100vh-104px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 dark:bg-black p-5 text-black">
        <Card className="w-full p-5 min-h-[calc(100vh-105px)]">
          <Card.Header>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Group Registrations</h1>

              <p className="text-slate-500 text-sm">
                Manage Group registrations for your team.
              </p>

              <div className="mt-5 max-w-full">
                <Input
                  aria-label="Search group registrations"
                  placeholder="Search group registrations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="md:w-1/3 h-10"
                  variant="secondary"
                />
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <Table className="bg-transparent shadow-md p-0">
                <Table.ScrollContainer>
                  <Table.Content
                    aria-label="Individual Registrations"
                    className="w-full rounded-none"
                  >
                    <Table.Header columns={columns}>
                      {(column) => (
                        <Table.Column isRowHeader={column.id === "slNo"}>
                          {column.name}
                        </Table.Column>
                      )}
                    </Table.Header>

                    <Table.Body items={paginatedItems} className="rounded-none">
                      {(registration) => (
                        <Table.Row key={registration._id} id={registration._id}>
                          <Table.Cell className="text-black">
                            {registration.showGame ? registration.slNo : ""}
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            {registration.showGame ? (
                              <span className="font-semibold">
                                {registration.gameName}
                              </span>
                            ) : (
                              ""
                            )}
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            <span className="font-medium">
                              {registration.groupName}
                            </span>
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            <div className="flex flex-wrap gap-2">
                              {registration.participants.map((participant) => (
                                <div
                                  key={participant._id}
                                  className="rounded-md bg-default-100 px-2 py-1"
                                >
                                  <div className="text-sm font-medium">
                                    {participant.employeeName}
                                  </div>

                                  <div className="text-xs text-slate-300">
                                    {participant.employeeCode}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
                <Table.Footer className="flex flex-col items-center gap-3 p-3 md:flex-row md:justify-between">
                  <Pagination size="sm">
                    <Pagination.Summary>
                      {start} to {end} of {groupedGames.length}
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
            )}
          </Card.Content>
        </Card>
      </div>
    </>
  );
}
