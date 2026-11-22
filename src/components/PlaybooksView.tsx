import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ExternalLink, Search, Sparkles } from "lucide-react";
import type { OperatorTrack, TrackFilter, VeteranPlaybook } from "../types";
import { TRACK_LABELS } from "../data/seedData";
import { PortraitAvatar } from "./PortraitAvatar";

interface PlaybooksViewProps {
  playbooks: VeteranPlaybook[];
  selectedPlaybookId: string;
  onSelectPlaybook: (id: string) => void;
  trackFilter: TrackFilter;
  onSelectTrack: (track: TrackFilter) => void;
  checkedItems: Record<string, boolean>;
  onToggleChecklistItem: (key: string) => void;
  activeNiche: string;
  onAddPlaybook: (playbook: VeteranPlaybook) => void;
}

const FILTER_TABS: Array<{ id: TrackFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "entrepreneur", label: "Entrepreneurs" },
  { id: "freelancer", label: "Freelancers" },
  { id: "creator", label: "Creators" },
  { id: "digital_seller", label: "Digital Sellers" },
];

export function PlaybooksView({
  playbooks,
  selectedPlaybookId,
  onSelectPlaybook,
  trackFilter,
  onSelectTrack,
  checkedItems,
  onToggleChecklistItem,
  activeNiche,
  onAddPlaybook,
}: PlaybooksViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dilemmaInput, setDilemmaInput] = useState("");
  const [dilemmaTrack, setDilemmaTrack] = useState<OperatorTrack>(
    trackFilter === "all" ? "entrepreneur" : trackFilter
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredPlaybooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return playbooks.filter((item) => {
      const matchesTrack = trackFilter === "all" || item.track === trackFilter;
      if (!matchesTrack) return false;
      if (!q) return true;
      return (
        item.operatorName.toLowerCase().includes(q) ||
        item.roleTitle.toLowerCase().includes(q) ||
        item.businessModel.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    });
  }, [playbooks, trackFilter, searchQuery]);

  const activePlaybook =
    filteredPlaybooks.find((p) => p.id === selectedPlaybookId) ??
    filteredPlaybooks[0] ??
    null;

  const handleSelectItem = (id: string) => {
    onSelectPlaybook(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        document
          .getElementById("playbook-detail")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    }
  };

  const handleGeneratePlaybook = async (e: FormEvent) => {
    e.preventDefault();
    if (!dilemmaInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/research/playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: dilemmaTrack,
          dilemma: dilemmaInput.trim(),
          niche: activeNiche,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to research veteran playbook.");
      }
      onAddPlaybook(data as VeteranPlaybook);
      onSelectPlaybook(data.id);
      setDilemmaInput("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to load playbook.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              Veteran Operator Playbooks
            </h1>
            <p className="text-sm text-slate-600">
              Understand how people already operating in your industry handle pricing,
              marketing, inventory, and client retention compared to Year 1 beginners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-full lg:w-auto">
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
        </div>

        <form
          onSubmit={handleGeneratePlaybook}
          className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 md:grid-cols-12"
        >
          <div className="md:col-span-3">
            <label htmlFor="dilemma-track" className="sr-only">
              Operator Track
            </label>
            <select
              id="dilemma-track"
              value={dilemmaTrack}
              onChange={(e) => setDilemmaTrack(e.target.value as OperatorTrack)}
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            >
              <option value="entrepreneur">Entrepreneur / Small Business</option>
              <option value="freelancer">Freelancer</option>
              <option value="creator">Content Creator</option>
              <option value="digital_seller">Digital Product Seller</option>
            </select>
          </div>
          <div className="md:col-span-7">
            <label htmlFor="dilemma-input" className="sr-only">
              Ask how veterans solve a specific problem
            </label>
            <input
              id="dilemma-input"
              type="text"
              value={dilemmaInput}
              onChange={(e) => setDilemmaInput(e.target.value)}
              placeholder="Ask how veterans handle a challenge: e.g. How do Nigerian clothing brands handle delivery and returns?"
              className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isGenerating || !dilemmaInput.trim()}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{isGenerating ? "Researching..." : "Fetch Playbook"}</span>
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
      </section>

      {/* Master-Detail Playbook Explorer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white flex flex-col min-w-0">
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter playbooks..."
                aria-label="Filter veteran playbooks"
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredPlaybooks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                No playbooks match your current filter
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Clear your search or select All to view saved veteran dossiers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onSelectTrack("all");
                }}
                className="mt-4 min-h-[40px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Show All Playbooks
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredPlaybooks.map((item) => {
                const isSelected = activePlaybook?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3.5 ${
                      isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <PortraitAvatar
                      src={item.portraitUrl}
                      name={item.operatorName}
                      sizeClass="h-11 w-11"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="truncate">{TRACK_LABELS[item.track]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums shrink-0">
                          {item.yearsInBusiness} yrs
                        </span>
                      </div>
                      <p className="mt-0.5 font-display text-sm font-semibold text-slate-900 truncate">
                        {item.operatorName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{item.roleTitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div id="playbook-detail" className="lg:col-span-8 scroll-mt-20 min-w-0">
          {activePlaybook ? (
            <article className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
              <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-start">
                <PortraitAvatar
                  src={activePlaybook.portraitUrl}
                  name={activePlaybook.operatorName}
                  sizeClass="h-16 w-16"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">
                      {TRACK_LABELS[activePlaybook.track]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {activePlaybook.yearsInBusiness} years in business
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activePlaybook.businessModel}</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {activePlaybook.operatorName} — {activePlaybook.roleTitle}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {activePlaybook.summary}
                  </p>
                  <p className="font-mono text-xs text-slate-700 tabular-nums pt-1">
                    Revenue mix: {activePlaybook.revenueMix}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-slate-50/70">
                <p className="text-xs font-semibold text-slate-500">
                  Core Operational Insight
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-900 leading-relaxed">
                  {activePlaybook.nonObviousLesson}
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-4">
                  01. Year 1 Approach vs. Veteran Operations
                </h3>

                {/* Mobile Stacked Comparison */}
                <div className="space-y-3 sm:hidden">
                  {(activePlaybook.shifts ?? []).map((shift) => (
                    <div
                      key={shift.dimension}
                      className="rounded-lg border border-slate-200 p-3.5 space-y-2"
                    >
                      <p className="text-xs font-semibold text-slate-900">
                        {shift.dimension}
                      </p>
                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-500">Year 1: </span>
                        {shift.yearOne}
                      </div>
                      <div className="text-xs font-medium text-slate-900">
                        <span className="font-medium text-blue-700">Veteran: </span>
                        {shift.veteranToday}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet / Desktop Table */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                        <th className="px-4 py-2.5 w-36">Dimension</th>
                        <th className="px-4 py-2.5">Typical Year 1 Mistake</th>
                        <th className="px-4 py-2.5">Veteran Operating Model</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(activePlaybook.shifts ?? []).map((shift) => (
                        <tr key={shift.dimension}>
                          <td className="px-4 py-3 align-top font-semibold text-slate-900 text-xs">
                            {shift.dimension}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-slate-600 leading-relaxed">
                            {shift.yearOne}
                          </td>
                          <td className="px-4 py-3 align-top text-xs font-medium text-slate-900 leading-relaxed">
                            {shift.veteranToday}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3">
                  02. Actions You Can Adopt This Week
                </h3>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {(activePlaybook.checklist ?? []).map((step, index) => {
                    const key = `${activePlaybook.id}:${index}`;
                    const checked = Boolean(checkedItems[key]);
                    return (
                      <label
                        key={key}
                        className="flex min-h-[44px] cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => onToggleChecklistItem(key)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            checked
                              ? "border-blue-700 bg-blue-700 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-slate-400"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className={`text-sm leading-relaxed ${
                            checked ? "line-through text-slate-400" : "text-slate-800"
                          }`}
                        >
                          {step}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {activePlaybook.sources && activePlaybook.sources.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Sources:</span>
                    {activePlaybook.sources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline max-w-[220px] truncate"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                Select a veteran playbook from the list to inspect their operating model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
