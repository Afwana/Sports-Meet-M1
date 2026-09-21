import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Teams from "@/models/Teams";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload an Excel file.",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        {
          success: false,
          message: "The Excel file does not contain a worksheet.",
        },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The Excel file is empty.",
        },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    const errors: string[] = [];

    const getValue = (row: Record<string, unknown>, names: string[]) => {
      for (const name of names) {
        const value = row[name];

        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          return String(value).trim();
        }
      }

      return "";
    };

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      const employeeCode = getValue(row, [
        "Employee Code",
        "employeeCode",
        "EmployeeCode",
      ]).toUpperCase();

      const employeeName = getValue(row, [
        "Employee Name",
        "employeeName",
        "EmployeeName",
      ]);

      const genderValue = getValue(row, ["Gender", "gender"]);

      const gender =
        genderValue.toLowerCase() === "male"
          ? "Male"
          : genderValue.toLowerCase() === "female"
            ? "Female"
            : "";

      const teamName = getValue(row, ["Team Name", "teamName", "Team"]);

      const department = getValue(row, ["Department", "department"]);

      const phoneNumber = getValue(row, [
        "Phone Number",
        "phoneNumber",
        "Phone",
        "Mobile",
        "Mobile Number",
      ]);

      const dateOfBirth = getValue(row, [
        "Date of Birth",
        "DOB",
        "dateOfBirth",
      ]);

      if (!employeeCode || !employeeName || !gender || !dateOfBirth) {
        skipped++;

        errors.push(
          `Row ${index + 2}: Employee Code and Employee Name, Gender and Date of Birth are required.`,
        );

        continue;
      }

      let DOB: Date;

      const excelDate = Number(dateOfBirth);

      if (!Number.isNaN(excelDate) && excelDate > 1000) {
        const parsed = XLSX.SSF.parse_date_code(excelDate);

        DOB = new Date(parsed.y, parsed.m - 1, parsed.d);
      } else {
        DOB = new Date(dateOfBirth);
      }

      if (Number.isNaN(DOB.getTime())) {
        skipped++;

        errors.push(`Row ${index + 2}: Invalid Date of Birth.`);

        continue;
      }

      let teamId = null;

      if (teamName) {
        const team = await Teams.findOne({
          name: teamName,
        })
          .select("_id name")
          .lean();

        if (!team) {
          skipped++;

          errors.push(
            `Row ${index + 2}: Team "${teamName}" was not found in Competition Teams.`,
          );

          continue;
        }

        teamId = team._id;
      }

      const existing = await Employee.findOne({
        employeeCode,
      });

      if (existing) {
        existing.employeeName = employeeName;
        existing.dateOfBirth = DOB;
        existing.gender = gender;
        existing.department = department;
        existing.phoneNumber = phoneNumber;

        if (teamName) {
          existing.team = teamName;
          existing.teamId = teamId;
        }

        await existing.save();

        updated++;
      } else {
        await Employee.create({
          employeeCode,
          employeeName,
          dateOfBirth: DOB,
          gender,
          department,
          phoneNumber,
          team: teamName,
          teamId,
          role: "Employee",
          isCaptain: false,
          isRegistered: false,
        });

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Employee data imported successfully.",
      summary: {
        total: rows.length,
        created,
        updated,
        skipped,
      },
      errors,
    });
  } catch (error) {
    console.error("EMPLOYEE IMPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to import employee data.",
      },
      { status: 500 },
    );
  }
}
