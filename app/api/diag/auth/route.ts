import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const diag = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT_SET",
      FIREBASE_ADMIN: {
        PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        PRIVATE_KEY_LENGTH: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
        PRIVATE_KEY_FORMAT_VALID: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("-----BEGIN PRIVATE KEY-----") || false,
      }
    },
    status: {
      firebase_initialized: !!adminAuth,
      database_reachable: false,
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    diag.status.database_reachable = true;
  } catch (err) {
    console.error("Diagnostic DB Failure:", err);
  }

  return NextResponse.json(diag);
}
