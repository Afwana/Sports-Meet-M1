import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Teams from "@/models/Teams";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const body = await req.json();
    const { id } = await params;

    const employeeCode =
      typeof body.employeeCode === "string"
        ? body.employeeCode.trim().toUpperCase()
        : "";

    const employeeName =
      typeof body.employeeName === "string" ? body.employeeName.trim() : "";

    const dateOfBirth = new Date(body.dateOfBirth);

    const gender =
      body.gender === "Male" || body.gender === "Female" ? body.gender : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    const teamId =
      typeof body.teamId === "string" && body.teamId.trim() !== ""
        ? body.teamId.trim()
        : null;

    // Validate employee
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

    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Date of Birth is required.",
        },
        { status: 400 },
      );
    }

    // Check duplicate employee code
    const duplicate = await Employee.findOne({
      employeeCode,
      _id: { $ne: id },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code already exists.",
        },
        { status: 400 },
      );
    }

    // Resolve team from teamId
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

    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        employeeCode,
        employeeName,
        dateOfBirth,
        gender,
        team,
        teamId,
        department,
        phoneNumber,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update employee.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const isCaptain = await Teams.exists({
      captain: id,
    });

    if (isCaptain) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete a team captain.",
        },
        { status: 400 },
      );
    }

    await Employee.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error("Delete employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete employee.",
      },
      { status: 500 },
    );
  }
}
