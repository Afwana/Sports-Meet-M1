import GalleryView from "@/components/GalleryView";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export const dynamic = "force-dynamic";

export default async function CaptainGalleryPage() {
  // Redirects to /register when the captain is not logged in.
  await getCurrentEmployee();

  return <GalleryView />;
}
