"use client";

import { Button, Card, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPrint } from "react-icons/fa";
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

export default function AdminGamesPage() {
  const router = useRouter();
  const [report, setReport] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/registrations/print");
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load registrations.");
          return;
        }

        setReport(data.report || []);
        setLoaded(true);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load registrations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loaded]);
  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 md:p-6 dark:bg-black">
      <Card className="w-full p-5 min-h-[calc(100vh-115px)]">
        <Card.Header className="flex flex-col gap-3 md:flex-row md:justify-between">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">Games</h1>

            <p className="text-slate-500 text-sm">
              Manage Individual and Group games.
            </p>
          </div>
          <Button
            variant="primary"
            onPress={() => {
              router.push("/admin/registrations/print");
            }}
          >
            <FaPrint />
            Print Registrations
          </Button>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md">Loading registrations...</Spinner>
            </div>
          ) : report.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-default-500">
              No registrations yet.
            </div>
          ) : (
            report.map((team) => (
              <section key={team.teamId} className="mb-8 last:mb-0">
                <h1 className="border-b-2 border-default-800 pb-2 text-xl font-bold">
                  {team.teamName}
                </h1>

                {team.categories.map((cat) => (
                  <div key={cat.category} className="mt-4">
                    <h2 className="text-base font-semibold">
                      {cat.category} Items
                    </h2>

                    {cat.genders.map((genderEntry) => (
                      <div key={genderEntry.gender} className="mt-2 pl-2">
                        <h3 className="font-bold">{genderEntry.gender}</h3>

                        {genderEntry.ageCategories.map((ageEntry) => (
                          <div key={ageEntry.ageCategory} className="mt-1 pl-3">
                            <h4 className="text-sm text-default-500">
                              {ageEntry.ageCategory}
                            </h4>

                            {ageEntry.games.map((game) => (
                              <div key={game.gameId} className="mt-2 pl-3">
                                <p className="text-sm font-semibold underline underline-offset-2">
                                  {game.gameName}
                                </p>

                                {game.type === "Individual" ? (
                                  <table className="mt-1 w-full max-w-md border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b border-default-300 text-left">
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
                                          className="border-b border-default-100"
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
                                        className="flex flex-wrap items-start gap-x-4 gap-y-1 border-b border-default-100 pb-2 text-sm"
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
        </Card.Content>
      </Card>
    </div>
  );
}
