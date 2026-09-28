/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CategoryGamesTable,
  ItemCategoryEntry,
} from "@/components/admin/ItemRegistrationsList";
import { Button, Spinner } from "@heroui/react";
import { Printer } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function ItemPrintContent() {
  const params = useSearchParams();
  const mode = params.get("mode") || "all";
  const category = params.get("category") || "";
  const gameId = params.get("gameId") || "";

  const [report, setReport] = useState<ItemCategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/registrations/item-print", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load report.");
          return;
        }

        setReport(data.report || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sections = useMemo(() => {
    if (mode === "category") {
      return report.filter((r) => r.category === category);
    }

    if (mode === "game") {
      return report
        .filter((r) => r.category === category)
        .map((r) => ({
          ...r,
          games: r.games.filter((g: any) => g.gameId === gameId),
        }))
        .filter((r) => r.games.length > 0);
    }

    return report;
  }, [report, mode, category, gameId]);

  const subtitle =
    mode === "category"
      ? `${category} registrations`
      : mode === "game"
        ? `${category} · selected game`
        : "All registrations";

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-black print:p-0">
      <style>{`
        @page {
          size: A4;
          margin: 14mm 12mm;
        }
      `}</style>

      {/* Toolbar — hidden when printing */}
      <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold">Registrations Report</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <Button onPress={() => window.print()} isDisabled={loading}>
          <Printer size={16} />
          Print
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 print:hidden">
          <Spinner>Loading...</Spinner>
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-slate-500">
          No registrations found.
        </div>
      ) : (
        sections.map((section, index) => (
          <section
            key={section.category}
            className={`mx-auto max-w-5xl ${
              index > 0 ? "break-before-page" : ""
            }`}
          >
            <h2 className="mb-4 break-after-avoid border-b-2 border-black pb-2 text-2xl font-bold">
              {section.category} Items
            </h2>

            <CategoryGamesTable games={section.games} />
          </section>
        ))
      )}
    </div>
  );
}

export default function ItemPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner>Loading...</Spinner>
        </div>
      }
    >
      <ItemPrintContent />
    </Suspense>
  );
}
