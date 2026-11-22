import {
  BookOpen,
  Crosshair,
  Download,
  FileText,
  LayoutGrid,
  RotateCcw,
  X,
} from "lucide-react";
import type { TrackFilter, WorkspaceView } from "../types";

interface SidebarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  trackFilter: TrackFilter;
  onSelectTrack: (track: TrackFilter) => void;
  counts: {
    playbooks: number;
    competitors: number;
    checklistDone: number;
    checklistTotal: number;
  };
  onExportMarkdown: () => void;
  onResetWorkspace: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: WorkspaceView;
  label: string;
  icon: typeof LayoutGrid;
}> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "competitors", label: "Competitors & Socials", icon: Crosshair },
  { id: "playbooks", label: "Veteran Playbooks", icon: BookOpen },
  { id: "report", label: "Market Report", icon: FileText },
];

const TRACK_OPTIONS: Array<{ id: TrackFilter; label: string }> = [
  { id: "all", label: "All Audiences" },
  { id: "entrepreneur", label: "Entrepreneurs & SMB" },
  { id: "freelancer", label: "Freelancers" },
  { id: "creator", label: "Content Creators" },
  { id: "digital_seller", label: "Digital Product Sellers" },
];

export function Sidebar({
  activeView,
  onSelectView,
  trackFilter,
  onSelectTrack,
  counts,
  onExportMarkdown,
  onResetWorkspace,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-white border-r border-slate-200 px-4 py-5">
      <div className="space-y-7">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => {
              onSelectView("overview");
              onCloseMobile();
            }}
            className="text-left font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            MarketLens AI
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden flex h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-900 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="px-2 text-xs font-medium text-slate-500">Research Hub</p>
          <nav aria-label="Primary Workspace" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const trailingCount =
                item.id === "playbooks"
                  ? counts.playbooks
                  : item.id === "competitors"
                  ? counts.competitors
                  : item.id === "report"
                  ? `${counts.checklistDone}/${counts.checklistTotal}`
                  : null;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {trailingCount !== null && (
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        isActive ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {trailingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-5">
          <p className="px-2 text-xs font-medium text-slate-500">Target Audience</p>
          <div className="space-y-1">
            {TRACK_OPTIONS.map((option) => {
              const active = trackFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelectTrack(option.id);
                    onCloseMobile();
                  }}
                  className={`flex min-h-[44px] lg:min-h-0 w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    active
                      ? "bg-blue-50 font-semibold text-blue-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{option.label}</span>
                  {active && <span className="font-mono text-xs text-blue-700">Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-1.5 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => {
            onExportMarkdown();
            onCloseMobile();
          }}
          className="flex min-h-[44px] lg:min-h-0 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Export Report</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onResetWorkspace();
            onCloseMobile();
          }}
          className="flex min-h-[44px] lg:min-h-0 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          <span>Restore Sample Brief</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {navContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full w-[280px] max-w-[85vw]">{navContent}</div>
        </div>
      )}
    </>
  );
}
