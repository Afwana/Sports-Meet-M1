import TeamsTable from "@/components/admin/TeamsTable";
import { connectDB } from "@/lib/mongodb";
import Teams from "@/models/Teams";
import { Team } from "@/types/team";

export default async function AdminGamesPage() {
  await connectDB();

  const teams = (await Teams.find()
    .populate("captain", "employeeCode employeeName")
    .sort({ name: 1 })
    .lean()) as unknown as Team[];

  return (
    <div className="min-h-[calc(100vh-110px)] bg-blue-50 p-6 dark:bg-black">
      <TeamsTable teams={JSON.parse(JSON.stringify(teams))} />
    </div>
  );
}
