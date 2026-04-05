import prisma from "./prisma";
import { JourneyStage, JourneyTask } from "./types";

export type { JourneyTask };

export async function generateTasks(userId: string, stage: JourneyStage, tasks: JourneyTask[]) {
  // Clear old incomplete tasks for this stage to avoid duplication
  await prisma.journeyTask.deleteMany({
    where: { userId, stage: stage.toString(), completed: false },
  });

  const taskData = tasks.map((t) => ({
    userId,
    stage: stage.toString(),
    title: t.title,
    description: t.description,
    priority: t.priority ?? 1,
  }));

  return await prisma.journeyTask.createMany({
    data: taskData,
  });
}

export async function getTasks(userId: string, stage?: string) {
  return await prisma.journeyTask.findMany({
    where: { 
      userId, 
      ...(stage ? { stage } : {}) 
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

export async function completeTask(taskId: string) {
  return await prisma.journeyTask.update({
    where: { id: taskId },
    data: { completed: true },
  });
}

export function getDefaultTasksForStage(stage: JourneyStage): JourneyTask[] {
  switch (stage) {
    case JourneyStage.IDEA_VALIDATION:
      return [
        { title: "Define Target Customer", description: "Identify the exact segment your idea serves.", priority: 3 },
        { title: "List Direct Competitors", description: "Who else is solving this problem today?", priority: 2 }
      ];
    case JourneyStage.RESEARCH_SUBMISSION:
      return [
        { title: "Upload Market Study", description: "Find a report that validates the TAM/SAM size.", priority: 3 },
        { title: "Conduct Initial Interviews", description: "Talk to at least 5 potential users and note findings.", priority: 2 }
      ];
    case JourneyStage.EXECUTION_PATH:
      return [
        { title: "Draft Investment Deck", description: "Outline the 10 core slides for your pitch.", priority: 3 },
        { title: "Map Revenue Model", description: "Define your pricing tiers and unit economics.", priority: 3 }
      ];
    default:
      return [];
  }
}
