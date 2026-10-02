import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { GeneratorForm } from "./components/GeneratorForm";
import { PlanResultView } from "./components/PlanResultView";
import { AdminDashboard } from "./components/AdminDashboard";
import { VsCodeGuide } from "./components/VsCodeGuide";
import { UserProfile, WorkoutPlan } from "./types";
import { Dumbbell, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "plan" | "admin" | "docs">("generator");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Fetch initial user count and default sample user
  const fetchInitialData = async () => {
    try {
      const response = await fetch("/api/view-all-users");
      const data = await response.json();
      if (data.users && data.users.length > 0) {
        setTotalUsersCount(data.users.length);
        // Pre-load the first user with a plan so the plan tab is immediately previewable
        const userWithPlan = data.users.find((u: any) => u.plan);
        if (userWithPlan && !currentUser) {
          setCurrentUser(userWithPlan);
          setCurrentPlan(userWithPlan.plan);
        }
      }
    } catch (err) {
      console.error("Error fetching initial roster:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handlePlanGenerated = (user: UserProfile, plan: WorkoutPlan) => {
    setCurrentUser(user);
    setCurrentPlan(plan);
    setTotalUsersCount((prev) => prev + 1);
    setActiveTab("plan");
  };

  const handlePlanUpdated = (updatedPlan: WorkoutPlan) => {
    setCurrentPlan(updatedPlan);
  };

  const handleSelectFromAdmin = (user: UserProfile, plan: WorkoutPlan) => {
    setCurrentUser(user);
    setCurrentPlan(plan);
    setActiveTab("plan");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActivePlan={Boolean(currentUser && currentPlan)}
        totalUsersCount={totalUsersCount}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
        {/* Generator Form Tab */}
        {activeTab === "generator" && (
          <GeneratorForm
            onPlanGenerated={handlePlanGenerated}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {/* Active Plan Tab */}
        {activeTab === "plan" && (
          <>
            {currentUser && currentPlan ? (
              <PlanResultView
                user={currentUser}
                plan={currentPlan}
                onPlanUpdated={handlePlanUpdated}
                onNewPlanRequest={() => setActiveTab("generator")}
              />
            ) : (
              <div className="max-w-xl mx-auto text-center py-16 px-6 bg-[#0e1424] border border-slate-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Active Workout Plan Selected</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Generate a personalized 7-day routine tailored to your fitness objectives or select a registered client from the directory.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("generator")}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate New Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors border border-slate-700"
                  >
                    Browse Client Roster
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Coach Admin Directory Tab */}
        {activeTab === "admin" && (
          <AdminDashboard
            onSelectUserPlan={handleSelectFromAdmin}
            onRefreshCount={fetchInitialData}
          />
        )}

        {/* FastAPI & VS Code Documentation Tab */}
        {activeTab === "docs" && <VsCodeGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 px-4 lg:px-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">FitBuddy AI</span>
            <span>•</span>
            <span>Personalized Workout & Nutrition Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Google Gemini Powered
            </span>
            <span>•</span>
            <span>SQLite & FastAPI Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
