import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi, UNAUTHORIZED_BODY } from "@/lib/requireAdminApi";
import {
  isJpeg,
  MAX_GALLERY_CAPTION_LENGTH,
  MAX_GALLERY_FULL_BYTES,
  MAX_GALLERY_THUMB_BYTES,
  serializeGalleryPhoto,
} from "@/lib/galleryRules";
import GalleryPhoto from "@/models/GalleryPhoto";

export const runtime = "nodejs";

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// Admin: upload one program photo (full-size copy + thumbnail, both JPEG).
// The browser sends photos one request at a time.
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();

    if (!admin) {
      return NextResponse.json(UNAUTHORIZED_BODY, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const thumb = form.get("thumb");

    if (!(file instanceof File) || !(thumb instanceof File)) {
      return fail("Photo file is missing.");
    }

    const fileBytes = Buffer.from(await file.arrayBuffer());
    const thumbBytes = Buffer.from(await thumb.arrayBuffer());

    if (!isJpeg(fileBytes) || !isJpeg(thumbBytes)) {
      return fail("Invalid image data.");
    }

    if (fileBytes.length > MAX_GALLERY_FULL_BYTES) {
      return fail("Photo is too large.", 413);
    }

    if (thumbBytes.length > MAX_GALLERY_THUMB_BYTES) {
      return fail("Thumbnail is too large.", 413);
    }

    const caption = String(form.get("caption") ?? "")
      .trim()
      .slice(0, MAX_GALLERY_CAPTION_LENGTH);

    await connectDB();

    const photo = await GalleryPhoto.create({
      caption,
      data: fileBytes,
      thumb: thumbBytes,
      mimeType: "image/jpeg",
      size: fileBytes.length,
      width: Number(form.get("width")) || 0,
      height: Number(form.get("height")) || 0,
      uploadedBy: admin._id,
    });

    return NextResponse.json(
      { success: true, photo: serializeGalleryPhoto(photo) },
      { status: 201 },
    );
  } catch (error) {
    console.error("GALLERY UPLOAD ERROR:", error);

    return fail("Failed to upload photo.", 500);
  }
}
