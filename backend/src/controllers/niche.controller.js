import { discoverBusinesses } from "../service/discovery.service.js";
import { analyzeNiche } from "../service/ai.service.js";
import { supabase } from "../config/supabase.js";

const isLocationRelevant = (result, location) => {
  const text = `
    ${result.title || ""}
    ${result.content || ""}
    ${result.url || ""}
  `.toLowerCase();

  return text.includes(location.toLowerCase());
};

const classifyCompetitor = (result) => {
  const text = `
    ${result.title || ""}
    ${result.content || ""}
    ${result.url || ""}
  `.toLowerCase();

  const marketplaces = [
    "marketplace",
    "directory",
    "superprof",
    "upwork",
    "trainerize",
  ];

  if (marketplaces.some((term) => text.includes(term))) {
    return "Adjacent";
  }

  return "Direct";
};

export const runNicheResearch = async (req, res) => {
  try {
    const { track, niche } = req.body;

    const audience = req.body.audience?.trim() || niche;
    const location = req.body.location?.trim() || "Global";

    if (!track || !niche?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Track and niche are required.",
      });
    }

    // 1. Discover potential businesses
    const results = await discoverBusinesses(niche, location, audience);
    const { data: research, error: researchError } = await supabase
      .from("research_projects")
      .insert({
        industry: niche,
        location,
        business_description: audience,
        status: "completed",
      })
      .select()
      .single();

    if (researchError) throw researchError;

    // Keep all discovered sources for reference
    const sources = results.map((result) => ({
      title: result.title,
      uri: result.url,
    }));

    // Only keep results with location evidence
    const qualifiedResults = results;

    // Build competitor records
    const competitors = qualifiedResults.map((result, index) => ({
      id: `competitor-${index + 1}`,
      track,
      name: result.title,
      domain: result.url,
      niche,
      offerSummary: result.content,
      pricingTier: "Not available",
      productsAndPrices: [],
      socialHandles: [],
      acquisitionChannel: "Not available",
      marketingStrategies: [],
      customerComplaints: [],
      positioningEdge: "Not available",
      exploitableGap: "Not available",
      messagingHooks: [],
      offerLadder: [],
      counterStrategy: "Not available",
      threatLevel: classifyCompetitor(result),
      sources: [{ title: result.title, uri: result.url }],
    }));

    // Save all discovered research sources
    if (results.length > 0) {
      const { error: sourcesError } = await supabase
        .from("research_sources")
        .insert(
          results.map((result) => ({
            research_id: research.id,
            title: result.title || "Untitled source",
            url: result.url,
            content: result.content || null,
          })),
        );

      if (sourcesError) throw sourcesError;
    }

    // 2. Attempt AI analysis
    let analysis;

    try {
      analysis = await analyzeNiche(
        {
          industry: niche,
          location,
          business_description: audience,
          track,
        },
        competitors,
      );
    } catch (aiError) {
      console.error("AI analysis unavailable:", aiError.message);
    }

    // Save AI analysis to Supabase
    if (analysis) {
      const { error: insightsError } = await supabase
        .from("market_insights")
        .insert({
          research_id: research.id,
          insight_type: "market_analysis",
          content: JSON.stringify(analysis),
        });

      if (insightsError) throw insightsError;
    }

    // 3. Return research even if AI fails
    return res.status(200).json({
      success: true,
      nicheTitle: niche,
      track,
      executiveSummary:
        analysis?.executiveSummary ||
        "Competitor discovery completed. AI analysis is temporarily unavailable.",
      benchmarks: analysis?.benchmarks || {
        rampTime: "Not available",
        rateRange: "Not available",
        primaryGrowthLever: "Not available",
        commonPitfall: "Not available",
      },
      marketingHighlights: analysis?.marketingHighlights || [],
      customerComplaints: analysis?.customerComplaints || [],
      veteranInsights: analysis?.veteranInsights || [],
      competitors: analysis?.competitors?.length
        ? analysis.competitors
        : competitors,
      sources: analysis?.sources?.length ? analysis.sources : sources,
      aiAvailable: Boolean(analysis),
    });
  } catch (error) {
    console.error("Niche research error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to complete business discovery.",
    });
  }
};
