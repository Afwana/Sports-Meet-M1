import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminKPICards from "@/components/admin/AdminKPICards";
import PointConfigurationTable from "@/components/admin/PointConfigurationTable";
import PublicPointsTable from "@/components/PublicPointsTable";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Games from "@/models/Games";
import GroupResult from "@/models/GroupResult";
import IndividualResult from "@/models/IndividualResult";
import MarathonResult from "@/models/MarathonResult";
import Teams from "@/models/Teams";

export default async function AdminDashboard() {
  await connectDB();

  const [
    totalEmployees,
    totalTeams,
    totalGames,
    individualGameIds,
    groupGameIds,
    marathonGameIds,
  ] = await Promise.all([
    Employee.countDocuments({}),
    Teams.countDocuments({}),
    Games.countDocuments({}),
    IndividualResult.distinct("game"),
    GroupResult.distinct("game"),
    MarathonResult.distinct("game"),
  ]);

  const resultGameIds = [
    ...new Set(
      [...individualGameIds, ...groupGameIds, ...marathonGameIds].map(String),
    ),
  ];

  const completedGames = await Games.countDocuments({
    _id: { $in: resultGameIds },
  });

  return (
    <div className="min-h-[calc(100vh-66px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-6 dark:bg-black text-black">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage Sports Meet 2026 settings and data.
          </p>
        </div>

        <AdminKPICards
          totalEmployees={totalEmployees}
          totalTeams={totalTeams}
          totalGames={totalGames}
          completedGames={completedGames}
        />

        <AdminDataManagement />
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <PointConfigurationTable />
          <PublicPointsTable />
        </div>
      </div>
    </div>
  );
}
