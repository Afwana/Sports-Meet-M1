"use client";

import GalleryGrid from "@/components/GalleryGrid";
import { MAX_GALLERY_CAPTION_LENGTH } from "@/lib/galleryRules";
import { prepareGalleryImage } from "@/lib/prepareGalleryImage";
import type { GalleryPhoto } from "@/types/gallery";
import { useEffect, useRef, useState } from "react";
import { FaImages } from "react-icons/fa";
import { toast } from "sonner";

interface Pending {
  key: string;
  file: File;
  preview: string;
  caption: string;
}

interface Props {
  initialPhotos: GalleryPhoto[];
}

export default function GalleryManager({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  // Release preview URLs if the page is left with files still queued.
  const pendingRef = useRef<Pending[]>([]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";

    const images = files.filter((file) => file.type.startsWith("image/"));

    if (images.length < files.length) {
      toast.error("Some files were skipped because they are not images.");
    }

    setPending((prev) => [
      ...prev,
      ...images.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        caption: "",
      })),
    ]);
  }

  function removePending(key: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function handleUpload() {
    if (pending.length === 0 || uploading) return;

    setUploading(true);

    const queue = [...pending];
    const failed: Pending[] = [];
    let done = 0;

    for (const [index, item] of queue.entries()) {
      setProgress(`Uploading ${index + 1} of ${queue.length}...`);

      try {
        const { full, thumb, width, height } = await prepareGalleryImage(
          item.file,
        );

        const body = new FormData();
        body.append("file", full, "photo.jpg");
        body.append("thumb", thumb, "thumb.jpg");
        body.append("caption", item.caption);
        body.append("width", String(width));
        body.append("height", String(height));

        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          body,
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Upload failed.");
        }

        URL.revokeObjectURL(item.preview);
        setPhotos((prev) => [data.photo as GalleryPhoto, ...prev]);
        done++;
      } catch (error) {
        failed.push(item);
        toast.error(
          `${item.file.name}: ${
            error instanceof Error ? error.message : "Upload failed."
          }`,
        );
      }
    }

    setPending(failed);
    setUploading(false);
    setProgress("");

    if (done > 0) toast.success(`${done} photo(s) uploaded.`);
  }

  async function handleDelete(photo: GalleryPhoto) {
    if (!window.confirm("Delete this photo from the gallery?")) return;

    try {
      const res = await fetch(`/api/admin/gallery/${photo._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        toast.success("Photo deleted.");
        setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
      } else {
        toast.error(data?.message || "Failed to delete photo.");
      }
    } catch {
      toast.error("Failed to delete photo.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm text-slate-600">
          Add photos from the program. They are resized automatically and become
          visible to all employees.
        </p>

        <label
          className={`mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white ${
            uploading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-blue-700"
          }`}
        >
          <FaImages />
          Choose photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelect}
            disabled={uploading}
          />
        </label>

        {pending.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {pending.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md bg-slate-100 object-cover"
                />

                <input
                  value={item.caption}
                  maxLength={MAX_GALLERY_CAPTION_LENGTH}
                  placeholder="Caption (optional)"
                  aria-label={`Caption for ${item.file.name}`}
                  disabled={uploading}
                  onChange={(e) =>
                    setPending((prev) =>
                      prev.map((p) =>
                        p.key === item.key
                          ? { ...p, caption: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-black"
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => removePending(item.key)}
                  className="text-sm text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {uploading ? progress : `Upload ${pending.length} photo(s)`}
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-black">
          Gallery ({photos.length})
        </h2>

        <GalleryGrid
          photos={photos}
          onDelete={handleDelete}
          emptyMessage="No photos yet. Choose photos above to add the first ones."
        />
      </div>
    </div>
  );
}
