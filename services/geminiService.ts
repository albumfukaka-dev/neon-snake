import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

let aiClient: GoogleGenAI | null = null;

// Initialize the client safely
try {
  if (process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const generateGameCommentary = async (
  context: string
): Promise<string> => {
  if (!aiClient) {
    return "SYSTEM_OFFLINE: Connect API Key for Neural Link.";
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: ${context}. Generate a short commentary.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 60,
        temperature: 0.8,
      },
    });

    return response.text || "NO_DATA_RECEIVED";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ERR_CONNECTION_REFUSED: AI module unreachable.";
  }
};
