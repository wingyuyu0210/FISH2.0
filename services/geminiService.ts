import { GoogleGenAI, Type } from "@google/genai";
import { EconomicEvent, ImpactLevel, MarketBriefing } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper to get today's date context
const getTodayContext = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const generateDailyBriefing = async (watchlist: string[]): Promise<MarketBriefing> => {
  if (watchlist.length === 0) throw new Error("关注列表为空");

  const prompt = `
    You are an expert financial analyst for a professional trader.
    Today is ${getTodayContext()} (YYYY-MM-DD).
    
    Determine the current global market session based on the current time:
    - Asian Session (UTC 00:00 - 08:00)
    - European Session (UTC 07:00 - 16:00)
    - US Session (UTC 13:30 - 20:00)
    
    Review the market performance for the following assets: ${watchlist.join(', ')}.
    
    Provide a "Session Market Observation" report in Simplified Chinese (简体中文).
    1. Focus on the LATEST news and price action relevant to the CURRENT or UPCOMING session.
    2. Identify the primary catalyst (news, data, or technicals) driving the moves (in Chinese).
    3. Provide a sentiment score from 0 (Extreme Fear) to 100 (Extreme Greed).
    
    Use Google Search to ensure all data is up-to-the-minute.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Detailed Markdown summary of session market action in Simplified Chinese." },
            keyTakeaways: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 bullet points of crucial info in Simplified Chinese."
            },
            sentimentScore: { type: Type.NUMBER, description: "0-100 score" },
          },
          required: ["summary", "keyTakeaways", "sentimentScore"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      date: getTodayContext(),
      summary: json.summary,
      keyTakeaways: json.keyTakeaways,
      sentimentScore: json.sentimentScore,
      sources: sources
    };
  } catch (error) {
    console.error("Briefing Generation Error:", error);
    throw error;
  }
};

export const fetchWeeklyEvents = async (watchlist: string[]): Promise<EconomicEvent[]> => {
  if (watchlist.length === 0) return [];

  const todayStr = getTodayContext();

  const prompt = `
    Today is ${todayStr} (YYYY-MM-DD).
    Find the major economic events, earnings releases, and data prints specifically relevant to these assets: ${watchlist.join(', ')}.
    Focus on the current week.
    
    Return a raw JSON list of events. 
    Translate the 'event' description, 'forecast', and 'relatedAsset' into Simplified Chinese (简体中文).
    ENSURE the 'date' field is strictly in "YYYY-MM-DD" format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Date of event (YYYY-MM-DD)" },
              time: { type: Type.STRING, description: "Time of event (include timezone if possible)" },
              event: { type: Type.STRING, description: "Name of the event in Chinese (e.g., CPI 数据, 苹果财报)" },
              impact: { type: Type.STRING, enum: [ImpactLevel.HIGH, ImpactLevel.MEDIUM, ImpactLevel.LOW] },
              forecast: { type: Type.STRING, description: "Consensus forecast in Chinese if available" },
              relatedAsset: { type: Type.STRING, description: "The specific asset affected" }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Calendar Fetch Error:", error);
    return [];
  }
};
