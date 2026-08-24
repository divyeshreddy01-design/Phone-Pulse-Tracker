import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  History, 
  BarChart3, 
  FileText, 
  Settings, 
  Sparkles,
  GitCompare,
  X,
  TrendingUp
} from 'lucide-react';
import { Person, NavigationTab } from '../../types';

interface SidebarProps {
  currentView: NavigationTab;
  onNavigate: (view: NavigationTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activePerson?: Person | null;
  peopleCount?: number;
  recordsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  activePerson,
  peopleCount = 0,
  recordsCount = 0,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: any; emoji: string; badge?: string | null }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'people', label: 'People', icon: Users, emoji: '👥', badge: peopleCount > 0 ? `${peopleCount}` : null },
    { id: 'record', label: 'Record Usage', icon: PlusCircle, emoji: '✍️' },
    { id: 'history', label: 'Usage History', icon: History, emoji: '📜', badge: recordsCount > 0 ? `${recordsCount}` : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, emoji: '📈' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, emoji: '⚡' },
    { id: 'comparison', label: 'Compare People', icon: GitCompare, emoji: '🔄' },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, emoji: '💡' },
    { id: 'reports', label: 'Reports', icon: FileText, emoji: '📄' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'PP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand header */}
        <div className="p-6 flex items-center justify-between">
          <button
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-white font-bold tracking-tight text-xl">
              PhonePulse
            </span>
          </button>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`text-base ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.emoji}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Person Footer Card */}
        <div className="p-6 mt-auto border-t border-slate-800">
          {activePerson ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-600 shrink-0">
                {getInitials(activePerson.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {activePerson.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {activePerson.userType} Profile
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700 shrink-0">
                PP
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">No Profile</p>
                <p className="text-xs text-slate-500">Select user</p>
              </div>
            </div>
          )}

          <button
            id="nav-settings-btn"
            onClick={() => {
              onNavigate('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'settings'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
