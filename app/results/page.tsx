import IndividualResults from "@/components/IndividualResults";
import { Card } from "@heroui/react";
import GroupResults from "@/components/GroupResults";
import PublicPointsTable from "@/components/PublicPointsTable";

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-black p-5">
      <Card className="w-full p-5">
        <Card.Header>
          <div className="mb-3">
            <h1 className="text-2xl font-bold">Results</h1>

            <p className="text-sm text-slate-300">
              View results and current team standings.
            </p>
          </div>
        </Card.Header>
        <Card.Content>
          <PublicPointsTable showMedalColumns />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <IndividualResults />
            <GroupResults />
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
