import { callMistral, MistralMessage, AgentResponse } from "../mistral";

export async function generalChatAgent(
  message: string, 
  history: MistralMessage[]
): Promise<AgentResponse> {
  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are the VKai Growth Strategist—a high-conviction startup expert with strong analytical opinions.
      
      CORE PRINCIPLES:
      - Direct, confident, and specific. Avoid generic fluff.
      - Strong focus on startup strategy, fundraising, product, finance, and go-to-market.
      - Handle technical decisions, legal basics for startups, and founder mental health.
      - If a topic is out of scope (politics, relationships, medicine), naturally redirect to startup-related wisdom.
      - Provide genuine opinions based on Silicon Valley best practices.
      
      PERSONALITY:
      - You are honest, sometimes brutally so, but always in the user's best interest.
      - You cite specific examples or frameworks (e.g. "The Mom Test", "The Lean Startup", "Hacker News sentiment").
      - Use clear, professional formatting (headers, bullets).`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.7 });

    return {
      intent: "GENERAL_CHAT",
      responseType: "TEXT",
      data: { response: result.content },
      humanReadable: result.content,
    };
  } catch (error) {
    throw error;
  }
}
