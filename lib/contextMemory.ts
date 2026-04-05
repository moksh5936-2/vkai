import { JourneyStage, StartupJourney } from "@prisma/client";

export interface ContextMemory {
  coreIdea: string;
  validationSummary: string;
  researchInsights: string;
  pastMistakes: string[];
  strengths: string[];
  weaknesses: string[];
  readinessScore: number;
  journeyStage: JourneyStage;
}

export function buildContextPrompt(memory: ContextMemory): string {
  return `### FOUNDER CONTEXT MEMORY (PRIORITIZED)
  - STAGE: ${memory.journeyStage}
  - READINESS: ${memory.readinessScore}/100
  - CORE IDEA: ${memory.coreIdea}
  - VALIDATION: ${memory.validationSummary}
  - RESEARCH: ${memory.researchInsights}
  - RECOGNIZED STRENGTHS: ${memory.strengths.join(", ")}
  - RECOGNIZED WEAKNESSES: ${memory.weaknesses.join(", ")}
  - PAST MISTAKES TO AVOID: ${memory.pastMistakes.join(", ")}
  
  ### SYSTEM GUIDANCE
  - Use this memory to maintain continuity.
  - Do not ask for information already stored in memory.
  - Bridge new insights with established strengths and weaknesses.
  - If the founder repeats a past mistake, point it out immediately but constructively.`;
}

export function extractMemoryFromJourney(journey: StartupJourney): ContextMemory {
  interface ValidationData {
    idea?: string;
    humanReadable?: string;
    opportunities?: string[];
    risks?: string[];
  }
  interface ResearchData {
    findings?: string;
  }
  interface FeedbackLogs {
    pastMistakes?: string[];
  }

  const vData = (journey.validationData as ValidationData | null) || {};
  const rData = (journey.researchData as ResearchData | null) || {};
  const fLogs = (journey.feedbackLogs as FeedbackLogs | null) || {};

  return {
    coreIdea: vData.idea || "N/A",
    validationSummary: vData.humanReadable || "N/A",
    researchInsights: rData.findings || "N/A",
    pastMistakes: fLogs.pastMistakes || [],
    strengths: vData.opportunities || [],
    weaknesses: vData.risks || [],
    readinessScore: journey.readinessScore || 0,
    journeyStage: journey.stage
  };
}
