import type {
  CompetitorEntry,
  CustomerComplaintGap,
  NicheBenchmark,
  OperatorTrack,
  PositioningPlan,
  VeteranPlaybook,
} from "../types";

export const TRACK_LABELS: Record<OperatorTrack, string> = {
  entrepreneur: "Entrepreneurs & Small Business",
  freelancer: "Freelancers",
  creator: "Content Creators",
  digital_seller: "Digital Product Sellers",
};

export const TRACK_BENCHMARKS: Record<OperatorTrack, NicheBenchmark> = {
  entrepreneur: {
    rampTime: "6–14 months to repeat customer orders",
    rateRange: "₦35,000–₦180,000 RTW or $49–$299/mo products",
    primaryGrowthLever: "Short-form video demos + WhatsApp / direct DM conversion",
    commonPitfall: "Launching too many SKUs or features before validating top 3 sellers",
  },
  freelancer: {
    rampTime: "3–6 months to steady retainer pipeline",
    rateRange: "$125–$250/hr effective or $3,500–$8,500/mo retainers",
    primaryGrowthLever: "Before-and-after teardown posts + anchor client referrals",
    commonPitfall: "Underpricing hourly generalist work with zero scope boundaries",
  },
  creator: {
    rampTime: "9–18 months to diversified brand & product income",
    rateRange: "$25–$65 CPM sponsorships + $49–$299 digital guides",
    primaryGrowthLever: "Searchable evergreen tutorials feeding an email or WhatsApp list",
    commonPitfall: "Chasing viral views without a clear product or audience funnel",
  },
  digital_seller: {
    rampTime: "2–5 months to consistent automated storefront sales",
    rateRange: "$19–$149 templates/toolkits · $299+ niche cohorts",
    primaryGrowthLever: "Free utility lead magnets + affiliate creator bundles",
    commonPitfall: "Creating an exhaustive course before selling a 1-page template MVP",
  },
};

export const SEED_EXECUTIVE_SUMMARY =
  "Sample active brief: Contemporary Fashion Retail in Nigeria & Independent Operators. Established brands convert buyers primarily through Instagram Reels try-ons, WhatsApp catalog ordering, and diaspora shipping, while newcomers win by fixing sizing consistency and delivery communication.";

export const SEED_MARKETING_HIGHLIGHTS: string[] = [
  "Instagram Reels & TikTok fit-check videos showing fabric movement on diverse body types",
  "WhatsApp Business catalogs and broadcast drops for repeat buyers and pre-orders",
  "Micro-creator styling partnerships with transparent size tags in captions",
  "Diaspora-friendly pricing toggles (NGN / USD / GBP) with DHL Express checkout",
];

export const SEED_CUSTOMER_COMPLAINTS: CustomerComplaintGap[] = [
  {
    complaint: "Inconsistent size charts and garment measurements across batches",
    opportunity: "Publish exact flat-lay garment measurements and height/size fit notes on every listing",
  },
  {
    complaint: "Slow DM response times and hidden prices ('DM for price')",
    opportunity: "Display transparent prices upfront with instant self-serve checkout or automated sizing links",
  },
  {
    complaint: "Delayed tailoring turnaround and lack of order tracking updates",
    opportunity: "Offer ready-to-ship core capsule pieces with automated WhatsApp dispatch notifications",
  },
  {
    complaint: "Fabric quality mismatch between studio photos and delivered items",
    opportunity: "Include unedited daylight close-up clips of fabric texture and stitching",
  },
];

