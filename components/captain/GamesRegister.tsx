"use client";

import { Game } from "@/types/game";
import { iconMap } from "@/utils/iconMap";
import { Card, Label, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { toast } from "sonner";

interface GameItemProps {
  game: Game;
  onSelect: (game: Game) => void;
}

function GameItem({ game, onSelect }: GameItemProps) {
  const Icon = iconMap[game.icon as keyof typeof iconMap];

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      aria-label={`Select ${game.name} for registration`}
      className="flex w-full flex-col gap-1 rounded-lg border border-slate-200 bg-default-50 p-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 md:p-4"
    >
      <div className="flex w-full gap-1 justify-between items-start">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <Icon className="shrink-0 text-2xl text-blue-600" />
          ) : (
            <FaCircle className="shrink-0 text-slate-400" />
          )}

          <p className="truncate font-medium">{game.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium">
        {game.type} | {game.gender} | {game.ageCategory}
      </div>
      {game.type === "Group" ? (
        <p className="mt-1 flex flex-col gap-1 text-xs text-slate-400">
          <span>
            Players per Group : {game.minParticipants} - {game.maxParticipants}
          </span>
          <span>Groups per Team : {game.maxTeamsPerCompetitionTeam}</span>
        </p>
      ) : (
        <p className="mt-1 flex flex-col text-xs text-slate-400">
          <span>
            Maximum Participants per Team : {game.maxParticipantsPerTeam ?? "-"}
          </span>
        </p>
      )}
    </button>
  );
}

const GENDER_ORDER: Array<Game["gender"]> = ["Both", "Male", "Female"];
const AGE_ORDER: Array<Game["ageCategory"]> = ["Open", "Junior", "Senior"];

export default function GamesRegister() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [gamesRes] = await Promise.all([
          fetch("/api/employee/games", {
            cache: "no-store",
          }),
        ]);

        const gamesData = await gamesRes.json();

        if (!gamesRes.ok) {
          toast.error(gamesData.message || "Failed to load games.");
          return;
        }

        setGames(gamesData.filter((game: Game) => game.isActive));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load games.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectGame = (game: Game) => {
    const params = new URLSearchParams({
      type: game.type,
      category: game.category,
      gender: game.gender,
      ageCategory: game.ageCategory,
      gameId: game._id,
    });
    router.push(`/captain/registration?${params.toString()}`);
  };

  const sportsGames = games.filter((game) => game.category === "Sports");
  const offStageGames = games.filter((game) => game.category === "Off Stage");
  const stageGames = games.filter((game) => game.category === "Stage");
  const gamesItems = games.filter((game) => game.category === "Games");

  const renderCategory = (title: string, categoryGames: Game[]) => {
    if (categoryGames.length === 0) {
      return null;
    }

    const genderGroups = GENDER_ORDER.map((gender) => ({
      gender,
      items: categoryGames.filter((game) => game.gender === gender),
    })).filter((group) => group.items.length > 0);

    return (
      <Card className="w-full border shadow-lg">
        <Card.Header>
          <Card.Title className="text-base font-semibold md:text-base text-black">
            {title}
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-5">
          {genderGroups.map((group, groupIndex) => {
            const ageGroups = AGE_ORDER.map((ageCategory) => ({
              ageCategory,
              items: group.items.filter((g) => g.ageCategory === ageCategory),
            })).filter((sub) => sub.items.length > 0);

            return (
              <div key={group.gender} className="flex flex-col gap-4">
                {groupIndex > 0 && (
                  <div className="border-t border-slate-200" />
                )}
                <Label className="text-sm font-semibold uppercase text-blue-500">
                  {group.gender}
                </Label>
                {ageGroups.map((sub) => (
                  <div key={sub.ageCategory}>
                    {ageGroups.length > 1 && (
                      <p className="text-blue-500">{sub.ageCategory}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
                      {sub.items.map((game) => (
                        <GameItem
                          key={game._id}
                          game={game}
                          onSelect={handleSelectGame}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
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

          {games.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-default-50 p-6 text-center">
              <p className="font-medium">No games available.</p>

              <p className="mt-1 text-sm text-slate-300">
                No games matching your gender are currently available.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {renderCategory("Off Stage Items", offStageGames)}
              {renderCategory("Stage Items", stageGames)}
              {renderCategory("Sports Items", sportsGames)}
              {renderCategory("Games", gamesItems)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
