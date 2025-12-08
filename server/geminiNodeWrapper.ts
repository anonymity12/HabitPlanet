
import { GoogleGenAI } from "@google/genai";
import { Habit, CheckInRecord } from "../types";

// In a real backend, this would be process.env.API_KEY loaded from .env file
// 在真实后端，这里会从 .env 文件加载 API Key
const apiKey = process.env.API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GeminiService = {
  /**
   * Generate habit advice
   * 生成习惯建议
   */
  async generateAdvice(habits: Habit[], checkIns: CheckInRecord[]): Promise<string> {
    if (!ai) return "AI Service Unavailable (Missing Key)";

    const habitSummary = habits.map(h => 
      `- ${h.title} (${h.type}): Streak ${h.streak}, Today: ${h.isCompletedToday}`
    ).join('\n');

    const prompt = `
      You are a habit coach. User Stats:
      ${habitSummary}
      Provide 3 short, punchy tips to improve consistency. Use emojis.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Keep it up!";
    } catch (e) {
      console.error("Gemini Error:", e);
      return "Keep going!";
    }
  },

  /**
   * Generate card image
   * 生成卡牌图片
   */
  async generateCardArt(figureName: string, title: string): Promise<string | null> {
    if (!ai) return null;

    const prompt = `Trading card illustration of Taoist figure: ${figureName} (${title}). Chibi style, vector art, white background.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (e) {
      console.error("Gemini Image Error:", e);
      return null;
    }
  }
};
