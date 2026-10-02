import React, { useState } from "react";
import { Sparkles, Flame, Target, User, Scale, Activity, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { UserProfile, WorkoutPlan } from "../types";

interface GeneratorFormProps {
  onPlanGenerated: (user: UserProfile, plan: WorkoutPlan) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const PRESET_PERSONAS = [
  {
    name: "Alex Rivera",
    user_id: "alex_fit",
    age: 28,
    weight: 78,
    goal: "muscle_gain",
    intensity: "high",
    notes: "Access to full commercial gym. Looking for progressive overload.",
    label: "Alex (Muscle Gain • High)",
  },
  {
    name: "Sarah Jenkins",
    user_id: "sarah_wellness",
    age: 34,
    weight: 65,
    goal: "weight_loss",
    intensity: "medium",
    notes: "Dumbbells and resistance bands at home. Prefers low-impact cardio.",
    label: "Sarah (Fat Loss • Medium)",
  },
  {
    name: "David Kim",
    user_id: "david_runner",
    age: 29,
    weight: 70,
    goal: "endurance",
    intensity: "medium",
    notes: "Training for a half-marathon, wants leg endurance and core stability.",
    label: "David (Endurance • Medium)",
  },
  {
    name: "Elena Rostova",
    user_id: "elena_core",
    age: 42,
    weight: 61,
    goal: "general_wellness",
    intensity: "low",
    notes: "Desk job with tight hips and mild lower back tightness. Bodyweight.",
    label: "Elena (Wellness • Low)",
  },
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onPlanGenerated,
  isLoading,
  setIsLoading,
}) => {
  const [formData, setFormData] = useState({
    username: "Alex Rivera",
    user_id: "alex_fit",
    age: 28,
    weight: 78,
    goal: "muscle_gain",
    intensity: "high",
    preferences: "Access to dumbbells and barbells. Focus on upper chest and quad growth.",
  });

  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyPreset = (preset: (typeof PRESET_PERSONAS)[0]) => {
    setFormData({
      username: preset.name,
      user_id: preset.user_id,
      age: preset.age,
      weight: preset.weight,
      goal: preset.goal,
      intensity: preset.intensity,
      preferences: preset.notes,
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate workout plan.");
      }

      clearInterval(stepInterval);
      setLoadingStep(3);

      setTimeout(() => {
        setIsLoading(false);
        onPlanGenerated(data.user, data.plan);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsLoading(false);
      setErrorMsg(err.message || "Something went wrong while connecting to Gemini.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Banner with Gym Motif */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 border border-slate-700/60 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Scenario 1: AI Plan Generator
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] mb-3">
            Build Your 7-Day Precision Fitness Blueprint
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Harness Google Gemini's advanced reasoning models to craft a periodized,
            day-wise workout protocol tailored to your body weight, exact goal, and selected intensity.
          </p>

          {/* Quick preset pills */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Test Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_PERSONAS.map((preset) => (
                <button
                  key={preset.user_id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold">Generation Notice</p>
              <p className="text-red-300/90 text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              />
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <span className="text-emerald-400 font-mono">#</span> User ID (For SQLite Persistence & Feedback)
              </label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                placeholder="e.g. alex_fitness"
                className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Age (Years)
              </label>
              <input
                type="number"
                required
                min={14}
                max={99}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              />
            </div>

            {/* Weight (kg) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" /> Weight (kg)
              </label>
              <input
                type="number"
                required
                min={30}
                max={250}
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              />
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Primary Fitness Goal
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
              >
                <option value="muscle_gain">💪 Muscle Gain & Hypertrophy</option>
                <option value="weight_loss">🔥 Weight Loss & Fat Burn</option>
                <option value="endurance">🏃 Endurance & Stamina</option>
                <option value="general_wellness">🌱 General Wellness & Vitality</option>
                <option value="flexibility">🧘 Flexibility, Mobility & Core</option>
              </select>
            </div>

            {/* Workout Intensity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" /> Preferred Intensity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, intensity: lvl })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      formData.intensity === lvl
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-[#131b2e] text-slate-300 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences / Equipment / Constraints */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Equipment Access & Preferences (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              placeholder="e.g. Home gym with adjustable dumbbells, no jump ropes, knee friendly exercises."
              className="w-full bg-[#131b2e] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
                isLoading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-emerald-400 rounded-full animate-spin" />
                  <span>
                    {loadingStep === 1 && "Synthesizing Biometric Profile..."}
                    {loadingStep === 2 && "Gemini: Formulating 7-Day Day-by-Day Routine..."}
                    {loadingStep === 3 && "Gemini Flash: Calculating Nutrition Macros..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate 7-Day Fitness Plan with Gemini</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feature badges */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Structured 7-Day Day-by-Day Split</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Goal-Specific Nutrition & Recovery</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Adaptive AI Feedback Loop</span>
          </div>
        </div>
      </div>
    </div>
  );
};
