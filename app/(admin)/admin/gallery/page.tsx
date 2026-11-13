import GalleryManager from "@/components/admin/GalleryManager";
import { getGalleryPhotos } from "@/lib/getGalleryPhotos";
import { Card } from "@heroui/react";

// The admin layout already requires a logged-in admin.
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 text-black md:p-6 dark:bg-black">
      <Card className="w-full p-5">
        <Card.Header>
          <div className="mb-2">
            <Card.Title className="text-lg font-semibold text-black">
              Gallery
            </Card.Title>
            <Card.Description>
              Upload program photos for employees to see.
            </Card.Description>
          </div>
        </Card.Header>

        <Card.Content>
          <GalleryManager initialPhotos={photos} />
        </Card.Content>
      </Card>
    </div>
  );
}
