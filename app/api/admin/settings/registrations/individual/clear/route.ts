import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import IndividualRegistration from "@/models/IndividualRegistration";
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

    const registrations = await IndividualRegistration.deleteMany({});

    /*
     * Employees remain.
     * Team/captain data remains.
     * Only their individual registration
     * status is reset.
     */
    const employees = await Employee.updateMany(
      {},
      {
        $set: {
          isRegistered: false,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "All individual registrations cleared successfully.",
      deletedCount: registrations.deletedCount ?? 0,
      employeesReset: employees.modifiedCount ?? 0,
    });
  } catch (error) {
    console.error("CLEAR INDIVIDUAL REGISTRATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear individual registrations.",
      },
      { status: 500 },
    );
  }
}
