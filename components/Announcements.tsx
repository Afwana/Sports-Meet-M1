"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBullhorn } from "react-icons/fa6";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link: string;
  createdAt: string;
}

export default function Announcements({ expanded }: { expanded: boolean }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setAnnouncements(data.announcements || []);
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  if (loading || announcements.length === 0) {
    return (
      <div className="border border-slate-300 p-5 flex items-center justify-center m-2 text-gray-400">
        No announcements are there...
      </div>
    );
  }

  return (
    <>
      {/* Announcement list */}
      {expanded && (
        <div className="max-h-150 lg:max-h-180 overflow-y-auto backdrop-blur-sm scrollbar-thin">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="border-b border-slate-300 last:border-b-0"
            >
              <div className="flex items-start gap-2 px-3 py-2">
                {/* Icon */}
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-500">
                  <FaBullhorn size={12} className="text-white" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 text-slate-800">
                  <p className="text-sm font-semibold leading-5">
                    {announcement.title}
                  </p>

                  <p className="mt-0.5 text-xs leading-4 text-slate-500">
                    {announcement.message}
                  </p>

                  {announcement.link && (
                    <Link
                      href={announcement.link}
                      target="_blank"
                      className="mt-1 text-xs leading-4 text-blue-400"
                    >
                      {announcement.link}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
