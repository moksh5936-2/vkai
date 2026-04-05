import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PLAN_LIMITS, PlanType } from "@/lib/creditLimits";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true, credits: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Ensure credits and subscription objects exist
    if (!user.credits) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            create: { chatCredits: 5, pitchCredits: 1 },
          },
        },
        include: { subscription: true, credits: true },
      });
    }

    if (!user?.subscription) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: {
            create: { plan: "FREE", status: "ACTIVE", currentPeriodStart: new Date() },
          },
        },
        include: { subscription: true, credits: true },
      });
    }

    // Monthly Reset Logic
    const lastReset = new Date(user?.credits?.resetDate || 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (lastReset < thirtyDaysAgo && user?.subscription?.plan !== "FREE") {
      const plan = user?.subscription?.plan as PlanType;
      const limits = PLAN_LIMITS[plan];

      await prisma.userCredits.update({
        where: { userId },
        data: {
          chatCredits: limits.chat,
          pitchCredits: limits.pitch,
          pitchDeckCredits: limits.pitchDeck,
          chatCreditsUsed: 0,
          pitchCreditsUsed: 0,
          pitchDeckCreditsUsed: 0,
          resetDate: new Date(),
        },
      });

      await prisma.creditTransaction.create({
        data: {
          userId,
          type: "RESET",
          creditType: "ALL",
          amount: 0,
          description: `Monthly credit reset for ${plan} plan`,
        },
      });
    }

    return NextResponse.json({
      plan: user?.subscription?.plan,
      status: user?.subscription?.status,
      credits: user?.credits,
      limits: PLAN_LIMITS[user?.subscription?.plan as PlanType],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
