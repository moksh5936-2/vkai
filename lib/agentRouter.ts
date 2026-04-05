import { MistralMessage, AgentResponse, Intent } from "./mistral";
import { getJourney, runStructuredJourney, JourneyResponse } from "./startupJourneyEngine";
import { mentorModeAgent } from "./agents/mentorMode";
import { shouldUnlockMentor } from "./decisionEngine";
import { getTasks } from "./taskEngine";
import { extractMemoryFromJourney } from "./contextMemory";
import { JourneyTask } from "./types";
import prisma from "./prisma";

export async function routeToAgent(
  message: string, 
  history: MistralMessage[], 
  context: { role: string; plan: string; sessionId: string; userId: string }
): Promise<AgentResponse> {
  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    include: { subscription: true }
  });
  
  if (!user) throw new Error("User not found");

  const journey = await getJourney(context.userId);
  const memory = extractMemoryFromJourney(journey);
  const tasks = await getTasks(context.userId, journey.stage);
  
  const v2Context = {
    ...memory,
    tasks: tasks.map((t: JourneyTask) => ({ title: t.title, completed: !!t.completed })),
    subscription: user.subscription?.plan ?? "FREE"
  };

  // V2 Transition Logic
  if (!shouldUnlockMentor(journey, user)) {
    const journeyResult: JourneyResponse = await runStructuredJourney(context.userId, message);
    
    return {
      intent: (journeyResult.intent || "IDEA_VALIDATION") as Intent,
      responseType: "STRUCTURED",
      data: (journeyResult.data || journeyResult) as Record<string, unknown>,
      humanReadable: journeyResult.humanReadable,
    };
  }

  // Mentor Mode with full persistent memory
  return await mentorModeAgent(message, history, v2Context);
}

export function buildHumanReadable(intent: Intent, data: Record<string, unknown>): string {
  // ... existing implementation or simplified version for V2
  return (data.humanReadable as string) || "Processing request...";
}
