import { StartupJourney, User } from "./types";

export interface ProgressEvaluation {
  canProceed: boolean;
  needsImprovement: boolean;
  confidenceLevel: number;
  reasoning: string;
}

export function evaluateProgress(journey: Partial<StartupJourney>): ProgressEvaluation {
  const score = journey.readinessScore || 0;
  const validation = (journey.validationData as Record<string, unknown>)?.viabilityScore as number || 0;
  const researchData = journey.researchData as Record<string, unknown>;
  
  // Logic to determine research depth based on existence and length of findings
  const findings = researchData?.findings as string;
  const researchDepth = findings ? Math.min(100, findings.length / 10) : 0;

  const canProceed = 
    score >= 60 && 
    validation >= 50 && 
    researchDepth >= 40;

  const confidenceLevel = (score + validation + researchDepth) / 3;

  let reasoning = "";
  if (!canProceed) {
    if (score < 60) reasoning += "Readiness score is too low. ";
    if (validation < 50) reasoning += "Initial viability validation is weak. ";
    if (researchDepth < 40) reasoning += "Research depth is insufficient. ";
  } else {
    reasoning = "All signals indicate readiness for the next stage.";
  }

  return {
    canProceed,
    needsImprovement: !canProceed,
    confidenceLevel,
    reasoning
  };
}

export function shouldUnlockMentor(journey: StartupJourney, user: User): boolean {
  const viabilityScore = (journey.validationData as Record<string, unknown>)?.viabilityScore as number || 0;
  const isHighScorer = (journey.readinessScore || 0) >= 60 || viabilityScore >= 70;
  const isPremium = user.subscription?.plan === "PRO" || user.subscription?.plan === "ENTERPRISE";

  return isHighScorer || isPremium;
}
