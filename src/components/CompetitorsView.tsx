import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import type { CompetitorEntry, OperatorTrack, TrackFilter } from "../types";
import { TRACK_LABELS } from "../data/seedData";

interface CompetitorsViewProps {
  competitors: CompetitorEntry[];
  selectedCompetitorId: string;
  onSelectCompetitor: (id: string) => void;
  trackFilter: TrackFilter;
  onSelectTrack: (track: TrackFilter) => void;
  activeNiche: string;
  onAddCompetitor: (entry: CompetitorEntry) => void;
  onDeleteCompetitor: (id: string) => void;
}

const FILTER_TABS: Array<{ id: TrackFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "entrepreneur", label: "Entrepreneurs" },
  { id: "freelancer", label: "Freelancers" },
  { id: "creator", label: "Creators" },
  { id: "digital_seller", label: "Digital Sellers" },
];

const THREAT_TEXT_CLASS: Record<CompetitorEntry["threatLevel"], string> = {
  Direct: "text-red-700",
  Adjacent: "text-amber-700",
  Emerging: "text-emerald-700",
};

export function CompetitorsView({
  competitors,
  selectedCompetitorId,
  onSelectCompetitor,
  trackFilter,
  onSelectTrack,
  activeNiche,
  onAddCompetitor,
  onDeleteCompetitor,
}: CompetitorsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [threatFilter, setThreatFilter] = useState<string>("all");
  const [lookupInput, setLookupInput] = useState("");
  const [lookupTrack, setLookupTrack] = useState<OperatorTrack>(
    trackFilter === "all" ? "entrepreneur" : trackFilter
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualDomain, setManualDomain] = useState("");
  const [manualSocial, setManualSocial] = useState("");
  const [manualPricing, setManualPricing] = useState("");
  const [manualStrategy, setManualStrategy] = useState("");
  const [manualComplaint, setManualComplaint] = useState("");

  const filteredCompetitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return competitors.filter((item) => {
      if (trackFilter !== "all" && item.track !== trackFilter) return false;
      if (threatFilter !== "all" && item.threatLevel !== threatFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.niche.toLowerCase().includes(q) ||
        (item.socialHandles ?? []).some((s) => s.handle.toLowerCase().includes(q)) ||
        item.exploitableGap.toLowerCase().includes(q)
      );
    });
  }, [competitors, trackFilter, threatFilter, searchQuery]);

  const activeCompetitor =
    filteredCompetitors.find((c) => c.id === selectedCompetitorId) ??
    filteredCompetitors[0] ??
    null;

  const handleRowSelect = (id: string) => {
    onSelectCompetitor(id);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setTimeout(() => {
        document
          .getElementById("competitor-inspector")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    }
  };

  const handleAnalyzeCompetitor = async (e: FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/research/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: lookupInput.trim(),
          track: lookupTrack,
          niche: activeNiche,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to analyze competitor.");
      }
      onAddCompetitor(data as CompetitorEntry);
      onSelectCompetitor(data.id);
      setLookupInput("");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to analyze competitor."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateManual = (e: FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const entry: CompetitorEntry = {
      id: `manual-${Date.now()}`,
      track: lookupTrack,
      name: manualName.trim(),
      domain: manualDomain.trim() || "instagram.com",
      niche: activeNiche || "Tracked Market",
      offerSummary: manualStrategy.trim() || "Tracked business or creator",
      pricingTier: manualPricing.trim() || "Contact for quote",
      productsAndPrices: manualPricing.trim()
        ? [{ item: "Core Offering", price: manualPricing.trim() }]
        : [],
      socialHandles: manualSocial.trim()
        ? [{ platform: "Social", handle: manualSocial.trim() }]
        : [],
      acquisitionChannel: manualStrategy.trim() || "Social media & referrals",
      marketingStrategies: manualStrategy.trim() ? [manualStrategy.trim()] : [],
      customerComplaints: manualComplaint.trim() ? [manualComplaint.trim()] : [],
      positioningEdge: manualStrategy.trim() || "Established social visibility",
      exploitableGap:
        manualComplaint.trim() || "Opportunity for clearer pricing & faster support",
      messagingHooks: [manualStrategy.trim() || "Primary positioning claim"],
      offerLadder: [manualPricing.trim() || "Core offer"],
      counterStrategy: `Differentiate by fixing: ${
        manualComplaint.trim() || "slow response times and hidden pricing"
      }.`,
      threatLevel: "Direct",
      isCustom: true,
    };
    onAddCompetitor(entry);
    onSelectCompetitor(entry.id);
    setManualName("");
    setManualDomain("");
    setManualSocial("");
    setManualPricing("");
    setManualStrategy("");
    setManualComplaint("");
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Competitor & Social Lookup Bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              Competitors, Social Accounts & Pricing
            </h1>
            <p className="text-sm text-slate-600">
              Discover active businesses and creators, inspect their social handles,
              product prices, marketing tactics, and customer complaints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-full sm:w-auto">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTrack(tab.id)}
                  className={`min-h-[36px] sm:min-h-0 flex-1 sm:flex-initial rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    trackFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowManualForm((prev) => !prev)}
              className="inline-flex min-h-[40px] sm:min-h-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 w-full sm:w-auto"
            >
              {showManualForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{showManualForm ? "Close Form" : "Add Manually"}</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAnalyzeCompetitor}
          className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 md:grid-cols-12"
        >
          <div className="md:col-span-3">
            <label htmlFor="comp-track" className="sr-only">
              Track
            </label>
            <select
              id="comp-track"
              value={lookupTrack}
              onChange={(e) => setLookupTrack(e.target.value as OperatorTrack)}
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            >
              <option value="entrepreneur">Business / Brand</option>
              <option value="freelancer">Freelancer / Agency</option>
              <option value="creator">Content Creator</option>
              <option value="digital_seller">Digital Product Seller</option>
            </select>
          </div>
          <div className="md:col-span-7">
            <label htmlFor="comp-query" className="sr-only">
              Business name, creator handle, or website URL
            </label>
            <input
              id="comp-query"
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Look up any business or creator: e.g. Veekee James, Beehiiv, or @handle"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isAnalyzing || !lookupInput.trim()}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>{isAnalyzing ? "Scanning..." : "Analyze"}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
          >
            {errorMsg}
          </div>
        )}

        {showManualForm && (
          <form
            onSubmit={handleCreateManual}
            className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <input
              type="text"
              required
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Business or creator name *"
              className="min-h-[42px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
            <input
              type="text"
              value={manualDomain}
              onChange={(e) => setManualDomain(e.target.value)}
              placeholder="Website domain (e.g. brand.com)"
              className="min-h-[42px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
            <input
              type="text"
              value={manualSocial}
              onChange={(e) => setManualSocial(e.target.value)}
              placeholder="Social handle (e.g. @brandhandle)"
              className="min-h-[42px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
            <input
              type="text"
              value={manualPricing}
              onChange={(e) => setManualPricing(e.target.value)}
              placeholder="Product / service prices (e.g. ₦35k–₦80k)"
              className="min-h-[42px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
            <input
              type="text"
              value={manualStrategy}
              onChange={(e) => setManualStrategy(e.target.value)}
              placeholder="Marketing strategy used"
              className="min-h-[42px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualComplaint}
                onChange={(e) => setManualComplaint(e.target.value)}
                placeholder="Customer complaint or gap"
                className="min-h-[42px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-[42px] rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                Save Row
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Matrix Table + Detailed Teardown Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, social handles, or gaps..."
                aria-label="Search competitors"
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <label htmlFor="threat-filter" className="text-xs text-slate-500">
                Overlap:
              </label>
              <select
                id="threat-filter"
                value={threatFilter}
                onChange={(e) => setThreatFilter(e.target.value)}
                className="min-h-[38px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-700 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="Direct">Direct</option>
                <option value="Adjacent">Adjacent</option>
                <option value="Emerging">Emerging</option>
              </select>
            </div>
          </div>

          {filteredCompetitors.length === 0 ? (
            <div className="p-8 sm:p-10 text-center">
              <p className="text-sm font-medium text-slate-900">
                No competitors match this filter
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Analyze a competitor above or reset your search filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setThreatFilter("all");
                  onSelectTrack("all");
                }}
                className="mt-4 min-h-[40px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Stacked Cards */}
              <div className="divide-y divide-slate-200 md:hidden">
                {filteredCompetitors.map((comp) => {
                  const isSelected = activeCompetitor?.id === comp.id;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => handleRowSelect(comp.id)}
                      className={`w-full text-left p-4 transition-colors space-y-2 ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-slate-900 truncate">
                            {comp.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-mono text-slate-500 truncate">
                              {comp.domain}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className={`font-medium ${THREAT_TEXT_CLASS[comp.threatLevel]}`}>
                              {comp.threatLevel}
                            </span>
                          </div>
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
                        {comp.exploitableGap}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Tablet & Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                      <th className="py-2.5 pl-5 pr-3">Business / Creator</th>
                      <th className="px-3 py-2.5">Socials</th>
                      <th className="px-3 py-2.5">Pricing</th>
                      <th className="py-2.5 pl-3 pr-5">Customer Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredCompetitors.map((comp) => {
                      const isSelected = activeCompetitor?.id === comp.id;
                      return (
                        <tr
                          key={comp.id}
                          onClick={() => handleRowSelect(comp.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3 pl-5 pr-3 align-top">
                            <div className="font-semibold text-slate-900 whitespace-nowrap">
                              {comp.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-mono text-slate-500">{comp.domain}</span>
                              <span className="text-slate-300" aria-hidden="true">
                                ·
                              </span>
                              <span className={`font-medium ${THREAT_TEXT_CLASS[comp.threatLevel]}`}>
                                {comp.threatLevel}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top text-xs text-slate-700">
                            {(comp.socialHandles ?? []).slice(0, 2).map((s, idx) => (
                              <div key={idx} className="whitespace-nowrap">
                                <span className="text-slate-500">{s.platform}:</span>{" "}
                                <span className="font-mono text-slate-900">{s.handle}</span>
                              </div>
                            ))}
                          </td>
                          <td className="px-3 py-3 align-top font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {comp.pricingTier}
                          </td>
                          <td className="py-3 pl-3 pr-5 align-top text-xs text-slate-700 max-w-[220px]">
                            {comp.exploitableGap}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right Teardown Inspector */}
        <div id="competitor-inspector" className="xl:col-span-5 scroll-mt-20 min-w-0">
          {activeCompetitor ? (
            <aside className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              <div className="p-4 sm:p-6 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{TRACK_LABELS[activeCompetitor.track]}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        THREAT_TEXT_CLASS[activeCompetitor.threatLevel]
                      }`}
                    >
                      {activeCompetitor.threatLevel} Overlap
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono break-all">{activeCompetitor.domain}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {activeCompetitor.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {activeCompetitor.offerSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCompetitor(activeCompetitor.id)}
                  aria-label={`Remove ${activeCompetitor.name}`}
                  title="Remove from matrix"
                  className="flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {(activeCompetitor.socialHandles ?? []).length > 0 && (
                <div className="p-4 sm:p-6 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-900">
                    Social Media Accounts
                  </p>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {(activeCompetitor.socialHandles ?? []).map((social, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                      >
                        <span className="font-medium text-slate-600 shrink-0">
                          {social.platform}
                        </span>
                        {social.url ? (
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 hover:underline truncate"
                          >
                            <span className="truncate">{social.handle}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="font-mono font-semibold text-slate-900 truncate">
                            {social.handle}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeCompetitor.productsAndPrices ?? []).length > 0 && (
                <div className="p-4 sm:p-6 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-900">
                    Observed Products & Prices
                  </p>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {(activeCompetitor.productsAndPrices ?? []).map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                      >
                        <span className="text-slate-700">{row.item}</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                          {row.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-4">
                {(activeCompetitor.marketingStrategies ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-1.5">
                      Marketing Strategies Used
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(activeCompetitor.marketingStrategies ?? []).map((m, i) => (
                        <li key={i} className="leading-relaxed">
                          • {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(activeCompetitor.customerComplaints ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-800 mb-1.5">
                      Common Customer Complaints
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(activeCompetitor.customerComplaints ?? []).map((c, i) => (
                        <li key={i} className="leading-relaxed">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 bg-slate-50/70 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    How a New Entrant Can Win
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 leading-relaxed">
                    {activeCompetitor.counterStrategy}
                  </p>
                </div>

                {activeCompetitor.sources && activeCompetitor.sources.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Verified links:</span>
                    {activeCompetitor.sources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline max-w-[200px] truncate"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                Select a business or creator row to inspect their full profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
