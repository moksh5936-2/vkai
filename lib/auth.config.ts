import type { NextAuthConfig } from "next-auth";

type Role = "FOUNDER" | "INVESTOR" | "CONSULTANT" | "INCUBATOR" | "BANK";

export const authConfig = {
  providers: [], // Empty for now, will be extended in lib/auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
