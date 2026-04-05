import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PLAN_LIMITS, PlanType } from "@/lib/creditLimits";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscriptionSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  billing: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { plan, billing } = subscriptionSchema.parse(body);

    const limits = PLAN_LIMITS[plan as PlanType];

    // Update Subscription
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: plan as any,
        billing: billing as any,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: billing === "MONTHLY" 
          ? new Date(new Date().setMonth(new Date().getMonth() + 1))
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
      create: {
        userId,
        plan: plan as any,
        billing: billing as any,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: billing === "MONTHLY" 
          ? new Date(new Date().setMonth(new Date().getMonth() + 1))
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    });

    // Reset Credits for the new plan
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

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        type: "SUBSCRIPTION",
        title: "Plan Upgraded!",
        message: `You've successfully upgraded to the ${plan} plan. Your credits have been reset.`,
      },
    });

    // Track Usage
    await prisma.usageEvent.create({
      data: {
        userId,
        event: "SUBSCRIPTION_UPGRADE",
        metadata: { plan, billing },
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
