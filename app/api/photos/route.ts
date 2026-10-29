import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import {
  isPhotographyParticipant,
  employeePrefix,
  serializePhoto,
  MAX_PHOTOS_PER_EMPLOYEE,
  ALLOWED_TYPES,
} from "@/lib/photoRules";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

// The logged-in employee's own photos + whether they may upload.
export async function GET() {
  try {
    await connectDB();

    const viewer = await getViewer();

    if (!viewer || viewer.kind !== "employee") {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      );
    }

    const [eligible, photos] = await Promise.all([
      isPhotographyParticipant(viewer.id),
      PhotoSubmission.find({ employee: viewer.id })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      employeeId: viewer.id,
      eligible,
      max: MAX_PHOTOS_PER_EMPLOYEE,
      photos: photos.map(serializePhoto),
    });
  } catch (error) {
    console.error("PHOTOS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load photos." },
      { status: 500 },
    );
  }
}

interface RegisterBody {
  title?: string;
  caption?: string;
  original?: {
    pathname?: string;
    url?: string;
    size?: number;
    contentType?: string;
  };
  thumb?: { pathname?: string; url?: string };
  width?: number;
  height?: number;
}

// Called by the browser after both files finished uploading to Blob.
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const viewer = await getViewer();

    if (!viewer || viewer.kind !== "employee") {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      );
    }

    if (!viewer.teamId) {
      return NextResponse.json(
        { success: false, message: "You are not assigned to a team." },
        { status: 400 },
      );
    }

    if (!(await isPhotographyParticipant(viewer.id))) {
      return NextResponse.json(
        {
          success: false,
          message: "Register for the Photography game before uploading.",
        },
        { status: 403 },
      );
    }

    const existing = await PhotoSubmission.countDocuments({
      employee: viewer.id,
    });

    if (existing >= MAX_PHOTOS_PER_EMPLOYEE) {
      return NextResponse.json(
        {
          success: false,
          message: `You can upload up to ${MAX_PHOTOS_PER_EMPLOYEE} photos.`,
        },
        { status: 400 },
      );
    }

    const body = (await req.json()) as RegisterBody;
    const prefix = employeePrefix(viewer.id);

    const original = body.original;
    const thumb = body.thumb;

    // Files must be inside the employee's own folder.
    if (
      !original?.pathname ||
      !original.url ||
      !original.pathname.startsWith(prefix) ||
      (thumb?.pathname && !thumb.pathname.startsWith(prefix))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid upload data." },
        { status: 400 },
      );
    }

    const photo = await PhotoSubmission.create({
      employee: viewer.id,
      employeeCode: viewer.employeeCode,
      employeeName: viewer.employeeName,
      department: viewer.department,
      phoneNumber: viewer.phoneNumber,
      teamId: viewer.teamId,
      teamName: viewer.team,
      title: String(body.title ?? "")
        .trim()
        .slice(0, 80),
      caption: String(body.caption ?? "")
        .trim()
        .slice(0, 300),
      blobPathname: original.pathname,
      blobUrl: original.url,
      thumbPathname: thumb?.pathname ?? "",
      thumbUrl: thumb?.url ?? "",
      mimeType: ALLOWED_TYPES.includes(original.contentType ?? "")
        ? original.contentType
        : "image/jpeg",
      size: Number(original.size) || 0,
      width: Number(body.width) || 0,
      height: Number(body.height) || 0,
    });

    return NextResponse.json({
      success: true,
      photo: serializePhoto(photo.toObject()),
    });
  } catch (error) {
    console.error("PHOTO REGISTER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save photo." },
      { status: 500 },
    );
  }
}
