import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GroundingSource {
  title: string;
  uri: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your key in the Settings > Secrets panel."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function normalizeTrack(track?: string): "entrepreneur" | "freelancer" | "creator" | "digital_seller" {
  if (
    track === "freelancer" ||
    track === "creator" ||
    track === "digital_seller"
  ) {
    return track;
  }
  return "entrepreneur";
}

function extractGroundingSources(response: unknown): GroundingSource[] {
  const candidate = (
    response as {
      candidates?: Array<{
        groundingMetadata?: {
          groundingChunks?: Array<{
            web?: { uri?: string; title?: string };
          }>;
        };
      }>;
    }
  )?.candidates?.[0];

  const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        uri,
        title: chunk.web?.title || uri,
      });
    }
  }
  return sources.slice(0, 8);
}

function safeParseJson<T>(raw: string | undefined): T {
  const text = (raw ?? "").trim();
  if (!text) {
    throw new Error("Empty response returned from Gemini.");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("Unable to parse structured intelligence response.");
  }
}

function extractErrorDetails(err: unknown): { message: string; status: number } {
  const raw = err instanceof Error ? err.message : "Unexpected error generating research.";
  let parsedMessage = raw;
  let parsedCode: number | undefined;
  let parsedStatus: string | undefined;

  try {
    const outer = JSON.parse(raw) as {
      error?: { code?: number; message?: string; status?: string };
      message?: string;
    };
    if (outer?.error?.message) {
      parsedMessage = outer.error.message;
      parsedCode = outer.error.code;
      parsedStatus = outer.error.status;
    } else if (outer?.message) {
      parsedMessage = outer.message;
    }
  } catch {
    // Raw message is already plain text
  }

  const lower = `${parsedMessage} ${parsedStatus ?? ""}`.toLowerCase();

  if (
    parsedCode === 403 ||
    lower.includes("permission_denied") ||
    lower.includes("leaked") ||
    lower.includes("api_key_invalid") ||
    lower.includes("api key not valid") ||
    lower.includes("gemini_api_key")
  ) {
    return {
      status: parsedCode === 403 ? 403 : 400,
      message:
        "Your Gemini API key is invalid or was reported as leaked. Please add a fresh GEMINI_API_KEY in the Settings > Secrets panel and try again.",
    };
  }

  if (parsedCode === 429 || lower.includes("resource_exhausted")) {
    return {
      status: 429,
      message:
        "Gemini API rate limit or quota exceeded. Please wait a moment or check your billing tier in Settings > Secrets.",
    };
  }

  return {
    status: parsedCode && parsedCode >= 400 && parsedCode < 600 ? parsedCode : 500,
    message: parsedMessage,
  };
}

