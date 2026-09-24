"use client";

import { Spinner } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";
import { GiTrophy } from "react-icons/gi";

interface PointTableRow {
  rank: number;
  teamId: string;
  teamName: string;
  first: number;
  second: number;
  third: number;
  totalPoints: number;
}

interface PublicPointsTableProps {
  showMedalColumns?: boolean;
}

export default function PublicPointsTable({
  showMedalColumns = false,
}: PublicPointsTableProps) {
  const [pointTable, setPointTable] = useState<PointTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPointTable = async () => {
      try {
        const res = await fetch("/api/points-table");
        const data = await res.json();

        if (data.success) {
          setPointTable(data.pointTable || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPointTable();
  }, []);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-3xl bg-white/95 p-2 shadow-2xl backdrop-blur dark:bg-neutral-900/95">
          {/* Header */}
          <div
            className={`grid ${
              showMedalColumns ? "grid-cols-6" : "grid-cols-3"
            } gap-4 rounded-2xl p-1 md:px-6 md:py-4 text-xs font-bold uppercase tracking-wider text-gray-500`}
          >
            <span>Rank</span>
            <span>Team</span>
            {showMedalColumns && (
              <>
                <span className="text-center">🥇</span>
                <span className="text-center">🥈</span>
                <span className="text-center">🥉</span>
              </>
            )}
            <span className="text-right">Points</span>
          </div>

          {/* Rows */}
          <div className="space-y-1 md:space-y-2">
            {pointTable.map((team) => (
              <div
                key={team.teamId}
                className={`grid ${
                  showMedalColumns ? "grid-cols-6" : "grid-cols-3"
                } items-center rounded-2xl transition-all duration-200 ${
                  team.rank === 1 && team.totalPoints > 0
                    ? "bg-linear-to-r from-blue-700 to-blue-600 text-white shadow-lg px-3 md:px-6 py-3 md:py-5"
                    : "p-1 md:px-3 md:py-2 border border-gray-200 bg-white hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                }`}
              >
                {/* Rank */}
                <div
                  className={`flex items-center gap-3 font-bold ${team.rank === 1 && team.totalPoints > 0 ? "text-wihte" : "text-gray-800"}`}
                >
                  {team.totalPoints > 0 && team.rank <= 3 ? (
                    team.rank === 1 ? (
                      <GiTrophy className="text-4xl text-yellow-400" />
                    ) : (
                      <FaMedal
                        className={`text-2xl ${
                          team.rank === 2 ? "text-gray-400" : "text-amber-500"
                        }`}
                      />
                    )
                  ) : (
                    <div className="w-6" />
                  )}
                  <span className="text-base md:text-xl">{team.rank}</span>
                </div>

                {/* Team */}
                <div
                  className={`text-base md:text-xl font-semibold ${
                    team.rank === 1 && team.totalPoints > 0
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {team.teamName}
                </div>

                {showMedalColumns && (
                  <>
                    <div className="text-center font-semibold">
                      {team.first}
                    </div>
                    <div className="text-center font-semibold">
                      {team.second}
                    </div>
                    <div className="text-center font-semibold">
                      {team.third}
                    </div>
                  </>
                )}

                {/* Points */}
                <div
                  className={`text-right text-xl font-bold ${
                    team.rank === 1 && team.totalPoints > 0
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {team.totalPoints}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center p-0.5 md:p-2 justify-end">
            <Link
              href="/results"
              className="text-blue-300 underline text-sm font-medium"
            >
              View In Detail
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
