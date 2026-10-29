import PhotoUploader from "@/components/PhotoUploader";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { Card } from "@heroui/react";

export default async function PhotosPage() {
  const employee = await getCurrentEmployee();

  return (
    <div className="min-h-[calc(100vh-66px)] w-full bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 text-black dark:bg-black">
      <Card className="min-h-[calc(100vh-90px)] p-5">
        <Card.Header>
          <Card.Title className="mt-3 text-lg font-bold text-black md:text-2xl">
            Mobile Photography Upload
          </Card.Title>
          <Card.Description className="mt-1 text-xs text-slate-500 md:text-sm">
            {employee.employeeName} ({employee.employeeCode}) · {employee.team}
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <PhotoUploader />
        </Card.Content>
      </Card>
    </div>
  );
}
