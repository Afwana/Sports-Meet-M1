import AppHeader from "@/components/layout/AppHeader";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const employee = await getCurrentEmployee();
  return (
    <>
      <AppHeader
        role="employee"
        user={{
          role: "employee",
          employeeName: employee.employeeName,
          employeeCode: employee.employeeCode,
          team: employee.team,
          isCaptain: employee.isCaptain,
        }}
      />

      <main>{children}</main>
    </>
  );
}
