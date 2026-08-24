import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  ChevronDown, 
  Plus, 
  Sun, 
  Moon, 
  User,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { Person, NavigationTab } from '../../types';

interface NavbarProps {
  people: Person[];
  activePersonId: string | null;
  onSelectPerson: (personId: string) => void;
  onAddPerson: () => void;
  onToggleMobileMenu: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGoToLanding: () => void;
  currentView?: NavigationTab;
  onRecordUsageClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  people,
  activePersonId,
  onSelectPerson,
  onAddPerson,
  onToggleMobileMenu,
  darkMode,
  onToggleDarkMode,
  onGoToLanding,
  currentView = 'dashboard',
  onRecordUsageClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePerson = people.find(p => p.id === activePersonId) || (people.length > 0 ? people[0] : null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title mapper based on current view
  const getHeaderInfo = (view?: NavigationTab | string) => {
    switch (view) {
      case 'dashboard':
        return { title: 'Dashboard Overview', subtitle: 'Track. Understand. Improve.' };
      case 'people':
        return { title: 'People & Demographic Profiles', subtitle: 'Manage student, professional and senior user profiles' };
      case 'record':
        return { title: 'Record Screen Time', subtitle: 'Manual Android Digital Wellbeing usage log' };
      case 'history':
        return { title: 'Usage Log History', subtitle: 'Searchable historical daily screen time logs' };
      case 'analytics':
        return { title: 'Usage Analytics', subtitle: 'Deep dive into app distributions and category share' };
      case 'trends':
        return { title: 'Trends & Velocity', subtitle: 'Week-over-week phone habit progression' };
      case 'recommendations':
        return { title: 'Smart Recommendations', subtitle: 'Actionable habits and digital wellbeing score' };
      case 'comparison':
        return { title: 'Multi-Person Comparison', subtitle: 'Side-by-side demographic benchmarking' };
      case 'reports':
        return { title: 'Reports & Export', subtitle: 'Print-ready A4 documentation and data backups' };
      case 'settings':
        return { title: 'Settings & Storage', subtitle: 'Data portability, themes, and goals configuration' };
      default:
        return { title: 'PhonePulse Tracker', subtitle: 'Track. Understand. Improve.' };
    }
  };

  const { title, subtitle } = getHeaderInfo(currentView);

  // Formatted date string
  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header
      id="app-header"
      className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shrink-0 no-print transition-colors"
    >
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate font-display">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Date Display Pill */}
        <span className="hidden md:inline-block text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {formattedToday}
        </span>

        {/* Profile Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {people.length > 0 ? (
            <button
              id="profile-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr ${activePerson?.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs`}>
                {activePerson ? activePerson.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block min-w-0 max-w-[110px]">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                  {activePerson?.name || 'Select'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {activePerson?.userType || 'Profile'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onAddPerson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Person</span>
            </button>
          )}

          {/* Person Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fadeIn">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Profile
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5 px-1.5">
                {people.map(p => {
                  const isSelected = p.id === activePerson?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPerson(p.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/60'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${p.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.userType} • {p.phoneModel || 'Android'}</p>
                        </div>
                      </div>
                      {p.isSample && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                          Demo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 mt-1.5 pt-1.5 px-1.5">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onAddPerson();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Primary CTA button */}
        {onRecordUsageClick && (
          <button
            id="header-record-btn"
            onClick={onRecordUsageClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Usage</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};
