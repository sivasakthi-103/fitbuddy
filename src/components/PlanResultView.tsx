import React, { useState, useMemo } from "react";
import {
  Calendar,
  Apple,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Copy,
  Printer,
  ChevronRight,
  Send,
  Sliders,
  Check,
  Timer,
  Flame,
  Info,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { UserProfile, WorkoutPlan } from "../types";
import { parseWorkoutPlan } from "../utils/planParser";

interface PlanResultViewProps {
  user: UserProfile;
  plan: WorkoutPlan;
  onPlanUpdated: (updatedPlan: WorkoutPlan) => void;
  onNewPlanRequest: () => void;
}

export const PlanResultView: React.FC<PlanResultViewProps> = ({
  user,
  plan,
  onPlanUpdated,
  onNewPlanRequest,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [viewVersion, setViewVersion] = useState<"updated" | "original">(
    plan.updated_plan ? "updated" : "original"
  );
  const [viewMode, setViewMode] = useState<"interactive" | "raw">("interactive");
  const [feedbackText, setFeedbackText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Active plan text to parse
  const currentPlanText = useMemo(() => {
    if (viewVersion === "updated" && plan.updated_plan) {
      return plan.updated_plan;
    }
    return plan.original_plan;
  }, [viewVersion, plan]);

  const activeNutritionTip = useMemo(() => {
    if (viewVersion === "updated" && plan.updated_nutrition_tip) {
      return plan.updated_nutrition_tip;
    }
    return plan.nutrition_tip;
  }, [viewVersion, plan]);

  const parsedDays = useMemo(() => {
    return parseWorkoutPlan(currentPlanText);
  }, [currentPlanText]);

  const activeDay = parsedDays[activeDayIndex] || parsedDays[0];

  const toggleExerciseCheck = (exerciseKey: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseKey]: !prev[exerciseKey],
    }));
  };

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(
      `FITBUDDY WORKOUT PLAN FOR ${user.username.toUpperCase()}\nGoal: ${user.goal} | Intensity: ${user.intensity}\n\n` +
        currentPlanText +
        `\n\nNUTRITION & RECOVERY TIP:\n` +
        activeNutritionTip
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          feedback: feedbackText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update workout plan.");
      }

      onPlanUpdated(data.plan);
      setViewVersion("updated");
      setFeedbackText("");
    } catch (err: any) {
      setUpdateError(err.message || "Failed to process feedback update.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner / User Biometric Card */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {user.username}'s 7-Day Plan
              </h1>
              {plan.updated_plan && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Version 2 (Refined)
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-400">
              <span>User ID: <code className="text-slate-200 font-mono font-semibold">{user.user_id}</code></span>
              <span>•</span>
              <span>Age: <strong className="text-slate-200">{user.age} yrs</strong></span>
              <span>•</span>
              <span>Weight: <strong className="text-slate-200">{user.weight} kg</strong></span>
              <span>•</span>
              <span className="capitalize">Goal: <strong className="text-emerald-400">{user.goal.replace(/_/g, " ")}</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlan}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Plan"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onNewPlanRequest}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Profile</span>
            </button>
          </div>
        </div>

        {/* Version Switcher if user has submitted feedback */}
        {plan.updated_plan && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Plan Comparison:
              </span>
              <div className="bg-[#131b2e] p-1 rounded-xl flex gap-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewVersion("updated")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewVersion === "updated"
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚡ Updated Plan (Post-Feedback)
                </button>
                <button
                  type="button"
                  onClick={() => setViewVersion("original")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewVersion === "original"
                      ? "bg-slate-700 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Original Generated Plan
                </button>
              </div>
            </div>

            {plan.feedback && viewVersion === "updated" && (
              <div className="text-xs text-slate-300 italic bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 max-w-md truncate">
                <strong className="text-emerald-400 not-italic">Feedback applied:</strong> "{plan.feedback}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenario 3: Targeted Nutrition & Recovery Tip Box */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/40 border border-cyan-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-cyan-400">
            <Apple className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Scenario 3: Targeted Nutrition & Recovery Guidance
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Gemini Flash Model
              </span>
            </div>
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed">
              {activeNutritionTip}
            </p>
          </div>
        </div>
      </div>

      {/* Main 7-Day Workout Plan Container */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Header & View Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              7-Day Structured Schedule
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {user.intensity.toUpperCase()} Intensity
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Display:</span>
            <div className="bg-[#131b2e] p-1 rounded-xl flex gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "interactive"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Interactive Day Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "raw"
                    ? "bg-slate-700 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                FastAPI &lt;pre&gt; Block
              </button>
            </div>
          </div>
        </div>

        {viewMode === "interactive" && parsedDays.length > 0 ? (
          <div>
            {/* Day Selector Pills */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
              {parsedDays.map((day, idx) => (
                <button
                  key={day.dayNumber || idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`p-3 rounded-xl text-center transition-all border ${
                    activeDayIndex === idx
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-[#131b2e] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider block">
                    Day {day.dayNumber || idx + 1}
                  </span>
                  <span className="text-xs font-semibold truncate block mt-0.5">
                    {day.isRestDay ? "Rest" : `Part ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Day Workout Card */}
            {activeDay && (
              <div className="space-y-5 bg-[#12192c] border border-slate-700/80 rounded-xl p-5 sm:p-7">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Day {activeDay.dayNumber} Protocol
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                      {activeDay.focus || activeDay.title}
                    </h3>
                  </div>
                  {activeDay.isRestDay ? (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                      Rest & Restoration
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Active Training Session
                    </span>
                  )}
                </div>

                {/* Warm-up Section */}
                <div className="rounded-xl bg-[#0b101d] border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Dynamic Warm-Up (5–10 mins)</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeDay.warmup}
                  </p>
                </div>

                {/* Main Workout Exercises */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Main Workout Protocol</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Click checkmark to track completion
                    </span>
                  </div>

                  {activeDay.exercises && activeDay.exercises.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeDay.exercises.map((ex, exIdx) => {
                        const key = `${user.user_id}-d${activeDay.dayNumber}-e${exIdx}`;
                        const isDone = Boolean(completedExercises[key]);
                        return (
                          <div
                            key={exIdx}
                            onClick={() => toggleExerciseCheck(key)}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isDone
                                ? "bg-emerald-950/20 border-emerald-500/40 opacity-75"
                                : "bg-[#0b101d] border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                    : "border-slate-600 bg-slate-800/60 text-transparent"
                                }`}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                              <div>
                                <p
                                  className={`text-sm sm:text-base font-semibold text-white ${
                                    isDone ? "line-through text-slate-400" : ""
                                  }`}
                                >
                                  {ex.name}
                                </p>
                                {ex.details && ex.details !== ex.name && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {ex.details}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                                {ex.sets} sets × {ex.reps}
                              </span>
                              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {ex.rest}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#0b101d] text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {activeDay.rawText}
                    </div>
                  )}
                </div>

                {/* Cooldown Section */}
                <div className="rounded-xl bg-[#0b101d] border border-slate-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cooldown & Mobility (5–10 mins)</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeDay.cooldown}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Raw View matching FastAPI <pre> requirement */
          <div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Renders raw format as returned to FastAPI Jinja2 template &lt;pre&gt; tag:</span>
              <button
                onClick={handleCopyPlan}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Copy Raw <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-6 rounded-xl bg-[#090d18] border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {currentPlanText}
            </pre>
          </div>
        )}
      </div>

      {/* Scenario 2: Feedback-Based Plan Updating Loop */}
      <div className="bg-[#0e1424] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Scenario 2: Refine Workout Plan (AI Feedback Loop)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                Gemini Pro Integration
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              Have specific constraints or evolving preferences? Request changes like
              <em> "Add 15 mins HIIT cardio"</em>, <em>"Include 1 more rest day"</em>, or <em>"Lower impact due to shoulder tightness"</em>.
              FitBuddy re-evaluates and regenerates an updated routine while preserving your original plan in the database.
            </p>

            {updateError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {updateError}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Please add 15 minutes of cardio at the end of each session, replace barbell squats due to knee pain, and include a dedicated core circuit."
                  className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-sm"
                />
              </div>

              {/* Quick feedback suggestions */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-400 py-1">Quick Suggestions:</span>
                {[
                  "Add 15 min HIIT cardio",
                  "Include more rest days (make it 4 days/week)",
                  "Focus heavily on core & mobility",
                  "Joint friendly: remove high-impact jumps",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setFeedbackText(sug)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating || !feedbackText.trim()}
                  className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isUpdating || !feedbackText.trim()
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Gemini: Updating & Re-structuring Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Feedback & Update Plan</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
