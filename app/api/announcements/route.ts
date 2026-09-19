import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export async function GET() {
  try {
    await connectDB();

    const announcements = await Announcement.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("title message link createdAt")
      .lean();

    const serializedAnnouncements = announcements.map((announcement) => ({
      _id: announcement._id.toString(),
      title: announcement.title,
      message: announcement.message,
      link: announcement.link,
      createdAt: announcement.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      announcements: serializedAnnouncements,
    });
  } catch (error) {
    console.error("Public announcements GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements.",
      },
      { status: 500 },
    );
  }
}
