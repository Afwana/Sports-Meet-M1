"use client";

import { navigation } from "@/lib/navigation";
import { HeaderUser } from "@/types/user";
import { Button, Dropdown, ScrollShadow, Separator } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCrown } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import LogoutButton from "../LogoutButton";
import { useEffect, useState } from "react";
import Image from "next/image";

type Role = "admin" | "captain" | "employee";

interface Props {
  role: Role;
  user: HeaderUser;
}

interface SiteSettings {
  programName: string;
  companyLogo: string;
}

export default function AppHeader({ role, user }: Props) {
  const pathname = usePathname();
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

  const links = role === "employee" ? [] : navigation[role];

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white dark:bg-black">
        <div className="flex h-16 max-w-full items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg xl:text-xl font-bold text-blue-700"
          >
            {settings.companyLogo && (
              <Image
                src={settings.companyLogo}
                alt="Company Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            )}

            <span>{settings.programName}</span>
          </Link>

          <nav className="hidden items-center gap-3 xl:gap-6 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm xl:text-lg font-medium transition xl:p-2 ${
                  pathname === item.href
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-default-600 hover:text-blue-600"
                }`}
              >
                <item.icon size={18} /> <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <Dropdown>
            <Button isIconOnly aria-label="Menu" variant="secondary">
              {user.role === "admin"
                ? user.name.charAt(0).toUpperCase()
                : user.employeeName.charAt(0).toUpperCase()}
            </Button>

            <Dropdown.Popover className="rounded-lg">
              <Dropdown.Menu>
                <Dropdown.Item id="profile" textValue="Profile" className="p-2">
                  {user.role === "admin" ? (
                    <div className="flex flex-col gap-3 border rounded-lg p-3 w-full">
                      <div className="flex flex-col">
                        <p className="text-base font-semibold">{user.name}</p>
                        <p className="text-sm text-default-500">{user.email}</p>
                      </div>

                      <div className=" flex gap-1 items-center px-1">
                        <FaShield size={16} color="#155DFC" />
                        <p className="text-sm text-blue-600 font-medium">
                          Administrator
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border rounded-lg p-3 w-full">
                      <div>
                        <p className="text-lg font-semibold">
                          {user.employeeName}
                        </p>

                        <p className="text-xs text-default-500">
                          {user.employeeCode}
                        </p>
                      </div>

                      <div className=" flex gap-1 text-sm items-center px-1">
                        <FaShield size={16} color="#155DFC" />
                        <p className="font-medium">{user.team || "No Team"}</p>
                      </div>

                      {user.isCaptain && (
                        <div className=" flex gap-1 text-sm items-center px-1">
                          <FaCrown size={14} color="#155DFC" />
                          <p className="text-xs font-medium text-blue-600">
                            Captain
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Dropdown.ItemIndicator />
                </Dropdown.Item>

                <Separator />

                <Dropdown.Item
                  id="logout"
                  textValue="Logout"
                  variant="danger"
                  className="p-2"
                >
                  <LogoutButton role={role} />
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        {/* Mobile Menu */}
        {links.length > 0 && (
          <ScrollShadow
            className="md:hidden h-16 max-w-full px-4"
            orientation="horizontal"
          >
            <nav className="flex flex-row gap-5">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-w-20 h-16 shrink-0 flex items-center justify-center text-base font-medium transition p-2  ${
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600 font-semibold rounded-none"
                      : "text-default-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </ScrollShadow>
        )}
      </header>
    </>
  );
}
