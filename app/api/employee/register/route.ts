import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { z } from "zod";
import Teams from "@/models/Teams";

// const RegisterSchema = z.object({
//   employeeCode: z.string().min(1),
//   team: z.string().min(1),
//   teamId: z.string().optional(),
// });

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { employeeCode, teamId } = body;

    if (!employeeCode || !teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code and team are required.",
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

    const team = await Teams.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected team is not available.",
        },
        { status: 400 },
      );
    }

    employee.team = team.name;
    employee.teamId = team._id;
    employee.isRegistered = true;

    await employee.save();

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Employee registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete registration.",
      },
      { status: 500 },
    );
  }
}
