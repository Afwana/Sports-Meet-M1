export interface FixtureEntry {
  _id?: string;
  entryType: "Employee" | "Group";
  employee?: {
    _id: string;
    employeeName: string;
    employeeCode: string;
  };
  group?: {
    _id: string;
    groupName: string;
    participantCount: number;
  };
  team: {
    _id: string;
    name: string;
  };
  lane?: number | null;
  seed?: number | null;
}

export interface Fixture {
  _id: string;
  game: {
    _id: string;
    name: string;
    category: "Sports" | "Arts";
    type: "Individual" | "Group";
  };
  fixtureName: string;
  round: string;
  fixtureNumber: number;
  venue: string;
  scheduledAt: string | null;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  entries: FixtureEntry[];
}
