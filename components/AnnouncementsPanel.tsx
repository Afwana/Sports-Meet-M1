"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Info,
  Megaphone,
  Trophy,
} from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link: string;
  createdAt: string;
}

// The Announcement model doesn't carry a "type" field, so the icon/color
// per row is just cycled from a fixed palette (matches the reference
// design's visual variety rather than encoding real categories).
const ICON_PALETTE = [
  { Icon: Trophy, bg: "bg-blue-500/15", fg: "text-blue-400" },
  { Icon: Calendar, bg: "bg-emerald-500/15", fg: "text-emerald-400" },
  { Icon: Info, bg: "bg-purple-500/15", fg: "text-purple-400" },
  { Icon: AlertTriangle, bg: "bg-red-500/15", fg: "text-red-400" },
];

const PREVIEW_COUNT = 4;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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

  const visibleAnnouncements = showAll
    ? announcements
    : announcements.slice(0, PREVIEW_COUNT);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
            <Megaphone size={16} className="text-blue-400" />
          </span>

          <h2 className="text-base font-semibold text-white md:text-lg">
            Latest Announcements
          </h2>
        </div>

        {announcements.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="flex items-center gap-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 md:text-sm"
          >
            {showAll ? "Show Less" : "View All"}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-4 flex max-h-88 flex-col gap-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No announcements yet.
          </div>
        ) : (
          visibleAnnouncements.map((announcement, index) => {
            const { Icon, bg, fg } = ICON_PALETTE[index % ICON_PALETTE.length];

            return (
              <div
                key={announcement._id}
                className="flex items-start justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon size={14} className={fg} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {announcement.title}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {announcement.message}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { FaBullhorn } from "react-icons/fa6";

// interface Announcement {
//   _id: string;
//   title: string;
//   message: string;
//   link: string;
//   createdAt: string;
// }

// export default function Announcements({ expanded }: { expanded: boolean }) {
//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadAnnouncements = async () => {
//       try {
//         const res = await fetch("/api/announcements");

//         const data = await res.json();

//         if (!res.ok) {
//           console.error(data.message);
//           return;
//         }

//         setAnnouncements(data.announcements || []);
//       } catch (error) {
//         console.error("Failed to load announcements:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAnnouncements();
//   }, []);

//   if (loading || announcements.length === 0) {
//     return (
//       <div className="border border-slate-300 p-5 flex items-center justify-center m-2 text-gray-400">
//         No announcements are there...
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Announcement list */}
//       {expanded && (
//         <div className="max-h-150 lg:max-h-180 overflow-y-auto backdrop-blur-sm scrollbar-thin">
//           {announcements.map((announcement) => (
//             <div
//               key={announcement._id}
//               className="border-b border-slate-300 last:border-b-0"
//             >
//               <div className="flex items-start gap-2 px-3 py-2">
//                 {/* Icon */}
//                 <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-500">
//                   <FaBullhorn size={12} className="text-white" />
//                 </div>

//                 {/* Content */}
//                 <div className="min-w-0 flex-1 text-slate-800">
//                   <p className="text-sm font-semibold leading-5">
//                     {announcement.title}
//                   </p>

//                   <p className="mt-0.5 text-xs leading-4 text-slate-500">
//                     {announcement.message}
//                   </p>

//                   {announcement.link && (
//                     <Link
//                       href={announcement.link}
//                       target="_blank"
//                       className="mt-1 text-xs leading-4 text-blue-400"
//                     >
//                       {announcement.link}
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// }
