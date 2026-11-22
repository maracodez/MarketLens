import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Compass, Download } from "lucide-react";
import type {
  CompetitorEntry,
  CustomerComplaintGap,
  OperatorTrack,
  PositioningPlan,
  VeteranPlaybook,
} from "../types";
import { TRACK_LABELS } from "../data/seedData";

interface PositioningViewProps {
  activeNiche: string;
  executiveSummary: string;
  marketingHighlights: string[];
  customerComplaints: CustomerComplaintGap[];
  playbooks: VeteranPlaybook[];
  competitors: CompetitorEntry[];
  plan: PositioningPlan;
  onUpdatePlan: (nextPlan: PositioningPlan) => void;
  onExportMarkdown: () => void;
}

export function PositioningView({
  activeNiche,
  executiveSummary,
  marketingHighlights,
  customerComplaints,
  playbooks,
  competitors,
  plan,
  onUpdatePlan,
  onExportMarkdown,
}: PositioningViewProps) {
  const [track, setTrack] = useState<OperatorTrack>("entrepreneur");
  const [niche, setNiche] = useState(
    activeNiche || "Contemporary Fashion Business in Nigeria"
  );
  const [userStrength, setUserStrength] = useState(
    "Direct quality control, transparent pricing, and fast customer response"
  );
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(
    playbooks[0]?.id ?? ""
  );
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>(
    competitors.slice(0, 2).map((c) => c.id)
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleCompetitor = (id: string) => {
    setSelectedCompetitorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSynthesize = async (e: FormEvent) => {
    e.preventDefault();
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setErrorMsg(null);
    try {
      const chosenVeteran = playbooks.find((p) => p.id === selectedPlaybookId);
      const chosenCompetitors = competitors.filter((c) =>
        selectedCompetitorIds.includes(c.id)
      );

      const res = await fetch("/api/research/positioning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          niche: niche.trim(),
          userStrength: userStrength.trim(),
          veteranModel: chosenVeteran
            ? `${chosenVeteran.businessModel} (${chosenVeteran.nonObviousLesson})`
            : undefined,
          competitors: chosenCompetitors.map((c) => ({
            name: c.name,
            exploitableGap: c.exploitableGap,
            pricingTier: c.pricingTier,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to generate market report strategy.");
      }

      onUpdatePlan({
        ...plan,
        targetSegment: data.targetSegment,
        corePromise: data.corePromise,
        pricingAnchor: data.pricingAnchor,
        weeklyCadence: data.weeklyCadence,
        firstThreeMoves: Array.isArray(data.firstThreeMoves)
          ? data.firstThreeMoves
          : plan.firstThreeMoves,
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to synthesize market report."
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              AI Market Research Report & Launch Strategy
            </h1>
            <p className="text-sm text-slate-600">
              Organized research report combining observed marketing strategies,
              customer complaints, competitor pricing, and your 30-day launch plan.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportMarkdown}
            className="inline-flex min-h-[42px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Full Report (.md)</span>
          </button>
        </div>

        {executiveSummary && (
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500">
              Executive Industry Brief · {activeNiche || "Active Market"}
            </p>
            <p className="mt-1 text-sm text-slate-800 leading-relaxed">
              {executiveSummary}
            </p>
          </div>
        )}
      </section>

      {/* Organized Summary Findings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-3 min-w-0">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Observed Marketing Tactics in This Industry
          </h2>
          <ul className="space-y-2 text-xs text-slate-700">
            {marketingHighlights.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-mono font-semibold text-blue-700 mr-2">
                  0{idx + 1}.
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-3 min-w-0">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Top Customer Complaints & Market Openings
          </h2>
          <ul className="space-y-2.5 text-xs">
            {customerComplaints.slice(0, 3).map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-semibold text-red-800">{item.complaint}</span>
                <span className="text-slate-400"> {"->"} </span>
                <span className="text-slate-700">{item.opportunity}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Strategy Synthesizer + Editable Blueprint */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <form
          onSubmit={handleSynthesize}
          className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-5 min-w-0"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            01. Customize Your Entry Strategy
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="pos-track"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Your Profile
              </label>
              <select
                id="pos-track"
                value={track}
                onChange={(e) => setTrack(e.target.value as OperatorTrack)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                <option value="entrepreneur">Entrepreneur / Small Business</option>
                <option value="freelancer">Freelancer</option>
                <option value="creator">Content Creator</option>
                <option value="digital_seller">Digital Product Seller</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pos-niche"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Business Idea / Niche
              </label>
              <input
                id="pos-niche"
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="pos-strength"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Your Starting Edge or Resources
              </label>
              <textarea
                id="pos-strength"
                rows={2}
                value={userStrength}
                onChange={(e) => setUserStrength(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="pos-veteran"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Veteran Model to Adopt
              </label>
              <select
                id="pos-veteran"
                value={selectedPlaybookId}
                onChange={(e) => setSelectedPlaybookId(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                {playbooks.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.operatorName} · {pb.businessModel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">
                Competitors to Beat ({selectedCompetitorIds.length} selected)
              </p>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 rounded-lg border border-slate-200">
                {competitors.map((comp) => {
                  const checked = selectedCompetitorIds.includes(comp.id);
                  return (
                    <label
                      key={comp.id}
                      className="flex min-h-[44px] cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-slate-50"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleCompetitor(comp.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <div className="min-w-0 flex-1 text-xs">
                        <span className="font-semibold text-slate-900">{comp.name}</span>
                        <span className="text-slate-400"> · </span>
                        <span className="text-slate-500">{TRACK_LABELS[comp.track]}</span>
                        <p className="text-slate-600 truncate">{comp.exploitableGap}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSynthesizing}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Compass className="h-4 w-4 shrink-0" />
            <span>
              {isSynthesizing ? "Generating Strategy..." : "Generate Decision Plan"}
            </span>
          </button>
        </form>

        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                02. Recommended Market Entry Blueprint
              </h2>
              <p className="text-xs text-slate-500">
                Editable decision guide saved automatically to your browser.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
              Updated {new Date(plan.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="bp-segment"
                className="block text-xs font-medium text-slate-500 mb-1"
              >
                Underserved Target Customer
              </label>
              <input
                id="bp-segment"
                type="text"
                value={plan.targetSegment}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    targetSegment: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="min-h-[42px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="bp-promise"
                className="block text-xs font-medium text-slate-500 mb-1"
              >
                Differentiated Offer Promise
              </label>
              <textarea
                id="bp-promise"
                rows={2}
                value={plan.corePromise}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    corePromise: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="bp-pricing"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Recommended Pricing Anchor
                </label>
                <input
                  id="bp-pricing"
                  type="text"
                  value={plan.pricingAnchor}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      pricingAnchor: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bp-cadence"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Weekly Marketing Cadence
                </label>
                <input
                  id="bp-cadence"
                  type="text"
                  value={plan.weeklyCadence}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      weeklyCadence: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                First 30-Day Execution Moves
              </p>
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {plan.firstThreeMoves.map((move, idx) => (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums pt-0.5 shrink-0">
                      0{idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={move}
                      onChange={(e) => {
                        const updatedMoves = [...plan.firstThreeMoves];
                        updatedMoves[idx] = e.target.value;
                        onUpdatePlan({
                          ...plan,
                          firstThreeMoves: updatedMoves,
                          updatedAt: new Date().toISOString(),
                        });
                      }}
                      aria-label={`Execution move ${idx + 1}`}
                      className="w-full min-w-0 text-sm text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="bp-notes"
                className="block text-xs font-medium text-slate-500 mb-1"
              >
                Decision Notes & Guardrails
              </label>
              <textarea
                id="bp-notes"
                rows={3}
                value={plan.notes}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    notes: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
