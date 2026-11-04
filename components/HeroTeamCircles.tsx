"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Team {
  _id: string;
  name: string;
  color: string;
  logo: string;
  isActive: boolean;
}

export default function HeroTeamCircles() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const [teamsRes, pointsRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/points-table").catch(() => null),
        ]);

        const data = await teamsRes.json();

        if (!teamsRes.ok) {
          console.error(data.message);
          return;
        }

        const loadedTeams: Team[] = data.teams || [];

        // Order teams by points table rank (highest score first)
        const rankMap = new Map<string, number>();

        if (pointsRes && pointsRes.ok) {
          const pointsData = await pointsRes.json();

          if (pointsData.success) {
            (pointsData.pointTable || []).forEach(
              (row: { teamId: string; rank: number }) => {
                rankMap.set(String(row.teamId), row.rank);
              },
            );
          }
        }

        const sortedTeams = [...loadedTeams].sort((a, b) => {
          const rankA = rankMap.get(String(a._id)) ?? Number.MAX_SAFE_INTEGER;
          const rankB = rankMap.get(String(b._id)) ?? Number.MAX_SAFE_INTEGER;

          if (rankA !== rankB) return rankA - rankB;

          return a.name.localeCompare(b.name);
        });

        setTeams(sortedTeams);
      } catch (error) {
        console.error("Failed to load teams:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  if (loading || teams.length === 0) {
    return null;
  }

  return (
    <div
      id="teams"
      className="flex flex-wrap items-start justify-center gap-6 scroll-mt-24 md:gap-10"
    >
      {teams.map((team) => (
        <div key={team._id} className="flex flex-col items-center gap-2">
          <Image
            src={team.logo}
            alt={team.name}
            width={110}
            height={110}
            className="h-16 w-16 rounded-full border-4 object-cover shadow-lg md:h-27.5 md:w-27.5"
            style={{ borderColor: team.color }}
          />

          <span className="whitespace-nowrap text-xs font-bold tracking-wide text-white md:text-sm">
            {team.name.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
