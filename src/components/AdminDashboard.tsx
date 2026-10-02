import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  FileText
} from "lucide-react";
import { UserProfile, WorkoutPlan, UserWithPlan } from "../types";

interface AdminDashboardProps {
  onSelectUserPlan: (user: UserProfile, plan: WorkoutPlan) => void;
  onRefreshCount: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectUserPlan,
  onRefreshCount,
}) => {
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [goalFilter, setGoalFilter] = useState("all");
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserWithPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/view-all-users");
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm(`Are you sure you want to delete user '${userId}' and their associated plans?`)) {
      return;
    }
    setIsDeleting(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.user_id !== userId));
        if (selectedUserDetail?.user_id === userId) {
          setSelectedUserDetail(null);
        }
        onRefreshCount();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = goalFilter === "all" || u.goal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  const updatedPlansCount = users.filter((u) => u.plan && u.plan.updated_plan).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Admin Header */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" /> Scenario 4: Coach & Admin Oversight
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Client Roster & Plan Directory
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              SQLite & SQLAlchemy persistence backend. Compare original baseline routines vs adaptive feedback updates.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Total Athletes</span>
            <span className="text-xl font-bold text-white mt-1 block">{users.length}</span>
          </div>
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Active Plans</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {users.filter((u) => u.plan).length}
            </span>
          </div>
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Feedback Revisions</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">{updatedPlansCount}</span>
          </div>
          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Avg Client Weight</span>
            <span className="text-xl font-bold text-purple-400 mt-1 block">
              {users.length > 0
                ? Math.round(users.reduce((acc, u) => acc + u.weight, 0) / users.length)
                : 0}{" "}
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131b2e] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Fitness Goals</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="endurance">Endurance</option>
            <option value="general_wellness">General Wellness</option>
            <option value="flexibility">Flexibility</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111827] text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Biometrics</th>
                <th className="py-3.5 px-4">Goal & Intensity</th>
                <th className="py-3.5 px-4">Plan Status</th>
                <th className="py-3.5 px-4">Feedback Revision</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const hasPlan = Boolean(u.plan);
                  const hasUpdatedPlan = Boolean(u.plan?.updated_plan);

                  return (
                    <tr
                      key={u.user_id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{u.username}</span>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-3.5 px-4">
                        <code className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {u.user_id}
                        </code>
                      </td>

                      {/* Biometrics */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span>{u.age} yrs</span> • <span>{u.weight} kg</span>
                      </td>

                      {/* Goal & Intensity */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-emerald-400 capitalize">
                            {u.goal.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {u.intensity} Intensity
                          </span>
                        </div>
                      </td>

                      {/* Plan Status */}
                      <td className="py-3.5 px-4">
                        {hasUpdatedPlan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            <Sparkles className="w-3 h-3" /> Updated (v2)
                          </span>
                        ) : hasPlan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Original (v1)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Pending</span>
                        )}
                      </td>

                      {/* Feedback */}
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {u.plan?.feedback ? (
                          <span className="text-xs text-slate-300 italic truncate block">
                            "{u.plan.feedback}"
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasPlan && (
                            <>
                              <button
                                onClick={() => setSelectedUserDetail(u)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Inspect Plan Comparison"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onSelectUserPlan(u, u.plan!)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                                title="Open in Interactive Active Plan View"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(u.user_id)}
                            disabled={isDeleting === u.user_id}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                            title="Delete Client Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? "Loading clients from database..." : "No client profiles found matching criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Inspection Modal */}
      {selectedUserDetail && selectedUserDetail.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {selectedUserDetail.username}'s Workout Plan
                  </h3>
                  <code className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {selectedUserDetail.user_id}
                  </code>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Goal: {selectedUserDetail.goal} • Intensity: {selectedUserDetail.intensity} • Weight: {selectedUserDetail.weight}kg
                </p>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Nutrition Tip */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  🥗 Nutrition & Recovery Tip (Gemini Flash)
                </span>
                <p className="text-sm text-slate-200">
                  {selectedUserDetail.plan.updated_nutrition_tip || selectedUserDetail.plan.nutrition_tip}
                </p>
              </div>

              {/* Side-by-side or Stacked Plans */}
              {selectedUserDetail.plan.updated_plan ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="bg-[#12192b] border border-slate-800 rounded-xl p-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Original Plan (v1 Baseline)
                    </span>
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {selectedUserDetail.plan.original_plan}
                    </pre>
                  </div>

                  {/* Updated */}
                  <div className="bg-[#12192b] border border-cyan-500/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                        ⚡ Updated Plan (v2 Refined)
                      </span>
                    </div>
                    {selectedUserDetail.plan.feedback && (
                      <p className="text-xs text-slate-300 italic mb-3 bg-slate-900/80 p-2 rounded border border-slate-800">
                        Feedback: "{selectedUserDetail.plan.feedback}"
                      </p>
                    )}
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {selectedUserDetail.plan.updated_plan}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-[#12192b] border border-slate-800 rounded-xl p-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                    7-Day Workout Routine
                  </span>
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                    {selectedUserDetail.plan.original_plan}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#111827] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectUserPlan(selectedUserDetail, selectedUserDetail.plan!);
                  setSelectedUserDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Open in Interactive Workout Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
