export interface Game {
  _id: string;
  name: string;
  category: "Sports" | "Off Stage" | "Stage" | "Games";
  type: "Individual" | "Group";
  gender: "Male" | "Female" | "Both";
  ageCategory: "Open" | "Junior" | "Senior";
  icon: string;
  minParticipants: number;
  maxParticipants?: number | null;
  maxParticipantsPerTeam?: number | null;
  maxTeamsPerCompetitionTeam: number;
  isActive: boolean;
}
