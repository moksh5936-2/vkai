import { callMistral, MistralMessage, AgentResponse, parseJSON } from "../mistral";
import { buildContextPrompt, ContextMemory } from "../contextMemory";

interface MentorResponse {
  response: string;
  strategicAdvice: string;
  nextAction: string;
  logicMatch: number;
}

export async function mentorModeAgent(
  message: string,
  history: MistralMessage[],
  context: ContextMemory & { subscription?: string }
): Promise<AgentResponse> {
  
  const memoryContext = buildContextPrompt(context);
  const systemPrompt = `You are NOT a chatbot. You are a high-level startup mentor and executive coach with 20+ years of experience.
  
  ${memoryContext}
  
  SUBSCRIPTION STATUS: ${context.subscription || "FREE"}
  
  YOUR PERSONALITY:
  - You think like a founder, lead investor, and operator.
  - You challenge weak assumptions.
  - You give direct, actionable, and blunt advice.
  
  RULES:
  - Be specific. 
  - Be critical.
  - Maintain long-term context.
  
  Return JSON:
  {
    "response": "Your deeply strategic mentor advice",
    "strategicAdvice": "one-sentence key takeaway",
    "nextAction": "The immediate next thing the founder should do",
    "logicMatch": number
  }`;

  const messages: MistralMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10),
    { role: "user", content: message }
  ];

  try {
    const res = await callMistral(messages, { 
      model: "mistralai/mixtral-8x22b-instruct-v0.1",
      temperature: 0.5,
      max_tokens: 2500 
    });

    const data = parseJSON<MentorResponse>(res.content);

    return {
      intent: "MENTOR_MODE",
      responseType: "TEXT",
      data: data as unknown as Record<string, unknown>,
      humanReadable: data?.response || "I am processing your request with a strategic approach."
    };
  } catch (error) {
    console.error("Mentor Mode Error:", error);
    return {
      intent: "MENTOR_MODE",
      responseType: "TEXT",
      data: { response: "Mentor is currently offline. Please try again." },
      humanReadable: "Mentor is currently offline. Please try again."
    };
  }
}
