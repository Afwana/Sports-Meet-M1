"use client";

import { Fixture, FixtureEntry } from "@/types/fixture";
import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface Game {
  _id: string;
  name: string;
  type: "Individual" | "Group";
}

// interface Entry {
//   entryType: "Employee" | "Group";

//   employee?: {
//     _id: string;
//     employeeName: string;
//     employeeCode: string;
//   };

//   group?: {
//     _id: string;
//     groupName: string;
//   };

//   team: {
//     _id: string;
//     name: string;
//   };
// }

// interface Fixture {
//   _id: string;
//   fixtureName: string;
//   round: string;
//   fixtureNumber: number;
//   venue: string;
//   scheduledAt: string | null;
//   status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
//   entries: unknown[];
// }

interface AddFixtureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  onSaved: (fixture: Fixture) => void;
}

export default function AddFixtureModal({
  isOpen,
  onOpenChange,
  game,
  onSaved,
}: AddFixtureModalProps) {
  const [fixtureName, setFixtureName] = useState("");

  const [round, setRound] = useState("Heat");

  const [fixtureNumber, setFixtureNumber] = useState("");

  const [venue, setVenue] = useState("");

  const [scheduledAt, setScheduledAt] = useState("");

  const [entries, setEntries] = useState<FixtureEntry[]>([]);

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const [loadingEntries, setLoadingEntries] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !game) {
      return;
    }

    // setFixtureName(`${game.name} - Fixture 1`);
    // setRound("Heat");
    // setFixtureNumber("1");
    // setVenue("");
    // setScheduledAt("");
    // setSelectedEntries([]);

    const loadEntries = async () => {
      try {
        setLoadingEntries(true);

        const res = await fetch(
          `/api/admin/fixtures/entries?gameId=${game._id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load entries.");
          return;
        }

        setEntries(data.entries || []);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load registered entries.");
      } finally {
        setLoadingEntries(false);
      }
    };

    loadEntries();
  }, [isOpen, game]);

  const getEntryId = (entry: FixtureEntry) => {
    return entry.entryType === "Employee"
      ? (entry.employee?._id ?? "")
      : (entry.group?._id ?? "");
  };

  const getEntryLabel = (entry: FixtureEntry) => {
    if (entry.entryType === "Employee") {
      return `${entry.employee?.employeeName} (${entry.employee?.employeeCode})`;
    }

    return `${entry.group?.groupName} (${entry.team.name})`;
  };

  const handleSave = async () => {
    if (!game) {
      return;
    }

    if (!fixtureName.trim()) {
      toast.error("Fixture name is required.");
      return;
    }

    if (!round.trim()) {
      toast.error("Round is required.");
      return;
    }

    const number = Number(fixtureNumber);

    if (!Number.isInteger(number) || number < 1) {
      toast.error("Enter a valid fixture number.");
      return;
    }

    if (selectedEntries.length === 0) {
      toast.error("Select at least one entry.");
      return;
    }

    try {
      setSaving(true);

      const payloadEntries = selectedEntries
        .map((id) => {
          const entry = entries.find((item) => getEntryId(item) === id);

          if (!entry) {
            return null;
          }

          return {
            entryType: entry.entryType,
            ...(entry.entryType === "Employee"
              ? {
                  employee: entry.employee?._id,
                }
              : {
                  group: entry.group?._id,
                }),
          };
        })
        .filter(Boolean);

      const res = await fetch("/api/admin/fixtures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: game._id,
          fixtureName: fixtureName.trim(),
          round: round.trim(),
          fixtureNumber: number,
          venue: venue.trim(),
          scheduledAt: scheduledAt || null,
          entries: payloadEntries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create fixture.");
        return;
      }

      onSaved(data.fixture);

      toast.success("Fixture created successfully.");

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to create fixture.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!saving) {
            onOpenChange(open);
          }
        }}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger>
              <div className="rounded-full bg-default" aria-label="Close">
                <FaXmark />
              </div>
            </Modal.CloseTrigger>

            <Modal.Header>
              <Modal.Heading>Create Fixture</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              {game && (
                <div className="space-y-5">
                  <div className="rounded-lg bg-default-100 p-4">
                    <p className="font-semibold">{game.name}</p>

                    <p className="text-sm text-default-500">{game.type} Game</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Fixture Name</Label>

                      <Input
                        value={fixtureName}
                        onChange={(e) => setFixtureName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Round</Label>

                      <Input
                        value={round}
                        onChange={(e) => setRound(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Fixture Number</Label>

                      <Input
                        type="number"
                        value={fixtureNumber}
                        onChange={(e) => setFixtureNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Venue</Label>

                      <Input
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Ground / Hall"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Scheduled Date & Time</Label>

                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Competition Entries</Label>

                    {loadingEntries ? (
                      <div className="flex justify-center py-8">
                        <Spinner />
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-default-500">
                        No registered entries available for this game.
                      </div>
                    ) : (
                      <Select
                        selectionMode="multiple"
                        value={selectedEntries}
                        onChange={(value) => {
                          setSelectedEntries(
                            Array.isArray(value) ? value.map(String) : [],
                          );
                        }}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox>
                            {entries.map((entry) => (
                              <ListBox.Item
                                key={getEntryId(entry)}
                                id={getEntryId(entry)}
                                textValue={getEntryLabel(entry)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {getEntryLabel(entry)}
                                  </span>

                                  <span className="text-xs text-default-500">
                                    {entry.team.name}
                                  </span>
                                </div>

                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}

                    <p className="text-xs text-default-500">
                      {selectedEntries.length} entries selected
                    </p>
                  </div>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="outline"
                onPress={() => onOpenChange(false)}
                isDisabled={saving}
              >
                Cancel
              </Button>

              <Button
                onPress={handleSave}
                isDisabled={saving || loadingEntries}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  "Create Fixture"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
