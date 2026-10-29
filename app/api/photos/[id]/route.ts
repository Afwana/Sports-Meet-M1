import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

// Owner or admin can delete a photo.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const viewer = await getViewer();

    if (!viewer) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const photo = await PhotoSubmission.findById(id);

    if (!photo) {
      return NextResponse.json(
        { success: false, message: "Photo not found." },
        { status: 404 },
      );
    }

    const isOwner =
      viewer.kind === "employee" && String(photo.employee) === viewer.id;

    if (viewer.kind !== "admin" && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Not allowed." },
        { status: 403 },
      );
    }

    const urls = [photo.blobUrl, photo.thumbUrl].filter(Boolean) as string[];

    if (urls.length > 0) {
      await del(urls);
    }

    await photo.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PHOTO DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete photo." },
      { status: 500 },
    );
  }
}
