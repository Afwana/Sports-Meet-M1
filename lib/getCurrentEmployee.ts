import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "./auth";
import { connectDB } from "./mongodb";
import Employee from "@/models/Employee";

export async function getCurrentEmployee() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sportsmeet_token")?.value;

  if (!token) {
    redirect("/register");
  }

  try {
    const payload = verifyToken(token);

    await connectDB();

    const employee = await Employee.findById(payload.id)
      .select(
        "employeeCode employeeName dateOfBirth gender team role isCaptain isRegistered teamId",
      )
      .lean();

    if (!employee) {
      redirect("/register");
    }

    return {
      _id: String(employee._id),
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      team: employee.team,
      role: employee.role,
      isCaptain: employee.isCaptain,
      isRegistered: employee.isRegistered,
      teamId: employee.teamId ? String(employee.teamId) : null,
    };
  } catch {
    redirect("/register");
  }
}
