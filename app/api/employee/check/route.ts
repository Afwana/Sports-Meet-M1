import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const code = req.nextUrl.searchParams
      .get("employeeCode")
      ?.trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee code is required.",
        },
        { status: 400 },
      );
    }

    const employee = await Employee.findOne({
      $or: [
        { employeeCode: code }, // MB/TC/1378
        { employeeCode: { $regex: `/${code}$`, $options: "i" } }, // 1378
      ],
    })
      .select(
        "_id employeeCode employeeName team teamId role isCaptain isRegistered department phoneNumber",
      )
      .lean();

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          message: "Employee not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      found: true,
      employee: {
        _id: String(employee._id),
        employeeCode: employee.employeeCode,
        employeeName: employee.employeeName,
        team: employee.team ?? "",
        teamId: employee.teamId ? String(employee.teamId) : null,
        department: employee.department ?? "",
        phoneNumber: employee.phoneNumber ?? "",
        role: employee.role,
        isCaptain: employee.isCaptain,
        isRegistered: employee.isRegistered,
      },
    });
  } catch (error) {
    console.error("EMPLOYEE CHECK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check employee code.",
      },
      { status: 500 },
    );
  }
}
