"use client";

import { iconMap } from "@/utils/iconMap";
import { Button, Label, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import { toast } from "sonner";

// const controlClassName = "bg-success-soft before:bg-success";

// const indicatorClassName =
//   "**:data-[slot=checkbox-default-indicator--checkmark]:text-success-foreground";

interface Game {
  _id: string;
  name: string;
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Individual" | "Group";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
  icon: string;
  minParticipants: number;
  maxParticipants: number;
  maxParticipantsPerTeam: number;
  maxTeamsPerCompetitionTeam: number;
  isActive: boolean;
}

interface RegisteredGame {
  gameId: string;
  gameName: string;
}

interface Props {
  employeeGender: "Male" | "Female";
  isCaptain: boolean;
}

interface GameItemProps {
  game: Game;
  registrationOpen: boolean;
}

function GameItem({ game, registrationOpen }: GameItemProps) {
  const Icon = iconMap[game.icon as keyof typeof iconMap];

  console.log(registrationOpen);

  // if (!registrationOpen) {
  //   return (
  //     <div
  //       className="
  //         flex items-center justify-between gap-3
  //         rounded-lg border border-default-200
  //         bg-default-50 p-4
  //       "
  //     >
  //       <div className="flex flex-col w-full gap-1">
  //         <div className="flex min-w-0 items-center gap-3">
  //           {Icon ? (
  //             <Icon className="shrink-0 text-2xl text-blue-600" />
  //           ) : (
  //             <FaCircle className="shrink-0 text-default-400" />
  //           )}

  //           <p className="truncate font-medium">{game.name}</p>
  //         </div>
  //       </div>

  //       <div className="flex items-center gap-1">
  //         {game.category === "Sports" && (
  //           <p className="text-xs font-medium text-blue-400">
  //             {game.ageCategory}
  //           </p>
  //         )}
  //         <span className="shrink-0 rounded-full bg-default-100 px-2 py-1 text-xs text-default-500">
  //           {game.type}
  //         </span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className="
          flex items-center justify-between gap-3
          rounded-lg border border-default-200
          bg-default-50 p-4
        "
    >
      <div className="flex flex-col w-full gap-1">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <Icon className="shrink-0 text-2xl text-blue-600" />
          ) : (
            <FaCircle className="shrink-0 text-default-400" />
          )}

          <p className="truncate font-medium">{game.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {(game.category === "Sports" || game.category === "Games") && (
          <p className="text-xs font-medium text-blue-400">
            {game.ageCategory}
          </p>
        )}
        <span className="shrink-0 rounded-full bg-default-100 px-2 py-1 text-xs text-default-500">
          {game.type}
        </span>
      </div>
    </div>
  );
}

