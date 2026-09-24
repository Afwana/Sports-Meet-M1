"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy, ChevronRight } from "lucide-react";

interface PointTableRow {
  rank: number;
  teamId: string;
  teamName: string;
  logo?: string;
  color?: string;
  totalPoints: number;
}

// Rank badge colors: 1st = red, 2nd/4th+ = slate, 3rd = amber — matches the
// reference design rather than literal medal colors.
const RANK_BADGE_CLASS: Record<number, string> = {
  1: "bg-red-500 text-white",
  2: "bg-slate-500 text-white",
  3: "bg-amber-600 text-white",
};

export default function LiveLeaderBoard() {
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
        console.error("Failed to load point table:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPointTable();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/15">
            <Trophy size={16} className="text-amber-400" />
          </span>

          <h2 className="text-base font-semibold text-white md:text-lg">
            Live Leaderboard
          </h2>
        </div>

        <Link
          href="/results"
          className="flex items-center gap-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 md:text-sm"
        >
          View All Results
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Column labels */}
      <div className="mt-4 grid grid-cols-[3rem_1fr_4rem] px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <span>Rank</span>
        <span>Team</span>
        <span className="text-right">Points</span>
      </div>

      {/* Rows */}
      <div className="mt-2 flex flex-col gap-2">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            Loading leaderboard...
          </div>
        ) : pointTable.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No results yet.
          </div>
        ) : (
          pointTable.slice(0, 4).map((team) => (
            <div
              key={team.teamId}
              className="grid grid-cols-[3rem_1fr_4rem] items-center rounded-xl bg-white/5 px-2 py-2.5"
            >
              <div className="flex items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                    RANK_BADGE_CLASS[team.rank] ?? "bg-slate-600 text-white"
                  }`}
                >
                  {team.rank}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2.5">
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={team.teamName}
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full border-2 object-cover"
                    style={{ borderColor: team.color || "#334155" }}
                  />
                ) : (
                  <span className="h-7 w-7 shrink-0 rounded-full bg-slate-700" />
                )}

                <span className="truncate text-sm font-medium text-white">
                  {team.teamName}
                </span>
              </div>

              <span className="text-right text-base font-bold text-white">
                {team.totalPoints}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
