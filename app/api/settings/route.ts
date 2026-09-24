import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await connectDB();

    const settings = await Settings.findOne().lean();

    return NextResponse.json({
      success: true,
      settings: {
        programName: settings?.programName ?? "Sports Meet 2026",
        companyLogo: settings?.companyLogo ?? "",
        registrationOpen: settings?.registrationOpen ?? false,
      },
    });
  } catch (error) {
    console.error("Public settings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings.",
      },
      { status: 500 },
    );
  }
}