function handleApiError(res: Response, err: unknown) {
  const { status, message } = extractErrorDetails(err);
  res.status(status).json({ error: message });
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/api/research/niche", async (req: Request, res: Response) => {
  try {
    const { track, niche, audience, location } = req.body as {
      track?: string;
      niche?: string;
      audience?: string;
      location?: string;
    };

    if (!niche || !niche.trim()) {
      res.status(400).json({ error: "Please enter a business idea or niche to research." });
      return;
    }

    const ai = getGeminiClient();
    const normalizedTrack = normalizeTrack(track);
    const trackLabel =
      normalizedTrack === "freelancer"
        ? "Independent Freelancer / Service Provider"
        : normalizedTrack === "creator"
        ? "Content Creator / Media Brand"
        : normalizedTrack === "digital_seller"
        ? "Digital Product Seller"
        : "Aspiring Entrepreneur / Small Business Owner";

    const prompt = `A user entered this business idea / niche query: "${niche.trim()}"${
      audience ? ` (Target audience: "${audience.trim()}")` : ""
    }${location ? ` (Location / Market: "${location.trim()}")` : ""}.
Their operator profile is: "${trackLabel}".

Use Google Search to research REAL businesses, business owners, and content creators currently operating in this exact industry and region.
Return:
1. nicheTitle: Crisp cleaned market title (e.g. "Contemporary Fashion Retail in Nigeria").
2. executiveSummary: 2-3 crisp sentences explaining how businesses in this industry currently operate, sell, and attract customers.
3. benchmarks:
   - rampTime (realistic timeline to steady traction)
   - rateRange (real product/service price ranges in the relevant local or global currency)
   - primaryGrowthLever (what drives real sales today)
   - commonPitfall (most common mistake newcomers make)
4. marketingHighlights: 4 concrete marketing strategies active businesses and creators in this niche are using right now (e.g., Instagram Reels try-ons, WhatsApp broadcast lists, influencer seeding, TikTok hooks).
5. customerComplaints: 4 common customer complaints observed in reviews/comments for this niche, each paired with the concrete market opportunity it creates.
6. veteranInsights: 2 profiles of established operators/founders/creators (5+ years in business) in this space showing how their Year 1 differed from how they operate today across 3 dimensions (Pricing, Marketing/Acquisition, Operations/Fulfillment), plus nonObviousLesson and a 3-item action checklist.
7. competitors: 4 real operating businesses or creators in this exact niche/region with:
   - name, domain
   - offerSummary
   - pricingTier (overall range in relevant currency)
   - productsAndPrices (2-3 specific products or services and their real/typical prices)
   - socialHandles (2-3 real or verified social media platforms & handles like Instagram @handle, TikTok @handle, YouTube, X, LinkedIn, with full URLs where known)
   - acquisitionChannel
   - marketingStrategies (2-3 specific tactics they use)
   - customerComplaints (2 common customer complaints or friction points)
   - positioningEdge, exploitableGap, 2 messagingHooks, 2-3 offerLadder tiers, counterStrategy, threatLevel ("Direct", "Adjacent", or "Emerging").`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          "You are MarketLens AI, a practical market research analyst for aspiring entrepreneurs, small business owners, freelancers, digital product sellers, and content creators. Always ground results in real businesses, real social handles, realistic local/global product prices, and genuine customer complaints found via search.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nicheTitle: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            benchmarks: {
              type: Type.OBJECT,
              properties: {
                rampTime: { type: Type.STRING },
                rateRange: { type: Type.STRING },
                primaryGrowthLever: { type: Type.STRING },
                commonPitfall: { type: Type.STRING },
              },
              required: ["rampTime", "rateRange", "primaryGrowthLever", "commonPitfall"],
            },
            marketingHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            customerComplaints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  complaint: { type: Type.STRING },
                  opportunity: { type: Type.STRING },
                },
                required: ["complaint", "opportunity"],
              },
            },
            veteranInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  operatorName: { type: Type.STRING },
                  roleTitle: { type: Type.STRING },
                  yearsInBusiness: { type: Type.INTEGER },
                  businessModel: { type: Type.STRING },
                  revenueMix: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  nonObviousLesson: { type: Type.STRING },
                  shifts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dimension: { type: Type.STRING },
                        yearOne: { type: Type.STRING },
                        veteranToday: { type: Type.STRING },
                      },
                      required: ["dimension", "yearOne", "veteranToday"],
                    },
                  },
                  checklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "operatorName",
                  "roleTitle",
                  "yearsInBusiness",
                  "businessModel",
                  "revenueMix",
                  "summary",
                  "nonObviousLesson",
                  "shifts",
                  "checklist",
                ],
              },
            },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  domain: { type: Type.STRING },
                  offerSummary: { type: Type.STRING },
                  pricingTier: { type: Type.STRING },
                  productsAndPrices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        price: { type: Type.STRING },
                      },
                      required: ["item", "price"],
                    },
                  },
                  socialHandles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        platform: { type: Type.STRING },
                        handle: { type: Type.STRING },
                        url: { type: Type.STRING },
                      },
                      required: ["platform", "handle"],
                    },
                  },
                  acquisitionChannel: { type: Type.STRING },
                  marketingStrategies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  customerComplaints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  positioningEdge: { type: Type.STRING },
                  exploitableGap: { type: Type.STRING },
                  messagingHooks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  offerLadder: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  counterStrategy: { type: Type.STRING },
                  threatLevel: { type: Type.STRING },
                },
                required: [
                  "name",
                  "domain",
                  "offerSummary",
                  "pricingTier",
                  "productsAndPrices",
                  "socialHandles",
                  "acquisitionChannel",
                  "marketingStrategies",
                  "customerComplaints",
                  "positioningEdge",
                  "exploitableGap",
                  "messagingHooks",
                  "offerLadder",
                  "counterStrategy",
                  "threatLevel",
                ],
              },
            },
          },
          required: [
            "nicheTitle",
            "executiveSummary",
            "benchmarks",
            "marketingHighlights",
            "customerComplaints",
            "veteranInsights",
            "competitors",
          ],
        },
      },
    });

    const parsed = safeParseJson<Record<string, unknown>>(response.text);
    const sources = extractGroundingSources(response);

    const veteranInsights = Array.isArray(parsed.veteranInsights)
      ? parsed.veteranInsights.map((item: Record<string, unknown>, idx: number) => ({
          id: `live-vet-${Date.now()}-${idx}`,
          track: normalizedTrack,
          ...item,
          shifts: Array.isArray(item.shifts) ? item.shifts : [],
          checklist: Array.isArray(item.checklist) ? item.checklist : [],
          sources,
          isCustom: true,
        }))
      : [];

    const competitors = Array.isArray(parsed.competitors)
      ? parsed.competitors.map((item: Record<string, unknown>, idx: number) => ({
          id: `live-comp-${Date.now()}-${idx}`,
          track: normalizedTrack,
          niche: (parsed.nicheTitle as string) || niche.trim(),
          ...item,
          productsAndPrices: Array.isArray(item.productsAndPrices)
            ? item.productsAndPrices
            : [],
          socialHandles: Array.isArray(item.socialHandles) ? item.socialHandles : [],
          marketingStrategies: Array.isArray(item.marketingStrategies)
            ? item.marketingStrategies
            : [],
          customerComplaints: Array.isArray(item.customerComplaints)
            ? item.customerComplaints
            : [],
          messagingHooks: Array.isArray(item.messagingHooks)
            ? item.messagingHooks
            : [],
          offerLadder: Array.isArray(item.offerLadder) ? item.offerLadder : [],
          threatLevel:
            item.threatLevel === "Direct" ||
            item.threatLevel === "Adjacent" ||
            item.threatLevel === "Emerging"
              ? item.threatLevel
              : "Direct",
          sources,
          isCustom: true,
        }))
      : [];

    res.json({
      nicheTitle: parsed.nicheTitle || niche.trim(),
      track: normalizedTrack,
      executiveSummary: parsed.executiveSummary || "",
      benchmarks: parsed.benchmarks,
      marketingHighlights: Array.isArray(parsed.marketingHighlights)
        ? parsed.marketingHighlights
        : [],
      customerComplaints: Array.isArray(parsed.customerComplaints)
        ? parsed.customerComplaints
        : [],
      veteranInsights,
      competitors,
      sources,
    });
  } catch (err) {
    handleApiError(res, err);
  }
});

