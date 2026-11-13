"use client";

import type { GalleryPhoto } from "@/types/gallery";
import { useCallback, useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

interface Props {
  photos: GalleryPhoto[];
  /** When given, each photo shows a delete button (admin only). */
  onDelete?: (photo: GalleryPhoto) => void;
  emptyMessage?: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GalleryGrid({
  photos,
  onDelete,
  emptyMessage = "No photos have been added yet.",
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;
  const total = photos.length;

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrevious = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null || total === 0 ? i : (i - 1 + total) % total,
      ),
    [total],
  );

  const showNext = useCallback(
    () =>
      setActiveIndex((i) => (i === null || total === 0 ? i : (i + 1) % total)),
    [total],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") showPrevious();
      else if (e.key === "ArrowRight") showNext();
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, showPrevious, showNext]);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  const active = activeIndex !== null ? photos[activeIndex] : undefined;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo, index) => (
          <div
            key={photo._id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={photo.caption || "Open photo"}
              className="block aspect-square w-full bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/gallery/${photo._id}/image?size=thumb`}
                alt={photo.caption || "Program photo"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            {(photo.caption || onDelete) && (
              <div className="flex items-center justify-between gap-2 p-2.5">
                <p className="min-w-0 truncate text-sm text-black">
                  {photo.caption}
                </p>

                {onDelete && (
                  <button
                    type="button"
                    aria-label="Delete photo"
                    onClick={() => onDelete(photo)}
                    className="shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <FaTrash size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-100 flex flex-col bg-black/90"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-3 p-3 text-white">
            <p className="text-sm text-slate-300">
              {(activeIndex ?? 0) + 1} / {total} ·{" "}
              {formatDate(active.createdAt)}
            </p>

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={`/api/gallery/${active._id}/image?size=full&download=1`}
                className="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
              >
                <FaDownload size={12} /> Download
              </a>

              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="rounded-md bg-white/15 p-2 hover:bg-white/25"
              >
                <FaXmark />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-3 md:px-16">
            {total > 1 && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevious();
                }}
                className="absolute left-2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
              >
                <FaChevronLeft />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active._id}
              src={`/api/gallery/${active._id}/image?size=full`}
              alt={active.caption || "Program photo"}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {total > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
              >
                <FaChevronRight />
              </button>
            )}
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
