import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    await connectDB();

    await getCurrentAdmin();

    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = await Settings.create({
        programName: "Sports Meet 2026",
        companyLogo: "",
        registrationOpen: false,
      });

      settings = settings.toObject();
    }

    return NextResponse.json({
      success: true,
      settings: {
        _id: settings._id.toString(),
        programName: settings.programName ?? "Sports Meet 2026",
        companyLogo: settings.companyLogo ?? "",
        registrationOpen: settings.registrationOpen ?? false,
      },
    });
  } catch (error) {
    console.error("Settings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin();

    const body = await req.json();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        programName: "Sports Meet 2026",
        companyLogo: "",
        registrationOpen: false,
      });
    }

    // Update only the fields that were provided.
    if (typeof body.programName === "string") {
      const programName = body.programName.trim();

      if (!programName) {
        return NextResponse.json(
          {
            success: false,
            message: "Program name is required.",
          },
          { status: 400 },
        );
      }

      settings.programName = programName;
    }

    if (typeof body.companyLogo === "string") {
      settings.companyLogo = body.companyLogo.trim();
    }

    if (typeof body.registrationOpen === "boolean") {
      settings.registrationOpen = body.registrationOpen;
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      settings: {
        _id: settings._id.toString(),
        programName: settings.programName,
        companyLogo: settings.companyLogo ?? "",
        registrationOpen: settings.registrationOpen ?? false,
      },
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings.",
      },
      { status: 500 },
    );
  }
}
