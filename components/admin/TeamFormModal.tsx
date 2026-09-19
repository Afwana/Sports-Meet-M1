"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  ButtonGroup,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  Switch,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Team } from "@/types/team";
import Image from "next/image";
import { useRouter } from "next/navigation";

const teamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required."),
  color: z.string().optional(),
  logo: z.string().optional(),
  captain: z.string().optional(),
  isActive: z.boolean(),
});

type TeamFormInput = z.input<typeof teamSchema>;
type TeamFormOutput = z.output<typeof teamSchema>;

interface Props {
  team: Team | null;
  onClose: () => void;
  onSaved: (team: Team) => void;
}

interface EmployeeOption {
  _id: string;
  employeeName: string;
  employeeCode: string;
  role: "Employee" | "Captain";
  teamId?: string | null;
  department: string;
  phoneNumber: string;
  isCaptain: boolean;
  isRegistered: boolean;
}

export default function TeamFormModal({ team, onClose, onSaved }: Props) {
  const router = useRouter();
  const isEdit = !!team?._id;

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      setEmployees(data);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TeamFormInput, undefined, TeamFormOutput>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      color: "",
      logo: "",
      captain: "",
      isActive: true,
    },
  });

  const color = useWatch({
    control,
    name: "color",
  });

  const captain = useWatch({
    control,
    name: "captain",
  });

  const logo = useWatch({
    control,
    name: "logo",
  });

  const isActive = useWatch({
    control,
    name: "isActive",
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setValue("logo", previewUrl, {
      shouldDirty: true,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/team-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Upload failed.");
        URL.revokeObjectURL(previewUrl);
        return;
      }

      setValue("logo", data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      URL.revokeObjectURL(previewUrl);
      toast.success("Logo uploaded successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      URL.revokeObjectURL(previewUrl);
      toast.error("Upload failed.");
    }
  };

  const onSubmit: SubmitHandler<TeamFormOutput> = async (formData) => {
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/teams/${team._id}` : "/api/admin/teams";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save team.");
        return;
      }

      onSaved(data);

      toast.success(
        isEdit
          ? `${formData.name} updated successfully.`
          : `${formData.name} created successfully.`,
      );
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (isEdit && team) {
      reset({
        name: team.name,
        color: team.color,
        logo: team.logo,
        captain: team.captain?._id || "",
        isActive: team.isActive,
      });
    } else {
      reset({
        name: "",
        color: "",
        logo: "",
        captain: "",
        isActive: true,
      });
    }
  }, [team, isEdit, reset]);

  return (
    <Modal isOpen={!!team} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-blue-800 text-white p-5 font-bold text-3xl">
              {isEdit ? "Edit Team" : "Add New Team"}
            </Modal.Header>

            <Modal.Body className="p-5">
              <form
                id="team-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Team Name */}

                <div className="flex flex-col gap-1">
                  <Label>Team Name</Label>

                  <Input placeholder="Enter team name" {...register("name")} />

                  {errors.name && (
                    <p className="text-danger text-sm">{errors.name.message}</p>
                  )}
                </div>

                {/* Captain */}

                <div className="flex flex-col gap-1">
                  <Label>Captain</Label>

                  <Select
                    aria-label="Captain"
                    value={captain}
                    onChange={(value) => {
                      if (value) {
                        setValue("captain", value as string, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        {loadingEmployees ? (
                          <ListBox.Item id="loading" isDisabled>
                            Loading employees...
                          </ListBox.Item>
                        ) : (
                          employees
                            .filter(
                              (employee) =>
                                employee.role === "Employee" ||
                                employee._id === team?.captain?._id,
                            )
                            .map((employee) => (
                              <ListBox.Item
                                key={employee._id}
                                id={employee._id}
                              >
                                <div className="flex flex-col">
                                  <span>{employee.employeeName}</span>
                                  <span className="text-xs text-default-500">
                                    {employee.employeeCode}
                                  </span>
                                </div>
                              </ListBox.Item>
                            ))
                        )}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* Logo Image upload */}
                <div className="flex flex-col gap-2">
                  <Label>Team Logo</Label>

                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border bg-default-100">
                      {logo ? (
                        <Image
                          src={logo}
                          alt="Team Logo"
                          width={80}
                          height={80}
                          objectFit="cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-default-500">
                          No Logo
                        </div>
                      )}
                    </div>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>

                {/* Color picker */}
                <div className="flex flex-col gap-2">
                  <Label>Team Color</Label>

                  <div className="flex items-center gap-4 rounded-xl border p-3">
                    <input
                      type="color"
                      value={color || "#2563EB"}
                      onChange={(e) =>
                        setValue("color", e.target.value, {
                          shouldDirty: true,
                        })
                      }
                      className="h-12 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                    />

                    <div className="flex flex-col">
                      <span className="font-medium">{color || "#2563EB"}</span>
                      <span className="text-sm text-default-500">
                        Team primary color
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active */}

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Switch
                    isSelected={isActive}
                    onChange={(value) =>
                      setValue("isActive", value, { shouldDirty: true })
                    }
                  >
                    <p className="font-medium">Status</p>
                    <Switch.Content>
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>

                      <p className="text-default-500 text-sm">
                        {isActive
                          ? "Captain is active."
                          : "Captain is not here!."}
                      </p>
                    </Switch.Content>
                  </Switch>
                </div>
              </form>
            </Modal.Body>

            <Modal.Footer className="p-3">
              <Button variant="ghost" onPress={onClose}>
                Cancel
              </Button>
              <ButtonGroup>
                <Button variant="primary" type="submit" form="team-form">
                  {isEdit ? "Update" : "Create"}
                </Button>
                {loading && (
                  <Button isIconOnly aria-label="More options">
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
