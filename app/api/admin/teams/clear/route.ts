import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Teams from "@/models/Teams";
import Employee from "@/models/Employee";
import GroupRegistration from "@/models/GroupRegistration";
import IndividualRegistration from "@/models/IndividualRegistration";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function POST() {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    await getCurrentAdmin();

    session.startTransaction();

    await GroupRegistration.deleteMany({}, { session });

    await IndividualRegistration.deleteMany({}, { session });

    await Employee.updateMany(
      {},
      {
        $set: {
          team: "",
          teamId: null,
          role: "Employee",
          isCaptain: false,
          isRegistered: false,
        },
      },
      { session },
    );

    await Teams.deleteMany({}, { session });

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "All teams have been cleared successfully.",
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Clear teams error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear teams.",
      },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}
