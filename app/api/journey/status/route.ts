import { auth } from "@/lib/auth";
import { getJourney } from "@/lib/startupJourneyEngine";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const journey = await getJourney(session.user.id);
    return NextResponse.json(journey);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
