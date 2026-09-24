"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface SiteSettings {
  programName: string;
  companyLogo: string;
}

export default function PublicNavbar() {
  const router = useRouter();

  const [settings, setSettings] = useState<SiteSettings>({
    programName: "Sports Meet 2026",
    companyLogo: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    loadSettings();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo + title */}
        <Link href="/" className="flex items-center gap-3">
          {settings.companyLogo && (
            <Image
              src={settings.companyLogo}
              alt="Media One"
              width={36}
              height={36}
              objectFit="cover"
            />
          )}

          <div className="hidden h-6 w-px bg-white/20 sm:block" />

          <span className="hidden text-lg font-bold text-white sm:block">
            {settings.programName}
          </span>
        </Link>

        {/* Admin login shortcut, styled as an account avatar */}
        <button
          type="button"
          onClick={() => router.push("/admin/auth")}
          aria-label="Admin login"
          className="flex items-center gap-1 rounded-full bg-white/5 py-1 pl-1 pr-2 text-white transition-colors hover:bg-white/10"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-indigo-600 text-xs font-semibold">
            A
          </span>

          <ChevronDown size={14} className="text-slate-300" />
        </button>
      </div>
    </nav>
  );
}
