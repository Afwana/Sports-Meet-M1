"use client";

import { Employee } from "@/types/employee";
import { Game } from "@/types/game";
import { GroupRegistration } from "@/types/registration";
import {
  Button,
  Modal,
  Spinner,
  ListBox,
  Label,
  Key,
  Autocomplete,
  useFilter,
  SearchField,
  EmptyState,
} from "@heroui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPeopleGroup, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface AddGroupRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  existingGroups: GroupRegistration[];
  onSaved: (registration: GroupRegistration) => void;
}

export default function AddGroupRegistrationModal({
  isOpen,
  onOpenChange,
  game,
  existingGroups,
  onSaved,
}: AddGroupRegistrationModalProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Key[]>([]);
  const [selectedEmployeeKey, setSelectedEmployeeKey] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);
  const { contains } = useFilter({ sensitivity: "base" });

  useEffect(() => {
    if (!isOpen || !game) {
      return;
    }

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);

        const res = await fetch(
          game.type === "Group"
            ? `/api/captain/group-registrations/available-employees?gameId=${game._id}`
            : `/api/captain/individual-registrations/available-employees?gameId=${game._id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load employees.");
          return;
        }

        setEmployees(data.employees || []);
        setSelectedEmployees([]);
      } catch (error) {
        console.error("Failed to load employees:", error);

        toast.error("Failed to load employees.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen, game]);

  const handleSave = async () => {
    if (!game) {
      return;
    }

    if (game.type === "Group") {
      if (selectedEmployees.length < game.minParticipants) {
        toast.error(`Select at least ${game.minParticipants} participants.`);
        return;
      }

      if (
        game.maxParticipants != null &&
        selectedEmployees.length > game.maxParticipants
      ) {
        toast.error(
          `Maximum ${game.maxParticipants} participants are allowed.`,
        );
        return;
      }

      if (existingGroups.length >= game.maxTeamsPerCompetitionTeam) {
        toast.error(
          `Maximum ${game.maxTeamsPerCompetitionTeam} groups are allowed.`,
        );
        return;
      }
    } else {
      if (selectedEmployees.length === 0) {
        toast.error("Select at least one participant.");
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
    }

    try {
      setSaving(true);

      const res = await fetch(
        game.type === "Group"
          ? "/api/captain/group-registrations"
          : "/api/captain/individual-registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameId: game._id,
            participants: selectedEmployees,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create group.");
        return;
      }

      toast.success("Group created successfully.");

      onSaved(data.registration);

      setSelectedEmployees([]);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create group:", error);

      toast.error("Failed to create group.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

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
              <Modal.Heading className="font-bold text-white text-xl">
                {game?.type === "Group"
                  ? "Create Group"
                  : "Add Individual Registration"}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-5">
              {game && (
                <div className="space-y-5">
                  <div className="rounded-lg bg-default-100 p-4">
                    <div className="flex items-center gap-2">
                      <FaPeopleGroup />

                      <span className="font-semibold">{game.name}</span>
                    </div>

                    <p className="mt-1 text-sm text-default-500">
                      {game.type === "Group"
                        ? `Select ${game.minParticipants} to ${game.maxParticipants} employees`
                        : `Select up to ${game.maxParticipantsPerTeam} employees`}
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
                        <Autocomplete
                          placeholder="Search employee..."
                          selectionMode="single"
                          value={selectedEmployeeKey}
                          onChange={(value) => {
                            if (typeof value !== "string" || !value) return;

                            if (!selectedEmployees.includes(value)) {
                              setSelectedEmployees((prev) => [...prev, value]);
                            }

                            // Clear autocomplete after selection
                            setSelectedEmployeeKey("");
                          }}
                        >
                          <Autocomplete.Trigger className="min-h-11">
                            <Autocomplete.Value />
                            <Autocomplete.ClearButton />
                            <Autocomplete.Indicator />
                          </Autocomplete.Trigger>

                          <Autocomplete.Popover>
                            <Autocomplete.Filter filter={contains}>
                              <SearchField
                                autoFocus
                                aria-label="Search employees"
                                name="search"
                                variant="secondary"
                              >
                                <SearchField.Group>
                                  <SearchField.SearchIcon />
                                  <SearchField.Input placeholder="Search by name or code..." />
                                  <SearchField.ClearButton />
                                </SearchField.Group>
                              </SearchField>

                              <ListBox
                                renderEmptyState={() => (
                                  <EmptyState>No employees found</EmptyState>
                                )}
                              >
                                {employees
                                  .filter(
                                    (emp) =>
                                      !selectedEmployees.includes(emp._id),
                                  )
                                  .map((employee) => (
                                    <ListBox.Item
                                      key={employee._id}
                                      id={employee._id}
                                      textValue={`${employee.employeeName} ${employee.employeeCode}`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {employee.employeeName}
                                        </span>
                                        <span className="text-xs text-default-500">
                                          {employee.employeeCode}
                                        </span>
                                      </div>

                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                              </ListBox>
                            </Autocomplete.Filter>
                          </Autocomplete.Popover>
                        </Autocomplete>

                        {/* Selected Employees */}
                        {selectedEmployees.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {selectedEmployees.map((id) => {
                              const employee = employees.find(
                                (e) => e._id === id,
                              );
                              if (!employee) return null;

                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                                >
                                  <span>
                                    {employee.employeeName} (
                                    {employee.employeeCode})
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedEmployees((prev) =>
                                        prev.filter((e) => e !== id),
                                      )
                                    }
                                    className="rounded-full p-0.5 hover:bg-primary/20"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-default-500">Selected</span>

                        <span className="font-semibold">
                          {selectedEmployees.length} / {game.maxParticipants}
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
                  saving ||
                  loadingEmployees ||
                  selectedEmployees.length < (game?.minParticipants ?? 1)
                }
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : game?.type === "Group" ? (
                  "Save Group"
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
