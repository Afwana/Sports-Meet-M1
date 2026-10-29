import { cookies } from "next/headers";

import Employee from "@/models/Employee";
import { verifyToken } from "./auth";
import { connectDB } from "./mongodb";
import { requireAdminApi } from "./requireAdminApi";

export type Viewer =
  | { kind: "admin" }
  | {
      kind: "employee";
      id: string;
      employeeCode: string;
      employeeName: string;
      department: string;
      phoneNumber: string;
      team: string;
      teamId: string | null;
      isCaptain: boolean;
    };

/**
 * Identifies who is calling an API route (admin or logged-in employee/captain).
 * Never redirects - returns null so the route can answer with a 401.
 */
export async function getViewer(): Promise<Viewer | null> {
  const admin = await requireAdminApi();

  if (admin) return { kind: "admin" };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sportsmeet_token")?.value;

    if (!token) return null;

    const payload = verifyToken(token);

    await connectDB();

    const employee = await Employee.findById(payload.id)
      .select(
        "employeeCode employeeName department phoneNumber team teamId role isCaptain",
      )
      .lean();

    if (!employee) return null;

    return {
      kind: "employee",
      id: String(employee._id),
      employeeCode: employee.employeeCode,
      employeeName: employee.employeeName,
      department: employee.department ?? "",
      phoneNumber: employee.phoneNumber ?? "",
      team: employee.team ?? "",
      teamId: employee.teamId ? String(employee.teamId) : null,
      isCaptain: employee.role === "Captain" || employee.isCaptain === true,
    };
  } catch {
    return null;
  }
}
