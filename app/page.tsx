"use client";

import Announcements from "@/components/Announcements";
import PublicPointsTable from "@/components/PublicPointsTable";
import TeamLogoStrip from "@/components/TeamLogoStrip";
import { Button, Card } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

export default function Home() {
  const router = useRouter();

  const [expanded, setExpanded] = useState(true);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <Image
        src="/images/mediaone.jpg"
        alt="Sports Meet Background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 hidden min-h-screen md:grid md:grid-cols-4">
        {/* Announcement card */}
        <div className="relative col-span-1 min-h-screen">
          <Card
            className={`
              absolute bottom-3 left-3 right-3
              overflow-hidden rounded-sm p-0 shadow-xl
              transition-all duration-300
              ${expanded ? "z-50" : "z-20"}
            `}
          >
            <Card.Header className="p-0">
              <Button
                type="button"
                onPress={() => setExpanded((current) => !current)}
                className="flex h-11 w-full items-center justify-between rounded-none bg-white p-3 text-left text-slate-800"
              >
                <span className="text-base font-semibold">Announcements</span>

                {expanded ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronUp size={12} />
                )}
              </Button>
            </Card.Header>

            {expanded && (
              <Card.Content>
                <Announcements expanded={expanded} />
              </Card.Content>
            )}

            <Card.Footer className="flex items-center justify-between gap-3 bg-slate-700/90 px-3 py-2">
              <p className="text-sm font-medium text-white">
                Login Here, If you are Admin!
              </p>

              <Button
                isIconOnly
                size="sm"
                variant="secondary"
                onPress={() => router.push("/admin/auth")}
              >
                A
              </Button>
            </Card.Footer>
          </Card>
        </div>
        <div className="relative col-span-3 min-h-screen">
          {/* Team Logo Strip */}
          <div className="absolute left-0 right-0 top-0">
            <TeamLogoStrip />
          </div>

          {/* Main Content */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-white">
            <h1 className="text-lg md:text-3xl font-bold lg:text-5xl">
              Sports Meet 2026
            </h1>

            <p className="mt-3 text-xs md:text-sm text-gray-200 lg:text-lg">
              Welcome to the Media One Sports Meet Portal
            </p>

            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onPress={() => router.push("/register")}
            >
              Get Started
            </Button>
          </div>

          {/* Point Table */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <PublicPointsTable />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="relative z-10 flex min-h-screen flex-col md:hidden">
        {/* Team Logos */}
        <div className="shrink-0">
          <TeamLogoStrip mobile />
        </div>

        {/* Main Content */}
        <div className="px-5 pt-6 pb-8 text-center text-white">
          <h1 className="text-4xl font-bold">Sports Meet 2026</h1>

          <p className="mt-3 text-sm text-gray-200">
            Welcome to the Media One Sports Meet Portal
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-6"
            onPress={() => router.push("/register")}
          >
            Get Started
          </Button>
        </div>

        {/* Point Table */}
        <div className="px-3">
          <PublicPointsTable />
        </div>

        {/* Announcements */}
        <div className="px-3 pt-4 pb-4">
          <Card className="overflow-hidden rounded-2xl p-0 shadow-xl">
            <Card.Header className="p-0">
              <Button
                type="button"
                onPress={() => setExpanded(!expanded)}
                className="flex h-11 w-full items-center justify-between rounded-none bg-white p-3 text-left text-slate-800"
              >
                <span className="font-semibold">Announcements</span>

                {expanded ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronUp size={12} />
                )}
              </Button>
            </Card.Header>

            {expanded && (
              <Card.Content className="max-h-[45vh] overflow-y-auto p-0">
                <Announcements expanded />
              </Card.Content>
            )}

            <Card.Footer className="flex items-center justify-between bg-slate-700/90 px-3 py-2">
              <span className="text-xs text-white">
                Login Here, If you are Admin!
              </span>

              <Button
                isIconOnly
                size="sm"
                variant="secondary"
                onPress={() => router.push("/admin/auth")}
              >
                A
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
}
