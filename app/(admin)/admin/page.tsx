import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminKPICards from "@/components/admin/AdminKPICards";
import PointConfigurationTable from "@/components/admin/PointConfigurationTable";
import PointsTable from "@/components/PointsTable";
import PublicPointsTable from "@/components/PublicPointsTable";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Games from "@/models/Games";
import Teams from "@/models/Teams";

export default async function AdminDashboard() {
  await connectDB();

  const [totalEmployees, totalTeams, totalGames] = await Promise.all([
    Employee.countDocuments({}),
    Teams.countDocuments({}),
    Games.countDocuments({}),
  ]);

  const resultPositions = 0;

  return (
    <div className="min-h-[calc(100vh-66px)] bg-blue-50 p-6 dark:bg-black">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <p className="mt-1 text-sm text-default-500">
            Manage Sports Meet 2026 settings and data.
          </p>
        </div>

        <AdminKPICards
          totalEmployees={totalEmployees}
          totalTeams={totalTeams}
          totalGames={totalGames}
          resultPositions={resultPositions}
        />

        <AdminDataManagement />
        <div className="flex justify-between gap-5">
          <PointConfigurationTable />
          <PublicPointsTable />
        </div>
      </div>
    </div>
  );
}
