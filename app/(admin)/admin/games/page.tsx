import GameTable from "@/components/admin/GameTable";
import { connectDB } from "@/lib/mongodb";
import Games from "@/models/Games";
import { Game as GameType } from "@/types/game";

export default async function AdminGamesPage() {
  await connectDB();

  const games = (await Games.find()
    .sort({
      category: 1,
      type: 1,
      name: 1,
    })
    .lean()) as unknown as GameType[];

  return (
    <div className="min-h-[calc(100vh-110px)] bg-blue-50 p-6 dark:bg-black">
      <GameTable games={JSON.parse(JSON.stringify(games))} />
    </div>
  );
}
