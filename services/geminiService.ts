import { GoogleGenAI } from "@google/genai";
import { Habit, CheckInRecord } from "../types";

// Safety check for API key availability
const apiKey = process.env.API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getHabitAdvice = async (
  habits: Habit[],
  checkIns: CheckInRecord[]
): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure the environment variable to use AI features.";
  }

  // Prepare context data
  const habitSummary = habits.map(h => 
    `- ${h.title} (${h.type}): Streak ${h.streak}, Completed Today: ${h.isCompletedToday}, Total Checkins: ${checkIns.filter(c => c.habitId === h.id).length}`
  ).join('\n');

  const prompt = `
    You are a gamified habit tracker assistant. Analyze the following user habit data:
    
    ${habitSummary}
    
    Provide 3 concise, motivating, and actionable tips to help the user improve their habit consistency. 
    Analyze which time of day might be best based on the types (inference). 
    Keep the tone friendly, encouraging, and "game-like" (mentioning leveling up or keeping streaks).
    Output format: Markdown bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Keep going! You're doing great.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate insights at the moment. Please try again later.";
  }
};

export const generateCardImage = async (figureName: string, title: string): Promise<string | null> => {
  if (!ai) return null;
  
  const prompt = `Create a cute, vibrant, trading card style illustration of the Chinese Taoist figure: ${figureName} (${title}). 
  Style: Flat vector art, colorful, sticker-like, white background, chibi proportion. 
  The image should look like a collectible game card asset.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};