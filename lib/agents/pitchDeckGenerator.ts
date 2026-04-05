import { callMistral, parseJSON, MistralMessage, AgentResponse } from "../mistral";

interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNote: string;
}

interface PitchDeckData {
  deckTitle: string;
  slides: Slide[];
  fundingAsk: string;
  keyMetric: string;
}

export async function pitchDeckAgent(
  message: string, 
  history: MistralMessage[], 
  _context: { sessionId: string }
): Promise<AgentResponse> {
  const prompt: MistralMessage[] = [
    {
      role: "system",
      content: `You are an expert venture capitalist. Create a detailed pitch deck structure for the user's startup.
      
      Respond with a JSON object containing:
      - deckTitle: string
      - slides: Array<{ slideNumber: number; title: string; bullets: string[]; speakerNote: string }>
      - fundingAsk: string
      - keyMetric: string (e.g. "Monthly Recurring Revenue", "User Growth Rate")
      
      Suggest exactly 10-12 slides. Return ONLY JSON. No other text.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await callMistral(prompt, { temperature: 0.3, response_format: { type: "json_object" } });
    const data = parseJSON<PitchDeckData>(result.content);

    let generatedFile = undefined;
    if (data) {
      const fileContent = `PITCH DECK: ${data.deckTitle}\n\n` + 
        data.slides.map((s: Slide) => `Slide ${s.slideNumber}: ${s.title}\n- ${s.bullets.join('\n- ')}\n\nSpeaker Notes: ${s.speakerNote}\n\n`).join('\n') +
        `FUNDING ASK: ${data.fundingAsk}\nKEY METRIC: ${data.keyMetric}`;
        
      generatedFile = {
        name: "pitch_deck.txt",
        type: "pitch_deck_txt",
        content: fileContent,
      };
    }

    return {
      intent: "PITCH_DECK",
      responseType: "STRUCTURED",
      data: data as unknown as Record<string, unknown>,
      humanReadable: "I have generated a comprehensive 10-slide pitch deck structure for you.",
      generatedFile,
    };
  } catch (error) {
    throw error;
  }
}
