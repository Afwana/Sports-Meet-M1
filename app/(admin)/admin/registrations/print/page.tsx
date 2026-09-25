"use client";

import { Button, Spinner } from "@heroui/react";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
      {/* Toolbar — hidden when printing */}
      <div className="mb-6 flex items-center justify-between print:hidden">
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

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md">Loading report...</Spinner>
        </div>
      ) : report.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-default-500">
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
            <h1 className="border-b-2 border-black pb-2 text-2xl font-bold">
              {team.teamName}
            </h1>

            {team.categories.map((cat) => (
              <div key={cat.category} className="mt-5">
                {/* {Category} Items */}
                <h2 className="text-lg font-semibold">{cat.category} Items</h2>

                {cat.genders.map((genderEntry) => (
                  <div key={genderEntry.gender} className="mt-3 pl-2">
                    {/* {Gender} */}
                    <h3 className="font-bold">{genderEntry.gender}</h3>

                    {genderEntry.ageCategories.map((ageEntry) => (
                      <div key={ageEntry.ageCategory} className="mt-1 pl-3">
                        {/* Age Category */}
                        <h4 className="text-sm text-default-600">
                          {ageEntry.ageCategory}
                        </h4>

                        {ageEntry.games.map((game) => (
                          <div
                            key={game.gameId}
                            className="mt-2 break-inside-avoid pl-3"
                          >
                            <p className="text-sm font-semibold underline underline-offset-2">
                              {game.gameName}
                            </p>

                            {game.type === "Individual" ? (
                              <table className="mt-1 w-full max-w-md border-collapse text-sm">
                                <thead>
                                  <tr className="border-b border-black/30 text-left">
                                    <th className="w-32 py-1 pr-3 font-medium">
                                      Participant Code
                                    </th>
                                    <th className="py-1 font-medium">
                                      Participant Name
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {game.individual.map((row, i) => (
                                    <tr
                                      key={`${row.employeeCode}-${i}`}
                                      className="border-b border-black/10"
                                    >
                                      <td className="py-1 pr-3">
                                        {row.employeeCode}
                                      </td>
                                      <td className="py-1">
                                        {row.employeeName}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="mt-1 flex flex-col gap-2">
                                {game.group.map((grp, i) => (
                                  <div
                                    key={`${grp.groupName}-${i}`}
                                    className="flex flex-wrap items-start gap-x-4 gap-y-1 border-b border-black/10 pb-2 text-sm"
                                  >
                                    <span className="w-40 shrink-0 font-medium">
                                      {grp.groupName}
                                    </span>

                                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                                      {grp.participants.map(
                                        (participant, pIndex) => (
                                          <div
                                            key={`${participant.employeeCode}-${pIndex}`}
                                            className="text-center"
                                          >
                                            <p className="font-semibold">
                                              {participant.employeeName}
                                            </p>
                                            <p className="text-xs text-default-500">
                                              {participant.employeeCode}
                                            </p>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
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
