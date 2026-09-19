"use client";

import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LogoutButtonProps {
  role: "admin" | "captain" | "employee";
}

export default function LogoutButton({ role }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to logout.");
        return;
      }

      toast.success("Logged out successfully.");

      if (role === "admin") {
        router.replace("/admin/auth");
      } else {
        router.replace("/");
      }

      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      toast.error("Failed to logout.");
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-danger"
      onPress={handleLogout}
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
}