export const SEED_PLAYBOOKS: VeteranPlaybook[] = [
  {
    id: "vet-founder-1",
    track: "entrepreneur",
    operatorName: "Amaka Okafor",
    roleTitle: "Founder, Ready-to-Wear Fashion Label (Lagos)",
    yearsInBusiness: 7,
    businessModel: "Capsule Ready-to-Wear Drops + Diaspora Online Store",
    revenueMix: "68% local & diaspora online orders · 22% pop-up trunk shows · 10% custom bridal",
    portraitUrl: "/src/assets/images/veteran_founder_portrait_1795277184507.jpg",
    summary:
      "Started out sewing one-off custom orders from Instagram DMs before shifting 80% of production to standardized ready-to-wear size runs. Experienced retail founders protect cash flow by pre-testing demand with small drops.",
    nonObviousLesson:
      "Stop hiding prices behind 'DM for price.' Transparent pricing paired with clear size guides cuts wasted DM inquiries by 70% and attracts buyers ready to pay immediately.",
    shifts: [
      {
        dimension: "Product & Inventory",
        yearOne: "Taking unlimited custom orders with unpredictable fabric sourcing costs",
        veteranToday: "4 core silhouettes in sizes UK 6–20 produced in tight 40-piece capsule batches",
      },
      {
        dimension: "Marketing & Sales",
        yearOne: "Static studio photos posted randomly with 'DM to order'",
        veteranToday: "Weekly Reels try-on series + direct storefront links + WhatsApp VIP early access",
      },
      {
        dimension: "Customer Trust",
        yearOne: "No clear return or alteration policy, leading to DM disputes",
        veteranToday: "Exact garment measurement table + 48-hour exchange guarantee on standard sizes",
      },
    ],
    checklist: [
      "Put clear prices and exact size measurements in every product post and bio link",
      "Film 15-second natural daylight fabric and fit clips before launching any new piece",
      "Build a simple WhatsApp or email waitlist for restocks before committing bulk fabric cash",
    ],
  },
  {
    id: "vet-freelancer-1",
    track: "freelancer",
    operatorName: "Claire Lin",
    roleTitle: "Principal Product & Brand Consultant",
    yearsInBusiness: 8,
    businessModel: "Productized Discovery + Monthly Advisory Retainer",
    revenueMix: "65% quarterly retainers · 35% fixed-scope audit sprints",
    portraitUrl: "/src/assets/images/veteran_freelancer_portrait_1795277186748.jpg",
    summary:
      "Transitioned out of competing on hourly freelance marketplaces into fixed-price two-week diagnostic audits. Clients hire veterans for risk reduction and clear communication, not raw hours logged.",
    nonObviousLesson:
      "Never send a custom proposal to a cold lead without first selling a small paid diagnostic. It tests working chemistry and pays you to scope the full engagement accurately.",
    shifts: [
      {
        dimension: "Engagement Structure",
        yearOne: "Hourly billing with open-ended revision rounds",
        veteranToday: "Fixed-fee 2-week Audit ($3,200) -> Monthly Retainer ($5,500/mo)",
      },
      {
        dimension: "Pipeline Stability",
        yearOne: "Feast-or-famine scrambling after every project ends",
        veteranToday: "Quarterly check-ins with past clients + 1 monthly teardown published",
      },
      {
        dimension: "Client Boundaries",
        yearOne: "Instant Slack replies at 10pm and unpaid scope creep",
        veteranToday: "Async weekly Loom updates every Tuesday + explicit change-order rules",
      },
    ],
    checklist: [
      "Package your first 10 hours of discovery into a named fixed-price audit",
      "Add a 2-revision cap and 50% upfront deposit clause to every contract",
      "Publish 2 before-and-after client case studies showing business outcomes",
    ],
  },
  {
    id: "vet-creator-1",
    track: "creator",
    operatorName: "Hannah Mercer",
    roleTitle: "Independent Media Publisher & Educator",
    yearsInBusiness: 7,
    businessModel: "Newsletter + YouTube + Digital Toolkits",
    revenueMix: "45% direct sponsorships · 40% digital products · 15% ad share",
    portraitUrl: "/src/assets/images/veteran_creator_portrait_1795277186327.jpg",
    summary:
      "Built a 95k-subscriber niche publication by treating content like a searchable reference library rather than daily news commentary.",
    nonObviousLesson:
      "Platform algorithms rent you attention; an email list and a repeatable flagship digital product own the business.",
    shifts: [
      {
        dimension: "Content Strategy",
        yearOne: "Chasing trending topics 5x/week across every social platform",
        veteranToday: "1 deep evergreen video/essay weekly + 3 repurposed distribution clips",
      },
      {
        dimension: "Monetization Mix",
        yearOne: "100% reliant on volatile platform ad revenue",
        veteranToday: "Quarterly sponsor bundles + owned self-paced templates & guides",
      },
      {
        dimension: "Production Workflow",
        yearOne: "Editing everything solo from scratch every Sunday night",
        veteranToday: "Modular research template + contractor editor on fixed per-episode rate",
      },
    ],
    checklist: [
      "Create one high-utility free resource directly tied to your core topic",
      "Batch-write 4 evergreen topics answering questions beginners search monthly",
      "Build a 1-page media kit with audience demographics and click rates",
    ],
  },
];

