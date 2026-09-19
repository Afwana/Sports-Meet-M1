import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const employees = await Employee.find()
      .sort({
        employeeName: 1,
      })
      .lean();

    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employees.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const employeeCode =
      typeof body.employeeCode === "string"
        ? body.employeeCode.trim().toUpperCase()
        : "";

    const employeeName =
      typeof body.employeeName === "string" ? body.employeeName.trim() : "";

    const dateOfBirth = new Date(body.dateOfBirth);

    const gender =
      body.gender === "Male" || body.gender === "Female" ? body.gender : "";

    const teamId =
      typeof body.teamId === "string" && body.teamId.trim() !== ""
        ? body.teamId.trim()
        : null;

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    if (!employeeCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code is required.",
        },
        { status: 400 },
      );
    }

    if (!employeeName) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee name is required.",
        },
        { status: 400 },
      );
    }

    if (!gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender is required.",
        },
        { status: 400 },
      );
    }

    const exists = await Employee.findOne({
      employeeCode,
    });

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code already exists.",
        },
        { status: 400 },
      );
    }

    let team = "";

    if (teamId) {
      const selectedTeam = await Teams.findById(teamId)
        .select("_id name")
        .lean();

      if (!selectedTeam) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected team not found.",
          },
          { status: 400 },
        );
      }

      team = selectedTeam.name;
    }

    const employee = await Employee.create({
      employeeCode,
      employeeName,
      dateOfBirth,
      gender,

      team,
      teamId,

      department,
      phoneNumber,

      role: "Employee",
      isCaptain: false,
      isRegistered: false,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create employee.",
      },
      { status: 500 },
    );
  }
}
