import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export async function GET() {
  try {
    await connectDB();

    const employee = await getCurrentEmployee();

    const registrations = await IndividualRegistration.find({
      employeeCode: employee.employeeCode,
    })
      .select("_id games")
      .lean();

    const games = registrations.flatMap(
      (registration) => registration.games ?? [],
    );

    return NextResponse.json({
      success: true,
      registered: registrations.length > 0,
      registration:
        registrations.length > 0
          ? {
              _id: registrations[0]._id,
              games,
            }
          : null,
    });
  } catch (error) {
    console.error("Individual registration status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check registration status.",
      },
      { status: 500 },
    );
  }
}