export const SEED_COMPETITORS: CompetitorEntry[] = [
  {
    id: "comp-ng-fashion-1",
    track: "entrepreneur",
    name: "Kai Collective",
    domain: "kaicollective.com",
    niche: "Contemporary Women's Fashion (Nigeria / Global)",
    offerSummary: "Printed statement ready-to-wear dresses, tops, and resort sets",
    pricingTier: "₦65,000–₦280,000 ($75–$220)",
    productsAndPrices: [
      { item: "Signature Gaia Mesh Top", price: "£75 / ~₦145,000" },
      { item: "Printed Midi Slip Dress", price: "£135 / ~₦260,000" },
      { item: "Tailored Resort Co-ord Set", price: "£160 / ~₦310,000" },
    ],
    socialHandles: [
      { platform: "Instagram", handle: "@kaicollective", url: "https://instagram.com/kaicollective" },
      { platform: "TikTok", handle: "@kaicollective", url: "https://tiktok.com/@kaicollective" },
      { platform: "X", handle: "@kaicollective", url: "https://x.com/kaicollective" },
    ],
    acquisitionChannel: "Editorial Instagram campaigns + diaspora celebrity styling",
    marketingStrategies: [
      "High-contrast editorial lookbooks paired with founder storytelling",
      "Inclusive size representation across social try-on posts",
      "Global e-commerce checkout targeting Lagos, London, and New York",
    ],
    customerComplaints: [
      "High price point out of reach for mid-market local shoppers",
      "Popular print sizes sell out rapidly with long restock waits",
    ],
    positioningEdge: "Distinctive proprietary prints and strong international brand equity",
    exploitableGap: "Accessible everyday mid-tier pricing (₦25k–₦60k) with fast local delivery",
    messagingHooks: [
      "Attainable luxury womenswear celebrating bold prints",
      "Designed in London, inspired by global women",
    ],
    offerLadder: ["Mesh Tops ($75)", "Statement Dresses ($160+)", "Limited Resort Capsules"],
    counterStrategy:
      "Serve mid-market professionals with durable, work-to-weekend tailored pieces priced transparently between ₦28,000 and ₦55,000.",
    threatLevel: "Adjacent",
  },
  {
    id: "comp-ng-fashion-2",
    track: "entrepreneur",
    name: "Lagos Street & Capsule Studio",
    domain: "mazelle.studio",
    niche: "Contemporary Nigerian Womenswear & Adire",
    offerSummary: "Hand-dyed Adire ready-to-wear and modern workwear sets",
    pricingTier: "₦28,000–₦95,000",
    productsAndPrices: [
      { item: "Adire Silk Two-Piece Boubou", price: "₦45,000" },
      { item: "Structured Linen Work Blazer", price: "₦68,000" },
      { item: "Everyday Cotton Wrap Dress", price: "₦32,000" },
    ],
    socialHandles: [
      { platform: "Instagram", handle: "@mazellestudio", url: "https://instagram.com/mazellestudio" },
      { platform: "TikTok", handle: "@mazellestudio" },
    ],
    acquisitionChannel: "Instagram Reels + Lagos weekend pop-up markets",
    marketingStrategies: [
      "Behind-the-scenes artisan dyeing reels showing authenticity",
      "Styling 1 piece 4 ways video series for office & brunch",
      "WhatsApp VIP broadcast ahead of payday weekend drops",
    ],
    customerComplaints: [
      "Some hand-dyed pieces bleed color if not pre-washed properly",
      "48-hour lag on Instagram DM size inquiries during peak drops",
    ],
    positioningEdge: "Authentic local craftsmanship at approachable mid-market prices",
    exploitableGap: "Colorfast care guarantees and instant self-serve checkout with live stock counts",
    messagingHooks: [
      "Modern Nigerian silhouettes crafted for everyday wear",
      "Limited artisan-dyed batches",
    ],
    offerLadder: ["Everyday Wrap Dresses (₦32k)", "Adire Sets (₦45k)", "Tailored Outerwear (₦68k+)"],
    counterStrategy:
      "Lead with pre-treated colorfast fabrics, transparent instant checkout, and 24-hour Lagos dispatch.",
    threatLevel: "Direct",
  },
  {
    id: "comp-free-1",
    track: "freelancer",
    name: "Designjoy",
    domain: "designjoy.co",
    niche: "Productized Design Subscription",
    offerSummary: "Flat-rate asynchronous design subscription with 48-hour turnarounds",
    pricingTier: "$4,995/mo flat retainer",
    productsAndPrices: [
      { item: "Standard Design Retainer", price: "$4,995/mo" },
      { item: "Pro Multi-Brand Retainer", price: "$7,995/mo" },
    ],
    socialHandles: [
      { platform: "X", handle: "@BrettFromDJ", url: "https://x.com/BrettFromDJ" },
      { platform: "YouTube", handle: "@Designjoy" },
    ],
    acquisitionChannel: "Founder X/Twitter build-in-public revenue transparency",
    marketingStrategies: [
      "Sharing solo revenue milestones and workflow breakdowns publicly",
      "Ultra-simple single-page pricing with pause/cancel flexibility",
    ],
    customerComplaints: [
      "No live strategy calls or collaborative workshops for complex teams",
      "Queue bottleneck when multiple large requests stack up",
    ],
    positioningEdge: "Zero-meeting asynchronous workflow and predictable monthly pricing",
    exploitableGap: "High-touch discovery workshops and conversion strategy for B2B founders",
    messagingHooks: [
      "Design subscriptions for everyone",
      "Pause or cancel anytime, zero meetings required",
    ],
    offerLadder: ["Standard ($4,995/mo)", "Pro ($7,995/mo)"],
    counterStrategy:
      "Differentiate with weekly strategy check-ins and measurable funnel conversion audits.",
    threatLevel: "Direct",
  },
  {
    id: "comp-cre-1",
    track: "creator",
    name: "Justin Welsh",
    domain: "justinwelsh.me",
    niche: "Solopreneur Systems & Digital Products",
    offerSummary: "Weekly newsletter and self-paced LinkedIn/business systems courses",
    pricingTier: "Free newsletter · $150–$699 courses",
    productsAndPrices: [
      { item: "The LinkedIn Operating System", price: "$150" },
      { item: "The Content Operating System", price: "$150" },
      { item: "The Creator MBA", price: "$699" },
    ],
    socialHandles: [
      { platform: "LinkedIn", handle: "in/justinwelsh", url: "https://linkedin.com/in/justinwelsh" },
      { platform: "X", handle: "@thejustinwelsh", url: "https://x.com/thejustinwelsh" },
    ],
    acquisitionChannel: "Daily LinkedIn frameworks + newsletter cross-promotions",
    marketingStrategies: [
      "Short, repeatable 3-step tactical frameworks posted every morning",
      "Lead magnet checklists converting social readers to Saturday newsletter",
    ],
    customerComplaints: [
      "Advice can feel broad or US-centric for niche or local markets",
      "Self-paced video format lacks live feedback or peer accountability",
    ],
    positioningEdge: "Clear, zero-fluff systems priced for impulse self-investment",
    exploitableGap: "Region-specific or industry-specific execution templates with live feedback",
    messagingHooks: [
      "Build a lean, profitable one-person business",
      "Actionable systems in 4 minutes every Saturday",
    ],
    offerLadder: ["Free Newsletter", "OS Courses ($150)", "Creator MBA ($699)"],
    counterStrategy:
      "Focus on a specific industry or regional market with live critiques and localized templates.",
    threatLevel: "Direct",
  },
  {
    id: "comp-dig-1",
    track: "digital_seller",
    name: "Easlo",
    domain: "easlo.co",
    niche: "Productivity & Business Notion Templates",
    offerSummary: "Minimalist Notion operating systems for founders and students",
    pricingTier: "Free–$129 digital templates",
    productsAndPrices: [
      { item: "Second Brain Notion System", price: "$79" },
      { item: "Freelance Business Hub", price: "$49" },
      { item: "Habit Tracker Starter", price: "Free ($0)" },
    ],
    socialHandles: [
      { platform: "X", handle: "@heyeaslo", url: "https://x.com/heyeaslo" },
      { platform: "Instagram", handle: "@heyeaslo" },
    ],
    acquisitionChannel: "Visual template walkthroughs on X/Instagram + affiliate partners",
    marketingStrategies: [
      "Free minimalist templates driving email opt-ins before upselling bundles",
      "Clean GIF/video screen previews showing workspace aesthetic",
    ],
    customerComplaints: [
      "Steep learning curve for buyers brand new to Notion formulas",
      "Generic structure requires heavy customization for specialized workflows",
    ],
    positioningEdge: "Clean visual branding and massive affiliate creator distribution",
    exploitableGap: "Pre-configured vertical templates with 5-minute video onboarding walkthroughs",
    messagingHooks: [
      "Organize your work and life in one clean workspace",
      "Built for creators, freelancers, and operators",
    ],
    offerLadder: ["Free Starter Templates", "Single Hubs ($49–$79)", "All-Access Bundle ($129)"],
    counterStrategy:
      "Bundle industry-specific templates (e.g. Fashion Inventory & Order Tracker) with plain-language video setup guides.",
    threatLevel: "Adjacent",
  },
];

export const SEED_POSITIONING: PositioningPlan = {
  targetSegment:
    "Young Nigerian professionals & diaspora buyers (24–38) wanting modern ready-to-wear work and weekend outfits with transparent pricing",
  corePromise:
    "Pre-washed, true-to-measurement contemporary Nigerian ready-to-wear with upfront pricing and 24-hour dispatch in Lagos.",
  pricingAnchor:
    "₦32,000–₦58,000 core ready-to-wear capsule · Free Lagos delivery above ₦75,000",
  weeklyCadence:
    "Publish 3 fit-check Instagram/TikTok Reels weekly + 1 Thursday WhatsApp VIP restock preview",
  firstThreeMoves: [
    "Launch with 3 core silhouettes in 5 standard sizes instead of custom one-off orders",
    "Publish exact flat-lay garment measurements and transparent NGN/USD prices on every post",
    "Film natural daylight fabric tests and partner with 5 micro-creators (5k–25k followers) for honest try-ons",
  ],
  notes:
    "Directly solves the top 3 customer complaints in Nigerian online fashion: hidden DM pricing, sizing inconsistency, and delayed dispatch.",
  updatedAt: "2026-11-21T08:15:00.000Z",
};
