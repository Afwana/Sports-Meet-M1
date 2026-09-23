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

export default function TeamLogoStrip({
  mobile = false,
}: {
  mobile?: boolean;
}) {
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
    <div
      className={
        mobile
          ? "w-full px-3"
          : "absolute left-1/2 top-6 z-20 w-full -translate-x-1/2 px-5"
      }
    >
      {/* <div className="mx-auto flex w-max min-w-full items-start justify-center gap-4 overflow-x-auto py-2"> */}
      <div className="grid grid-cols-2 md:grid-cols-4 mx-auto gap-4 overflow-x-auto py-2">
        {teams.map((team) => (
          <div
            key={team._id}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <Image
              src={team.logo}
              alt={team.name}
              width={mobile ? 72 : 250}
              height={mobile ? 72 : 250}
              objectFit="cover"
              className="rounded-full border-4 object-cover"
              style={{
                borderColor: team.color,
              }}
            />

            <span className=" text-center text-xs md:text-base font-semibold text-white">
              {team.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
