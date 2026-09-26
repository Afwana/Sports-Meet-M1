"use client";

import {
  GroupGamesTable,
  IndividualGamesTable,
} from "@/components/admin/RegistrationGameTables";
import {
  Button,
  Card,
  Key,
  Label,
  ListBox,
  Select,
  Spinner,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaPrint } from "react-icons/fa6";
import { toast } from "sonner";

interface Team {
  _id: string;
  name: string;
}

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

const CATEGORY_OPTIONS = ["Sports", "Off Stage", "Stage", "Games"];
const GENDER_ORDER = ["Both", "Male", "Female"];
const AGE_ORDER = ["Open", "Junior", "Senior"];

export default function AdminRegistrationsPage() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [report, setReport] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [teamsRes, reportRes] = await Promise.all([
          fetch("/api/admin/teams"),
          fetch("/api/admin/registrations/print"),
        ]);

        const teamsData = await teamsRes.json();
        const reportData = await reportRes.json();

        if (!teamsRes.ok) {
          toast.error(teamsData.message || "Failed to load teams.");
          return;
        }

        if (!reportRes.ok) {
          toast.error(reportData.message || "Failed to load registrations.");
          return;
        }

        setTeams(teamsData || []);
        setReport(reportData.report || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load registrations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedTeamName = teams.find((t) => t._id === selectedTeamId)?.name;

  // The category selected for the currently selected team, if it has any
  // registrations at all under that category.
  const categoryEntry: CategoryEntry | null = useMemo(() => {
    if (!selectedTeamId || !selectedCategory) return null;

    const teamEntry = report.find((t) => t.teamId === selectedTeamId);
    if (!teamEntry) return null;

    return (
      teamEntry.categories.find((c) => c.category === selectedCategory) || null
    );
  }, [report, selectedTeamId, selectedCategory]);

  // Gender -> AgeCategory -> games in that bucket, in the fixed display
  // order, dropping any bucket that has no individual/group data at all.
  const genderSections = useMemo(() => {
    return GENDER_ORDER.map((gender) => {
      const genderEntry = categoryEntry?.genders.find(
        (g) => g.gender === gender,
      );

      const ageSections = AGE_ORDER.map((ageCategory) => {
        const ageEntry = genderEntry?.ageCategories.find(
          (a) => a.ageCategory === ageCategory,
        );

        const games = ageEntry?.games || [];

        const hasIndividual = games.some(
          (g) => g.type === "Individual" && g.individual.length > 0,
        );
        const hasGroup = games.some(
          (g) => g.type === "Group" && g.group.length > 0,
        );

        return { ageCategory, games, hasIndividual, hasGroup };
      }).filter((a) => a.hasIndividual || a.hasGroup);

      return { gender, ageSections };
    }).filter((g) => g.ageSections.length > 0);
  }, [categoryEntry]);

  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 md:p-6 dark:bg-black">
      <Card className="w-full min-h-[calc(100vh-115px)] p-5">
        <Card.Header className="flex flex-col gap-3 md:flex-row md:justify-between">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Registrations</h1>

            <p className="text-slate-500 text-sm">
              Choose a team and category to see who&apos;s registered.
            </p>
          </div>

          <Button
            variant="primary"
            onPress={() => router.push("/admin/registrations/print")}
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
          ) : (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:max-w-xl">
                <div>
                  <Label className="mb-2">Team</Label>

                  <Select
                    aria-label="select team"
                    value={selectedTeamId}
                    onChange={(value: Key | null) => {
                      if (!value) return;
                      setSelectedTeamId(String(value));
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        {teams.map((team) => (
                          <ListBox.Item
                            key={team._id}
                            id={team._id}
                            textValue={team.name}
                          >
                            {team.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Category</Label>

                  <Select
                    aria-label="select category"
                    value={selectedCategory}
                    onChange={(value: Key | null) => {
                      if (!value) return;
                      setSelectedCategory(String(value));
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>

                    <Select.Popover>
                      <ListBox>
                        {CATEGORY_OPTIONS.map((category) => (
                          <ListBox.Item
                            key={category}
                            id={category}
                            textValue={category}
                          >
                            {category}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              {/* Results */}
              <div className="mt-8">
                {!selectedTeamId || !selectedCategory ? (
                  <div className="rounded-lg border border-dashed py-16 text-center text-slate-500">
                    Select a team and category to view registrations.
                  </div>
                ) : genderSections.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-16 text-center text-slate-500">
                    No registrations for {selectedTeamName} under{" "}
                    {selectedCategory}.
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {genderSections.map(({ gender, ageSections }) => (
                      <div key={gender}>
                        <h2 className="text-lg font-bold">{gender}</h2>

                        <div className="mt-3 flex flex-col gap-5 pl-2">
                          {ageSections.map(
                            ({
                              ageCategory,
                              games,
                              hasIndividual,
                              hasGroup,
                            }) => (
                              <div key={ageCategory}>
                                <h3 className="text-sm font-semibold text-slate-600">
                                  {ageCategory}
                                </h3>

                                <div className="mt-2 flex flex-col gap-4">
                                  {hasIndividual && (
                                    <div>
                                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Individual
                                      </p>
                                      <IndividualGamesTable games={games} />
                                    </div>
                                  )}

                                  {hasGroup && (
                                    <div>
                                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Group
                                      </p>
                                      <GroupGamesTable games={games} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
