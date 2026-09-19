export interface Game {
  _id: string;
  name: string;
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Individual" | "Group";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
  icon: string;
  minParticipants: number;
  maxParticipants: number;
  maxParticipantsPerTeam: number;
  maxTeamsPerCompetitionTeam: number;
  isActive: boolean;
}
