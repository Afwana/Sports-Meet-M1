"use client";

import { Photo } from "@/types/photo";
import { useState } from "react";
import { FaDownload, FaTrash, FaXmark } from "react-icons/fa6";

interface Props {
  photos: Photo[];
  /** Show employee name / code / department under each photo (captain + admin). */
  showOwner?: boolean;
  /** Show the delete button on each photo. */
  onDelete?: (photo: Photo) => void;
  /** Show a download link in the viewer (captain + admin). */
  allowDownload?: boolean;
}

export default function PhotoGallery({
  photos,
  showOwner = false,
  onDelete,
  allowDownload = false,
}: Props) {
  const [active, setActive] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No photos uploaded yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="block aspect-square w-full bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo._id}/image?size=thumb`}
                alt={photo.title || photo.employeeName}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>

            <div className="flex items-start justify-between gap-2 p-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">
                  {photo.title || "Untitled"}
                </p>

                {showOwner && (
                  <>
                    <p className="truncate text-xs text-slate-700">
                      {photo.employeeName} · {photo.employeeCode}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {[photo.department, photo.teamName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </>
                )}
              </div>

              {onDelete && (
                <button
                  type="button"
                  aria-label="Delete photo"
                  onClick={() => onDelete(photo)}
                  className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                >
                  <FaTrash size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-100 flex flex-col bg-black/90"
          onClick={() => setActive(null)}
        >
          <div className="flex items-center justify-between gap-3 p-3 text-white">
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {active.title || "Untitled"}
              </p>
              <p className="truncate text-xs text-slate-300">
                {active.employeeName} · {active.employeeCode}
                {active.department ? ` · ${active.department}` : ""}
                {active.phoneNumber && showOwner
                  ? ` · ${active.phoneNumber}`
                  : ""}
              </p>
            </div>

            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {allowDownload && (
                <>
                  <a
                    href={`/api/photos/${active._id}/image?size=full`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                  >
                    View original
                  </a>
                  <a
                    href={`/api/photos/${active._id}/image?size=full&download=1`}
                    className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                  >
                    <FaDownload size={12} /> Download original
                  </a>
                </>
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActive(null)}
                className="rounded-md bg-white/15 p-2 hover:bg-white/25"
              >
                <FaXmark />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/photos/${active._id}/image?size=thumb`}
              alt={active.title || active.employeeName}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {active.caption && (
            <p className="p-3 text-center text-sm text-slate-200">
              {active.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
