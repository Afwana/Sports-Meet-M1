import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import GalleryPhoto from "@/models/GalleryPhoto";

export const runtime = "nodejs";

/**
 * Serves a gallery photo to anyone who is logged in (admin, captain or
 * employee).
 *   ?size=thumb (default) -> small grid thumbnail
 *   ?size=full            -> full-size copy
 *   &download=1           -> force a file download
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const viewer = await getViewer();

    if (!viewer) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const search = req.nextUrl.searchParams;
    const wantsFull = search.get("size") === "full";
    const download = search.get("download") === "1";

    const photo = await GalleryPhoto.findById(id).select(
      wantsFull ? "+data mimeType updatedAt" : "+thumb mimeType updatedAt",
    );

    const bytes = photo ? (wantsFull ? photo.data : photo.thumb) : null;

    if (!photo || !bytes) {
      return new NextResponse("Not found", { status: 404 });
    }

    const etag = `W/"${new Date(photo.updatedAt).getTime()}-${bytes.length}-${
      wantsFull ? "f" : "t"
    }"`;

    const headers: Record<string, string> = {
      ETag: etag,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    };

    if (req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    headers["Content-Type"] = photo.mimeType || "image/jpeg";
    headers["Content-Length"] = String(bytes.length);

    if (download) {
      headers["Content-Disposition"] =
        `attachment; filename="sports-meet-${id}.jpg"`;
    }

    return new NextResponse(new Uint8Array(bytes), { headers });
  } catch (error) {
    console.error("GALLERY IMAGE ERROR:", error);

    return new NextResponse("Failed to load image", { status: 500 });
  }
}
