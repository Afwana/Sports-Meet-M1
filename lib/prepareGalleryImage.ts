import {
  GALLERY_FULL_MAX_DIMENSION,
  GALLERY_THUMB_MAX_DIMENSION,
  MAX_GALLERY_FULL_BYTES,
} from "@/lib/galleryRules";

// Browser-only helper: turns a picked image into a resized full copy and a
// small thumbnail (both JPEG) before it is sent to the server.

interface Rendered {
  blob: Blob;
  width: number;
  height: number;
}

async function renderJpeg(
  bitmap: ImageBitmap,
  maxDimension: number,
  quality: number,
): Promise<Rendered> {
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("This browser cannot process images.");
  }

  // JPEG has no transparency - avoid black backgrounds for PNG/WEBP.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );

  if (!blob) {
    throw new Error("Could not process the image.");
  }

  return { blob, width, height };
}

export async function prepareGalleryImage(file: File) {
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image can't be read. Please use a JPG, PNG or WEBP.");
  }

  try {
    let full = await renderJpeg(bitmap, GALLERY_FULL_MAX_DIMENSION, 0.85);

    for (const quality of [0.75, 0.65, 0.55]) {
      if (full.blob.size <= MAX_GALLERY_FULL_BYTES) break;

      full = await renderJpeg(bitmap, GALLERY_FULL_MAX_DIMENSION, quality);
    }

    const thumb = await renderJpeg(bitmap, GALLERY_THUMB_MAX_DIMENSION, 0.8);

    return {
      full: full.blob,
      thumb: thumb.blob,
      width: full.width,
      height: full.height,
    };
  } finally {
    bitmap.close();
  }
}
