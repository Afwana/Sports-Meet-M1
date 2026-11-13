import GalleryView from "@/components/GalleryView";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  // Redirects to /register when the employee is not logged in.
  await getCurrentEmployee();

  return <GalleryView />;
}
