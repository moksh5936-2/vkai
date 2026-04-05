import { callMistral, parseJSON, MistralMessage, AgentResponse } from "../mistral";
import prisma from "../prisma";

interface EcosystemMember {
  name: string;
  type: string;
  description?: string | null;
  website?: string | null;
}

interface Match {
  name: string;
  type: string;
  matchScore: number;
  reason: string;
  website: string;
}

interface InvestorMatcherData {
  matches: Match[];
  generalAdvice: string;
  nextStep: string;
}

export async function investorMatcherAgent(
  message: string, 
  history: MistralMessage[]
): Promise<AgentResponse> {
  // 1. Fetch real ecosystem members from DB
  const members = await prisma.ecosystemMember.findMany({
    take: 20,
    orderBy: { isVerified: 'desc' },
  });

  const memberCtx = members.map((m: EcosystemMember) => `- ${m.name} (${m.type}): ${m.description || 'No description'} website: ${m.website || 'N/A'}`).join('\n');

  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are an ecosystem connector. Match the user startup with the best partners from our ecosystem.
      
      Ecosystem Data:
      ${memberCtx}
      
      Respond with a JSON object containing:
      - matches: Array<{ name: string; type: string; matchScore: number; reason: string; website: string }>
      - generalAdvice: string
      - nextStep: string
      
      Suggest the top 3-5 matches. Return ONLY JSON. No other text.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.3, response_format: { type: "json_object" } });
    const data = parseJSON<InvestorMatcherData>(result.content);

    return {
      intent: "INVESTOR_MATCH",
      responseType: "STRUCTURED",
      data: data as unknown as Record<string, unknown>,
      humanReadable: data?.generalAdvice || "I have found several ecosystem partners that might be interested in your startup.",
    };
  } catch (error) {
    throw error;
  }
}
