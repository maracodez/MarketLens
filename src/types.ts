export type OperatorTrack =
  | "entrepreneur"
  | "freelancer"
  | "creator"
  | "digital_seller";

export type TrackFilter = "all" | OperatorTrack;

export type WorkspaceView = "overview" | "competitors" | "playbooks" | "report";

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SocialHandle {
  platform: string;
  handle: string;
  url?: string;
}

export interface ProductPriceItem {
  item: string;
  price: string;
}

export interface CustomerComplaintGap {
  complaint: string;
  opportunity: string;
}

export interface NicheBenchmark {
  rampTime: string;
  rateRange: string;
  primaryGrowthLever: string;
  commonPitfall: string;
}

export interface VeteranShift {
  dimension: string;
  yearOne: string;
  veteranToday: string;
}

export interface VeteranPlaybook {
  id: string;
  track: OperatorTrack;
  operatorName: string;
  roleTitle: string;
  yearsInBusiness: number;
  businessModel: string;
  revenueMix: string;
  portraitUrl?: string;
  summary: string;
  nonObviousLesson: string;
  shifts: VeteranShift[];
  checklist: string[];
  sources?: GroundingSource[];
  isCustom?: boolean;
}

export interface CompetitorEntry {
  id: string;
  track: OperatorTrack;
  name: string;
  domain: string;
  niche: string;
  offerSummary: string;
  pricingTier: string;
  productsAndPrices: ProductPriceItem[];
  socialHandles: SocialHandle[];
  acquisitionChannel: string;
  marketingStrategies: string[];
  customerComplaints: string[];
  positioningEdge: string;
  exploitableGap: string;
  messagingHooks: string[];
  offerLadder: string[];
  counterStrategy: string;
  threatLevel: "Direct" | "Adjacent" | "Emerging";
  sources?: GroundingSource[];
  isCustom?: boolean;
}

export interface PositioningPlan {
  targetSegment: string;
  corePromise: string;
  pricingAnchor: string;
  weeklyCadence: string;
  firstThreeMoves: string[];
  notes: string;
  updatedAt: string;
}

export interface NicheBriefResponse {
  nicheTitle: string;
  track: OperatorTrack;
  executiveSummary: string;
  benchmarks: NicheBenchmark;
  marketingHighlights: string[];
  customerComplaints: CustomerComplaintGap[];
  veteranInsights: VeteranPlaybook[];
  competitors: CompetitorEntry[];
  sources: GroundingSource[];
}
