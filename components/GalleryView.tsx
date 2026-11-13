import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryPhotos } from "@/lib/getGalleryPhotos";
import { Card } from "@heroui/react";

/** Read-only gallery page body, shared by the employee and captain pages. */
export default async function GalleryView() {
  const photos = await getGalleryPhotos();

  return (
    <div className="min-h-[calc(100vh-104px)] w-full bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 text-black dark:bg-black">
      <Card className="min-h-[calc(100vh-90px)] p-5">
        <Card.Header>
          <Card.Title className="mt-3 text-lg font-bold text-black md:text-2xl">
            Gallery
          </Card.Title>
          <Card.Description className="mt-1 text-xs text-slate-500 md:text-sm">
            Photos from the program. Tap a photo to view it full size.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <GalleryGrid photos={photos} />
        </Card.Content>
      </Card>
    </div>
  );
}
