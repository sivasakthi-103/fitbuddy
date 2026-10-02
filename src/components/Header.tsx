import React from "react";
import { Dumbbell, Users, Terminal, Sparkles, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  activeTab: "generator" | "plan" | "admin" | "docs";
  setActiveTab: (tab: "generator" | "plan" | "admin" | "docs") => void;
  hasActivePlan: boolean;
  totalUsersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasActivePlan,
  totalUsersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab("generator")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b101c] rounded-[10px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                FitBuddy
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI Workout & Nutrition Architecture
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "generator"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Generate Plan</span>
            <span className="sm:hidden">Create</span>
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === "plan"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Active Plan</span>
            <span className="sm:hidden">Plan</span>
            {hasActivePlan && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "admin"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Coach Admin</span>
            <span className="sm:hidden">Admin</span>
            {totalUsersCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {totalUsersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "docs"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
            title="FastAPI Backend & VS Code Run Guide"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">FastAPI & VS Code</span>
            <span className="md:hidden">Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
