import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
import type {
  CompetitorEntry,
  CustomerComplaintGap,
  GroundingSource,
  NicheBenchmark,
  OperatorTrack,
  TrackFilter,
  VeteranPlaybook,
  WorkspaceView,
} from "../types";
import { TRACK_BENCHMARKS, TRACK_LABELS } from "../data/seedData";
import { PortraitAvatar } from "./PortraitAvatar";

interface OverviewViewProps {
  trackFilter: TrackFilter;
  activeNiche: string;
  executiveSummary: string;
  activeBenchmark: NicheBenchmark | null;
  marketingHighlights: string[];
  customerComplaints: CustomerComplaintGap[];
  sources: GroundingSource[];
  playbooks: VeteranPlaybook[];
  competitors: CompetitorEntry[];
  isResearching: boolean;
  researchError: string | null;
  onRunNicheResearch: (params: {
    track: OperatorTrack;
    niche: string;
    audience: string;
    location: string;
  }) => Promise<void>;
  onNavigate: (view: WorkspaceView) => void;
  onInspectCompetitor: (competitor: CompetitorEntry) => void;
  onInspectPlaybook: (playbook: VeteranPlaybook) => void;
}

const SAMPLE_PROMPTS: Array<{
  track: OperatorTrack;
  niche: string;
  label: string;
}> = [
  {
    track: "entrepreneur",
    niche: "I want to start a fashion business in Nigeria",
    label: "Fashion business in Nigeria",
  },
  {
    track: "creator",
    niche: "I want to launch a skincare content creator brand",
    label: "Skincare creator brand",
  },
  {
    track: "digital_seller",
    niche: "I want to sell Notion productivity templates for freelancers",
    label: "Digital Notion templates",
  },
  {
    track: "freelancer",
    niche: "I want to start a freelance B2B SaaS copywriting service",
    label: "B2B SaaS copywriting",
  },
];

