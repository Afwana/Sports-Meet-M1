import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sportsmeet_token")?.value;

  const pathname = req.nextUrl.pathname;

  if (!token && pathname.startsWith("/games")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && pathname.startsWith("/captain")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token) {
    try {
      const payload = verifyToken(token);

      if (pathname.startsWith("/captain") && payload.role !== "Captain") {
        return NextResponse.redirect(new URL("/games", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/games/:path*", "/captain/:path*"],
};
