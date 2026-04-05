import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const status = {
    database: "Unknown",
    ai: "Unknown",
    overall: "Unknown",
  };

  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    status.database = "Operational";
  } catch (error) {
    status.database = "Error";
  }

  // Check AI (just environment variable check for health)
  if (process.env.NVIDIA_NIM_API_KEY) {
    status.ai = "Operational";
  } else {
    status.ai = "Error";
  }

  status.overall = (status.database === "Operational" && status.ai === "Operational") 
    ? "Operational" : "Degraded";

  return NextResponse.json({
    status: status.overall,
    components: status,
    timestamp: new Date().toISOString(),
  });
}