app.post("/api/research/competitor", async (req: Request, res: Response) => {
  try {
    const { query, track, niche } = req.body as {
      query?: string;
      track?: string;
      niche?: string;
    };

    if (!query || !query.trim()) {
      res.status(400).json({ error: "Enter a business name, creator handle, or website URL." });
      return;
    }

    const ai = getGeminiClient();
    const normalizedTrack = normalizeTrack(track);

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Analyze the business or creator "${query.trim()}" in the context of "${
        niche?.trim() || "their primary industry"
      }". Use Google Search to find their real website/domain, social media accounts (Instagram, TikTok, YouTube, X, LinkedIn), actual products/services and prices, marketing strategies, common customer complaints, and market gaps a new entrant can serve better.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          "You are MarketLens AI's competitive analyst. Return strictly search-grounded JSON matching the schema with concrete product prices, social media handles, marketing tactics, and customer pain points.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            domain: { type: Type.STRING },
            niche: { type: Type.STRING },
            offerSummary: { type: Type.STRING },
            pricingTier: { type: Type.STRING },
            productsAndPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  price: { type: Type.STRING },
                },
                required: ["item", "price"],
              },
            },
            socialHandles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  handle: { type: Type.STRING },
                  url: { type: Type.STRING },
                },
                required: ["platform", "handle"],
              },
            },
            acquisitionChannel: { type: Type.STRING },
            marketingStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            customerComplaints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            positioningEdge: { type: Type.STRING },
            exploitableGap: { type: Type.STRING },
            messagingHooks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            offerLadder: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            counterStrategy: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
          },
          required: [
            "name",
            "domain",
            "niche",
            "offerSummary",
            "pricingTier",
            "productsAndPrices",
            "socialHandles",
            "acquisitionChannel",
            "marketingStrategies",
            "customerComplaints",
            "positioningEdge",
            "exploitableGap",
            "messagingHooks",
            "offerLadder",
            "counterStrategy",
            "threatLevel",
          ],
        },
      },
    });

    const parsed = safeParseJson<Record<string, unknown>>(response.text);
    const sources = extractGroundingSources(response);

    res.json({
      id: `comp-${Date.now()}`,
      track: normalizedTrack,
      ...parsed,
      productsAndPrices: Array.isArray(parsed.productsAndPrices)
        ? parsed.productsAndPrices
        : [],
      socialHandles: Array.isArray(parsed.socialHandles) ? parsed.socialHandles : [],
      marketingStrategies: Array.isArray(parsed.marketingStrategies)
        ? parsed.marketingStrategies
        : [],
      customerComplaints: Array.isArray(parsed.customerComplaints)
        ? parsed.customerComplaints
        : [],
      messagingHooks: Array.isArray(parsed.messagingHooks)
        ? parsed.messagingHooks
        : [],
      offerLadder: Array.isArray(parsed.offerLadder) ? parsed.offerLadder : [],
      threatLevel:
        parsed.threatLevel === "Direct" ||
        parsed.threatLevel === "Adjacent" ||
        parsed.threatLevel === "Emerging"
          ? parsed.threatLevel
          : "Direct",
      sources,
      isCustom: true,
    });
  } catch (err) {
    handleApiError(res, err);
  }
});

