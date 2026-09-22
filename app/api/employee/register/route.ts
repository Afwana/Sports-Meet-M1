import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { employeeCode } = await req.json();

    if (!employeeCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code is required.",
        },
        { status: 400 },
      );
    }

    const employee = await Employee.findOne({
      employeeCode: employeeCode.trim().toUpperCase(),
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found.",
        },
        { status: 404 },
      );
    }

    if (employee.isRegistered) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee is already registered.",
        },
        { status: 400 },
      );
    }

    employee.isRegistered = true;
    await employee.save();

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete registration.",
      },
      { status: 500 },
    );
  }
}
