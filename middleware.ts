import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  if ((isDashboard || isAdmin) && !isAuth) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Admin protection
  if (isAdmin && req.auth?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
