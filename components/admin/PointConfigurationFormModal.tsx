/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  Switch,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PositionPoint = {
  position: number;
  points: number;
};

export type PointConfiguration = {
  _id: string;
  name: string;
  type: "Individual" | "Group";
  positions: PositionPoint[];
  isActive: boolean;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  configuration?: PointConfiguration | null;
  onSaved: () => void;
}

export default function PointConfigurationFormModal({
  isOpen,
  onClose,
  configuration,
  onSaved,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"Individual" | "Group">("Individual");

  const [positions, setPositions] = useState<PositionPoint[]>([
    {
      position: 1,
      points: 10,
    },
    {
      position: 2,
      points: 5,
    },
    {
      position: 3,
      points: 3,
    },
  ]);

  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(configuration);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (configuration) {
      setName(configuration.name);
      setType(configuration.type);
      setPositions(
        [...configuration.positions].sort((a, b) => a.position - b.position),
      );
      setIsActive(configuration.isActive);
    } else {
      setName("");
      setType("Individual");
      setPositions([
        {
          position: 1,
          points: 10,
        },
        {
          position: 2,
          points: 5,
        },
        {
          position: 3,
          points: 3,
        },
      ]);
      setIsActive(true);
    }
  }, [isOpen, configuration]);

  const addPosition = () => {
    const nextPosition =
      positions.length > 0
        ? Math.max(...positions.map((item) => item.position)) + 1
        : 1;

    setPositions((current) => [
      ...current,
      {
        position: nextPosition,
        points: 0,
      },
    ]);
  };

  const removePosition = (position: number) => {
    if (positions.length <= 1) {
      toast.error("At least one position is required.");
      return;
    }

    setPositions((current) =>
      current.filter((item) => item.position !== position),
    );
  };

  const updatePosition = (
    index: number,
    field: "position" | "points",
    value: number,
  ) => {
    setPositions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Configuration name is required.");
      return;
    }

    if (positions.length === 0) {
      toast.error("At least one position is required.");
      return;
    }

    if (
      positions.some(
        (item) => !Number.isInteger(item.position) || item.position < 1,
      )
    ) {
      toast.error("Position must be a positive whole number.");
      return;
    }

    if (
      positions.some(
        (item) => typeof item.points !== "number" || item.points < 0,
      )
    ) {
      toast.error("Points cannot be negative.");
      return;
    }

    const positionNumbers = positions.map((item) => item.position);

    if (new Set(positionNumbers).size !== positionNumbers.length) {
      toast.error("Position numbers cannot be duplicated.");
      return;
    }

    try {
      setSaving(true);

      const url = isEdit
        ? `/api/admin/point-configurations/${configuration?._id}`
        : "/api/admin/point-configurations";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          positions: [...positions].sort((a, b) => a.position - b.position),
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to save point configuration.");
        return;
      }

      toast.success(
        isEdit
          ? "Point configuration updated successfully."
          : "Point configuration created successfully.",
      );

      onSaved();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Point configuration save error:", error);

      toast.error("Failed to save point configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        variant="opaque"
      >
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-blue-700 p-5">
              <Modal.Heading className="text-lg font-bold text-white">
                {isEdit
                  ? "Edit Point Configuration"
                  : "Add Point Configuration"}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="">
              <div className="space-y-5 px-3">
                {/* Configuration Name */}
                <div className="space-y-2 flex flex-col">
                  <Label>Configuration Name</Label>

                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Individual Default"
                  />
                </div>

                {/* Configuration Type */}
                <div className="space-y-2">
                  <Label>Configuration Type</Label>

                  <Select
                    value={type}
                    onChange={(value) => {
                      if (typeof value === "string") {
                        setType(value as "Individual" | "Group");
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="Individual" textValue="Individual">
                          Individual
                          <ListBox.ItemIndicator />
                        </ListBox.Item>

                        <ListBox.Item id="Group" textValue="Group">
                          Group
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* Positions */}
                <div className="space-y-3 px-4 ">
                  <div className="flex items-center justify-between">
                    <Label>Positions & Points</Label>

                    <Button size="sm" variant="ghost" onPress={addPosition}>
                      + Add Position
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {positions.map((item, index) => (
                      <div
                        key={`${item.position}-${index}`}
                        className="grid grid-cols-[1fr_1fr_auto] items-end gap-3"
                      >
                        <div className="flex flex-col gap-1 w-32">
                          <Label>Position</Label>
                          <Input
                            type="number"
                            min={1}
                            value={String(item.position)}
                            onChange={(event) =>
                              updatePosition(
                                index,
                                "position",
                                Number(event.target.value),
                              )
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-1 w-32">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min={0}
                            value={String(item.points)}
                            onChange={(event) =>
                              updatePosition(
                                index,
                                "points",
                                Number(event.target.value),
                              )
                            }
                            className="w-32 mt-1"
                          />
                        </div>

                        <Button
                          variant="danger"
                          onPress={() => removePosition(item.position)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active */}
                <Switch isSelected={isActive} onChange={setIsActive}>
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Active
                  </Switch.Content>
                </Switch>
              </div>
            </Modal.Body>

            <Modal.Footer className="p-4">
              <Button variant="ghost" onPress={onClose} isDisabled={saving}>
                Cancel
              </Button>

              <Button onPress={handleSave} isDisabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    {isEdit ? "Updating..." : "Saving..."}
                  </>
                ) : isEdit ? (
                  "Update Configuration"
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
