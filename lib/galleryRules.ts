import type { GalleryPhoto } from "@/types/gallery";

/** Longest side of the stored full-size copy, in pixels. */
export const GALLERY_FULL_MAX_DIMENSION = 2000;

/** Longest side of the grid thumbnail, in pixels. */
export const GALLERY_THUMB_MAX_DIMENSION = 480;

/** Server-side limits (the browser resizes well below these). */
export const MAX_GALLERY_FULL_BYTES = 4 * 1024 * 1024;
export const MAX_GALLERY_THUMB_BYTES = 400 * 1024;

export const MAX_GALLERY_CAPTION_LENGTH = 150;

/** The browser always sends re-encoded JPEGs; reject anything else. */
export function isJpeg(bytes: Uint8Array) {
  return (
    bytes.length > 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

interface GalleryPhotoLike {
  _id: unknown;
  caption?: string;
  width?: number;
  height?: number;
  size?: number;
  createdAt?: Date | string;
}

export function serializeGalleryPhoto(photo: GalleryPhotoLike): GalleryPhoto {
  return {
    _id: String(photo._id),
    caption: photo.caption ?? "",
    width: photo.width ?? 0,
    height: photo.height ?? 0,
    size: photo.size ?? 0,
    createdAt: photo.createdAt
      ? new Date(photo.createdAt).toISOString()
      : new Date(0).toISOString(),
  };
}
