import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

let aiClient: GoogleGenAI | null = null;

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
    return "系统离线: 未连接神经中枢 (API Key Missing)";
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

    return response.text || "数据传输中断";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "错误: 信号丢失 (Connection Refused)";
  }
};