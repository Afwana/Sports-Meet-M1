"use client";

import PhotoGallery from "@/components/PhotoGallery";
import { Photo } from "@/types/photo";
import { Card } from "@heroui/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function CaptainPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/captain/photos", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPhotos(data.photos);
        else toast.error(data.message || "Failed to load photos.");
      })
      .catch(() => toast.error("Failed to load photos."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return photos;

    return photos.filter(
      (p) =>
        p.employeeName.toLowerCase().includes(q) ||
        p.employeeCode.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
    );
  }, [photos, search]);

  const participants = new Set(photos.map((p) => p.employeeCode)).size;

  return (
    <div className="min-h-[calc(100vh-104px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-5 text-black dark:bg-black">
      <Card className="min-h-[calc(100vh-105px)] w-full p-5">
        <Card.Header>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Team Photos</h1>
            <p className="text-sm text-slate-500">
              {photos.length} photo(s) from {participants} participant(s).{" "}
              <Link href="/photos" className="text-blue-600 underline">
                Upload my own photos
              </Link>
            </p>
          </div>

          <input
            aria-label="Search photos"
            placeholder="Search by name, code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm md:w-1/3"
          />
        </Card.Header>

        <Card.Content>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <PhotoGallery photos={filtered} showOwner allowDownload />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
