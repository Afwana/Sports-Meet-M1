import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Admin from "@/models/Admin";
import { connectDB } from "./mongodb";
import { verifyAdminToken } from "./adminAuth";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get("admin-token")?.value;

  if (!token) redirect("/admin/auth");

  const payload = verifyAdminToken(token);

  await connectDB();

  const admin = await Admin.findById(payload.id);

  if (!admin) redirect("/admin/auth");

  return admin;
}
