import { supabase } from "../config/supabase.js";

export const createResearch = async (req, res) => {
  try {
    const { industry, location, business_description } = req.body;

    // Validate required fields
    if (!industry || !location) {
      return res.status(400).json({
        success: false,
        message: "Industry and location are required",
      });
    }

    // Save research request
    const { data, error } = await supabase
      .from("research_projects")
      .insert({
        industry,
        location,
        business_description,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Research request created successfully",
      research: data,
    });
  } catch (error) {
    console.error("Research creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create research request",
    });
  }
};

export const getResearch = async (req, res) => {
  try {
    const { id } = req.params;

    // Get research project
    const { data: research, error: researchError } = await supabase
      .from("research_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (researchError || !research) {
      return res.status(404).json({
        success: false,
        message: "Research project not found",
      });
    }

    // Get verified businesses
    const { data: businesses, error: businessesError } = await supabase
      .from("businesses")
      .select("*")
      .eq("research_id", id);

    if (businessesError) throw businessesError;

    // Get research sources
    const { data: sources, error: sourcesError } = await supabase
      .from("research_sources")
      .select("*")
      .eq("research_id", id);

    if (sourcesError) throw sourcesError;

    // Get AI insights
    const { data: insights, error: insightsError } = await supabase
      .from("market_insights")
      .select("*")
      .eq("research_id", id);

    if (insightsError) throw insightsError;

    return res.status(200).json({
      success: true,
      research,
      total_businesses: businesses.length,
      total_sources: sources.length,
      businesses,
      sources,
      insights,
    });

  } catch (error) {
    console.error("Get research error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve research.",
    });
  }
};