"use client";

import IndividualResults from "@/components/IndividualResults";
import { Button, Card } from "@heroui/react";
import GroupResults from "@/components/GroupResults";
import PublicPointsTable from "@/components/PublicPointsTable";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-black p-5">
      <Card className="w-full p-5">
        <Card.Header>
          <div className="mb-3 flex justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">Results</h1>

              <p className="text-sm text-slate-300">
                View results and current team standings.
              </p>
            </div>
            <Button
              isIconOnly
              aria-label="Back"
              variant="secondary"
              onPress={() => router.back()}
            >
              <ChevronLeft />
            </Button>
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
