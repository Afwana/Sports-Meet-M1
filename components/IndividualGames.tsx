"use client";

import { getAgeCategory } from "@/lib/getAgeCategory";
import { iconMap } from "@/utils/iconMap";
import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import { toast } from "sonner";

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

interface Props {
  employeeGender: "Male" | "Female";
  employeeAge: string | Date;
}

interface GameItemProps {
  game: Game;
  isRegistered: boolean;
}

function GameItem({ game, isRegistered }: GameItemProps) {
  const Icon = iconMap[game.icon as keyof typeof iconMap];

  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border border-slate-200 bg-default-50 p-2 md:p-4">
      <div className="flex w-full gap-1 justify-between items-start">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <Icon className="shrink-0 text-2xl text-blue-600" />
          ) : (
            <FaCircle className="shrink-0 text-slate-400" />
          )}

          <p className="truncate font-medium">{game.name}</p>
        </div>
        {isRegistered && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-success-100 px-2 py-1 text-xs font-medium text-success-700">
            <FaCheckCircle className="text-success" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs font-medium">
        {game.type} | {game.gender} | {game.ageCategory}
      </div>
    </div>
  );
}

export default function IndividualGames({
  employeeGender,
  employeeAge,
}: Props) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredGameIds, setRegisteredGameIds] = useState<string[]>([]);

  const employeeAgeCategory = getAgeCategory(employeeAge);

  console.log("DOB:", employeeAge);
  console.log("Age Category:", employeeAgeCategory);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [gamesRes, statusRes] = await Promise.all([
          fetch("/api/employee/games", {
            cache: "no-store",
          }),
          fetch("/api/employee/individual-registration/status", {
            cache: "no-store",
          }),
        ]);

        const gamesData = await gamesRes.json();

        if (!gamesRes.ok) {
          toast.error(gamesData.message || "Failed to load games.");
          return;
        }

        setGames(gamesData.filter((game: Game) => game.isActive));

        if (statusRes.ok) {
          const statusData = await statusRes.json();

          const ids =
            statusData.registration?.games?.map((g: { gameId: string }) =>
              String(g.gameId),
            ) || [];

          setRegisteredGameIds(ids);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load games.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const eligibleGames = games.filter((game) => {
    // Gender must match
    if (!(game.gender === employeeGender || game.gender === "Both")) {
      return false;
    }

    // Off Stage and Stage don't have age restrictions
    if (game.category === "Off Stage" || game.category === "Stage") {
      return true;
    }

    // Sports and Games
    return (
      game.ageCategory === "Open" || game.ageCategory === employeeAgeCategory
    );
  });

  const sportsGames = eligibleGames.filter(
    (game) => game.category === "Sports",
  );

  const offStageGames = eligibleGames.filter(
    (game) => game.category === "Off Stage",
  );

  const stageGames = eligibleGames.filter((game) => game.category === "Stage");

  const gamesItems = eligibleGames.filter((game) => game.category === "Games");

  const renderCategory = (
    title: string,
    categoryGames: Game[],
    showType = false,
  ) => {
    if (categoryGames.length === 0) {
      return null;
    }

    return (
      <Card className="flex flex-col gap-3 shadow-xl border">
        <Card.Header className="text-sm font-semibold md:text-base">
          {title}
        </Card.Header>

        <Card.Content className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryGames.map((game) => (
            <div key={game._id}>
              <GameItem
                game={game}
                isRegistered={registeredGameIds.includes(game._id)}
              />

              {showType &&
                (game.type === "Group" ? (
                  <p className="mt-1 px-1 text-xs text-slate-400 flex items-center justify-between gap-5">
                    <span>
                      Players per Group : {game.minParticipants} -{" "}
                      {game.maxParticipants}
                    </span>
                    <span>
                      Groups per Team : {game.maxTeamsPerCompetitionTeam}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 px-1 text-xs text-slate-400 flex items-center justify-end gap-5">
                    <span>
                      Max Participants per Team :{" "}
                      {game.maxParticipantsPerTeam ?? "-"}
                    </span>
                  </p>
                ))}
            </div>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <div className="mt-10 flex flex-col gap-5 px-3 md:px-5">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md">Loading Games...</Spinner>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 md:p-4">
            <p className="font-medium text-warning-700">
              Registration is handled by your Team Captain.
            </p>

            <p className="mt-1 text-sm text-warning-600">
              You can view all available games below. Contact your captain to
              participate.
            </p>
          </div>

          {eligibleGames.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-default-50 p-6 text-center">
              <p className="font-medium">No games available.</p>

              <p className="mt-1 text-sm text-slate-300">
                No games matching your gender are currently available.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {renderCategory("Off Stage Items", offStageGames, true)}
              {renderCategory("Stage Items", stageGames, true)}
              {renderCategory("Sports Items", sportsGames, true)}
              {renderCategory("Games", gamesItems, true)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
