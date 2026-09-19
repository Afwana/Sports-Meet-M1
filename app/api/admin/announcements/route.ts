import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function GET() {
  try {
    await connectDB();

    await getCurrentAdmin();

    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Announcements GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    await getCurrentAdmin();

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const link = typeof body.link === "string" ? body.link.trim() : "";
    const isActive = body.isActive ?? true;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 },
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid active status.",
        },
        { status: 400 },
      );
    }

    const announcement = await Announcement.create({
      title,
      message,
      link,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        announcement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Announcement POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create announcement.",
      },
      { status: 500 },
    );
  }
}
