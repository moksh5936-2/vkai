import { callMistral, parseJSON, MistralMessage, AgentResponse } from "../mistral";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

interface IdeaValidationData {
  viabilityScore: number;
  marketSentiment: string;
  summary: string;
  strengths: string[];
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
  targetMarket: string;
  competitiveEdge: string;
}

export async function ideaValidatorAgent(
  message: string, 
  history: MistralMessage[], 
  context: { userId: string }
): Promise<AgentResponse> {
  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are a high-level startup analyst. Your goal is to evaluate startup ideas with 100% honesty and deep market insight.
      
      Respond with a JSON object containing:
      - viabilityScore: 0-100
      - marketSentiment: string (e.g. "Extremely High", "Moderate", "Niche")
      - summary: 2-3 sentence overview of the idea's potential.
      - strengths: string[]
      - risks: string[]
      - opportunities: string[]
      - nextSteps: string[]
      - targetMarket: string
      - competitiveEdge: string
      
      Return ONLY the JSON. No other text.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.4, response_format: { type: "json_object" } });
    const data = parseJSON<IdeaValidationData>(result.content);

    if (data) {
      // Save result to history asynchronously
      prisma.ideaValidationHistory.create({
        data: {
          userId: context.userId,
          ideaText: message,
          viabilityScore: data.viabilityScore,
          marketSentiment: data.marketSentiment,
          fullResult: data as unknown as Prisma.InputJsonValue,
        }
      }).catch(console.error);
    }

    return {
      intent: "IDEA_VALIDATION",
      responseType: "STRUCTURED",
      data: data as unknown as Record<string, unknown>,
      humanReadable: data?.summary || "Here is your startup idea validation report.",
    };
  } catch (error) {
    throw error;
  }
}
