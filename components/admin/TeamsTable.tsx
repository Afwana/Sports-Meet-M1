"use client";

import {
  Button,
  Input,
  Table,
  Switch,
  ButtonGroup,
  Card,
  Pagination,
} from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Team } from "@/types/team";
import TeamFormModal from "./TeamFormModal";
import DeleteTeamModal from "./DeleteTeamModal";
import Image from "next/image";
import { getPageRange } from "@/lib/getPageRange";

interface Props {
  teams: Team[];
}

const newTeam: Team = {
  _id: "",
  name: "",
  color: "#2563EB",
  logo: "",
  captain: null,
  isActive: true,
};

const columns = [
  { id: "team", name: "Team" },
  { id: "captain", name: "Captain" },
  { id: "active", name: "Active" },
  { id: "actions", name: "Actions" },
];

const ROWS_PER_PAGE = 10;

export default function TeamsTable({ teams }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [teamList, setTeamList] = useState(teams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const filteredTeams = useMemo(() => {
    return teamList.filter((team) =>
      (team?.name ?? "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [teamList, search]);

  const totalPages = Math.ceil(filteredTeams.length / ROWS_PER_PAGE);

  // const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredTeams.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredTeams]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredTeams.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <div>
      <Card className="w-full p-5 min-h-[calc(100vh-115px)]">
        <Card.Header>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Teams</h1>

            <p className="text-default-500 text-sm">Manage Teams.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Input
              aria-label="Search teams"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3 h-10"
              variant="secondary"
            />

            <ButtonGroup variant="primary" className="h-10">
              <Button
                isIconOnly
                aria-label="Show QR code"
                onPress={() => setEditingTeam(newTeam)}
              >
                <Plus size={18} />
              </Button>
              <Button onPress={() => setEditingTeam(newTeam)}>
                <ButtonGroup.Separator />
                Add Team
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        <Card.Content>
          <Table className="bg-transparent shadow-md p-0">
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Games Table"
                className="w-full rounded-none"
              >
                <Table.Header columns={columns}>
                  {(column) => (
                    <Table.Column isRowHeader={column.id === "team"}>
                      {column.name}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={paginatedItems} className="rounded-none">
                  {(team) => {
                    return (
                      <Table.Row key={team._id} id={team._id}>
                        <Table.Cell>
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            {team.logo ? (
                              <Image
                                src={team.logo}
                                alt={team.name}
                                className="rounded-full border"
                                width={60}
                                height={60}
                                objectFit="cover"
                              />
                            ) : (
                              <div
                                className="h-10 w-10 rounded-full border"
                                style={{ backgroundColor: team.color }}
                              />
                            )}

                            <span>{team.name}</span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {team.captain ? (
                            <div className="flex flex-col">
                              <span>{team.captain.employeeName}</span>
                              <span className="text-xs text-default-500">
                                {team.captain.employeeCode}
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </Table.Cell>

                        {/* <Table.Cell>{team.color}</Table.Cell> */}

                        <Table.Cell>
                          <Switch isSelected={team.isActive} size="sm">
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch.Content>
                          </Switch>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="tertiary"
                              aria-label={`Edit ${team.name}`}
                              onPress={() => setEditingTeam(team)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              isIconOnly
                              size="sm"
                              variant="danger"
                              aria-label={`Delete ${team.name}`}
                              onPress={() => setDeletingTeam(team)}
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
                  {start} to {end} of {filteredTeams.length} results
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
        </Card.Content>
      </Card>
      <TeamFormModal
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSaved={(savedTeam) => {
          setTeamList((prev) => {
            const exists = prev.some((g) => g._id === savedTeam._id);

            if (exists) {
              return prev.map((g) => (g._id === savedTeam._id ? savedTeam : g));
            }

            return [...prev, savedTeam];
          });

          setEditingTeam(null);
        }}
      />

      <DeleteTeamModal
        team={deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onDeleted={(id) => {
          setTeamList((prev) => prev.filter((team) => team._id !== id));
          setDeletingTeam(null);
        }}
      />
    </div>
  );
}
