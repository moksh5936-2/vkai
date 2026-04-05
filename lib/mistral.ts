export type MistralMessage = {
  role: "system" | "user" | "assistant";
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
};

export type MistralResponse = {
  content: string;
  id: string;
  model: string;
};

export type Intent = "GENERAL_CHAT" | "IDEA_VALIDATION" | "MARKET_RESEARCH" | "PITCH_DECK" | "BUSINESS_MODEL" | "FINANCIAL_PROJECTIONS" | "INVESTOR_MATCH" | "MENTOR_MODE";

export interface AgentResponse {
  intent: Intent;
  responseType: "TEXT" | "STRUCTURED" | "MARKET_DATA" | "CHART";
  data: Record<string, unknown>;
  humanReadable: string;
  nextAction?: string;
  generatedFile?: {
    name: string;
    type: string;
    content: string;
  };
}

export async function callMistral(
  messages: MistralMessage[],
  options: { 
    temperature?: number; 
    max_tokens?: number; 
    model?: string;
    response_format?: { type: "json_object" | "text" } 
  } = {}
) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  const baseUrl = process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const model = options.model || process.env.MISTRAL_MODEL || "mistralai/mixtral-8x22b-instruct-v0.1";

  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is missing");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 2048,
        response_format: options.response_format,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      id: data.id,
      model: data.model,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Mistral AI request timed out (30s)");
    }
    throw error;
  }
}

export function parseJSON<T>(content: string): T | null {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return JSON.parse(content) as T;
  } catch (e) {
    console.error("Failed to parse JSON from Mistral response:", e);
    return null;
  }
}

export function buildImageMessage(base64: string, mimeType: string, prompt: string): MistralMessage {
  return {
    role: "user",
    content: [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}` },
      },
    ],
  };
}

export function buildDocumentMessage(text: string, fileName: string, prompt: string): MistralMessage {
  return {
    role: "user",
    content: `File Name: ${fileName}\nContent:\n${text}\n\nTask: ${prompt}`,
  };
}
