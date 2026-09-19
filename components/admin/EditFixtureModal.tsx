"use client";

import type { Fixture } from "@/types/fixture";
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

interface Entry {
  entryType: "Employee" | "Group";

  employee?: {
    _id: string;
    employeeName: string;
    employeeCode: string;
  };

  group?: {
    _id: string;
    groupName: string;
  };

  team: {
    _id: string;
    name: string;
  };
}

interface EditFixtureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  fixture: Fixture | null;
  onSaved: (fixture: Fixture) => void;
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localValue = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return localValue;
}

function getSelectedEntryIds(fixture: Fixture | null): string[] {
  if (!fixture) {
    return [];
  }

  return fixture.entries
    .map((entry) =>
      entry.entryType === "Employee" ? entry.employee?._id : entry.group?._id,
    )
    .filter((id): id is string => Boolean(id));
}

export default function EditFixtureModal({
  isOpen,
  onOpenChange,
  game,
  fixture,
  onSaved,
}: EditFixtureModalProps) {
  /*
   * These values are initialized from the fixture itself.
   *
   * The parent should render this modal only when a fixture exists
   * and use a key based on the fixture id. That gives us a fresh
   * form whenever another fixture is selected.
   */
  const [entries, setEntries] = useState<Entry[]>([]);

  const [selectedEntries, setSelectedEntries] = useState<string[]>(() =>
    getSelectedEntryIds(fixture),
  );

  const [fixtureName, setFixtureName] = useState(
    () => fixture?.fixtureName ?? "",
  );

  const [round, setRound] = useState(() => fixture?.round ?? "");

  const [fixtureNumber, setFixtureNumber] = useState(() =>
    fixture ? String(fixture.fixtureNumber) : "",
  );

  const [venue, setVenue] = useState(() => fixture?.venue ?? "");

  const [scheduledAt, setScheduledAt] = useState(() =>
    toDateTimeLocal(fixture?.scheduledAt),
  );

  const [status, setStatus] = useState<Fixture["status"]>(
    () => fixture?.status ?? "Scheduled",
  );

  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * This effect only synchronizes with the external API.
   *
   * It no longer initializes form state, so the
   * react-hooks/set-state-in-effect error is avoided.
   */
  useEffect(() => {
    if (!isOpen || !game || !fixture) {
      return;
    }

    let cancelled = false;

    const loadEntries = async () => {
      try {
        const res = await fetch(
          `/api/admin/fixtures/entries?gameId=${game._id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load entries.");
          return;
        }

        if (!cancelled) {
          setEntries(data.entries || []);
          setLoadingEntries(false);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          toast.error("Failed to load entries.");
          setLoadingEntries(false);
        }
      }
    };

    void loadEntries();

    return () => {
      cancelled = true;
    };
  }, [isOpen, game, fixture]);

  const getEntryId = (entry: Entry): string => {
    return entry.entryType === "Employee"
      ? (entry.employee?._id ?? "")
      : (entry.group?._id ?? "");
  };

  const getEntryLabel = (entry: Entry): string => {
    if (entry.entryType === "Employee") {
      return `${entry.employee?.employeeName ?? ""} (${entry.employee?.employeeCode ?? ""})`;
    }

    return `${entry.group?.groupName ?? ""} (${entry.team.name})`;
  };

  const handleSave = async () => {
    if (!fixture) {
      return;
    }

    const number = Number(fixtureNumber);

    if (!fixtureName.trim()) {
      toast.error("Fixture name is required.");
      return;
    }

    if (!round.trim()) {
      toast.error("Round is required.");
      return;
    }

    if (!Number.isInteger(number) || number < 1) {
      toast.error("Invalid fixture number.");
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

          if (entry.entryType === "Employee") {
            return {
              entryType: "Employee" as const,
              employee: entry.employee?._id,
            };
          }

          return {
            entryType: "Group" as const,
            group: entry.group?._id,
          };
        })
        .filter(
          (
            entry,
          ): entry is
            | {
                entryType: "Employee";
                employee: string;
              }
            | {
                entryType: "Group";
                group: string;
              } =>
            Boolean(
              entry &&
              (entry.entryType === "Employee" ? entry.employee : entry.group),
            ),
        );

      const res = await fetch(`/api/admin/fixtures/${fixture._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fixtureName: fixtureName.trim(),
          round: round.trim(),
          fixtureNumber: number,
          venue: venue.trim(),
          scheduledAt: scheduledAt || null,
          status,
          entries: payloadEntries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update fixture.");
        return;
      }

      onSaved(data.fixture);

      toast.success("Fixture updated successfully.");

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to update fixture.");
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
              <Modal.Heading>Edit Fixture</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              {game && fixture && (
                <div className="space-y-5">
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

                  <div className="space-y-1">
                    <Label>Status</Label>

                    <Select
                      value={status}
                      onChange={(value) => {
                        if (typeof value === "string") {
                          setStatus(value as Fixture["status"]);
                        }
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover>
                        <ListBox>
                          {[
                            "Scheduled",
                            "In Progress",
                            "Completed",
                            "Cancelled",
                          ].map((item) => (
                            <ListBox.Item key={item} id={item} textValue={item}>
                              {item}

                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Competition Entries</Label>

                    {loadingEntries ? (
                      <div className="flex justify-center py-8">
                        <Spinner />
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
                  "Save Changes"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
