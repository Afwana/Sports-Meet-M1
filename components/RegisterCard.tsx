"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  InputGroup,
  Label,
  ListBox,
  Select,
  Spinner,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Team {
  _id: string;
  name: string;
  color: string;
  logo: string;
}

interface Employee {
  employeeCode: string;
  employeeName: string;
  team: string;
  isCaptain: boolean;
  isRegistered: boolean;
  department: string;
  phoneNumber: string;
  role: "Employee" | "Captain";
}

export function RegisterCard() {
  const router = useRouter();

  const registerSchema = z.object({
    employeeCode: z.string().min(1, "Employee code is required!"),
    team: z.string().optional(),
    teamId: z.string().optional(),
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      employeeCode: "",
      team: "",
      teamId: "",
    },
  });

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const canLogin = employee?.isCaptain || employee?.isRegistered;

  const searchEmployee = async () => {
    const employeeCode = getValues("employeeCode").trim().toUpperCase();

    if (!employeeCode) {
      setEmployee(null);
      setEmployeeError("");
      return;
    }

    setLoading(true);
    setEmployeeError("");

    try {
      const res = await fetch(
        `/api/employee/check?employeeCode=${encodeURIComponent(employeeCode)}`,
        {
          method: "GET",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          // body: JSON.stringify({ employeeCode }),
          cache: "no-store",
        },
      );

      const data = await res.json();

      if (data.success) {
        setEmployee(data.employee);
        setValue("team", data.employee.team || "");
        setValue(
          "teamId",
          data.employee.teamId ? String(data.employee.teamId) : "",
        );
      } else {
        setEmployee(null);
        setEmployeeError(
          data.message ||
            "Employee not found. Please check your employee code.",
        );
      }
    } catch (error) {
      console.error(error);
      setEmployee(null);
      setEmployeeError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const team = useWatch({ control, name: "team" });

  const teamId = useWatch({ control, name: "teamId" });

  const onSubmit = async (formData: RegisterFormData) => {
    if (!employee) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/employee/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeCode: employee.employeeCode,
          teamId: formData.teamId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Registration completed successfully.");

        setEmployee({
          ...employee,
          team: formData.team as string,
          isRegistered: true,
        });
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setTeamsLoading(true);

        const res = await fetch("/api/teams");

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          toast.error("Failed to load teams.");
          return;
        }

        setTeams(data.teams);
      } catch (error) {
        console.error("Failed to load teams:", error);
        toast.error("Unable to load teams.");
      } finally {
        setTeamsLoading(false);
      }
    };

    loadTeams();
  }, []);

  return (
    <Card className="w-full md:w-2/5 p-5 h-auto shadow-md" variant="default">
      <CardHeader className="flex flex-col gap-1.5 items-center justify-center p-3 border-b border-solid">
        <CardTitle className="text-3xl font-bold">Sports Meet 2026</CardTitle>
        <CardDescription className="text-base">
          Employee Registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="employee-code">Employee Code</Label>
            <InputGroup className="h-10 w-full flex justify-between gap-2 bg-transparent shadow-none focus:border-none">
              <Input
                id="employee-code"
                placeholder="MB/AD/0000"
                type="text"
                className="h-10 w-full"
                {...register("employeeCode")}
                onBlur={searchEmployee}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchEmployee();
                  }
                }}
              />
              <InputGroup.Suffix>
                {loading && <Spinner size="md" color="accent" />}
              </InputGroup.Suffix>
            </InputGroup>
            {errors.employeeCode ? (
              <p className="text-sm text-red-500">
                {errors.employeeCode.message}
              </p>
            ) : (
              employeeError && (
                <p className="text-sm text-danger">{employeeError}</p>
              )
            )}
          </div>
          {employee && (
            <>
              <div className="flex flex-col gap-1">
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input
                  id="employee-name"
                  placeholder="Enter your name..."
                  type="text"
                  className="h-10"
                  value={employee?.employeeName || ""}
                  readOnly
                />
              </div>
              {canLogin ? (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="employee-team">Team</Label>
                  <Input
                    id="employee-team"
                    className="h-10"
                    value={employee?.team || ""}
                    readOnly
                  />
                </div>
              ) : (
                <Select
                  className="flex flex-col gap-1"
                  value={teamId || null}
                  onChange={(key) => {
                    const selectedTeam = teams.find((item) => item._id === key);

                    setValue("teamId", (key as string) || "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    setValue("team", selectedTeam?.name || "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  isDisabled={teamsLoading}
                  placeholder={
                    teamsLoading ? "Loading teams..." : "Select your team..."
                  }
                >
                  <Label>Team</Label>
                  <Select.Trigger className="h-10">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {teams.map((teamItem) => (
                        <ListBox.Item
                          key={teamItem._id}
                          id={teamItem._id}
                          textValue={teamItem.name}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              alt={`${teamItem.name} logo`}
                              src={teamItem.logo}
                              width={30}
                              height={30}
                              objectFit="cover"
                            />

                            {teamItem.name}
                          </div>

                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
              <Checkbox
                name="captain-check"
                isSelected={employee.isCaptain}
                isReadOnly
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  Is Captain
                </Checkbox.Content>
              </Checkbox>
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" className="w-32">
                  Cancel
                </Button>
                {canLogin ? (
                  <Button
                    className="w-32"
                    onPress={async () => {
                      const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          employeeCode: employee.employeeCode,
                        }),
                      });
                      const data = await res.json();

                      if (data.success) {
                        if (data.role === "Captain") {
                          router.push("/captain");
                        } else {
                          router.push("/games");
                        }
                      } else {
                        setEmployeeError(data.message);
                      }
                    }}
                  >
                    Login
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-32"
                    isPending={submitting}
                    isDisabled={submitting}
                  >
                    Register
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
