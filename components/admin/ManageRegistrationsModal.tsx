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
import { Team } from "@/types/team";
import {
  Button,
  Key,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaUser } from "react-icons/fa";
import { FaPeopleGroup, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";
import { gameLabel, ItemGameEntry } from "./ItemRegistrationsList";

const API_BASE = "/api/admin/registrations/manage";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Every game the admin can manage (the game select lists all of them). */
  games: ItemGameEntry[];
  /** Game that is selected when the modal opens (the row's game). */
  initialGameId: string | null;
  /** Called after any add / update / delete so the page can refresh. */
  onChanged: () => void;
}

function toGame(entry: ItemGameEntry): Game {
  return {
    _id: entry.gameId,
    name: entry.gameName,
    category: entry.category as Game["category"],
    type: entry.type as Game["type"],
    gender: entry.gender as Game["gender"],
    ageCategory: entry.ageCategory as Game["ageCategory"],
    icon: "",
    minParticipants: entry.minParticipants ?? 1,
    maxParticipants: entry.maxParticipants ?? null,
    maxParticipantsPerTeam: entry.maxParticipantsPerTeam ?? null,
    maxTeamsPerCompetitionTeam: entry.maxTeamsPerCompetitionTeam ?? 1,
    isActive: true,
  };
}

export default function ManageRegistrationsModal({
  isOpen,
  onOpenChange,
  games,
  initialGameId,
  onChanged,
}: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const [gameId, setGameId] = useState("");
  const [teamId, setTeamId] = useState("");

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

  const game = useMemo(() => {
    const entry = games.find((g) => g.gameId === gameId);
    return entry ? toGame(entry) : null;
  }, [games, gameId]);

  const selectedTeam = teams.find((t) => t._id === teamId) || null;
  const isGroup = game?.type === "Group";

  // Reset every time the modal is opened for a game.
  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGameId(initialGameId ?? "");
    setTeamId("");
    setGroupRegistrations([]);
    setIndividualRegistrations([]);
  }, [isOpen, initialGameId]);

  // Teams (loaded once).
  useEffect(() => {
    if (!isOpen || teams.length > 0) return;

    const loadTeams = async () => {
      try {
        setLoadingTeams(true);

        const res = await fetch("/api/admin/teams", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load teams.");
          return;
        }

        setTeams(
          (Array.isArray(data) ? data : []).filter(
            (t: Team) => t.isActive !== false,
          ),
        );
      } catch (error) {
        console.error(error);
        toast.error("Failed to load teams.");
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, [isOpen, teams.length]);

  // Registrations for the chosen game + team.
  const currentGameId = game?._id;
  const currentGameType = game?.type;

  useEffect(() => {
    if (!isOpen || !currentGameId || !currentGameType || !teamId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoadingRegistrations(true);

        const endpoint =
          currentGameType === "Group"
            ? `${API_BASE}/group-registrations`
            : `${API_BASE}/individual-registrations`;

        const res = await fetch(
          `${endpoint}?gameId=${currentGameId}&teamId=${teamId}`,
          { cache: "no-store" },
        );
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          toast.error(data.message || "Failed to load registrations.");
          return;
        }

        if (currentGameType === "Group") {
          setGroupRegistrations(data.registrations || []);
        } else {
          setIndividualRegistrations(data.registrations || []);
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("Failed to load registrations.");
      } finally {
        if (!cancelled) setLoadingRegistrations(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentGameId, currentGameType, teamId]);

  const openCreateModal = () => {
    if (!game || !teamId) return;

    if (
      game.type === "Group" &&
      groupRegistrations.length >= game.maxTeamsPerCompetitionTeam
    ) {
      toast.error(
        `Maximum ${game.maxTeamsPerCompetitionTeam} groups are allowed.`,
      );
      return;
    }

    setIsAddModalOpen(true);
  };

  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container size="lg">
            <Modal.Dialog className="p-0">
              <Modal.CloseTrigger>
                <div className="rounded-full bg-default" aria-label="Close">
                  <FaXmark />
                </div>
              </Modal.CloseTrigger>

              <Modal.Header className="bg-blue-800 p-5">
                <Modal.Heading className="text-xl font-bold text-white">
                  Manage Registrations
                </Modal.Heading>
              </Modal.Header>

              <Modal.Body className="px-5">
                <div className="max-h-[70vh] space-y-5 overflow-y-auto py-1 pr-1">
                  {/* Game + team pickers */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-2 text-black">Game</Label>

                      <Select
                        aria-label="select game"
                        placeholder="Select game"
                        value={gameId || null}
                        onChange={(value: Key | null) => {
                          if (!value) return;
                          setGameId(String(value));
                        }}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox className="text-black">
                            {games.map((g) => (
                              <ListBox.Item
                                key={g.gameId}
                                id={g.gameId}
                                textValue={`${g.category} ${gameLabel(g)}`}
                              >
                                <p className="flex flex-col gap-1">
                                  <span className="font-bold">
                                    {gameLabel(g)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {g.category} | {g.type}
                                  </span>
                                </p>
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 text-black">Team</Label>

                      <Select
                        aria-label="select team"
                        placeholder={
                          loadingTeams ? "Loading teams..." : "Select team"
                        }
                        value={teamId || null}
                        isDisabled={loadingTeams}
                        onChange={(value: Key | null) => {
                          if (!value) return;
                          setTeamId(String(value));
                        }}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                          <ListBox className="text-black">
                            {teams.map((team) => (
                              <ListBox.Item
                                key={team._id}
                                id={team._id}
                                textValue={team.name}
                              >
                                {team.name}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  {/* Game rules */}
                  {game && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {isGroup ? (
                        <>
                          <div className="rounded-lg bg-default-100 p-4">
                            <p className="text-sm text-slate-500">
                              Minimum Participants
                            </p>
                            <p className="text-xl font-bold">
                              {game.minParticipants}
                            </p>
                          </div>

                          <div className="rounded-lg bg-default-100 p-4">
                            <p className="text-sm text-slate-500">
                              Maximum Participants
                            </p>
                            <p className="text-xl font-bold">
                              {game.maxParticipants ?? "Unlimited"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-default-100 p-4">
                            <p className="text-sm text-slate-500">
                              Maximum Groups
                            </p>
                            <p className="text-xl font-bold">
                              {game.maxTeamsPerCompetitionTeam}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-lg bg-default-100 p-4">
                            <p className="text-sm text-slate-500">
                              Maximum Participants
                            </p>
                            <p className="text-xl font-bold">
                              {game.maxParticipants ?? "Unlimited"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-default-100 p-4">
                            <p className="text-sm text-slate-500">
                              Maximum Per Team
                            </p>
                            <p className="text-xl font-bold">
                              {game.maxParticipantsPerTeam ?? "Unlimited"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Registrations */}
                  {!game || !teamId ? (
                    <div className="rounded-lg border border-dashed py-12 text-center text-slate-500">
                      {!game
                        ? "Select a game to manage its registrations."
                        : "Select a team to view and manage its registrations."}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {isGroup
                            ? "Group Registrations"
                            : "Individual Registrations"}
                          {selectedTeam ? ` · ${selectedTeam.name}` : ""}
                        </p>

                        <Button
                          onPress={openCreateModal}
                          isDisabled={loadingRegistrations}
                        >
                          <FaPlus />
                          {isGroup ? "Create Group" : "Add Registration"}
                        </Button>
                      </div>

                      {loadingRegistrations ? (
                        <div className="flex justify-center py-10">
                          <Spinner />
                        </div>
                      ) : isGroup ? (
                        groupRegistrations.length === 0 ? (
                          <div className="rounded-lg border border-dashed py-12 text-center text-slate-500">
                            No groups created yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {groupRegistrations.map((group) => (
                              <div
                                key={group._id}
                                className="rounded-xl border border-default-200 p-4"
                              >
                                <div className="flex w-full justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <FaPeopleGroup />
                                      <span className="font-bold">
                                        {group.groupName}
                                      </span>
                                    </div>

                                    <p className="text-sm text-slate-500">
                                      {group.participants.length} /{" "}
                                      {game.maxParticipants ?? "∞"} participants
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
                                      onPress={() =>
                                        setDeletingRegistration(group)
                                      }
                                    >
                                      <FaTrash />
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                  {group.participants.map((emp) => (
                                    <div
                                      key={emp._id}
                                      className="rounded-md bg-default-100 p-2"
                                    >
                                      <div className="text-sm font-medium">
                                        {emp.employeeName}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {emp.employeeCode}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : individualRegistrations.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center text-slate-500">
                          No individual registrations yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {individualRegistrations.map((registration) => (
                            <div
                              key={
                                registration._id || registration.employee._id
                              }
                              className="flex items-center justify-between gap-2 rounded-xl border border-default-200 p-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FaUser />
                                  <span className="font-bold">
                                    {registration?.employee?.employeeName}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500">
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
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer className="p-3">
                <Button variant="outline" onPress={() => onOpenChange(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {isGroup ? (
        <>
          <AddGroupRegistrationModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            game={game}
            apiBase={API_BASE}
            teamId={teamId}
            existingGroups={groupRegistrations}
            onSaved={(registration) => {
              setGroupRegistrations((prev) => [...prev, registration]);
              onChanged();
            }}
          />

          <EditGroupRegistrationModal
            isOpen={editingGroup !== null}
            onOpenChange={(open) => !open && setEditingGroup(null)}
            game={game}
            group={editingGroup}
            apiBase={API_BASE}
            onSaved={(registration) => {
              setGroupRegistrations((prev) =>
                prev.map((g) =>
                  g._id === registration._id ? registration : g,
                ),
              );
              setEditingGroup(null);
              onChanged();
            }}
          />
        </>
      ) : (
        <>
          <AddIndividualRegistrationModal
            isOpen={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            game={game}
            apiBase={API_BASE}
            teamId={teamId}
            onSaved={(registrations: IndividualRegistration[]) => {
              setIndividualRegistrations((prev) => [...prev, ...registrations]);
              onChanged();
            }}
          />

          <EditIndividualRegistrationModal
            isOpen={editingIndividual !== null}
            onOpenChange={(open: boolean) => {
              if (!open) setEditingIndividual(null);
            }}
            game={game}
            registration={editingIndividual}
            apiBase={API_BASE}
            onSaved={(registration: IndividualRegistration) => {
              setIndividualRegistrations((prev) =>
                prev.map((r) =>
                  r._id === registration._id ? registration : r,
                ),
              );
              setEditingIndividual(null);
              onChanged();
            }}
          />
        </>
      )}

      <DeleteGroupRegistrationModal
        isOpen={deletingRegistration !== null}
        onOpenChange={(open) => !open && setDeletingRegistration(null)}
        game={game}
        registration={deletingRegistration}
        apiBase={API_BASE}
        onDeleted={(id) => {
          if (isGroup) {
            setGroupRegistrations((prev) => prev.filter((g) => g._id !== id));
          } else {
            setIndividualRegistrations((prev) =>
              prev.filter((r) => r._id !== id),
            );
          }

          setDeletingRegistration(null);
          onChanged();
        }}
      />
    </>
  );
}
