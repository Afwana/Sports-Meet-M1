"use client";

import { Card } from "@heroui/react";
import { BsMicrosoftTeams } from "react-icons/bs";
import { FaMedal, FaUsers } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";

interface AdminKPICardsProps {
  totalEmployees: number;
  totalTeams: number;
  totalGames: number;
  resultPositions: number;
}

export default function AdminKPICards({
  totalEmployees,
  totalTeams,
  totalGames,
  resultPositions,
}: AdminKPICardsProps) {
  const cards = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: <FaUsers size={24} />,
    },
    {
      label: "Total Teams",
      value: totalTeams,
      icon: <BsMicrosoftTeams size={26} />,
    },
    {
      label: "Total Games",
      value: totalGames,
      icon: <IoGameController size={26} />,
    },
    {
      label: "Result Positions",
      value: resultPositions,
      icon: <FaMedal size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="w-full">
          <Card.Header>
            <Card.Title className="flex items-center gap-3">
              <span className="text-blue-600">{card.icon}</span>

              <span className="text-xl font-bold text-black">{card.value}</span>
            </Card.Title>

            <Card.Description>{card.label}</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </div>
  );
}
