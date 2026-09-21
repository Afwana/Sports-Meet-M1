"use client";

import { Game } from "@/types/game";
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
import { ChangeEvent, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import IconPicker from "../IconPicker";
import { IconName } from "@/utils/iconMap";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const gameSchema = z.object({
  name: z.string().min(2, "Game name is required."),
  category: z.enum(["Sports", "Off Stage", "Stage", "Games"]),
  gender: z.enum(["Male", "Female", "Both"]),
  ageCategory: z.enum(["Open", "Junior", "Senior"]),
  type: z.enum(["Individual", "Group"]),
  icon: z.string().min(1, "Choose an icon."),
  minParticipants: z.number().min(1),
  maxParticipants: z.union([z.number().min(1), z.null()]),
  maxParticipantsPerTeam: z.union([z.number().min(1), z.null()]),
  maxTeamsPerCompetitionTeam: z.number().min(1),
  isActive: z.boolean(),
});

type GameFormInput = z.input<typeof gameSchema>;
type GameFormOutput = z.output<typeof gameSchema>;

interface Props {
  game: Game | null;
  onClose: () => void;
  onSaved: (game: Game) => void;
}

export default function GameFormModal({ game, onClose, onSaved }: Props) {
  const router = useRouter();
  const isEdit = !!game?._id;

  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GameFormInput, undefined, GameFormOutput>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      name: "",
      category: "Sports",
      type: "Individual",
      icon: "Football",
      minParticipants: 1,
      maxParticipants: null,
      ageCategory: "Open",
      maxParticipantsPerTeam: null,
      maxTeamsPerCompetitionTeam: 1,
      isActive: true,
    },
  });

  const type = useWatch({
    control,
    name: "type",
  });

  const category = useWatch({
    control,
    name: "category",
  });

  const ageCategory = useWatch({
    control,
    name: "ageCategory",
  });

  const icon = useWatch({
    control,
    name: "icon",
  });

  const isActive = useWatch({
    control,
    name: "isActive",
  });

  const gender = useWatch({
    control,
    name: "gender",
  });

  const onSubmit: SubmitHandler<GameFormOutput> = async (formData) => {
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/games/${game._id}` : "/api/admin/games";

      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        ...formData,
        maxParticipants:
          formData.maxParticipants === null ||
          Number.isNaN(formData.maxParticipants as number)
            ? null
            : formData.maxParticipants,

        maxParticipantsPerTeam:
          formData.maxParticipantsPerTeam === null ||
          Number.isNaN(formData.maxParticipantsPerTeam as number)
            ? null
            : formData.maxParticipantsPerTeam,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({
        success: false,
        message: "Unexpected server response.",
      }));

      if (!res.ok) {
        toast.error(data.message || "Failed to save game.");
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
    if (isEdit && game) {
      reset({
        name: game.name,
        category: game.category,
        type: game.type,
        gender: game.gender,
        icon: game.icon,
        minParticipants: game.minParticipants ?? 1,
        maxParticipants: game.maxParticipants ?? null,
        ageCategory: game.ageCategory ?? "Open",
        maxParticipantsPerTeam: game.maxParticipantsPerTeam ?? null,
        maxTeamsPerCompetitionTeam: game.maxTeamsPerCompetitionTeam ?? 1,
        isActive: game.isActive,
      });
    } else {
      reset({
        name: "",
        category: "Sports",
        type: "Individual",
        gender: "Male",
        icon: "FaCircle",
        minParticipants: 1,
        maxParticipants: null,
        ageCategory: "Open",
        maxParticipantsPerTeam: null,
        maxTeamsPerCompetitionTeam: 1,
        isActive: true,
      });
    }
  }, [game, isEdit, reset]);

  return (
    <Modal isOpen={!!game} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-blue-800 text-white p-5 font-bold text-3xl">
              {isEdit ? "Edit Game" : "Add New Game"}
            </Modal.Header>

            <Modal.Body className="p-5">
              <form
                id="game-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Game Name */}

                <div className="flex flex-col gap-1">
                  <Label>Game Name</Label>

                  <Input placeholder="Enter game name" {...register("name")} />

                  {errors.name && (
                    <p className="text-danger text-sm">{errors.name.message}</p>
                  )}
                </div>

                {/* Category */}

                <div className="flex flex-col gap-1">
                  <Label>Category</Label>

                  <Select
                    aria-label="Game category"
                    value={category}
                    onChange={(value) => {
                      if (value) {
                        setValue(
                          "category",
                          value as "Sports" | "Off Stage" | "Stage" | "Games",
                        );
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="Sports" textValue="Sports">
                          Sports
                        </ListBox.Item>

                        <ListBox.Item id="Off Stage" textValue="Off Stage">
                          Off Stage
                        </ListBox.Item>

                        <ListBox.Item id="Stage" textValue="Stage">
                          Stage
                        </ListBox.Item>

                        <ListBox.Item id="Games" textValue="Games">
                          Games
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {/* Type */}

                <div className="flex flex-col gap-1">
                  <Label>Type</Label>

                  <Select
                    aria-label="Game type"
                    value={type}
                    onChange={(value) => {
                      if (value) {
                        setValue("type", value as "Individual" | "Group");
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="Individual">Individual</ListBox.Item>

                        <ListBox.Item id="Group">Group</ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Gender</Label>

                  <Select
                    aria-label="Game gender"
                    value={gender}
                    onChange={(value) => {
                      if (value) {
                        setValue("gender", value as "Male" | "Female", {
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
                        <ListBox.Item id="Male" textValue="Male">
                          Male
                        </ListBox.Item>

                        <ListBox.Item id="Female" textValue="Female">
                          Female
                        </ListBox.Item>

                        <ListBox.Item
                          id="Both"
                          textValue="Both (Male & Female)"
                        >
                          Both (Male & Female)
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {(category === "Sports" || category === "Games") && (
                  <div className="flex flex-col gap-1">
                    <Label>Age Category</Label>

                    <Select
                      aria-label="Age category"
                      value={ageCategory}
                      onChange={(value) => {
                        if (value) {
                          setValue(
                            "ageCategory",
                            value as "Open" | "Junior" | "Senior",
                            { shouldDirty: true },
                          );
                        }
                      }}
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="Open" textValue="Open">
                            Open
                          </ListBox.Item>
                          <ListBox.Item id="Junior" textValue="Junior">
                            Junior
                          </ListBox.Item>
                          <ListBox.Item id="Senior" textValue="Senior">
                            Senior
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                )}

                {/* Icon */}

                <div className="flex flex-col gap-1">
                  <IconPicker
                    value={icon as IconName}
                    onChange={(selectedIcon) =>
                      setValue("icon", selectedIcon, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>

                {/* Individual registration limits */}
                {type === "Individual" && (
                  <>
                    <div className="rounded-xl border p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          Individual Registration Limits
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <Label>Maximum Participants</Label>

                          <Controller
                            control={control}
                            name="maxParticipants"
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="Unlimited"
                                value={
                                  field.value == null
                                    ? ""
                                    : (field.value as string | number)
                                }
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            )}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label>Maximum Participants Per Team</Label>

                          <Controller
                            control={control}
                            name="maxParticipantsPerTeam"
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="Unlimited"
                                value={
                                  field.value == null
                                    ? ""
                                    : (field.value as string | number)
                                }
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {type === "Group" && (
                  <div className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Group Registration Rules</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Min Participants */}
                      <div className="flex flex-col gap-1">
                        <Label>Minimum Participants Per Group</Label>

                        <Input
                          type="number"
                          {...register("minParticipants", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      {/* Max Participants */}
                      <div className="flex flex-col gap-1">
                        <Label>Maximum Participants Per Group</Label>

                        {/* <Input
                          type="number"
                          {...register("maxParticipants", {
                            valueAsNumber: true,
                          })}
                        /> */}
                        <Controller
                          control={control}
                          name="maxParticipants"
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="Unlimited"
                              value={
                                field.value == null
                                  ? ""
                                  : (field.value as string | number)
                              }
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                            />
                          )}
                        />
                      </div>

                      {/* Group Only */}
                      <div className="flex flex-col gap-1">
                        <Label>Max Groups per Team</Label>
                        <Input
                          type="number"
                          {...register("maxTeamsPerCompetitionTeam", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                          ? "This game is available for the competition."
                          : "This game is hidden from employees."}
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
                <Button
                  variant="primary"
                  // isLoading={loading}
                  type="submit"
                  form="game-form"
                >
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
