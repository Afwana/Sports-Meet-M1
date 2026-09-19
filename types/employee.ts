export interface Employee {
  _id: string;
  employeeCode: string;
  employeeName: string;
  dateOfBirth: Date;
  gender: "Male" | "Female";
  role: "Employee" | "Captain";
  team: string;
  teamId: string | null;
  department: string;
  phoneNumber: string;
  isCaptain: boolean;
  isRegistered: boolean;
}
