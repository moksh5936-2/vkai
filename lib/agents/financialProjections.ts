import { callMistral, parseJSON, MistralMessage, AgentResponse } from "../mistral";

interface Projection {
  year: number;
  revenue: number;
  costs: number;
  profit: number;
  growth: number;
}

interface FinancialData {
  assumptions: string[];
  projections: Projection[];
  breakEvenMonth: number;
  fundingRequired: number;
  keyRisks: string[];
  optimisticCase: string;
  pessimisticCase: string;
}

export async function financialProjectionsAgent(
  message: string, 
  history: MistralMessage[], 
  _context: { sessionId: string }
): Promise<AgentResponse> {
  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are a startup CFO. Create 3-year financial projections based on the user's startup model.
      
      Respond with a JSON object containing:
      - assumptions: string[]
      - projections: Array<{ year: number; revenue: number; costs: number; profit: number; growth: number }>
      - breakEvenMonth: number (from launch)
      - fundingRequired: number
      - keyRisks: string[]
      - optimisticCase: string
      - pessimisticCase: string
      
      Return ONLY JSON. No other text.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.3, response_format: { type: "json_object" } });
    const data = parseJSON<FinancialData>(result.content);

    let generatedFile = undefined;
    if (data && data.projections) {
      const csvLines = ["Year,Revenue,Costs,Profit,Growth"];
      data.projections.forEach((p: Projection) => {
        csvLines.push(`${p.year},${p.revenue},${p.costs},${p.profit},${p.growth}%`);
      });
        
      generatedFile = {
        name: "financial_projections.csv",
        type: "financial_csv",
        content: csvLines.join('\n'),
      };
    }

    return {
      intent: "FINANCIAL_PROJECTIONS",
      responseType: "STRUCTURED",
      data: data as unknown as Record<string, unknown>,
      humanReadable: "I have calculated your 3-year financial roadmap based on current assumptions.",
      generatedFile,
    };
  } catch (error) {
    throw error;
  }
}
