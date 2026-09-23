import GamesRegister from "@/components/captain/GamesRegister";
import KPICards from "@/components/captain/KPICards";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";
import { getTeamRank } from "@/lib/getTeamRank";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import IndividualRegistration from "@/models/IndividualRegistration";
import { Badge, Card } from "@heroui/react";
import { FaCrown } from "react-icons/fa";

export default async function CaptainPage() {
  await connectDB();

  const captain = await getCurrentEmployee();

  if (!captain.teamId) {
    return (
      <div className="min-h-[calc(100vh-110px)] bg-blue-50 p-6 dark:bg-black">
        <Card className="w-full p-5">
          <Card.Content>
            <p className="text-danger">Your team is not assigned.</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const [members, individualRegistrations, groupRegistrations, teamPosition] =
    await Promise.all([
      Employee.countDocuments({ teamId: captain.teamId }),
      IndividualRegistration.countDocuments({ teamId: captain.teamId }),
      GroupRegistration.countDocuments({ team: captain.teamId }),
      getTeamRank(captain.teamId),
    ]);

  return (
    <div className="min-h-[calc(100vh-110px)] bg-blue-50 dark:bg-black p-6">
      <Card className="w-full p-5 min-h-[calc(100vh-115px)]">
        <Card.Header>
          <Card.Title>
            <Badge.Anchor>
              <p className="text-2xl font-bold">{captain.team}</p>
              <Badge
                className="min-w-7 translate-x-5 font-semibold tabular-nums"
                color="accent"
                size="md"
                variant="soft"
              >
                <FaCrown size={14} color="#155DFC" />
              </Badge>
            </Badge.Anchor>
          </Card.Title>
          <Card.Description className="text-default-500 mt-1">
            Welcome back, {captain.employeeName}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <KPICards
            members={members}
            individualRegistrations={individualRegistrations}
            groupRegistrations={groupRegistrations}
            teamPosition={teamPosition}
          />
          <hr className="my-5" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Games</h2>
            <p className="text-sm">Choose items for register</p>
          </div>
          <GamesRegister />
        </Card.Content>
      </Card>
    </div>
  );
}
