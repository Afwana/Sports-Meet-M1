"use client";

import AnnouncementsPanel from "@/components/AnnouncementsPanel";
import HeroTeamCircles from "@/components/HeroTeamCircles";
import LiveLeaderBoard from "@/components/LiveLeaderBoard";
import { Button } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/mediaone.jpg"
          alt="Recreation Meet Background"
          fill
          priority
          className="object-cover"
        />

        {/* Dark navy wash to match the reference mood + keep text legible */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/55 to-slate-950/90" />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5 py-14 text-center text-white md:gap-10 md:py-20">
          <div>
            <h1 className="text-3xl font-extrabold md:text-5xl lg:text-6xl">
              Recreation Meet <span className="text-blue-500">2026</span>
            </h1>

            <p className="mt-3 text-base font-semibold text-blue-300 md:text-xl">
              Media One Recreation Meet
            </p>

            <p className="mt-2 text-xs text-slate-300 md:text-sm">
              Stronger Teams &bull; Healthier Minds &bull; A United Media One
            </p>
          </div>

          <HeroTeamCircles />

          <Button
            variant="primary"
            size="lg"
            className="rounded-full px-6"
            onPress={() => router.push("/register")}
          >
            Get Started
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Announcements + Leaderboard */}
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 pb-6 md:grid-cols-2 md:gap-5 md:px-8 md:pb-8">
          <AnnouncementsPanel />
          <LiveLeaderBoard />
        </div>
      </div>
    </div>
  );
}
