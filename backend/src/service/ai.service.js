import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeMarket = async (research, businesses) => {
  const prompt = `
    You are a professional market research analyst.

    Analyse the following market research information.

    INDUSTRY: ${research.industry}
    LOCATION: ${research.location}
    BUSINESS IDEA: ${research.business_description}

    BUSINESSES DISCOVERED:
    ${JSON.stringify(businesses)}

    Provide:
    1. Market overview
    2. Competitor analysis
    3. Pricing observations (only where evidence exists)
    4. Marketing strategies competitors appear to use
    5. Market opportunities
    6. Recommendations for someone entering this market.

    Important:
    - Use only the information provided.
    - Do not invent statistics, prices, or facts.
    - Clearly identify information that is unavailable.
    - Distinguish observed evidence from your own recommendations.
  `;

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      break;
    } catch (error) {
      const retryableErrors = [429, 500, 503];

      if (!retryableErrors.includes(error.status) || attempt === 3) {
        throw error;
      }

      console.log(`Gemini attempt ${attempt} failed. Retrying...`);

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
      );
    }
  }

  return response.text;
};

export const analyzeNiche = async (research, businesses) => {
  const prompt = `
    You are a professional market research analyst.

    Research:
    ${JSON.stringify(research)}

    Discovered businesses:
    ${JSON.stringify(businesses)}

    Return ONLY valid JSON with these fields:

    {
      "nicheTitle": "string",
      "track": "${research.track}",
      "executiveSummary": "string",
      "benchmarks": {
        "rampTime": "string",
        "rateRange": "string",
        "primaryGrowthLever": "string",
        "commonPitfall": "string"
      },
      "marketingHighlights": [],
      "customerComplaints": [],
      "veteranInsights": [],
      "competitors": [],
      "sources": []
    }

    Rules:
    - Use only evidence from the research provided.
    - Never invent statistics, prices, or facts.
    - Use empty arrays when information is unavailable.
    - Sources must contain actual URLs from the discovered businesses.
    - The track must be one of: entrepreneur, freelancer, creator, digital_seller.
  `;

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      break;
    } catch (error) {
      const retryableErrors = [500, 503];

      if (!retryableErrors.includes(error.status) || attempt === 3) {
        console.error("Gemini API error:", {
          status: error.status,
          message: error.message,
        });

        throw error;
      }

      console.log(`Gemini attempt ${attempt} failed. Retrying...`);

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
      );
    }
  }

  return JSON.parse(response.text);
};


// Shared structured-research helper for the frontend's additional tools.
const parseStructuredResponse = (raw) => {
  const text = (raw || "").trim();
  if (!text) throw new Error("The AI returned an empty response.");

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The AI returned an invalid JSON response.");
    return JSON.parse(match[0]);
  }
};

export const generateResearchJson = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  const data = parseStructuredResponse(response.text);
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seen = new Set();
  const sources = [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({ uri, title: chunk.web.title || uri });
    }
  }

  return { data, sources: sources.slice(0, 8) };
};
