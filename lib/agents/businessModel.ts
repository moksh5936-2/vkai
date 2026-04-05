import { callMistral, parseJSON, MistralMessage, AgentResponse } from "../mistral";

export async function businessModelAgent(
  message: string, 
  history: MistralMessage[], 
  context: { sessionId: string }
): Promise<AgentResponse> {
  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are a Lean Startup strategy expert. Build a detailed Lean Canvas and revenue model analysis.
      
      Respond with a JSON object containing:
      - leanCanvas: { 
          problem: string, solution: string, keyMetrics: string, 
          valueProposition: string, unfairAdvantage: string, 
          channels: string, customerSegments: string, 
          costStructure: string, revenueStreams: string 
        }
      - revenueModelType: string
      - unitEconomics: { 
          cac: number, ltv: number, ratio: number, 
          paybackPeriod: number, targetMargin: number 
        }
      - recommendation: string (2-3 sentences)
      
      Return ONLY JSON. No other text.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.3, response_format: { type: "json_object" } });
    const data = parseJSON<any>(result.content);

    let generatedFile = undefined;
    if (data && data.leanCanvas) {
      const fileContent = `LEAN CANVAS\n\n` + 
        Object.entries(data.leanCanvas).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n\n') +
        `REVENUE MODEL: ${data.revenueModelType}\n\n` + 
        `RECOMMENDATION: ${data.recommendation}`;
        
      generatedFile = {
        name: "business_model_canvas.txt",
        type: "lean_canvas_txt",
        content: fileContent,
      };
    }

    return {
      intent: "BUSINESS_MODEL",
      responseType: "STRUCTURED",
      data,
      humanReadable: data?.recommendation || "Here is your detailed business model analysis.",
      generatedFile,
    };
  } catch (error) {
    throw error;
  }
}
