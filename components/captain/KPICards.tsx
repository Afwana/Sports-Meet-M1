import { Card } from "@heroui/react";
import { FaMedal, FaUsers } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";
import { MdGames } from "react-icons/md";

interface KPICardsProps {
  members: number;
  individualRegistrations: number;
  groupRegistrations: number;
  teamPosition: number | null;
}

export default function KPICards({
  members,
  individualRegistrations,
  groupRegistrations,
  teamPosition,
}: KPICardsProps) {
  const getOrdinalSuffix = (position: number) => {
    if (position % 100 >= 11 && position % 100 <= 13) {
      return "th";
    }

    switch (position % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 max-w-full gap-5 mt-5">
      <Card className="w-full" variant="secondary">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <FaUsers size={24} color="#155DFC" />
            <p className="text-base font-semibold">{members}</p>
          </Card.Title>
          <Card.Description>Team Members</Card.Description>
        </Card.Header>
      </Card>

      <Card className="w-full" variant="secondary">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <IoGameController size={24} color="#155DFC" />
            <p className="text-base font-semibold">{individualRegistrations}</p>
          </Card.Title>
          <Card.Description>Individual Registrations</Card.Description>
        </Card.Header>
      </Card>

      <Card className="w-full" variant="secondary">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <MdGames size={24} color="#155DFC" />
            <p className="text-base font-semibold">{groupRegistrations}</p>
          </Card.Title>
          <Card.Description>Group Registrations</Card.Description>
        </Card.Header>
      </Card>

      <Card className="w-full" variant="secondary">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <FaMedal size={24} color="#155DFC" />
            <p className="text-base font-semibold">
              {teamPosition
                ? `${teamPosition}${getOrdinalSuffix(teamPosition)}`
                : "—"}
            </p>
          </Card.Title>
          <Card.Description>Team Position</Card.Description>
        </Card.Header>
      </Card>
    </div>
  );
}
