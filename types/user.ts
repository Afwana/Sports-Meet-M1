export type HeaderUser =
  | {
      role: "admin";
      name: string;
      email: string;
    }
  | {
      role: "employee" | "captain";
      employeeName: string;
      employeeCode: string;
      team: string;
      isCaptain: boolean;
    };
