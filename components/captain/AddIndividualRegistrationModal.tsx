"use client";

import { Employee } from "@/types/employee";
import { IndividualRegistration } from "@/types/registration";
import {
  Button,
  Modal,
  Spinner,
  Select,
  ListBox,
  Label,
  Key,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUser, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface Game {
  _id: string;
  name: string;
  minParticipants: number;
  maxParticipants?: number | null;
  maxParticipantsPerTeam?: number | null;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  onSaved: (registration: IndividualRegistration) => void;
}

export default function AddIndividualRegistrationModal({
  isOpen,
  onOpenChange,
  game,
  onSaved,
}: Props) {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Key[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !game) return;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);

        const res = await fetch(
          `/api/captain/individual-registrations/available-employees?gameId=${game._id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load employees.");
          return;
        }

        setEmployees(data.employees || []);
        setSelectedEmployees([]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen, game]);

  const handleSave = async () => {
    if (!game) return;

    if (selectedEmployees.length === 0) {
      toast.error("Select at least one employee.");
      return;
    }

    if (
      game.maxParticipantsPerTeam != null &&
      selectedEmployees.length > game.maxParticipantsPerTeam
    ) {
      toast.error(
        `Maximum ${game.maxParticipantsPerTeam} participants are allowed from your team.`,
      );
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/captain/individual-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: game._id,
          participants: selectedEmployees,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create registration.");
        return;
      }

      toast.success("Registration created successfully.");

      onSaved(data.registration);

      setSelectedEmployees([]);
      onOpenChange(false);

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create registration.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;

    setSelectedEmployees([]);
    onOpenChange(false);
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Container size="lg">
          <Modal.Dialog className="p-0">
            <Modal.CloseTrigger>
              <div className="rounded-full bg-default" aria-label="Close">
                <FaXmark />
              </div>
            </Modal.CloseTrigger>

            <Modal.Header className="bg-blue-800 p-5">
              <Modal.Heading className="text-xl font-bold text-white">
                Add Individual Registration
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-5">
              {game && (
                <div className="space-y-5">
                  <div className="rounded-lg bg-default-100 p-4">
                    <div className="flex items-center gap-2">
                      <FaUser />

                      <span className="font-semibold">{game.name}</span>
                    </div>

                    <p className="mt-1 text-sm text-default-500">
                      Select up to {game.maxParticipantsPerTeam} employees.
                    </p>
                  </div>

                  {loadingEmployees ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-default-500">
                      No available employees.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Select Employees</Label>

                        <Select
                          selectionMode="multiple"
                          value={selectedEmployees}
                          onChange={(value) =>
                            setSelectedEmployees(
                              Array.isArray(value) ? value : [],
                            )
                          }
                          className="w-full mt-2"
                        >
                          <Select.Trigger className="min-h-11">
                            <Select.Value>
                              {() => {
                                if (selectedEmployees.length === 0) {
                                  return (
                                    <span className="text-default-500">
                                      Select employees
                                    </span>
                                  );
                                }

                                return (
                                  <div className="flex flex-wrap gap-1.5">
                                    {employees
                                      .filter((emp) =>
                                        selectedEmployees.includes(emp._id),
                                      )
                                      .map((emp) => (
                                        <span
                                          key={emp._id}
                                          className="rounded-md bg-default-100 px-2 py-1 text-xs"
                                        >
                                          {emp.employeeName}
                                        </span>
                                      ))}
                                  </div>
                                );
                              }}
                            </Select.Value>

                            <Select.Indicator />
                          </Select.Trigger>

                          <Select.Popover>
                            <ListBox>
                              {employees.map((emp) => (
                                <ListBox.Item
                                  key={emp._id}
                                  id={emp._id}
                                  textValue={`${emp.employeeName} ${emp.employeeCode}`}
                                >
                                  <div className="flex flex-col">
                                    <span>{emp.employeeName}</span>

                                    <span className="text-xs text-default-500">
                                      {emp.employeeCode}
                                    </span>
                                  </div>

                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-default-500">Selected</span>

                        <span className="font-semibold">
                          {selectedEmployees.length} /{" "}
                          {game.maxParticipantsPerTeam}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="p-3">
              <Button
                variant="outline"
                onPress={handleClose}
                isDisabled={saving}
              >
                Cancel
              </Button>

              <Button
                onPress={handleSave}
                isDisabled={
                  saving || loadingEmployees || selectedEmployees.length === 0
                }
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  "Save Registration"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
