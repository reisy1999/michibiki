import { GoogleGenAI, Content } from "@google/genai";

const ai = new GoogleGenAI({});

const MODEL = "gemini-3-flash-preview";

export async function chat(
  contents: Content[],
  systemInstruction?: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: systemInstruction ? { systemInstruction } : undefined,
  });

  return response.text ?? "";
}