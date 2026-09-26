"use client";

import { Button, Spinner } from "@heroui/react";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  GroupGamesTable,
  IndividualGamesTable,
} from "@/components/admin/RegistrationGameTables";

interface IndividualRow {
  employeeCode: string;
  employeeName: string;
}

interface GroupParticipant {
  employeeName: string;
  employeeCode: string;
}

interface GroupRow {
  groupName: string;
  participants: GroupParticipant[];
}

interface GameEntry {
  gameId: string;
  gameName: string;
  type: "Individual" | "Group";
  individual: IndividualRow[];
  group: GroupRow[];
}

interface AgeCategoryEntry {
  ageCategory: string;
  games: GameEntry[];
}

interface GenderEntry {
  gender: string;
  ageCategories: AgeCategoryEntry[];
}

interface CategoryEntry {
  category: string;
  genders: GenderEntry[];
}

interface TeamEntry {
  teamId: string;
  teamName: string;
  categories: CategoryEntry[];
}

export default function RegistrationsPrintPage() {
  const [report, setReport] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/registrations/print");
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load report.");
          return;
        }

        setReport(data.report || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-black print:p-0">
      {/* Consistent page size/margins regardless of the browser's own
          print defaults. Doesn't affect on-screen rendering. */}
      <style>{`
        @page {
          size: A4;
          margin: 14mm 12mm;
        }
      `}</style>

      {/* Toolbar — hidden when printing, only the report below prints */}
      <div className="mb-6 flex flex-col gap-1 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Registrations Report</h1>
            <p className="text-sm text-default-500">
              Team-wise registrations, grouped by category, gender and age
              category.
            </p>
          </div>

          <Button onPress={() => window.print()} isDisabled={loading}>
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 print:hidden">
          <Spinner size="md">Loading report...</Spinner>
        </div>
      ) : report.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-default-500 print:hidden">
          No registrations to show.
        </div>
      ) : (
        report.map((team, teamIndex) => (
          <section
            key={team.teamId}
            className={`mx-auto max-w-4xl ${
              teamIndex > 0 ? "break-before-page" : ""
            }`}
          >
            {/* Team Name */}
            <h1 className="break-after-avoid border-b-2 border-black pb-2 text-2xl font-bold">
              {team.teamName}
            </h1>

            {team.categories.map((cat) => (
              <div key={cat.category} className="mt-5">
                {/* {Category} Items */}
                <h2 className="break-after-avoid text-lg font-semibold">
                  {cat.category} Items
                </h2>

                {cat.genders.map((genderEntry) => (
                  <div key={genderEntry.gender} className="mt-3 pl-2">
                    {/* {Gender} */}
                    <h3 className="break-after-avoid font-bold">
                      {genderEntry.gender}
                    </h3>

                    {genderEntry.ageCategories.map((ageEntry) => {
                      const hasIndividual = ageEntry.games.some(
                        (g) =>
                          g.type === "Individual" && g.individual.length > 0,
                      );
                      const hasGroup = ageEntry.games.some(
                        (g) => g.type === "Group" && g.group.length > 0,
                      );

                      return (
                        <div key={ageEntry.ageCategory} className="mt-2 pl-3">
                          {/* Age Category — kept with whatever follows it;
                              the tables below are free to break across
                              pages between rows (see break-inside-avoid on
                              each row instead), rather than forcing this
                              whole, often multi-page-tall block onto a
                              single page. */}
                          <h4 className="break-after-avoid text-sm text-default-600">
                            {ageEntry.ageCategory}
                          </h4>

                          <div className="mt-1 flex flex-col gap-3">
                            {hasIndividual && (
                              <IndividualGamesTable games={ageEntry.games} />
                            )}

                            {hasGroup && (
                              <GroupGamesTable games={ageEntry.games} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
