import React, { useState, useRef, useEffect } from "react";
import { BarChart, RefreshCw, LogOut, Users, ChevronDown } from "../ui/icons";
import TaskCommandLogo from "../ui/TaskCommandLogo";

export default function Header({
  user,
  showDashboard = false,
  showManagerDashboard = false,
  onToggleDashboard,
  onToggleManagerDashboard,
  onRefresh,
  onLogout,
  loading = false,
}) {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsViewMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentView = showManagerDashboard ? 'Manager View' : 'Personal View';
  const CurrentIcon = showManagerDashboard ? Users : BarChart;

  const handleViewSelect = (viewType) => {
    if (viewType === 'personal' && showManagerDashboard) {
      onToggleManagerDashboard();
    } else if (viewType === 'manager' && !showManagerDashboard) {
      onToggleManagerDashboard();
    }
    setIsViewMenuOpen(false);
  };

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
            {/* View Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white shadow-md transition-all hover:shadow-lg text-sm font-medium"
              >
                <CurrentIcon />
                {currentView}
                <ChevronDown className={`transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isViewMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={() => handleViewSelect('personal')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      !showManagerDashboard
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart />
                    Personal View
                    {!showManagerDashboard && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>

                  {onToggleManagerDashboard && (
                    <button
                      type="button"
                      onClick={() => handleViewSelect('manager')}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-slate-100 ${
                        showManagerDashboard
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Users />
                      Manager View
                      {showManagerDashboard && (
                        <span className="ml-auto text-indigo-600">✓</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

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