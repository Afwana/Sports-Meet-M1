import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await connectDB();

  const { employeeCode } = await req.json();

  const employee = await Employee.findOne({
    employeeCode: employeeCode.trim().toUpperCase(),
  });

  if (!employee) {
    return NextResponse.json(
      { success: false, message: "Employee not found." },
      { status: 404 },
    );
  }

  if (!employee.isRegistered && !employee.isCaptain) {
    return NextResponse.json(
      { success: false, message: "Please complete registration first." },
      { status: 400 },
    );
  }

  const token = createToken({
    id: employee._id.toString(),
    employeeCode: employee.employeeCode,
    role: employee.role,
  });

  const response = NextResponse.json({
    success: true,
    role: employee.role,
    employee: {
      employeeName: employee.employeeName,
      role: employee.role,
    },
  });

  response.cookies.set("sportsmeet_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