export function OverviewView({
  trackFilter,
  activeNiche,
  executiveSummary,
  activeBenchmark,
  marketingHighlights,
  customerComplaints,
  sources,
  playbooks,
  competitors,
  isResearching,
  researchError,
  onRunNicheResearch,
  onNavigate,
  onInspectCompetitor,
  onInspectPlaybook,
}: OverviewViewProps) {
  const defaultTrack: OperatorTrack =
    trackFilter === "all" ? "entrepreneur" : trackFilter;

  const [selectedTrack, setSelectedTrack] = useState<OperatorTrack>(defaultTrack);
  const [nicheInput, setNicheInput] = useState(
    activeNiche || "I want to start a fashion business in Nigeria"
  );
  const [locationInput, setLocationInput] = useState("");

  const displayBenchmark =
    activeBenchmark ??
    TRACK_BENCHMARKS[trackFilter === "all" ? "entrepreneur" : trackFilter];

  const filteredPlaybooks =
    trackFilter === "all"
      ? playbooks.slice(0, 3)
      : playbooks.filter((p) => p.track === trackFilter).slice(0, 3);

  const filteredCompetitors =
    trackFilter === "all"
      ? competitors.slice(0, 5)
      : competitors.filter((c) => c.track === trackFilter).slice(0, 5);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nicheInput.trim() || isResearching) return;
    await onRunNicheResearch({
      track: selectedTrack,
      niche: nicheInput.trim(),
      audience: "",
      location: locationInput.trim(),
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Primary Business Idea / Niche Discovery Bar */}
      <section
        id="live-research-panel"
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-blue-700">
              AI-Powered Industry & Competitor Discovery
            </p>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Enter your business idea to map competitors, prices, socials, and market gaps
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Skip hours of jumping across Instagram, TikTok, and websites. Describe what
              you want to start and get organized intelligence on how established players
              operate today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Try example:</span>
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setSelectedTrack(sample.track);
                  setNicheInput(sample.niche);
                }}
                className="min-h-[36px] sm:min-h-0 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <label
              htmlFor="overview-track"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              I am building as a
            </label>
            <select
              id="overview-track"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value as OperatorTrack)}
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            >
              <option value="entrepreneur">Entrepreneur / Small Business</option>
              <option value="freelancer">Freelancer / Service Provider</option>
              <option value="creator">Content Creator</option>
              <option value="digital_seller">Digital Product Seller</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="overview-niche"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Business Idea or Niche
            </label>
            <input
              id="overview-niche"
              type="text"
              required
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              placeholder="e.g. I want to start a fashion business in Nigeria"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="overview-location"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Region (Optional)
            </label>
            <input
              id="overview-location"
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Lagos, UK, Global"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isResearching || !nicheInput.trim()}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>{isResearching ? "Researching..." : "Research Market"}</span>
            </button>
          </div>
        </form>

        {executiveSummary && (
          <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">Industry Summary: </span>
            {executiveSummary}
          </p>
        )}

        {researchError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {researchError}
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Verified web sources:</span>
            {sources.map((src) => (
              <a
                key={src.uri}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline max-w-[200px] sm:max-w-[240px] truncate"
              >
                <span className="truncate">{src.title}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 4-Column Benchmark Strip */}
      {isResearching ? (
        <section
          aria-label="Loading market benchmarks"
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="h-24 sm:h-28 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-slate-200 mb-3" />
              <div className="h-5 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </section>
      ) : (
        <section
          aria-label="Market Benchmarks"
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Typical Ramp Window</p>
            <p className="mt-1.5 sm:mt-2 font-mono text-sm font-semibold text-slate-900 tabular-nums leading-snug">
              {displayBenchmark.rampTime}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Observed Price Range</p>
            <p className="mt-1.5 sm:mt-2 font-mono text-sm font-semibold text-slate-900 tabular-nums leading-snug">
              {displayBenchmark.rateRange}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Primary Sales Lever</p>
            <p className="mt-1.5 sm:mt-2 text-sm font-semibold text-slate-900 leading-snug">
              {displayBenchmark.primaryGrowthLever}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Common Beginner Pitfall</p>
            <p className="mt-1.5 sm:mt-2 text-sm font-semibold text-amber-800 leading-snug">
              {displayBenchmark.commonPitfall}
            </p>
          </div>
        </section>
      )}

      {/* Marketing Strategies & Customer Complaints Strip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white min-w-0">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              01. Active Marketing Strategies
            </h2>
            <p className="text-xs text-slate-500">
              How operating businesses and creators attract paying customers
            </p>
          </div>
          <ul className="divide-y divide-slate-200">
            {marketingHighlights.map((tactic, idx) => (
              <li key={idx} className="px-4 py-3 sm:px-6 sm:py-3.5 flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums pt-0.5 shrink-0">
                  0{idx + 1}.
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">{tactic}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white min-w-0">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              02. Common Customer Complaints & Market Gaps
            </h2>
            <p className="text-xs text-slate-500">
              Recurring buyer friction points that create an immediate opening for new entrants
            </p>
          </div>

          {/* Mobile Stacked Complaint Cards */}
          <div className="divide-y divide-slate-200 md:hidden">
            {customerComplaints.map((row, idx) => (
              <div key={idx} className="p-4 space-y-1.5">
                <p className="text-xs font-semibold text-red-800 leading-snug">
                  {row.complaint}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-medium text-slate-500">Opportunity: </span>
                  {row.opportunity}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-2.5 pl-6 pr-3">Observed Customer Complaint</th>
                  <th className="py-2.5 pl-3 pr-6">Your Market Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customerComplaints.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pl-6 pr-3 align-top text-xs font-medium text-red-800">
                      {row.complaint}
                    </td>
                    <td className="py-3 pl-3 pr-6 align-top text-xs text-slate-700 leading-relaxed">
                      {row.opportunity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Discovered Businesses & Socials + Veteran Playbooks Snapshot */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-slate-900">
                03. Discovered Businesses, Socials & Prices
              </h2>
              <p className="text-xs text-slate-500">
                Tap any business or creator to inspect full pricing, socials, and complaints
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("competitors")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <span>All Competitors</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Stacked Competitor Rows */}
          <div className="divide-y divide-slate-200 md:hidden">
            {filteredCompetitors.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => {
                  onInspectCompetitor(comp);
                  onNavigate("competitors");
                }}
                className="w-full text-left p-4 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {comp.name}
                    </p>
                    <p className="font-mono text-xs text-slate-500 truncate">
                      {comp.domain}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums shrink-0">
                    {comp.pricingTier}
                  </span>
                </div>
                {(comp.socialHandles ?? []).length > 0 && (
                  <p className="text-xs text-slate-600 truncate">
                    {(comp.socialHandles ?? [])
                      .slice(0, 2)
                      .map((s) => `${s.platform}: ${s.handle}`)
                      .join(" · ")}
                  </p>
                )}
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-medium text-slate-500">Gap: </span>
                  {comp.exploitableGap}
                </p>
              </button>
            ))}
          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-2.5 pl-6 pr-3">Business / Creator</th>
                  <th className="px-3 py-2.5">Social Accounts</th>
                  <th className="px-3 py-2.5">Price Range</th>
                  <th className="py-2.5 pl-3 pr-6">Gap to Serve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompetitors.map((comp) => (
                  <tr
                    key={comp.id}
                    onClick={() => {
                      onInspectCompetitor(comp);
                      onNavigate("competitors");
                    }}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 pl-6 pr-3 align-top">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">
                        {comp.name}
                      </div>
                      <div className="font-mono text-xs text-slate-500">{comp.domain}</div>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-700">
                      {(comp.socialHandles ?? []).slice(0, 2).map((s, i) => (
                        <div key={i} className="whitespace-nowrap">
                          <span className="text-slate-500">{s.platform}:</span>{" "}
                          <span className="font-mono text-slate-900">{s.handle}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {comp.pricingTier}
                    </td>
                    <td className="py-3 pl-3 pr-6 align-top text-xs text-slate-700 max-w-[220px]">
                      {comp.exploitableGap}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-slate-900">
                04. How Veterans Operate
              </h2>
              <p className="text-xs text-slate-500">
                Lessons from established business owners, freelancers, and creators
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("playbooks")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <span>All Playbooks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-200 flex-1">
            {filteredPlaybooks.map((playbook) => (
              <button
                key={playbook.id}
                type="button"
                onClick={() => {
                  onInspectPlaybook(playbook);
                  onNavigate("playbooks");
                }}
                className="w-full text-left px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-start gap-3.5 sm:gap-4"
              >
                <PortraitAvatar
                  src={playbook.portraitUrl}
                  name={playbook.operatorName}
                  sizeClass="h-12 w-12"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {TRACK_LABELS[playbook.track]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {playbook.yearsInBusiness} yrs in business
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    {playbook.operatorName} — {playbook.roleTitle}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {playbook.nonObviousLesson}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
