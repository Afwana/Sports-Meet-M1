import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
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

    const result = await GroupRegistration.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All group registrations cleared successfully.",
      deletedCount: result.deletedCount ?? 0,
    });
  } catch (error) {
    console.error("CLEAR GROUP REGISTRATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear group registrations.",
      },
      { status: 500 },
    );
  }
}
