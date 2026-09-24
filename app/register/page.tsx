import PublicNavbar from "@/components/PublicNavbar";
import { RegisterCard } from "@/components/RegisterCard";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const token = (await cookies()).get("sportsmeet_token")?.value;

  if (token) {
    try {
      verifyToken(token);
      redirect("/games");
    } catch {}
  }
  return (
    <div className="w-full min-h-screen bg-linear-to-b from-blue-100/55 via-blue-100/80 to-blue-100/90">
      <PublicNavbar />
      <div className="flex flex-col flex-1 items-center justify-center font-sans p-5 w-full min-h-[calc(100vh-94px)]">
        <RegisterCard />
      </div>
    </div>
  );
}