export default function IndividualGames({ employeeGender, isCaptain }: Props) {
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  // const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const [registeredGames, setRegisteredGames] = useState<RegisteredGame[]>([]);

  const [loading, setLoading] = useState(true);
  // const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [gamesRes, statusRes, settingsRes] = await Promise.all([
          fetch("/api/employee/games", {
            cache: "no-store",
          }),

          fetch("/api/employee/individual-registration/status", {
            cache: "no-store",
          }),

          fetch("/api/settings", {
            cache: "no-store",
          }),
        ]);

        const gamesData = await gamesRes.json();
        const statusData = await statusRes.json();
        const settingsData = await settingsRes.json();

        if (settingsRes.ok && settingsData.success) {
          setRegistrationOpen(settingsData.settings.registrationOpen === true);
        } else {
          setRegistrationOpen(false);

          toast.error(
            settingsData.message || "Failed to load registration status.",
          );
        }

        if (!gamesRes.ok) {
          toast.error(gamesData.message || "Failed to load games.");
          return;
        }

        const activeGames = gamesData.filter(
          (game: Game) => game.isActive === true,
        );

        setGames(activeGames);

        if (!statusRes.ok) {
          toast.error(
            statusData.message || "Failed to check registration status.",
          );
          return;
        }

        if (statusData.registered) {
          const existingGames: RegisteredGame[] =
            statusData.registration?.games || [];

          setSubmitted(true);
          setRegisteredGames(existingGames);

          // setSelectedGames(existingGames.map((game) => String(game.gameId)));
        }
      } catch (error) {
        console.error("Failed to load individual registration:", error);

        toast.error("Failed to load individual games.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const eligibleGames = games.filter(
    (game) => game.gender === employeeGender || game.gender === "Both",
  );

  // const registrationGames = eligibleGames.filter(
  //   (game) => game.type === "Individual",
  // );

  const sportsGames = eligibleGames.filter(
    (game) => game.category === "Sports" || game.category === "Games",
  );

  const offStageGames = eligibleGames.filter(
    (game) => game.category === "Off Stage",
  );

  const stageGames = eligibleGames.filter((game) => game.category === "Stage");

  const gamesItems = eligibleGames.filter((game) => game.category === "Games");

  // const registrationSportsGames = registrationGames.filter(
  //   (game) => game.category === "Sports",
  // );

  // const registrationOffStageGames = registrationGames.filter(
  //   (game) => game.category === "Off Stage",
  // );

  // const registrationStageGames = registrationGames.filter(
  //   (game) => game.category === "Stage",
  // );

  // const registrationGamesItems = registrationGames.filter(
  //   (game) => game.category === "Games",
  // );

  // const submitRegistration = async () => {
  //   if (!registrationOpen) {
  //     toast.error("Individual registration is currently closed.");
  //     return;
  //   }

  //   const selectedGameObjects = registrationGames
  //     .filter((game) => selectedGames.includes(game._id))
  //     .map((game) => ({
  //       gameId: game._id,
  //       gameName: game.name,
  //     }));

  //   if (selectedGameObjects.length === 0) {
  //     toast.error("Please select at least one individual game.");
  //     return;
  //   }

  //   try {
  //     setSubmitting(true);

  //     const res = await fetch("/api/employee/individual-registration", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         games: selectedGameObjects,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data.message || "Failed to submit registration.");
  //       return;
  //     }

  //     const savedGames: RegisteredGame[] =
  //       data.registration?.games || selectedGameObjects;

  //     setRegisteredGames(savedGames);
  //     setSubmitted(true);

  //     toast.success("Individual registration submitted successfully.");

  //     router.refresh();
  //   } catch (error) {
  //     console.error("Individual registration error:", error);

  //     toast.error("Failed to submit registration.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const renderCategory = (
    title: string,
    categoryGames: Game[],
    showType = false,
  ) => {
    if (categoryGames.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold md:text-base">{title}</Label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryGames.map((game) => (
            <div key={game._id}>
              <GameItem game={game} registrationOpen={registrationOpen} />

              {showType &&
                (game.type === "Group" ? (
                  <p className="mt-1 px-1 text-xs text-default-400 flex items-center justify-between gap-5">
                    <span>
                      Players per Group : {game.minParticipants} -{" "}
                      {game.maxParticipants}
                    </span>
                    <span>
                      Groups per Team : {game.maxTeamsPerCompetitionTeam}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 px-1 text-xs text-default-400 flex items-center justify-between gap-5">
                    <span>Max Participants : {game.maxParticipants}</span>
                    <span>
                      Max Participants per Team : {game.maxParticipantsPerTeam}
                    </span>
                  </p>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 flex flex-col gap-5">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md">Loading Games...</Spinner>
        </div>
      ) : submitted ? (
        <div className="px-5">
          <div className="rounded-lg border border-success-200 bg-success-50 p-5">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-xl text-success" />

              <div>
                <h2 className="font-semibold">
                  Individual Registration Submitted
                </h2>

                <p className="text-sm text-default-500">
                  Your selected individual games have been registered
                  successfully.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold">Selected Games</h3>

            {registeredGames.length === 0 ? (
              <p className="text-sm text-default-500">No games found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {registeredGames.map((game) => {
                  const currentGame = eligibleGames.find(
                    (item) => item._id === String(game.gameId),
                  );

                  const Icon = currentGame
                    ? iconMap[currentGame.icon as keyof typeof iconMap]
                    : null;

                  return (
                    <div
                      key={String(game.gameId)}
                      className="
                        flex items-center gap-3
                        rounded-lg border
                        border-default-200
                        bg-default-50 p-4
                      "
                    >
                      {Icon ? (
                        <Icon className="shrink-0 text-xl text-blue-600" />
                      ) : (
                        <FaCircle className="shrink-0 text-default-400" />
                      )}

                      <div className="min-w-0">
                        <p className="font-medium">{game.gameName}</p>

                        <p className="truncate text-xs text-default-500">
                          {String(game.gameId)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-5">
          {isCaptain ? (
            !registrationOpen ? (
              <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 flex w-full items-start justify-between">
                <div>
                  <p className="font-medium text-warning-700">
                    Registration is not available Now!.
                  </p>

                  <p className="mt-1 text-sm text-warning-600">
                    You can view the available games below. Registration will
                    available soon!.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 flex w-full items-start justify-between">
                <div>
                  <p className="font-medium text-success-700">
                    Registration is now open.
                  </p>

                  <p className="mt-1 text-sm text-success-600">
                    Select the games and team members to register.
                  </p>
                </div>
                <Button onPress={() => router.push("/captain/groups")}>
                  Register Now
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 flex w-full items-start justify-between">
              <div>
                <p className="font-medium text-warning-700">
                  Registration is handled by your Team Captain.
                </p>

                <p className="mt-1 text-sm text-warning-600">
                  You can view the available games below. Contact your captain
                  to participate in this event.
                </p>
              </div>
            </div>
          )}
          {/* {registrationOpen && (
            <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 flex w-full items-start justify-between">
              <div>
                <p className="font-medium text-success-700">
                  Individual registration is now open.
                </p>

                <p className="mt-1 text-sm text-success-600">
                  Select the individual games you would like to participate in.
                </p>
              </div>
              <Button
                onPress={submitRegistration}
                isDisabled={submitting || selectedGames.length === 0}
              >
                {submitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          )} */}
          {eligibleGames.length === 0 ? (
            <div className="rounded-lg border border-default-200 bg-default-50 p-6 text-center">
              <p className="font-medium">No games available.</p>

              <p className="mt-1 text-sm text-default-500">
                No games matching your gender are currently available.
              </p>
            </div>
          ) : (
            // : registrationOpen ? (
            //   <>
            //     {registrationGames.length === 0 ? (
            //       <div className="rounded-lg border border-default-200 bg-default-50 p-6 text-center">
            //         <p className="font-medium">No individual games available.</p>

            //         <p className="mt-1 text-sm text-default-500">
            //           There are currently no individual games available for your
            //           gender.
            //         </p>
            //       </div>
            //     ) : (
            //       <CheckboxGroup
            //         className="w-full gap-8"
            //         name="games"
            //         value={selectedGames}
            //         onChange={setSelectedGames}
            //       >
            //         {renderCategory("Sports Items", registrationSportsGames)}

            //         {renderCategory("Off Stage Items", registrationOffStageGames)}

            //         {renderCategory("Stage Items", registrationStageGames)}

            //         {renderCategory("Games", registrationGamesItems)}
            //       </CheckboxGroup>
            //     )}

            //     {/* Selected Games + Submit */}
            //     {registrationGames.length > 0 && (
            //       <div className="mt-5 flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-center">
            //         <Label className="my-4 text-sm text-muted">
            //           <span className="font-medium">Selected:</span>{" "}
            //           {selectedGames.length > 0
            //             ? registrationGames
            //                 .filter((game) => selectedGames.includes(game._id))
            //                 .map((game) => game.name)
            //                 .join(", ")
            //             : "None"}
            //         </Label>

            //         <Button
            //           onPress={submitRegistration}
            //           isDisabled={submitting || selectedGames.length === 0}
            //         >
            //           {submitting ? "Submitting..." : "Submit Registration"}
            //         </Button>
            //       </div>
            //     )}
            //   </>
            // )
            <div className="flex flex-col gap-8">
              {renderCategory("Off Stage Items", offStageGames, true)}

              {renderCategory("Stage Items", stageGames, true)}

              {renderCategory("Sports Items", sportsGames, true)}

              {renderCategory("Games", gamesItems, true)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
