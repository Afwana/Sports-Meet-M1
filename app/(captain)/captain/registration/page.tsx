"use client";

import AddGroupRegistrationModal from "@/components/captain/AddGroupRegistrationModal";
import AddIndividualRegistrationModal from "@/components/captain/AddIndividualRegistrationModal";
import DeleteGroupRegistrationModal from "@/components/captain/DeleteGroupRegistrationModal";
import EditGroupRegistrationModal from "@/components/captain/EditGroupRegistrationModal";
import EditIndividualRegistrationModal from "@/components/captain/EditIndividualRegistrationModal";
import { Game } from "@/types/game";
import {
  GroupRegistration,
  IndividualRegistration,
} from "@/types/registration";
import {
  Button,
  Card,
  Key,
  Label,
  ListBox,
  Select,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaUser } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { toast } from "sonner";

export default function CaptainRegistrationPage() {
  const [type, setType] = useState("Individual");
  const [category, setCategory] = useState("Sports");
  const [gender, setGender] = useState("Male");
  const [ageCategory, setAgeCategory] = useState("Open");

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [groupRegistrations, setGroupRegistrations] = useState<
    GroupRegistration[]
  >([]);
  const [individualRegistrations, setIndividualRegistrations] = useState<
    IndividualRegistration[]
  >([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState<GroupRegistration | null>(
    null,
  );
  const [editingIndividual, setEditingIndividual] =
    useState<IndividualRegistration | null>(null);

  const [deletingRegistration, setDeletingRegistration] = useState<
    GroupRegistration | IndividualRegistration | null
  >(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true);

        const res = await fetch("/api/captain/games");
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load games.");
          return;
        }

        setGames(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load games.");
      } finally {
        setLoadingGames(false);
      }
    };

    loadGames();
  }, []);

  // const filteredGames = games.filter((game) => {
  //   if (game.type !== type) return false;
  //   if (game.category !== category) return false;

  //   // Gender
  //   if (gender === "Male") {
  //     if (game.gender !== "Male" && game.gender !== "Both") return false;
  //   } else if (gender === "Female") {
  //     if (game.gender !== "Female" && game.gender !== "Both") return false;
  //   } else if (gender === "Both") {
  //     if (game.gender !== "Both") return false;
  //   }

  //   // Age (Sports only)
  //   if (
  //     category === "Sports" &&
  //     ageCategory !== "Open" &&
  //     game.ageCategory !== ageCategory
  //   ) {
  //     return false;
  //   }

  //   return true;
  // });

  const filteredGames = games.filter((game) => {
    // Type must match
    if (game.type !== type) return false;

    // Category must match
    if (game.category !== category) return false;

    // Gender must match EXACTLY
    if (game.gender !== gender) return false;

    // Sports age category must match EXACTLY
    if (
      (category === "Sports" || category === "Games") &&
      game.ageCategory !== ageCategory
    ) {
      return false;
    }

    return true;
  });

  const loadRegistrationData = async (gameId: string) => {
    const game = games.find((g) => g._id === gameId) || null;

    setSelectedGame(game);
    setSelectedGameId(gameId);

    setGroupRegistrations([]);
    setIndividualRegistrations([]);

    try {
      setLoadingRegistrations(true);

      const endpoint =
        type === "Group"
          ? `/api/captain/group-registrations?gameId=${gameId}`
          : `/api/captain/individual-registrations?gameId=${gameId}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load registrations.");
        return;
      }

      if (type === "Group") {
        setGroupRegistrations(data.registrations || []);
      } else {
        setIndividualRegistrations(data.registrations || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load registrations.");
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const openCreateModal = () => {
    if (!selectedGame) return;

    if (
      selectedGame.type === "Group" &&
      groupRegistrations.length >= selectedGame.maxTeamsPerCompetitionTeam
    ) {
      toast.error(
        `Maximum ${selectedGame.maxTeamsPerCompetitionTeam} groups are allowed.`,
      );
      return;
    }

    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-104px)] bg-blue-50 dark:bg-black p-5">
      <Card className="w-full p-5 min-h-[calc(100vh-105px)]">
        <Card.Header>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Registrations</h1>

            <p className="text-default-500 text-sm">
              Manage individual and group registrations for your team.
            </p>
          </div>
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* TYPE */}
            <div>
              <Label className="mb-2">Game Type</Label>

              <Select
                aria-label="select type"
                value={type}
                onChange={(value: Key | null) => {
                  if (!value) return;

                  setType(String(value));
                  setSelectedGame(null);
                  setSelectedGameId("");
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
                    </ListBox.Item>

                    <ListBox.Item id="Group" textValue="Group">
                      Group
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* CATEGORY */}
            <div>
              <Label className="mb-2">Category</Label>

              <Select
                aria-label="select category"
                value={category}
                onChange={(value: Key | null) => {
                  if (!value) return;

                  setCategory(String(value));
                  setSelectedGame(null);
                  setSelectedGameId("");
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

                    <ListBox.Item id="Stage" textValue="Stage">
                      Stage
                    </ListBox.Item>

                    <ListBox.Item id="Off Stage" textValue="Off Stage">
                      Off Stage
                    </ListBox.Item>

                    <ListBox.Item id="Games" textValue="Games">
                      Games
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* GENDER */}
            <div>
              <Label className="mb-2">Gender</Label>

              <Select
                aria-label="select gender"
                value={gender}
                onChange={(value: Key | null) => {
                  if (!value) return;

                  setGender(String(value));
                  setSelectedGame(null);
                  setSelectedGameId("");
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

                    <ListBox.Item id="Both" textValue="Both">
                      Both
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* AGE */}
            {(category === "Sports" || category === "Games") && (
              <div>
                <Label className="mb-2">Age Category</Label>

                <Select
                  aria-label="select category"
                  value={ageCategory}
                  onChange={(value: Key | null) => {
                    if (!value) return;

                    setAgeCategory(String(value));
                    setSelectedGame(null);
                    setSelectedGameId("");
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
          </div>

          <div className="mt-6 max-w-xl">
            <Label className="mb-2">Select Game</Label>

            <Select
              aria-label="select game"
              value={selectedGameId}
              isDisabled={loadingGames}
              onChange={(value: Key | null) => {
                if (!value) return;

                loadRegistrationData(String(value));
              }}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover>
                <ListBox>
                  {filteredGames.map((game) => (
                    <ListBox.Item
                      key={game._id}
                      id={game._id}
                      textValue={game.name}
                    >
                      <p className="flex flex-col gap-1">
                        <span className="font-bold">{game.name}</span>
                        <span className="flex items-center gap-2 text-gray-400 text-xs">
                          {game.category} | {game.gender}{" "}
                          {game.ageCategory ? `| ${game.ageCategory}` : ""}
                        </span>
                      </p>
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {selectedGame && (
            <>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {type === "Group" ? (
                  <>
                    <div className="rounded-lg bg-default-100 p-4">
                      <p className="text-sm text-default-500">
                        Minimum Participants
                      </p>

                      <p className="text-xl font-bold">
                        {selectedGame.minParticipants}
                      </p>
                    </div>

                    <div className="rounded-lg bg-default-100 p-4">
                      <p className="text-sm text-default-500">
                        Maximum Participants
                      </p>

                      <p className="text-xl font-bold">
                        {selectedGame.maxParticipants ?? "Unlimited"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-default-100 p-4">
                      <p className="text-sm text-default-500">Maximum Groups</p>

                      <p className="text-xl font-bold">
                        {selectedGame.maxTeamsPerCompetitionTeam}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-default-100 p-4">
                      <p className="text-sm text-default-500">
                        Maximum Participants
                      </p>

                      <p className="text-xl font-bold">
                        {selectedGame.maxParticipants}
                      </p>
                    </div>

                    <div className="rounded-lg bg-default-100 p-4">
                      <p className="text-sm text-default-500">
                        Maximum Per Team
                      </p>

                      <p className="text-xl font-bold">
                        {selectedGame.maxParticipantsPerTeam}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="font-semibold">
                  {type === "Group"
                    ? "Group Registrations"
                    : "Individual Registrations"}
                </p>

                <Button onPress={openCreateModal}>
                  <FaPlus />
                  {type === "Group" ? "Create Group" : "Add Registration"}
                </Button>
              </div>

              {loadingRegistrations ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : type === "Group" ? (
                <div className="space-y-4 mt-4">
                  {groupRegistrations.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-default-500">
                      No groups created yet.
                    </div>
                  ) : (
                    groupRegistrations.map((group) => (
                      <Card key={group._id}>
                        <Card.Header>
                          <div className="flex w-full justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <FaPeopleGroup />

                                <span className="font-bold">
                                  {group.groupName}
                                </span>
                              </div>

                              <p className="text-sm text-default-500">
                                {group.participants.length} /{" "}
                                {selectedGame.maxParticipants} participants
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onPress={() => setEditingGroup(group)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="danger"
                                onPress={() => setDeletingRegistration(group)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                        </Card.Header>

                        <Card.Content>
                          <div className="grid md:grid-cols-3 gap-2">
                            {group.participants.map((emp) => (
                              <div
                                key={emp._id}
                                className="rounded-md bg-default-100 p-3"
                              >
                                <div className="font-medium">
                                  {emp.employeeName}
                                </div>

                                <div className="text-xs text-default-500">
                                  {emp.employeeCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card.Content>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {individualRegistrations.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-default-500">
                      No individual registrations yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                      {individualRegistrations.map((registration) => (
                        <Card
                          key={registration._id || registration.employee._id}
                          id={registration._id}
                        >
                          <Card.Header>
                            <div className="flex w-full justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <FaUser />

                                  <span className="font-bold">
                                    {registration?.employee?.employeeName}
                                  </span>
                                </div>
                                <p className="text-sm text-default-500">
                                  {registration?.employee?.employeeCode}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onPress={() =>
                                    setEditingIndividual(registration)
                                  }
                                >
                                  Edit
                                </Button>

                                <Button
                                  size="sm"
                                  variant="danger"
                                  onPress={() =>
                                    setDeletingRegistration(registration)
                                  }
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </div>
                          </Card.Header>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {selectedGame?.type === "Group" ? (
        <>
          <AddGroupRegistrationModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            game={selectedGame}
            existingGroups={groupRegistrations}
            onSaved={(registration) =>
              setGroupRegistrations((prev) => [...prev, registration])
            }
          />

          <EditGroupRegistrationModal
            isOpen={editingGroup !== null}
            onOpenChange={(open) => !open && setEditingGroup(null)}
            game={selectedGame}
            group={editingGroup}
            onSaved={(registration) => {
              setGroupRegistrations((prev) =>
                prev.map((g) =>
                  g._id === registration._id ? registration : g,
                ),
              );

              setEditingGroup(null);
            }}
          />
        </>
      ) : (
        <>
          <AddIndividualRegistrationModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            game={selectedGame}
            onSaved={(registration: IndividualRegistration) => {
              setIndividualRegistrations((prev) => [...prev, registration]);
            }}
          />

          <EditIndividualRegistrationModal
            isOpen={editingIndividual !== null}
            onOpenChange={(open: boolean) => {
              if (!open) {
                setEditingIndividual(null);
              }
            }}
            game={selectedGame}
            registration={editingIndividual}
            onSaved={(registration: IndividualRegistration) => {
              setIndividualRegistrations((prev) =>
                prev.map((r) =>
                  r._id === registration._id ? registration : r,
                ),
              );

              setEditingIndividual(null);
            }}
          />
        </>
      )}

      <DeleteGroupRegistrationModal
        isOpen={deletingRegistration !== null}
        onOpenChange={(open) => !open && setDeletingRegistration(null)}
        game={selectedGame}
        registration={deletingRegistration}
        onDeleted={(id) => {
          if (selectedGame?.type === "Group") {
            setGroupRegistrations((prev) => prev.filter((g) => g._id !== id));
          } else {
            setIndividualRegistrations((prev) =>
              prev.filter((r) => r._id !== id),
            );
          }

          setDeletingRegistration(null);
        }}
      />
    </div>
  );
}
