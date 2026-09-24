"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ButtonGroup,
  Input,
  Label,
  Modal,
  Spinner,
  Select,
  ListBox,
  Switch,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Employee } from "@/types/employee";

const employeeSchema = z.object({
  employeeCode: z.string().min(2, "Employee code is required."),
  employeeName: z.string().min(2, "Employee name is required."),
  dateOfBirth: z.string().min(1, "Date of Birth is required."),
  gender: z.enum(["Male", "Female"]),
  teamId: z.string().optional(),
  team: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  isRegistered: z.boolean(),
});

type EmployeeFormInput = z.input<typeof employeeSchema>;
type EmployeeFormOutput = z.output<typeof employeeSchema>;

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onSaved: (employee: Employee) => void;
}

interface TeamOption {
  _id: string;
  name: string;
}

export default function EmployeeFormModal({
  employee,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!employee?._id;

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormInput, undefined, EmployeeFormOutput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: "",
      employeeName: "",
      dateOfBirth: "",
      gender: "Male",
      teamId: "",
      team: "",
      department: "",
      phoneNumber: "",
      isRegistered: false,
    },
  });

  const teamId = useWatch({
    control,
    name: "teamId",
  });
  const isRegistered = useWatch({ control, name: "isRegistered" });
  const gender = useWatch({
    control,
    name: "gender",
  });

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoadingTeams(true);

        const res = await fetch("/api/admin/teams");

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load teams.");
          return;
        }

        setTeams(data);
      } catch (error) {
        console.error("Failed to load teams:", error);

        toast.error("Failed to load teams.");
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, []);

  const onSubmit: SubmitHandler<EmployeeFormOutput> = async (formData) => {
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/employees/${employee._id}`
        : "/api/admin/employees";

      const method = isEdit ? "PATCH" : "POST";

      const selectedTeam = teams.find((team) => team._id === formData.teamId);

      const payload = {
        employeeCode: formData.employeeCode.trim().toUpperCase(),
        employeeName: formData.employeeName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        teamId: formData.teamId?.trim() || null,
        team: selectedTeam?.name ?? formData.team?.trim() ?? "",
        department: formData.department?.trim() ?? "",
        phoneNumber: formData.phoneNumber?.trim() ?? "",
        isRegistered: formData.isRegistered,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save employee.");
        return;
      }

      onSaved(data);

      toast.success(
        isEdit
          ? `${formData.employeeName} updated successfully.`
          : `${formData.employeeName} created successfully.`,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit && employee) {
      reset({
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        dateOfBirth: employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: employee.gender,
        teamId: employee.teamId ?? "",
        team: employee.team || "",
        department: employee.department ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        isRegistered: employee.isRegistered,
      });
    } else {
      reset({
        employeeCode: "",
        employeeName: "",
        dateOfBirth: "",
        gender: "Male",
        teamId: "",
        team: "",
        department: "",
        phoneNumber: "",
        isRegistered: false,
      });
    }
  }, [employee, isEdit, reset]);

  const handleTeamChange = (value: string) => {
    const selectedTeam = teams.find((team) => team._id === value);

    setValue("teamId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("team", selectedTeam?.name ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Modal isOpen={!!employee} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-blue-800 text-white p-5 font-bold text-3xl">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </Modal.Header>

            <Modal.Body className="p-5">
              <form
                id="employee-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Employee Code */}

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Employee Code</Label>

                  <Input
                    placeholder="Enter employee code"
                    {...register("employeeCode")}
                    onChange={(e) =>
                      setValue("employeeCode", e.target.value.toUpperCase(), {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    disabled={loading}
                  />

                  {errors.employeeCode && (
                    <p className="text-danger text-sm">
                      {errors.employeeCode.message}
                    </p>
                  )}
                </div>

                {/* Employee Name */}

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Employee Name</Label>

                  <Input
                    placeholder="Enter employee name"
                    {...register("employeeName")}
                    onChange={(e) =>
                      setValue("employeeName", e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    disabled={loading}
                  />

                  {errors.employeeName && (
                    <p className="text-danger text-sm">
                      {errors.employeeName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Date of Birth</Label>

                  <Input type="date" {...register("dateOfBirth")} />

                  {errors.dateOfBirth && (
                    <p className="text-danger text-sm">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Gender</Label>

                  <Select
                    aria-label="Employee gender"
                    placeholder="Select gender"
                    value={gender}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        setValue("gender", value as "Male" | "Female", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                    isDisabled={loading}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="Male" textValue="Male">
                          Male
                          <ListBox.ItemIndicator />
                        </ListBox.Item>

                        <ListBox.Item id="Female" textValue="Female">
                          Female
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  {errors.gender && (
                    <p className="text-sm text-danger">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Team</Label>

                  <Select
                    aria-label="Team"
                    placeholder="Select team"
                    value={teamId ?? ""}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        handleTeamChange(value);
                      }
                    }}
                    isDisabled={loading || loadingTeams}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        {loadingTeams ? (
                          <ListBox.Item
                            id="loading"
                            isDisabled
                            textValue="Loading teams"
                          >
                            Loading teams...
                          </ListBox.Item>
                        ) : teams.length === 0 ? (
                          <ListBox.Item
                            id="empty"
                            isDisabled
                            textValue="No teams"
                          >
                            No teams available.
                          </ListBox.Item>
                        ) : (
                          teams.map((team) => (
                            <ListBox.Item
                              key={team._id}
                              id={team._id}
                              textValue={team.name}
                            >
                              {team.name}

                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Department</Label>

                  <Input
                    placeholder="Enter department"
                    {...register("department")}
                  />

                  {errors.department && (
                    <p className="text-sm text-danger">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-black">Phone Number</Label>

                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...register("phoneNumber")}
                  />

                  {errors.phoneNumber && (
                    <p className="text-sm text-danger">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {isEdit && (
                  <div className="rounded-lg border p-3">
                    <Switch isSelected={employee?.isCaptain} isDisabled>
                      <p className="font-medium text-black">Captain</p>

                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>

                        <p className="text-slate-300 text-sm">
                          {employee?.isCaptain
                            ? "Assigned as team captain."
                            : "Not a captain."}
                        </p>
                      </Switch.Content>
                    </Switch>
                  </div>
                )}

                {isEdit && (
                  <div className="rounded-lg border p-3">
                    <Switch isSelected={isRegistered} isDisabled>
                      <p className="font-medium text-black">
                        Registration Status
                      </p>

                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>

                        <p className="text-slate-300 text-sm">
                          {isRegistered
                            ? "Employee has completed registration."
                            : "Employee has not registered yet."}
                        </p>
                      </Switch.Content>
                    </Switch>
                  </div>
                )}
              </form>
            </Modal.Body>

            <Modal.Footer className="p-3">
              <Button variant="ghost" onPress={onClose}>
                Cancel
              </Button>
              <ButtonGroup>
                <Button
                  variant="primary"
                  type="submit"
                  form="employee-form"
                  isDisabled={loading}
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
                {loading && (
                  <Button
                    isIconOnly
                    aria-label="More options"
                    variant="primary"
                  >
                    <ButtonGroup.Separator />
                    <Spinner size="md" className="text-white" />
                  </Button>
                )}
              </ButtonGroup>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
