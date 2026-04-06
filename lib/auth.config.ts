import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Empty for now, will be extended in lib/auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
