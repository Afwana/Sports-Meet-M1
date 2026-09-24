import IndividualGames from "@/components/IndividualGames";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { Card, Input, Label } from "@heroui/react";

export default async function GamesPage() {
  const employee = await getCurrentEmployee();

  return (
    <div className="flex flex-col gap-3 min-h-[calc(100vh-66px)] w-full bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 font-sans dark:bg-black p-3">
      <Card className="min-h-[calc(100vh-90px)] p-5">
        <Card.Header>
          <Card.Title className="text-lg md:text-2xl font-bold mt-3">
            Individual Games
          </Card.Title>
          <Card.Description className="text-xs md:text-sm mt-1">
            Choose your games to participate!
          </Card.Description>

          <div className="flex flex-col md:flex-row items-center gap-2.5 mt-6">
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="code" className="text-xs">
                Employee Code
              </Label>
              <Input
                id="code"
                type="text"
                value={employee.employeeCode}
                readOnly
                className="h-10 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="name" className="text-xs">
                Employee Name
              </Label>
              <Input
                id="name"
                type="text"
                value={employee.employeeName}
                readOnly
                className="h-10 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="team" className="text-xs">
                Team
              </Label>
              <Input
                id="team"
                type="text"
                value={employee.team}
                readOnly
                className="h-10 font-medium"
              />
            </div>
          </div>
        </Card.Header>

        <Card.Content>
          <IndividualGames
            employeeGender={employee.gender}
            employeeAge={employee.dateOfBirth}
          />
        </Card.Content>
      </Card>
    </div>
  );
}
