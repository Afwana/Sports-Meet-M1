"use client";

import PhotoGallery from "@/components/PhotoGallery";
import { Photo } from "@/types/photo";
import { Card } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("all");

  useEffect(() => {
    fetch("/api/admin/photos", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPhotos(data.photos);
        else toast.error(data.message || "Failed to load photos.");
      })
      .catch(() => toast.error("Failed to load photos."))
      .finally(() => setLoading(false));
  }, []);

  const teams = useMemo(
    () =>
      Array.from(new Set(photos.map((p) => p.teamName).filter(Boolean))).sort(),
    [photos],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return photos.filter((p) => {
      if (team !== "all" && p.teamName !== team) return false;

      if (!q) return true;

      return (
        p.employeeName.toLowerCase().includes(q) ||
        p.employeeCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      );
    });
  }, [photos, search, team]);

  async function handleDelete(photo: Photo) {
    if (!window.confirm(`Delete this photo from ${photo.employeeName}?`))
      return;

    const res = await fetch(`/api/photos/${photo._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      toast.success("Photo deleted.");
      setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
    } else {
      toast.error(data?.message || "Failed to delete photo.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-110px)] bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90 p-3 text-black md:p-6 dark:bg-black">
      <Card className="w-full p-5">
        <Card.Header>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Photography Submissions</h1>
            <p className="text-sm text-slate-500">
              {filtered.length} of {photos.length} photo(s)
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              aria-label="Search photos"
              placeholder="Search by name, code, department or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm md:w-1/3"
            />

            <select
              aria-label="Filter by team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="all">All teams</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </Card.Header>

        <Card.Content>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <PhotoGallery
              photos={filtered}
              showOwner
              allowDownload
              onDelete={handleDelete}
            />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
