import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin();

    const { id } = await params;

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const link = typeof body.link === "string" ? body.link.trim() : "";
    const isActive = body.isActive;

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

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        message,
        link,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!announcement) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error("Announcement PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update announcement.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await connectDB();

    await getCurrentAdmin();

    const { id } = await params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return NextResponse.json(
        {
          success: false,
          message: "Announcement not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("Announcement DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete announcement.",
      },
      { status: 500 },
    );
  }
}
