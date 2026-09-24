// types/registration.ts
export interface RegistrationParticipant {
  _id: string;
  employeeName: string;
  employeeCode: string;
}

export interface IndividualRegistration {
  _id: string;
  employee: {
    _id: string;
    employeeCode: string;
    employeeName: string;
  };
  employeeCode: string;
  employeeName: string;
  games: {
    gameId: string;
    gameName: string;
  }[];
  teamId: string;
}

export interface GroupRegistration {
  _id: string;
  game: {
    _id: string;
    name: string;
    maxParticipants: number;
  };
  team: string;
  groupName: string;
  participants: RegistrationParticipant[];
}
