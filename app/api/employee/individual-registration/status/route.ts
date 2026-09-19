import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export async function GET() {
  try {
    await connectDB();

    const employee = await getCurrentEmployee();

    const registration = await IndividualRegistration.findOne({
      employeeCode: employee.employeeCode,
    })
      .select("_id games")
      .lean();

    return NextResponse.json({
      success: true,
      registered: !!registration,
      registration: registration
        ? {
            _id: registration._id,
            games: registration.games,
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
