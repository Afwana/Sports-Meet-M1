import AppHeader from "@/components/layout/AppHeader";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname");

  if (pathname === "/admin/auth") {
    return children;
  }
  const admin = await getCurrentAdmin();
  return (
    <>
      <AppHeader
        role="admin"
        user={{
          role: "admin",
          name: admin.name,
          email: admin.email,
        }}
      />

      <main className="">{children}</main>
    </>
  );
}
