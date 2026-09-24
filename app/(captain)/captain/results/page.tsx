import { redirect } from "next/navigation";

import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import IndividualResults from "@/components/IndividualResults";
import PointsTable from "@/components/PointsTable";
import { Card } from "@heroui/react";
import GroupResults from "@/components/GroupResults";

export default async function CaptainResultsPage() {
  const employee = await getCurrentEmployee();

  if (!employee) {
    redirect("/register");
  }

  return (
    <div className="min-h-[calc(100vh-104px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 dark:bg-black p-5">
      <Card className="w-full p-5 min-h-[calc(100vh-105px)]">
        <Card.Header>
          <div className="mb-3">
            <h1 className="text-2xl font-bold">Results</h1>

            <p className="text-sm text-default-500">
              View results and current team standings.
            </p>
          </div>
        </Card.Header>
        <Card.Content>
          <PointsTable />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <IndividualResults />
            <GroupResults />
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
