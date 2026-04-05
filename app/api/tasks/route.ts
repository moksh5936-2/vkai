import { auth } from "@/lib/auth";
import { getTasks } from "@/lib/taskEngine";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tasks = await getTasks(session.user.id);
    return NextResponse.json(tasks);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
