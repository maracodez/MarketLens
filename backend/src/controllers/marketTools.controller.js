import { generateResearchJson } from "../service/ai.service.js";

const normalizeTrack = (track) =>
  ["entrepreneur", "freelancer", "creator", "digital_seller"].includes(track)
    ? track
    : "entrepreneur";

const asArray = (value) => (Array.isArray(value) ? value : []);

const competitorDefaults = (data) => ({
  id: `comp-${Date.now()}`,
  track: normalizeTrack(data.track),
  name: data.name || "Unknown business",
  domain: data.domain || "",
  niche: data.niche || "",
  offerSummary: data.offerSummary || "",
  pricingTier: data.pricingTier || "Not available",
  productsAndPrices: asArray(data.productsAndPrices),
  socialHandles: asArray(data.socialHandles),
  acquisitionChannel: data.acquisitionChannel || "Not available",
  marketingStrategies: asArray(data.marketingStrategies),
  customerComplaints: asArray(data.customerComplaints),
  positioningEdge: data.positioningEdge || "Not available",
  exploitableGap: data.exploitableGap || "Not available",
  messagingHooks: asArray(data.messagingHooks),
  offerLadder: asArray(data.offerLadder),
  counterStrategy: data.counterStrategy || "Not available",
  threatLevel: ["Direct", "Adjacent", "Emerging"].includes(data.threatLevel)
    ? data.threatLevel
    : "Direct",
});

export const analyzeCompetitor = async (req, res) => {
  try {
    const { query, track, niche } = req.body || {};
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        error: "Enter a business name, creator handle, or website URL.",
      });
    }

    const normalizedTrack = normalizeTrack(track);
    const prompt = `
You are MarketLens AI's competitive analyst. Research the real business or creator "${query.trim()}" in the context of "${(niche || "their primary industry").trim()}".

Use Google Search. Return one JSON object with exactly these fields:
{
  "name": "business or creator name",
  "domain": "official website URL or empty string",
  "niche": "industry/niche",
  "offerSummary": "what they sell or provide",
  "pricingTier": "observed price range or Not available",
  "productsAndPrices": [{"item":"specific product/service","price":"observed price or Not available"}],
  "socialHandles": [{"platform":"Instagram","handle":"@handle","url":"profile URL"}],
  "acquisitionChannel": "main customer acquisition channel",
  "marketingStrategies": ["specific observed tactic"],
  "customerComplaints": ["complaint supported by reviews or public feedback"],
  "positioningEdge": "their apparent competitive advantage",
  "exploitableGap": "a plausible gap supported by available evidence",
  "messagingHooks": ["marketing angle"],
  "offerLadder": ["entry offer", "core offer", "premium offer"],
  "counterStrategy": "how a new entrant could compete",
  "threatLevel": "Direct, Adjacent, or Emerging"
}
Track: ${normalizedTrack}.
Rules: do not invent prices, social handles, complaints, or URLs. Use "Not available" or empty arrays when evidence is missing. Return valid JSON only.
`;
    const { data, sources } = await generateResearchJson(prompt);
    const result = competitorDefaults({ ...data, track: normalizedTrack, niche });
    return res.status(200).json({ ...result, sources, isCustom: true });
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return res.status(error.status === 429 ? 429 : 500).json({
      error: error.status === 429
        ? "AI quota exceeded. Please try again after your quota resets."
        : "Unable to analyze this competitor.",
    });
  }
};

export const generatePlaybook = async (req, res) => {
  try {
    const { track, dilemma, niche } = req.body || {};
    if (typeof dilemma !== "string" || !dilemma.trim()) {
      return res.status(400).json({
        error: "Describe the business question or challenge to research.",
      });
    }

    const normalizedTrack = normalizeTrack(track);
    const prompt = `
You are MarketLens AI. Research practical approaches used by experienced operators with at least five years of experience in this field.
Track: ${normalizedTrack}
Niche: ${niche || "independent business"}
Challenge: ${dilemma.trim()}

Return valid JSON only:
{
 "operatorName":"real named operator if verifiable, otherwise 'Experienced operators in this niche'",
 "roleTitle":"role",
 "yearsInBusiness":5,
 "businessModel":"how the operator earns revenue",
 "revenueMix":"known revenue streams; do not invent percentages",
 "summary":"practical summary",
 "nonObviousLesson":"important lesson",
 "shifts":[
   {"dimension":"Pricing","yearOne":"typical beginner approach","veteranToday":"more experienced approach"},
   {"dimension":"Marketing / Acquisition","yearOne":"...","veteranToday":"..."},
   {"dimension":"Operations","yearOne":"...","veteranToday":"..."}
 ],
 "checklist":["actionable step"]
}
Use evidence from search. Do not fabricate a person's identity, years in business, or private business metrics. If a named veteran cannot be verified, describe established operator practices generally and make that clear.
`;
    const { data, sources } = await generateResearchJson(prompt);
    return res.status(200).json({
      id: `playbook-${Date.now()}`,
      track: normalizedTrack,
      operatorName: data.operatorName || "Experienced operators in this niche",
      roleTitle: data.roleTitle || "",
      yearsInBusiness: Number(data.yearsInBusiness) || 0,
      businessModel: data.businessModel || "",
      revenueMix: data.revenueMix || "",
      summary: data.summary || "",
      nonObviousLesson: data.nonObviousLesson || "",
      shifts: asArray(data.shifts),
      checklist: asArray(data.checklist),
      sources,
      isCustom: true,
    });
  } catch (error) {
    console.error("Playbook generation error:", error);
    return res.status(error.status === 429 ? 429 : 500).json({
      error: error.status === 429
        ? "AI quota exceeded. Please try again after your quota resets."
        : "Unable to generate the veteran playbook.",
    });
  }
};

export const generatePositioning = async (req, res) => {
  try {
    const { track, niche, competitors, veteranModel, userStrength } = req.body || {};
    if (!(niche || "").trim() && !(userStrength || "").trim()) {
      return res.status(400).json({
        error: "Provide your business idea or strength to generate a market decision report.",
      });
    }

    const competitorSummary = asArray(competitors)
      .map((item) => `- ${item.name || "Competitor"} (${item.pricingTier || "price unknown"}): ${item.exploitableGap || "No gap supplied"}`)
      .join("\n");

    const prompt = `
You are MarketLens AI's market-entry strategy advisor.
Track: ${normalizeTrack(track)}
Niche: ${niche || "not specified"}
User's strength/resources: ${userStrength || "not specified"}
Veteran model to learn from: ${veteranModel || "not specified"}
Competitor evidence:
${competitorSummary || "No competitor details supplied."}

Return valid JSON only:
{
 "targetSegment":"specific customer segment",
 "corePromise":"clear value proposition",
 "pricingAnchor":"pricing recommendation with assumptions clearly stated",
 "weeklyCadence":"practical weekly marketing and sales rhythm",
 "firstThreeMoves":["specific move 1","specific move 2","specific move 3"]
}
Do not invent competitor facts. Separate recommendations from observed evidence. Keep actions realistic for a new entrant.
`;
    const { data } = await generateResearchJson(prompt);
    return res.status(200).json({
      targetSegment: data.targetSegment || "",
      corePromise: data.corePromise || "",
      pricingAnchor: data.pricingAnchor || "",
      weeklyCadence: data.weeklyCadence || "",
      firstThreeMoves: asArray(data.firstThreeMoves),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Positioning report error:", error);
    return res.status(error.status === 429 ? 429 : 500).json({
      error: error.status === 429
        ? "AI quota exceeded. Please try again after your quota resets."
        : "Unable to generate the positioning report.",
    });
  }
};
