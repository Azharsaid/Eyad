
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCurrencyInsights = async (base: string, target: string, rate: number): Promise<AIInsight> => {
  try {
    const prompt = `Provide a short financial insight about the currency pair ${base} to ${target}. 
    The current exchange rate is 1 ${base} = ${rate} ${target}.
    The user is looking at this via 'Dar Al Dawa' (a leading pharmaceutical company) portal. 
    Mention a brief fact about one of these markets and a potential business implication.
    Keep it professional, encouraging, and under 80 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            sentiment: { 
              type: Type.STRING,
              description: "One of: positive, neutral, or negative"
            }
          },
          required: ["title", "content", "sentiment"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Market Insight Unavailable",
      content: "We couldn't reach the AI analyst at this moment. Please try again later.",
      sentiment: "neutral"
    };
  }
};
