import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

/**
 * Streams a photo from the private Blob store after checking who is asking:
 *  - admin     -> any photo
 *  - captain   -> photos from their own team
 *  - employee  -> their own photos
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
    const photo = await PhotoSubmission.findById(id).lean();

    if (!photo) {
      return new NextResponse("Not found", { status: 404 });
    }

    const allowed =
      viewer.kind === "admin" ||
      String(photo.employee) === viewer.id ||
      (viewer.isCaptain &&
        viewer.teamId !== null &&
        viewer.teamId === String(photo.teamId));

    if (!allowed) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const search = req.nextUrl.searchParams;
    const wantsThumb = search.get("size") !== "full";
    const download = search.get("download") === "1";

    const pathname =
      wantsThumb && photo.thumbPathname
        ? photo.thumbPathname
        : photo.blobPathname;

    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: req.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return new NextResponse("Image unavailable", { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    };

    if (download) {
      const safeCode = String(photo.employeeCode).replace(
        /[^A-Za-z0-9_-]/g,
        "-",
      );
      const ext =
        photo.blobPathname
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg";

      headers["Content-Disposition"] =
        `attachment; filename="${safeCode}-${String(photo._id)}.${ext}"`;
    }

    return new NextResponse(result.stream, { headers });
  } catch (error) {
    console.error("PHOTO IMAGE ERROR:", error);

    return new NextResponse("Failed to load image", { status: 500 });
  }
}
