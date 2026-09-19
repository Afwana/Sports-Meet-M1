import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
import GroupRegistration from "@/models/GroupRegistration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function DELETE() {
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

    const [individualRegistrations, groupRegistrations, employees] =
      await Promise.all([
        IndividualRegistration.deleteMany({}),
        GroupRegistration.deleteMany({}),
        Employee.deleteMany({}),
      ]);

    return NextResponse.json({
      success: true,
      message: "All employee data cleared successfully.",
      deleted: {
        employees: employees.deletedCount ?? 0,
        individualRegistrations: individualRegistrations.deletedCount ?? 0,
        groupRegistrations: groupRegistrations.deletedCount ?? 0,
      },
    });
  } catch (error) {
    console.error("CLEAR EMPLOYEE DATA ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear employee data.",
      },
      { status: 500 },
    );
  }
}
