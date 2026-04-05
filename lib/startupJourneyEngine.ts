import prisma from "./prisma";
import { JourneyStage, type StartupJourney } from "./types";
import { Prisma } from "@prisma/client";
import { callMistral } from "./mistral";
import { evaluateProgress } from "./decisionEngine";
import { generateTasks, getDefaultTasksForStage } from "./taskEngine";
import { buildContextPrompt, extractMemoryFromJourney } from "./contextMemory";

const MAX_FEEDBACK_LOOPS = 3;

export interface JourneyTask {
  title: string;
  description: string;
  priority: number;
}

export interface JourneyResponse {
  intent: string;
  stage: JourneyStage;
  humanReadable: string;
  data?: Record<string, unknown>;
  tasks?: JourneyTask[];
  nextAction?: string;
  warnings?: string[];
}

export async function getJourney(userId: string): Promise<StartupJourney> {
  let journey = await prisma.startupJourney.findUnique({
    where: { userId },
  });

  if (!journey) {
    journey = await prisma.startupJourney.create({
      data: { userId, stage: JourneyStage.IDEA_INPUT },
    });
  }

  return journey;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateJourney(userId: string, data: Partial<StartupJourney> | any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const { userId: _, id: __, ...updateData } = data as any;
  return await prisma.startupJourney.update({
    where: { userId },
    data: updateData as Prisma.StartupJourneyUpdateInput,
  });
}

export async function runStructuredJourney(userId: string, message: string): Promise<JourneyResponse> {
  const journey = await getJourney(userId);
  const currentStage = journey.stage;
  const memory = extractMemoryFromJourney(journey);
  const contextPrompt = buildContextPrompt(memory);

  // V2 Structured Response Requirement
  const formatInstructions = `
  Return ONLY a structured JSON response:
  {
    "intent": "string",
    "stage": "${currentStage}",
    "humanReadable": "string message to user",
    "data": {},
    "tasks": [{"title": "string", "description": "string", "priority": number}],
    "nextAction": "string",
    "warnings": ["string"]
  }`;

  switch (currentStage) {
    case JourneyStage.IDEA_INPUT:
      return await handleIdeaInput(userId, message);

    case JourneyStage.IDEA_VALIDATION:
      return await handleIdeaValidation(journey, formatInstructions);

    case JourneyStage.RESEARCH_PATH_SELECTION:
      return await handleResearchSelection(userId, message);

    case JourneyStage.RESEARCH_SUBMISSION:
      return await handleResearchSubmission(userId, message);

    case JourneyStage.AI_FEEDBACK_LOOP:
      return await handleFeedbackLoop(userId, message, journey, contextPrompt, formatInstructions);

    case JourneyStage.READINESS_SCORE:
      return await handleReadinessScore(userId, journey, contextPrompt, formatInstructions);

    default:
      return { 
        humanReadable: "System error: Invalid Journey Stage.", 
        stage: currentStage,
        intent: "SYSTEM_ERROR"
      };
  }
}

async function handleIdeaInput(userId: string, message: string): Promise<JourneyResponse> {
  const tasks = getDefaultTasksForStage(JourneyStage.IDEA_VALIDATION);
  await generateTasks(userId, JourneyStage.IDEA_VALIDATION, tasks);
  
  await updateJourney(userId, { 
    stage: JourneyStage.IDEA_VALIDATION,
    validationData: { idea: message }
  });

  return {
    intent: "IDEA_RECEIVED",
    stage: JourneyStage.IDEA_VALIDATION,
    humanReadable: `Vision accepted: "${message}". I've initialized your validation path and assigned initial tasks in your dashboard.`,
    tasks,
    nextAction: "Complete the tasks in your dashboard to move to the validation phase."
  };
}

async function handleIdeaValidation(journey: StartupJourney, format: string): Promise<JourneyResponse> {
  const idea = (journey.validationData as Record<string, unknown>)?.idea;
  const userId = journey.userId;

  const prompt = `${format}\n\nAnalyze this startup idea: "${idea}". 
  Provide viabilityScore (0-100), market sentiment, risks, and opportunities.`;

  const res = await callMistral([{ role: "user", content: prompt }], { 
    model: "mistralai/mixtral-8x22b-instruct-v0.1",
    response_format: { type: "json_object" },
    temperature: 0.4 
  });
  
  const data = JSON.parse(res.content) as Record<string, unknown>;
  
  await updateJourney(userId, {
    stage: JourneyStage.RESEARCH_PATH_SELECTION,
    validationData: data as Prisma.InputJsonValue
  });

  return {
    ...data,
    intent: "IDEA_VALIDATED",
    stage: JourneyStage.RESEARCH_PATH_SELECTION
  } as unknown as JourneyResponse;
}

async function handleResearchSelection(userId: string, message: string): Promise<JourneyResponse> {
  const selection = message.toLowerCase();
  let path = "MARKET_RESEARCH";
  if (selection.includes("survey")) path = "SURVEYS";
  if (selection.includes("competitor")) path = "COMPETITOR_ANALYSIS";
  if (selection.includes("mvp") || selection.includes("test")) path = "MVP_TESTING";

  await updateJourney(userId, {
    stage: JourneyStage.RESEARCH_SUBMISSION,
    researchData: { selectedPath: path }
  });

  const tasks = getDefaultTasksForStage(JourneyStage.RESEARCH_SUBMISSION);
  await generateTasks(userId, JourneyStage.RESEARCH_SUBMISSION, tasks);

  return {
    intent: "RESEARCH_PATH_SELECTED",
    stage: JourneyStage.RESEARCH_SUBMISSION,
    humanReadable: `Focus locked: **${path.replace(/_/g, ' ')}**. I've updated your task list. Please provide your data for analysis.`,
    tasks,
    nextAction: "Complete the research tasks and upload your findings."
  };
}

async function handleResearchSubmission(userId: string, message: string): Promise<JourneyResponse> {
  await updateJourney(userId, {
    stage: JourneyStage.AI_FEEDBACK_LOOP,
    researchData: { findings: message } as Prisma.InputJsonValue,
    feedbackLoopCount: 0
  });

  return {
    intent: "RESEARCH_RECEIVED",
    stage: JourneyStage.AI_FEEDBACK_LOOP,
    humanReadable: "Research data ingested. I am now performing an initial cross-reference with market benchmarks.",
    nextAction: "Stand by for feedback loop interaction."
  };
}

async function handleFeedbackLoop(userId: string, message: string, journey: StartupJourney, context: string, format: string): Promise<JourneyResponse> {
  const findings = (journey.researchData as Record<string, unknown>)?.findings;
  const loopCount = journey.feedbackLoopCount + 1;

  if (loopCount >= MAX_FEEDBACK_LOOPS || message.toLowerCase().includes("score") || message.toLowerCase().includes("proceed")) {
    await updateJourney(userId, { stage: JourneyStage.READINESS_SCORE });
    return {
      intent: "FEEDBACK_LOOP_COMPLETED",
      humanReadable: "Feedback cycle concluded. Proceeding to final Readiness Score calculation.",
      stage: JourneyStage.READINESS_SCORE,
      nextAction: "Review your final readiness verdict."
    };
  }

  const prompt = `${context}\n${format}\n\nLoop ${loopCount}/${MAX_FEEDBACK_LOOPS}. Findings: "${findings}". 
  Evaluate research validation gaps.`;

  const res = await callMistral([{ role: "user", content: prompt }], { 
    model: "mistralai/mixtral-8x22b-instruct-v0.1",
    response_format: { type: "json_object" }
  });

  const data = JSON.parse(res.content) as Record<string, unknown>;
  await updateJourney(userId, { feedbackLoopCount: loopCount });

  return {
    ...data,
    intent: "FEEDBACK_LOOP_ACTIVE",
    stage: JourneyStage.AI_FEEDBACK_LOOP
  } as unknown as JourneyResponse;
}

async function handleReadinessScore(userId: string, journey: StartupJourney, context: string, format: string): Promise<JourneyResponse> {
  const findings = (journey.researchData as Record<string, unknown>)?.findings;

  const prompt = `${context}\n${format}\n\nCalculate final Startup Readiness Score based on findings: "${findings}".`;

  const res = await callMistral([{ role: "user", content: prompt }], { 
    model: "mistralai/mixtral-8x22b-instruct-v0.1",
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const data = JSON.parse(res.content) as Record<string, unknown>;
  
  // Use V2 Decision Engine
  const evaluation = evaluateProgress({ ...journey, readinessScore: data.score as number } as StartupJourney);
  const nextStage = evaluation.canProceed ? JourneyStage.EXECUTION_PATH : JourneyStage.RESEARCH_SUBMISSION;

  await updateJourney(userId, {
    stage: nextStage,
    readinessScore: data.score,
    feedbackLogs: data as Prisma.InputJsonValue
  });

  if (evaluation.canProceed) {
    const execTasks = getDefaultTasksForStage(JourneyStage.EXECUTION_PATH);
    await generateTasks(userId, JourneyStage.EXECUTION_PATH, execTasks);
  }

  return {
    ...data,
    intent: "READINESS_SCORE_CALCULATED",
    stage: nextStage,
    humanReadable: data.humanReadable || "Readiness calculation complete.",
    warnings: evaluation.needsImprovement ? [evaluation.reasoning] : []
  } as unknown as JourneyResponse;
}
