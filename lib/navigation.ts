import { BsMicrosoftTeams } from "react-icons/bs";
import { FaBell, FaMedal, FaUsers } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { IoGameController } from "react-icons/io5";
import { MdDashboard, MdGames } from "react-icons/md";

export const navigation = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: MdDashboard },
    { label: "Employees", href: "/admin/employees", icon: FaUsers },
    { label: "Teams", href: "/admin/teams", icon: BsMicrosoftTeams },
    { label: "Games", href: "/admin/games", icon: IoGameController },
    { label: "Announcements", href: "/admin/announcements", icon: FaBell },
    { label: "Registrations", href: "/admin/registrations", icon: FaListCheck },
    { label: "Results", href: "/admin/results", icon: FaMedal },
  ],

  captain: [
    { label: "Dashboard", href: "/captain", icon: MdDashboard },
    { label: "Members", href: "/captain/members", icon: FaUsers },
    { label: "Registration", href: "/captain/registration", icon: FaListCheck },
    {
      label: "Individual Registrations",
      href: "/captain/individuals",
      icon: IoGameController,
    },
    { label: "Group Registrations", href: "/captain/groups", icon: MdGames },
    { label: "Results", href: "/captain/results", icon: FaMedal },
  ],
};
