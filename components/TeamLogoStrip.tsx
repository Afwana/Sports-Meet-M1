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

export default function TeamLogoStrip() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await fetch("/api/teams");

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setTeams(data.teams || []);
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
    <div className="absolute left-1/2 top-6 z-20 w-full -translate-x-1/2 px-3 md:px-5">
      <div className="mx-auto flex max-w-full items-center justify-center gap-2 md:gap-8 overflow-x-auto py-2">
        {teams.map((team) => (
          <div key={team._id} className="flex flex-col items-center gap-5">
            <Image
              src={team.logo}
              alt={team.name}
              width={250}
              height={250}
              className="rounded-full border-4 object-cover"
              style={{
                borderColor: team.color,
              }}
            />

            <span className="whitespace-nowrap text-base font-semibold text-white">
              {team.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
