import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import { serializePhoto } from "@/lib/photoRules";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

// Admin: every uploaded photo.
export async function GET() {
  try {
    const admin = await requireAdminApi();

    if (!admin) {
      return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
    }

    await connectDB();

    const photos = await PhotoSubmission.find()
      .sort({ teamName: 1, employeeName: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      photos: photos.map(serializePhoto),
    });
  } catch (error) {
    console.error("ADMIN PHOTOS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load photos." },
      { status: 500 },
    );
  }
}
