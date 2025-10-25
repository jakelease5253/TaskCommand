import React from "react";
import { BarChart, TrendingUp, Award, Zap, ChevronUp } from "../../../components/ui/icons";

export default function Dashboard({
  dateRange,
  setDateRange,
  metrics,
  onToggleCollapse,
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Performance Dashboard
        </h2>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Hide metrics"
          >
            <ChevronUp className="text-slate-600" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total Completed</p>
              <div className="text-3xl font-bold text-slate-800">
                {metrics.totalCompleted}
              </div>
              <p className="text-xs text-slate-500 mt-1">tasks</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <BarChart />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Avg Focus Time</p>
              <div className="text-3xl font-bold text-slate-800">
                {metrics.avgFocusTime}
              </div>
              <p className="text-xs text-slate-500 mt-1">minutes</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <TrendingUp />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Completion Rate</p>
              <div className="text-3xl font-bold text-slate-800">
                {metrics.completionRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1">of tasks</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Award />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Current Streak</p>
              <div className="text-3xl font-bold text-slate-800">
                {metrics.currentStreak}
              </div>
              <p className="text-xs text-slate-500 mt-1">consecutive days</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Zap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}