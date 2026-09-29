import { cookies } from "next/headers";

import Admin from "@/models/Admin";
import { connectDB } from "./mongodb";
import { verifyAdminToken } from "./adminAuth";

/**
 * Admin check for API routes.
 *
 * Unlike getCurrentAdmin() this never redirects — it returns null so the
 * route can answer with a proper 401 JSON response (a redirect would make
 * fetch().json() fail on the client).
 */
export async function requireAdminApi() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) return null;

    const payload = verifyAdminToken(token);

    await connectDB();

    return await Admin.findById(payload.id);
  } catch {
    return null;
  }
}

export const UNAUTHORIZED_BODY = {
  success: false,
  message: "Admin authentication required.",
};
