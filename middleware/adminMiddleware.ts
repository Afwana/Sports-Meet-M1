import { NextRequest, NextResponse } from "next/server";

export function adminMiddleware(req: NextRequest) {
  const token = req.cookies.get("admin-token")?.value;

  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.startsWith("/admin/auth")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/auth", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
