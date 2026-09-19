import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function GET() {
  try {
    await connectDB();

    await getCurrentAdmin();

    const employees = await Employee.find({})
      .select("employeeCode employeeName gender team department phoneNumber")
      .sort({
        employeeCode: 1,
      })
      .lean();

    const rows = employees.map((employee) => ({
      "Employee Code": employee.employeeCode,
      "Employee Name": employee.employeeName,
      Gender: employee.gender,
      "Team Name": employee.team,
      Department: employee.department,
      "Phone Number": employee.phoneNumber,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="sports-meet-employees.xlsx"',
      },
    });
  } catch (error) {
    console.error("Employee export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export employees.",
      },
      { status: 500 },
    );
  }
}