app.post("/api/research/playbook", async (req: Request, res: Response) => {
  try {
    const { track, dilemma, niche } = req.body as {
      track?: string;
      dilemma?: string;
      niche?: string;
    };

    if (!dilemma || !dilemma.trim()) {
      res.status(400).json({ error: "Describe the business question or challenge to research." });
      return;
    }

    const ai = getGeminiClient();
    const normalizedTrack = normalizeTrack(track);

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `A newcomer in the "${normalizedTrack}" track (niche: "${
        niche?.trim() || "independent business"
      }") asks: "${dilemma.trim()}".
Search real-world veteran business owner, creator, or freelancer practices to build a structured Veteran Playbook showing how people with 5+ years in this business handle pricing, marketing, customer complaints, and operations compared to Year 1 beginners.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          "You distill real-world veteran operator practices into concrete, actionable playbooks. Focus on pricing, marketing channels, supplier/client boundaries, and practical next steps.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            operatorName: { type: Type.STRING },
            roleTitle: { type: Type.STRING },
            yearsInBusiness: { type: Type.INTEGER },
            businessModel: { type: Type.STRING },
            revenueMix: { type: Type.STRING },
            summary: { type: Type.STRING },
            nonObviousLesson: { type: Type.STRING },
            shifts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dimension: { type: Type.STRING },
                  yearOne: { type: Type.STRING },
                  veteranToday: { type: Type.STRING },
                },
                required: ["dimension", "yearOne", "veteranToday"],
              },
            },
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "operatorName",
            "roleTitle",
            "yearsInBusiness",
            "businessModel",
            "revenueMix",
            "summary",
            "nonObviousLesson",
            "shifts",
            "checklist",
          ],
        },
      },
    });

    const parsed = safeParseJson<Record<string, unknown>>(response.text);
    const sources = extractGroundingSources(response);

    res.json({
      id: `playbook-${Date.now()}`,
      track: normalizedTrack,
      ...parsed,
      sources,
      isCustom: true,
    });
  } catch (err) {
    handleApiError(res, err);
  }
});

app.post("/api/research/positioning", async (req: Request, res: Response) => {
  try {
    const { track, niche, competitors, veteranModel, userStrength } = req.body as {
      track?: string;
      niche?: string;
      competitors?: Array<{ name: string; exploitableGap: string; pricingTier: string }>;
      veteranModel?: string;
      userStrength?: string;
    };

    if (!niche?.trim() && !userStrength?.trim()) {
      res.status(400).json({ error: "Provide your business idea or strength to generate a market decision report." });
      return;
    }

    const ai = getGeminiClient();
    const compSummary = (competitors ?? [])
      .map((c) => `- ${c.name} (${c.pricingTier}): Gap is "${c.exploitableGap}"`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Generate an actionable Market Entry & Positioning Report for a new ${
        track || "entrepreneur"
      } entering "${niche || "their market"}".
User's unique edge / starting resources: "${userStrength || "fast execution and responsive customer service"}".
Veteran model to emulate: "${veteranModel || "Focused niche offering with transparent pricing"}".
Observed competitor gaps & complaints:
${compSummary || "- Competitors have slow customer response times and unclear pricing"}

Return targetSegment, corePromise, pricingAnchor, weeklyCadence (marketing & sales rhythm), and 3 concrete firstThreeMoves for the next 30 days.`,
      config: {
        systemInstruction:
          "You are MarketLens AI's strategy advisor. Produce crisp, practical launch decisions with realistic pricing anchors and marketing cadences.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetSegment: { type: Type.STRING },
            corePromise: { type: Type.STRING },
            pricingAnchor: { type: Type.STRING },
            weeklyCadence: { type: Type.STRING },
            firstThreeMoves: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "targetSegment",
            "corePromise",
            "pricingAnchor",
            "weeklyCadence",
            "firstThreeMoves",
          ],
        },
      },
    });

    const parsed = safeParseJson<Record<string, unknown>>(response.text);
    res.json({
      ...parsed,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleApiError(res, err);
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*splat", (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MarketLens AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
