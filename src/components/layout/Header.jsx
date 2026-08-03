import React, { useState, useRef, useEffect } from "react";
import { BarChart, RefreshCw, LogOut, Users, ChevronDown, Target, Calendar } from "../ui/icons";
import TaskCommandLogo from "../ui/TaskCommandLogo";
import { useTheme } from "../../contexts/ThemeContext";

export default function Header({
  user,
  currentView = 'personal', // 'personal', 'manager', 'settings'
  onNavigate,
  onRefresh,
  onLogout,
  loading = false,
}) {
  const { theme } = useTheme();
  console.log('Header rendering with theme:', theme.id, 'primaryDark:', theme.colors.primaryDark);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuSelect = (view) => {
    if (view === 'logout') {
      onLogout();
    } else {
      onNavigate(view);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('personal')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <TaskCommandLogo size="sm" />
              <h1 className="text-2xl font-bold" style={{ color: theme.colors.primaryDark }}>TaskCommand</h1>
            </button>
            {user && (
              <span className="text-sm text-slate-600 hidden sm:inline">
                Welcome, {user.displayName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Only show refresh button on personal view (manager dashboard has its own refresh) */}
            {currentView === 'personal' && (
              <button
                type="button"
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            )}

            {/* Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white shadow-md transition-all hover:shadow-lg text-sm font-medium"
              >
                Menu
                <ChevronDown className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={() => handleMenuSelect('personal')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      currentView === 'personal'
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Target />
                    Personal Tasks
                    {currentView === 'personal' && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMenuSelect('planning')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-slate-100 ${
                      currentView === 'planning'
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar />
                    Planning
                    {currentView === 'planning' && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMenuSelect('manager')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-slate-100 ${
                      currentView === 'manager'
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users />
                    Manager Dashboard
                    {currentView === 'manager' && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMenuSelect('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-slate-100 ${
                      currentView === 'settings'
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart />
                    Settings
                    {currentView === 'settings' && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMenuSelect('logout')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-t border-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}