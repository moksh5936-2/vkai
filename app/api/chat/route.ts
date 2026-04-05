import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { routeToAgent } from "@/lib/agentRouter";
import { NextResponse } from "next/server";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  attachment: z.object({
    fileName: z.string(),
    fileType: z.string(),
    extractedContent: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
  }).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { message, sessionId, attachment } = chatSchema.parse(body);

    // 1. Check Credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId },
    });

    if (!userCredits || userCredits.chatCredits <= userCredits.chatCreditsUsed) {
      return NextResponse.json({ error: "Insufficient credits. Please upgrade." }, { status: 403 });
    }

    // 2. Manage Session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const newSession = await prisma.chatSession.create({
        data: { userId, title: message.slice(0, 50) + "..." },
      });
      activeSessionId = newSession.id;
    }

    // 3. Fetch History
    const historyData = await prisma.chatMessage.findMany({
      where: { sessionId: activeSessionId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const historyMissions = historyData.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 4. Update Message in DB
    await prisma.chatMessage.create({
      data: {
        userId,
        sessionId: activeSessionId,
        role: "user",
        content: message,
      },
    });

    // 5. Call AI Router
    const aiResponse = await routeToAgent(message, historyMissions as any, {
      role: (session.user as any).role || "FOUNDER",
      plan: "FREE",
      sessionId: activeSessionId,
      userId,
    });

    // 6. Deduct Credit
    await prisma.userCredits.update({
      where: { userId },
      data: { chatCreditsUsed: { increment: 1 } },
    });

    // 7. Save AI Response
    await prisma.chatMessage.create({
      data: {
        userId,
        sessionId: activeSessionId,
        role: "assistant",
        content: typeof aiResponse.data === 'string' ? aiResponse.data : JSON.stringify(aiResponse.data),
        intent: aiResponse.intent,
        isGenerated: true,
      },
    });

    // 8. Auto-update session title if it's "New Chat"
    const currentSession = await prisma.chatSession.findUnique({ where: { id: activeSessionId } });
    if (currentSession?.title === "New Chat") {
      await prisma.chatSession.update({
        where: { id: activeSessionId },
        data: { title: message.slice(0, 30) },
      });
    }

    return NextResponse.json({
      success: true,
      data: aiResponse,
      sessionId: activeSessionId,
      creditsRemaining: userCredits.chatCredits - (userCredits.chatCreditsUsed + 1),
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
