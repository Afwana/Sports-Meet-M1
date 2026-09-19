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
    <div className="flex flex-col flex-1 items-center justify-center bg-blue-50 font-sans dark:bg-black p-5">
      <RegisterCard />
    </div>
  );
}
