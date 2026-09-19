import EmployeesTable from "@/components/admin/EmployeesTable";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { Employee as EmployeeType } from "@/types/employee";

export default async function EmployeesPage() {
  await connectDB();

  const employees = (await Employee.find()
    .sort({
      employeeName: 1,
    })
    .lean()) as unknown as EmployeeType[];

  return (
    <div className="min-h-[calc(100vh-110px)] bg-blue-50 p-6 dark:bg-black">
      <EmployeesTable employees={JSON.parse(JSON.stringify(employees))} />
    </div>
  );
}
