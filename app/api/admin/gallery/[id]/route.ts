import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import GalleryPhoto from "@/models/GalleryPhoto";

export const runtime = "nodejs";

// Admin: delete a program photo.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminApi();

    if (!admin) {
      return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Photo not found." },
        { status: 404 },
      );
    }

    await connectDB();

    const deleted = await GalleryPhoto.findByIdAndDelete(id).select("_id");

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Photo not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GALLERY DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete photo." },
      { status: 500 },
    );
  }
}
