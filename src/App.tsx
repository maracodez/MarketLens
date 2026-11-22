import { useEffect, useMemo, useState } from "react";
import type {
  CompetitorEntry,
  CustomerComplaintGap,
  GroundingSource,
  NicheBenchmark,
  NicheBriefResponse,
  OperatorTrack,
  PositioningPlan,
  TrackFilter,
  VeteranPlaybook,
  WorkspaceView,
} from "./types";
import {
  SEED_COMPETITORS,
  SEED_CUSTOMER_COMPLAINTS,
  SEED_EXECUTIVE_SUMMARY,
  SEED_MARKETING_HIGHLIGHTS,
  SEED_PLAYBOOKS,
  SEED_POSITIONING,
} from "./data/seedData";
import { Sidebar } from "./components/Sidebar";
import { TopHeader } from "./components/TopHeader";
import { OverviewView } from "./components/OverviewView";
import { PlaybooksView } from "./components/PlaybooksView";
import { CompetitorsView } from "./components/CompetitorsView";
import { PositioningView } from "./components/PositioningView";

const STORAGE_KEY = "marketlens_workspace_v1";

interface PersistedState {
  trackFilter: TrackFilter;
  activeNiche: string;
  executiveSummary: string;
  activeBenchmark: NicheBenchmark | null;
  marketingHighlights: string[];
  customerComplaints: CustomerComplaintGap[];
  sources: GroundingSource[];
  playbooks: VeteranPlaybook[];
  competitors: CompetitorEntry[];
  checkedItems: Record<string, boolean>;
  positioningPlan: PositioningPlan;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        trackFilter: parsed.trackFilter ?? "all",
        activeNiche: parsed.activeNiche ?? "Fashion Business in Nigeria",
        executiveSummary: parsed.executiveSummary ?? SEED_EXECUTIVE_SUMMARY,
        activeBenchmark: parsed.activeBenchmark ?? null,
        marketingHighlights:
          Array.isArray(parsed.marketingHighlights) &&
          parsed.marketingHighlights.length > 0
            ? parsed.marketingHighlights
            : SEED_MARKETING_HIGHLIGHTS,
        customerComplaints:
          Array.isArray(parsed.customerComplaints) &&
          parsed.customerComplaints.length > 0
            ? parsed.customerComplaints
            : SEED_CUSTOMER_COMPLAINTS,
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        playbooks:
          Array.isArray(parsed.playbooks) && parsed.playbooks.length > 0
            ? parsed.playbooks.map((pb) => ({
                ...pb,
                shifts: Array.isArray(pb.shifts) ? pb.shifts : [],
                checklist: Array.isArray(pb.checklist) ? pb.checklist : [],
              }))
            : SEED_PLAYBOOKS,
        competitors:
          Array.isArray(parsed.competitors) && parsed.competitors.length > 0
            ? parsed.competitors.map((c) => ({
                ...c,
                productsAndPrices: Array.isArray(c.productsAndPrices)
                  ? c.productsAndPrices
                  : [],
                socialHandles: Array.isArray(c.socialHandles) ? c.socialHandles : [],
                marketingStrategies: Array.isArray(c.marketingStrategies)
                  ? c.marketingStrategies
                  : [],
                customerComplaints: Array.isArray(c.customerComplaints)
                  ? c.customerComplaints
                  : [],
                messagingHooks: Array.isArray(c.messagingHooks)
                  ? c.messagingHooks
                  : [],
                offerLadder: Array.isArray(c.offerLadder) ? c.offerLadder : [],
              }))
            : SEED_COMPETITORS,
        checkedItems: parsed.checkedItems ?? {},
        positioningPlan: parsed.positioningPlan ?? SEED_POSITIONING,
      };
    }
  } catch {
    // Fall back to curated defaults if storage cannot be read
  }
  return {
    trackFilter: "all",
    activeNiche: "Fashion Business in Nigeria",
    executiveSummary: SEED_EXECUTIVE_SUMMARY,
    activeBenchmark: null,
    marketingHighlights: SEED_MARKETING_HIGHLIGHTS,
    customerComplaints: SEED_CUSTOMER_COMPLAINTS,
    sources: [],
    playbooks: SEED_PLAYBOOKS,
    competitors: SEED_COMPETITORS,
    checkedItems: {},
    positioningPlan: SEED_POSITIONING,
  };
}

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);

  const [activeView, setActiveView] = useState<WorkspaceView>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [trackFilter, setTrackFilter] = useState<TrackFilter>(initial.trackFilter);
  const [activeNiche, setActiveNiche] = useState<string>(initial.activeNiche);
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    initial.executiveSummary
  );
  const [activeBenchmark, setActiveBenchmark] = useState<NicheBenchmark | null>(
    initial.activeBenchmark
  );
  const [marketingHighlights, setMarketingHighlights] = useState<string[]>(
    initial.marketingHighlights
  );
  const [customerComplaints, setCustomerComplaints] = useState<
    CustomerComplaintGap[]
  >(initial.customerComplaints);
  const [sources, setSources] = useState<GroundingSource[]>(initial.sources);
  const [playbooks, setPlaybooks] = useState<VeteranPlaybook[]>(initial.playbooks);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(
    initial.competitors
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    initial.checkedItems
  );
  const [positioningPlan, setPositioningPlan] = useState<PositioningPlan>(
    initial.positioningPlan
  );

  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    initial.playbooks[0]?.id ?? ""
  );
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(
    initial.competitors[0]?.id ?? ""
  );

  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  useEffect(() => {
    const payload: PersistedState = {
      trackFilter,
      activeNiche,
      executiveSummary,
      activeBenchmark,
      marketingHighlights,
      customerComplaints,
      sources,
      playbooks,
      competitors,
      checkedItems,
      positioningPlan,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    trackFilter,
    activeNiche,
    executiveSummary,
    activeBenchmark,
    marketingHighlights,
    customerComplaints,
    sources,
    playbooks,
    competitors,
    checkedItems,
    positioningPlan,
  ]);

  const checklistStats = useMemo(() => {
    const total = playbooks.reduce((sum, pb) => sum + pb.checklist.length, 0);
    const done = playbooks.reduce(
      (sum, pb) =>
        sum +
        pb.checklist.filter((_, idx) => checkedItems[`${pb.id}:${idx}`]).length,
      0
    );
    return { done, total };
  }, [playbooks, checkedItems]);

  const handleRunNicheResearch = async (params: {
    track: OperatorTrack;
    niche: string;
    audience: string;
    location: string;
  }) => {
    setIsResearching(true);
    setResearchError(null);
    try {
      const res = await fetch("/api/research/niche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate market research report.");
      }

      const brief = data as NicheBriefResponse;
      setTrackFilter(brief.track);
      setActiveNiche(brief.nicheTitle || params.niche);
      setExecutiveSummary(brief.executiveSummary);
      setActiveBenchmark(brief.benchmarks);
      if (brief.marketingHighlights?.length > 0) {
        setMarketingHighlights(brief.marketingHighlights);
      }
      if (brief.customerComplaints?.length > 0) {
        setCustomerComplaints(brief.customerComplaints);
      }
      setSources(brief.sources ?? []);

      if (brief.veteranInsights.length > 0) {
        setPlaybooks((prev) => [...brief.veteranInsights, ...prev]);
        setSelectedPlaybookId(brief.veteranInsights[0].id);
      }
      if (brief.competitors.length > 0) {
        setCompetitors((prev) => [...brief.competitors, ...prev]);
        setSelectedCompetitorId(brief.competitors[0].id);
      }
    } catch (err) {
      setResearchError(
        err instanceof Error
          ? err.message
          : "Unable to complete market research."
      );
    } finally {
      setIsResearching(false);
    }
  };

  const handleToggleChecklistItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExportMarkdown = () => {
    const lines: string[] = [
      `# MarketLens AI — Industry & Competitor Research Report`,
      `Generated: ${new Date().toISOString()}`,
      `Niche Focus: ${activeNiche || trackFilter}`,
      "",
      `## Executive Summary`,
      executiveSummary,
      "",
      `## Active Marketing Strategies`,
      ...marketingHighlights.map((m, i) => `${i + 1}. ${m}`),
      "",
      `## Common Customer Complaints & Market Gaps`,
      ...customerComplaints.map(
        (c) => `- **Complaint:** ${c.complaint} -> **Opportunity:** ${c.opportunity}`
      ),
      "",
      `## Recommended Entry Strategy`,
      `- **Target Customer:** ${positioningPlan.targetSegment}`,
      `- **Core Promise:** ${positioningPlan.corePromise}`,
      `- **Pricing Anchor:** ${positioningPlan.pricingAnchor}`,
      `- **Weekly Cadence:** ${positioningPlan.weeklyCadence}`,
      ...positioningPlan.firstThreeMoves.map((m, i) => `  ${i + 1}. ${m}`),
      "",
      `## Discovered Businesses, Socials & Prices (${competitors.length})`,
      ...competitors.flatMap((c) => [
        `### ${c.name} (${c.domain})`,
        `- **Pricing:** ${c.pricingTier}`,
        `- **Social Accounts:** ${c.socialHandles
          .map((s) => `${s.platform}: ${s.handle}`)
          .join(" | ")}`,
        `- **Marketing:** ${c.marketingStrategies.join("; ")}`,
        `- **Customer Complaints:** ${c.customerComplaints.join("; ")}`,
        `- **Gap:** ${c.exploitableGap}`,
        "",
      ]),
      `## Veteran Playbooks (${playbooks.length})`,
      ...playbooks.flatMap((pb) => [
        `### ${pb.operatorName} — ${pb.roleTitle} (${pb.yearsInBusiness} yrs)`,
        pb.summary,
        `**Core Insight:** ${pb.nonObviousLesson}`,
        "",
      ]),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketlens-report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleResetWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTrackFilter("all");
    setActiveNiche("Fashion Business in Nigeria");
    setExecutiveSummary(SEED_EXECUTIVE_SUMMARY);
    setActiveBenchmark(null);
    setMarketingHighlights(SEED_MARKETING_HIGHLIGHTS);
    setCustomerComplaints(SEED_CUSTOMER_COMPLAINTS);
    setSources([]);
    setPlaybooks(SEED_PLAYBOOKS);
    setCompetitors(SEED_COMPETITORS);
    setCheckedItems({});
    setPositioningPlan(SEED_POSITIONING);
    setSelectedPlaybookId(SEED_PLAYBOOKS[0]?.id ?? "");
    setSelectedCompetitorId(SEED_COMPETITORS[0]?.id ?? "");
    setResearchError(null);
  };

  const handleFocusResearch = () => {
    setActiveView("overview");
    setTimeout(() => {
      const input = document.getElementById("overview-niche");
      input?.focus();
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-x-hidden">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        trackFilter={trackFilter}
        onSelectTrack={setTrackFilter}
        counts={{
          playbooks: playbooks.length,
          competitors: competitors.length,
          checklistDone: checklistStats.done,
          checklistTotal: checklistStats.total,
        }}
        onExportMarkdown={handleExportMarkdown}
        onResetWorkspace={handleResetWorkspace}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          activeView={activeView}
          trackFilter={trackFilter}
          activeNiche={activeNiche}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onFocusResearch={handleFocusResearch}
        />

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {activeView === "overview" && (
            <OverviewView
              trackFilter={trackFilter}
              activeNiche={activeNiche}
              executiveSummary={executiveSummary}
              activeBenchmark={activeBenchmark}
              marketingHighlights={marketingHighlights}
              customerComplaints={customerComplaints}
              sources={sources}
              playbooks={playbooks}
              competitors={competitors}
              isResearching={isResearching}
              researchError={researchError}
              onRunNicheResearch={handleRunNicheResearch}
              onNavigate={setActiveView}
              onInspectCompetitor={(comp) => setSelectedCompetitorId(comp.id)}
              onInspectPlaybook={(pb) => setSelectedPlaybookId(pb.id)}
            />
          )}

          {activeView === "competitors" && (
            <CompetitorsView
              competitors={competitors}
              selectedCompetitorId={selectedCompetitorId}
              onSelectCompetitor={setSelectedCompetitorId}
              trackFilter={trackFilter}
              onSelectTrack={setTrackFilter}
              activeNiche={activeNiche}
              onAddCompetitor={(comp) => setCompetitors((prev) => [comp, ...prev])}
              onDeleteCompetitor={(id) =>
                setCompetitors((prev) => prev.filter((item) => item.id !== id))
              }
            />
          )}

          {activeView === "playbooks" && (
            <PlaybooksView
              playbooks={playbooks}
              selectedPlaybookId={selectedPlaybookId}
              onSelectPlaybook={setSelectedPlaybookId}
              trackFilter={trackFilter}
              onSelectTrack={setTrackFilter}
              checkedItems={checkedItems}
              onToggleChecklistItem={handleToggleChecklistItem}
              activeNiche={activeNiche}
              onAddPlaybook={(pb) => setPlaybooks((prev) => [pb, ...prev])}
            />
          )}

          {activeView === "report" && (
            <PositioningView
              activeNiche={activeNiche}
              executiveSummary={executiveSummary}
              marketingHighlights={marketingHighlights}
              customerComplaints={customerComplaints}
              playbooks={playbooks}
              competitors={competitors}
              plan={positioningPlan}
              onUpdatePlan={setPositioningPlan}
              onExportMarkdown={handleExportMarkdown}
            />
          )}
        </main>
      </div>
    </div>
  );
}
