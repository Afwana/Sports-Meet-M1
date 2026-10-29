import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getViewer } from "@/lib/getViewer";
import {
  ALLOWED_TYPES,
  employeePrefix,
  isPhotographyParticipant,
  MAX_ORIGINAL_BYTES,
  MAX_PHOTOS_PER_EMPLOYEE,
} from "@/lib/photoRules";
import PhotoSubmission from "@/models/PhotoSubmission";

export const runtime = "nodejs";

/**
 * Issues a short-lived upload token so the phone can send the (large) photo
 * straight to Vercel Blob. Only logged-in Photography participants get one.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await connectDB();

        const viewer = await getViewer();

        if (!viewer || viewer.kind !== "employee") {
          throw new Error("Please log in.");
        }

        if (!viewer.teamId) {
          throw new Error("You are not assigned to a team.");
        }

        if (!pathname.startsWith(employeePrefix(viewer.id))) {
          throw new Error("Invalid upload path.");
        }

        if (!(await isPhotographyParticipant(viewer.id))) {
          throw new Error("Register for the Photography game first.");
        }

        const count = await PhotoSubmission.countDocuments({
          employee: viewer.id,
        });

        if (count >= MAX_PHOTOS_PER_EMPLOYEE) {
          throw new Error(
            `You can upload up to ${MAX_PHOTOS_PER_EMPLOYEE} photos.`,
          );
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_ORIGINAL_BYTES,
          addRandomSuffix: true,
        };
      },
      // Saving to MongoDB is done by POST /api/photos right after the upload.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload not allowed." },
      { status: 400 },
    );
  }
}
