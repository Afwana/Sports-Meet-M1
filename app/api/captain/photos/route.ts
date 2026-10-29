import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import { serializePhoto } from "@/lib/photoRules";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

// Captain: all photos uploaded by their own team.
export async function GET() {
  try {
    await connectDB();

    const viewer = await getViewer();

    if (!viewer || viewer.kind !== "employee" || !viewer.isCaptain) {
      return NextResponse.json(
        { success: false, message: "Captain access required." },
        { status: 403 },
      );
    }

    if (!viewer.teamId) {
      return NextResponse.json({ success: true, photos: [] });
    }

    const photos = await PhotoSubmission.find({ teamId: viewer.teamId })
      .sort({ employeeName: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      photos: photos.map(serializePhoto),
    });
  } catch (error) {
    console.error("CAPTAIN PHOTOS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load photos." },
      { status: 500 },
    );
  }
}
