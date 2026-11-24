import { supabase } from "../config/supabase.js";
import { discoverBusinesses } from "../service/discovery.service.js";
import { analyzeMarket } from "../service/ai.service.js";

export const runDiscovery = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the research request
    const { data: research, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !research) {
      return res.status(404).json({
        success: false,
        message: "Research project not found",
      });
    }

    // Update research status
    await supabase
      .from("research_projects")
      .update({ status: "processing" })
      .eq("id", id);

    // Search for businesses
    const results = await discoverBusinesses(
      research.industry,
      research.location,
      research.business_description,
    );

    // Prepare results for database
    const businesses = results.map((result) => ({
      research_id: id,
      name: result.title,
      industry: research.industry,
      location: research.location,
      website: result.url,
      description: result.content,
    }));

    // Save discovered results
    // Check whether businesses have already been saved
    const { data: existingBusinesses, error: existingError } = await supabase
      .from("businesses")
      .select("*")
      .eq("research_id", id);

    if (existingError) throw existingError;

    let data = existingBusinesses;

    // Only save businesses if none exist already
    if (data.length === 0) {
      const { data: savedBusinesses, error: saveError } = await supabase
        .from("businesses")
        .insert(businesses)
        .select();

      if (saveError) throw saveError;

      data = savedBusinesses;
    }

    // Analyse discovered businesses using Gemini
    const analysis = await analyzeMarket(research, data);

    // Save the AI analysis in Supabase
    const { error: insightError } = await supabase
      .from("market_insights")
      .insert({
        research_id: id,
        insight_type: "market_analysis",
        content: analysis,
      });

    if (insightError) throw insightError;

    // Mark research as completed
    await supabase
      .from("research_projects")
      .update({ status: "completed" })
      .eq("id", id);

    return res.status(200).json({
      success: true,
      message: "Business discovery and market analysis completed",
      total_discovered: data.length,
      businesses: data,
      analysis: analysis,
    });
  } catch (error) {
    console.error("Discovery error:", error);

    return res.status(500).json({
      success: false,
      message: "Business discovery failed",
    });
  }
};
