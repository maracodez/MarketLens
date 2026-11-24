import axios from "axios";

export const discoverBusinesses = async (industry, location, description) => {
  const query = `
Find real businesses currently operating in the ${industry} industry in ${location}.
Target audience or business focus: ${description}.

Prioritize operating companies, independent businesses, service providers, and brands
that sell relevant products or services. Prefer official websites and active business
profiles. Return search results that provide evidence about the business, its offer,
and its location. Articles, reports, directories, and educational pages may appear as
research sources but should not be treated as businesses without supporting evidence.
`;

  const response = await axios.post(
    "https://api.tavily.com/search",
    {
      query,
      topic: "general",
      search_depth: "advanced",
      max_results: 10,
      include_answer: false,
      country: "nigeria",
      exclude_domains: ["tracxn.com", "cbinsights.com"],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const results = response.data.results || [];

  console.log(
    "TAVILY RESULTS:",
    results.map((result) => ({
      title: result.title,
      url: result.url,
    })),
  );

  return results;
};
