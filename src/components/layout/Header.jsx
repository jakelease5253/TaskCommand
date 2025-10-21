import React from "react";
import { BarChart, RefreshCw, LogOut } from "../ui/icons";
import TaskCommandLogo from "../ui/TaskCommandLogo";

export default function Header({
  user,
  showDashboard = false,
  onToggleDashboard,
  onRefresh,
  onLogout,
  loading = false,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <TaskCommandLogo size="sm" />
              <h1 className="text-2xl font-bold text-slate-800">TaskCommand</h1>
            </div>
            {user && (
              <span className="text-sm text-slate-600 hidden sm:inline">
                Welcome, {user.displayName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleDashboard}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                showDashboard
                  ? "gradient-primary text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BarChart />
              Dashboard
            </button>

            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
              <LogOut />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}