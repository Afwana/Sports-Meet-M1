"use client";

import { getPageRange } from "@/lib/getPageRange";
import { Employee } from "@/types/employee";
import { Card, Chip, Input, Pagination, Switch, Table } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

const columns = [
  { id: "code", name: "Employee Code" },
  { id: "name", name: "Name" },
  { id: "role", name: "Role" },
  { id: "status", name: "Registered" },
];

const ROWS_PER_PAGE = 10;

export default function CaptainMembersPage() {
  const [members, setMembers] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/captain/members")
      .then((r) => r.json())
      .then(setMembers);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) =>
      member.employeeName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [members, search]);

  const totalPages = Math.ceil(filteredMembers.length / ROWS_PER_PAGE);

  // const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredMembers.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredMembers]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredMembers.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <div className="min-h-[calc(100vh-104px)] bg-blue-50 dark:bg-black p-5">
      <Card className="w-full p-5 min-h-[calc(100vh-105px)]">
        <Card.Header>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Team Members</h1>

            <p className="text-default-500 text-sm">
              Manage your team members.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Input
              aria-label="Search team members"
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3 h-10"
              variant="secondary"
            />
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
                    <Table.Column isRowHeader={column.id === "name"}>
                      {column.name}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={paginatedItems} className="rounded-none">
                  {(employee) => {
                    return (
                      <Table.Row key={employee._id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.employeeCode}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.employeeName}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {employee.isCaptain ? (
                            <Chip color="accent" className="bg-blue-50">
                              {employee.role}
                            </Chip>
                          ) : (
                            <Chip color="warning" className="bg-yellow-50">
                              {employee.role}
                            </Chip>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          <Switch isSelected={employee.isRegistered} size="sm">
                            <Switch.Content>
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch.Content>
                          </Switch>
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
                  {start} to {end} of {filteredMembers.length} results
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
    </div>
  );
}
