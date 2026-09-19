export interface Team {
  _id: string;
  name: string;
  color: string;
  logo: string;
  captain: {
    _id: string;
    employeeCode: string;
    employeeName: string;
  } | null;

  isActive: boolean;
}
