"use client";

import {
  Button,
  Input,
  Table,
  Switch,
  ButtonGroup,
  Card,
  Pagination,
  Chip,
} from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Employee } from "@/types/employee";
import EmployeeFormModal from "./EmployeeFormModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import { getAgeCategory } from "@/lib/getAgeCategory";

interface Props {
  employees: Employee[];
}

const newEmployee: Employee = {
  _id: "",
  employeeCode: "",
  employeeName: "",
  gender: "Male",
  dateOfBirth: new Date(),
  role: "Employee",
  team: "",
  teamId: "",
  department: "",
  phoneNumber: "",
  isCaptain: false,
  isRegistered: false,
};

const columns = [
  { id: "code", name: "Employee Code" },
  { id: "name", name: "Employee Name" },
  { id: "gender", name: "Gender" },
  { id: "team", name: "Team" },
  { id: "role", name: "Role" },
  { id: "department", name: "Department" },
  { id: "phoneNumber", name: "Phone Number" },
  { id: "isRegistered", name: "Registered" },
  { id: "actions", name: "Actions" },
];

const ROWS_PER_PAGE = 30;

export default function EmployeesTable({ employees }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [employeeList, setEmployeeList] = useState(employees);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );

  const filteredEmployees = useMemo(() => {
    return employeeList.filter((employee) =>
      employee.employeeName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [employeeList, search]);

  const totalPages = Math.ceil(filteredEmployees.length / ROWS_PER_PAGE);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredEmployees.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredEmployees]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredEmployees.length);

  return (
    <div>
      <Card className="w-full p-5 min-h-[calc(100vh-115px)]">
        <Card.Header>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Employees</h1>

            <p className="text-default-500 text-sm">
              Manage employees and captains.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Input
              aria-label="Search employees"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3 h-10"
              variant="secondary"
            />

            <ButtonGroup variant="primary" className="h-10">
              <Button
                isIconOnly
                aria-label="Show QR code"
                onPress={() => setEditingEmployee(newEmployee)}
              >
                <Plus size={18} />
              </Button>
              <Button onPress={() => setEditingEmployee(newEmployee)}>
                <ButtonGroup.Separator />
                Add Employee
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
                    <Table.Column isRowHeader={column.id === "name"}>
                      {column.name}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body items={paginatedItems} className="rounded-none">
                  {(employee) => {
                    return (
                      <Table.Row key={employee._id} id={employee._id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.employeeCode}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex flex-col gap-1">
                            {employee.employeeName}
                            <span className="text-slate-300 text-xs font-medium">
                              {employee.dateOfBirth
                                ? getAgeCategory(employee.dateOfBirth)
                                : ""}
                            </span>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.gender}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.team}
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
                          <div className="flex items-center gap-3">
                            {employee.department}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {employee.phoneNumber}
                          </div>
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

                        <Table.Cell>
                          <div className="flex gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="tertiary"
                              aria-label={`Edit ${employee.employeeName}`}
                              onPress={() => setEditingEmployee(employee)}
                            >
                              <Pencil size={16} />
                            </Button>

                            <Button
                              isIconOnly
                              size="sm"
                              variant="danger"
                              aria-label={`Delete ${employee.employeeName}`}
                              onPress={() => setDeletingEmployee(employee)}
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
            <Table.Footer>
              <Pagination size="sm">
                <Pagination.Summary>
                  {start} to {end} of {filteredEmployees.length} results
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
                  {pages.map((p) => (
                    <Pagination.Item key={p}>
                      <Pagination.Link
                        isActive={p === page}
                        onPress={() => setPage(p)}
                      >
                        {p}
                      </Pagination.Link>
                    </Pagination.Item>
                  ))}
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
      <EmployeeFormModal
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSaved={(savedEmployee) => {
          setEmployeeList((prev) => {
            const exists = prev.some((g) => g._id === savedEmployee._id);

            if (exists) {
              return prev.map((g) =>
                g._id === savedEmployee._id ? savedEmployee : g,
              );
            }

            return [...prev, savedEmployee];
          });

          setEditingEmployee(null);
        }}
      />

      <DeleteEmployeeModal
        employee={deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onDeleted={(id) => {
          setEmployeeList((prev) =>
            prev.filter((employee) => employee._id !== id),
          );
          setDeletingEmployee(null);
        }}
      />
    </div>
  );
}
