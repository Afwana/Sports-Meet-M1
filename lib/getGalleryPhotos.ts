import { connectDB } from "@/lib/mongodb";
import { serializeGalleryPhoto } from "@/lib/galleryRules";
import GalleryPhoto from "@/models/GalleryPhoto";

/** All gallery photos, newest first. Metadata only - no image bytes. */
export async function getGalleryPhotos() {
  await connectDB();

  const photos = await GalleryPhoto.find({})
    .select("caption width height size createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return photos.map(serializeGalleryPhoto);
}
