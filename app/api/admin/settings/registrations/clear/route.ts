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

    const [individuals, groups, employees] = await Promise.all([
      IndividualRegistration.deleteMany({}),
      GroupRegistration.deleteMany({}),
      Employee.updateMany({}, { $set: { isRegistered: false } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "All individual and group registrations cleared successfully.",
      deleted: {
        individualRegistrations: individuals.deletedCount ?? 0,
        groupRegistrations: groups.deletedCount ?? 0,
      },
      employeesReset: employees.modifiedCount ?? 0,
    });
  } catch (error) {
    console.error("CLEAR REGISTRATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear registrations.",
      },
      { status: 500 },
    );
  }
}
