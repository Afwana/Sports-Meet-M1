import AnnouncementTable from "@/components/admin/AnnouncementTable";
import { connectDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

export default async function AnnouncementsPage() {
  await connectDB();

  const announcements = await Announcement.find({})
    .sort({ createdAt: -1 })
    .lean();

  const serializedAnnouncements = announcements.map((announcement) => ({
    _id: announcement._id.toString(),
    title: announcement.title,
    message: announcement.message,
    link: announcement.link,
    isActive: announcement.isActive,
    createdAt: announcement.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-6 dark:bg-black">
      <AnnouncementTable initialAnnouncements={serializedAnnouncements} />
    </div>
  );
}
