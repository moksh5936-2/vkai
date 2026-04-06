import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

// Using a lightweight auth for Edge compatibility
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuth = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  if ((isDashboard || isAdmin) && !isAuth) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Admin protection
  if (isAdmin) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (req.auth?.user?.email !== adminEmail) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
