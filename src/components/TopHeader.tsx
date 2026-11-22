import { Menu, Search } from "lucide-react";
import type { TrackFilter, WorkspaceView } from "../types";

interface TopHeaderProps {
  activeView: WorkspaceView;
  trackFilter: TrackFilter;
  activeNiche: string;
  onOpenMobileMenu: () => void;
  onFocusResearch: () => void;
}

const VIEW_TITLES: Record<WorkspaceView, string> = {
  overview: "Overview",
  competitors: "Competitors & Socials",
  playbooks: "Veteran Playbooks",
  report: "Market Report",
};

const TRACK_NAMES: Record<TrackFilter, string> = {
  all: "All Audiences",
  entrepreneur: "Entrepreneurs & SMB",
  freelancer: "Freelancers",
  creator: "Content Creators",
  digital_seller: "Digital Product Sellers",
};

export function TopHeader({
  activeView,
  trackFilter,
  activeNiche,
  onOpenMobileMenu,
  onFocusResearch,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-xs">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <span className="hidden xs:inline sm:inline text-slate-500 whitespace-nowrap shrink-0">
            MarketLens AI
          </span>
          <span className="hidden xs:inline sm:inline text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="font-semibold text-slate-900 truncate">
            {VIEW_TITLES[activeView]}
          </span>
          <span className="hidden md:inline text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="hidden md:inline truncate text-slate-600">
            {TRACK_NAMES[trackFilter]}
            {activeNiche ? ` · ${activeNiche}` : ""}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onFocusResearch}
        className="inline-flex min-h-[40px] items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-700 px-3 sm:px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span>Research Idea</span>
      </button>
    </header>
  );
}
