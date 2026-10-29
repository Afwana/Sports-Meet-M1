"use client";

import PhotoGallery from "@/components/PhotoGallery";
import { Photo } from "@/types/photo";
import { upload } from "@vercel/blob/client";
import { useCallback, useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { toast } from "sonner";

// The original camera file is uploaded untouched (for judging).
// Only a small preview copy is generated for fast gallery loading.
const PREVIEW_DIMENSION = 1280;
const MULTIPART_ABOVE = 20 * 1024 * 1024; // more reliable for very large files

interface Pending {
  key: string;
  file: File;
  preview: string;
  title: string;
}

function getContentType(file: File) {
  if (file.type) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";

  return "image/jpeg";
}

function getExtension(file: File, contentType: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (
    fromName &&
    ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fromName)
  ) {
    return fromName;
  }

  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/heic") return "heic";
  if (contentType === "image/heif") return "heif";

  return "jpg";
}

/** Small JPEG preview. Returns null if this browser can't decode the file. */
async function makePreview(file: File) {
  try {
    const bitmap = await createImageBitmap(file);

    try {
      const scale = Math.min(
        1,
        PREVIEW_DIMENSION / Math.max(bitmap.width, bitmap.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.82),
      );

      return blob ? { blob, width: bitmap.width, height: bitmap.height } : null;
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

export default function PhotoUploader() {
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [max, setMax] = useState(3);
  const [employeeId, setEmployeeId] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [percent, setPercent] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/photos", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setEligible(data.eligible);
        setMax(data.max);
        setEmployeeId(data.employeeId);
        setPhotos(data.photos);
      } else {
        toast.error(data.message || "Failed to load photos.");
      }
    } catch {
      toast.error("Failed to load photos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remaining = Math.max(0, max - photos.length);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";

    const slots = remaining - pending.length;

    if (files.length > slots) {
      toast.error(`You can add ${Math.max(slots, 0)} more photo(s).`);
    }

    const next = files.slice(0, Math.max(slots, 0)).map((file) => ({
      key: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, "").slice(0, 80),
    }));

    setPending((prev) => [...prev, ...next]);
  }

  function removePending(key: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function handleUpload() {
    if (pending.length === 0) return;

    setUploading(true);

    let done = 0;
    const failed: Pending[] = [];

    for (const item of pending) {
      setPercent(0);
      setProgress(`Uploading ${done + failed.length + 1} of ${pending.length}`);

      try {
        const contentType = getContentType(item.file);
        const ext = getExtension(item.file, contentType);
        const preview = await makePreview(item.file);

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const prefix = `photos/${employeeId}/${id}`;

        // Phone -> Blob storage directly (no server size limit).
        const previewBlob = preview
          ? await upload(`${prefix}-preview.jpg`, preview.blob, {
              access: "private",
              handleUploadUrl: "/api/photos/upload",
              contentType: "image/jpeg",
            })
          : null;

        const originalBlob = await upload(`${prefix}.${ext}`, item.file, {
          access: "private",
          handleUploadUrl: "/api/photos/upload",
          contentType,
          multipart: item.file.size > MULTIPART_ABOVE,
          onUploadProgress: (e) => setPercent(Math.round(e.percentage)),
        });

        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            original: {
              pathname: originalBlob.pathname,
              url: originalBlob.url,
              size: item.file.size,
              contentType,
            },
            thumb: previewBlob
              ? { pathname: previewBlob.pathname, url: previewBlob.url }
              : undefined,
            width: preview?.width ?? 0,
            height: preview?.height ?? 0,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Upload failed.");
        }

        URL.revokeObjectURL(item.preview);
        done++;
      } catch (error) {
        failed.push(item);
        toast.error(
          `${item.title || item.file.name}: ${
            error instanceof Error ? error.message : "Upload failed."
          }`,
        );
      }
    }

    setPending(failed);
    setUploading(false);
    setProgress("");

    if (done > 0) toast.success(`${done} photo(s) uploaded.`);

    await load();
  }

  async function handleDelete(photo: Photo) {
    if (!window.confirm("Delete this photo?")) return;

    const res = await fetch(`/api/photos/${photo._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      toast.success("Photo deleted.");
      setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
    } else {
      toast.error(data?.message || "Failed to delete photo.");
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (!eligible) {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        Photo upload is only for participants registered in the Photography
        game. Please register for Photography first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm text-slate-600">
          You have uploaded <strong>{photos.length}</strong> of{" "}
          <strong>{max}</strong> photos.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Your original photo is uploaded without any compression, so large
          photos may take a little while on mobile data.
        </p>

        {remaining - pending.length > 0 && (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <FaCamera />
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
        )}

        {remaining === 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Photo limit reached. Delete one to upload another.
          </p>
        )}

        {pending.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {pending.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover"
                />
                <input
                  value={item.title}
                  maxLength={80}
                  placeholder="Photo title"
                  disabled={uploading}
                  onChange={(e) =>
                    setPending((prev) =>
                      prev.map((p) =>
                        p.key === item.key
                          ? { ...p, title: e.target.value }
                          : p,
                      ),
                    )
                  }
                  className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm"
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
              {uploading
                ? `${progress} (${percent}%)`
                : `Upload ${pending.length} photo(s)`}
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">My uploaded photos</h2>
        <PhotoGallery photos={photos} onDelete={handleDelete} />
      </div>
    </div>
  );
}
