import React from 'react';
import { 
  Smartphone, 
  ArrowRight, 
  Sparkles, 
  Users, 
  BarChart2, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  PieChart, 
  CheckCircle2,
  Sliders,
  TrendingDown
} from 'lucide-react';
import { Person } from '../../types';

interface LandingHeroProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  people: Person[];
  onSelectPerson: (personId: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGetStarted,
  onExploreDemo,
  people,
  onSelectPerson,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Tag & Hero */}
      <div className="text-center pt-6 pb-12">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Track. Understand. Improve.</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display mb-4">
          PhonePulse <span className="text-indigo-600 dark:text-indigo-400">Tracker</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 mb-6 max-w-2xl mx-auto">
          Track your phone usage. Understand your digital habits.
        </p>

        {/* Short explanation */}
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          PhonePulse Tracker helps you record daily screen time and individual app usage, 
          analyze usage patterns, understand trends, and generate professional usage reports.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-base shadow-xs transition-colors"
          >
            Explore Dashboard
          </button>
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">
            Precision Screen & App Tracking
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Record overall screen hours alongside detailed app-by-app usage. Automatically validates time limits and computes exact app percentages.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">
            Multi-Persona Habit Analysis
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Compare Android usage metrics between Students, Working Professionals, and Senior Citizens with customizable daily goals.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">
            A4 Print-Ready Reports & Trends
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Export comprehensive usage statements, daily/weekly charts, and smart actionable recommendations tailored for PDF export and printing.
          </p>
        </div>
      </div>

      {/* Quick Person Switcher if Sample data exists */}
      {people.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Available User Profiles
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a profile to instantly view their recorded Android statistics:
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create New Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {people.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectPerson(p.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${p.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-xs font-bold`}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {p.userType} • Goal: {Math.floor(p.dailyGoalMinutes / 60)}h {p.dailyGoalMinutes % 60 ? `${p.dailyGoalMinutes % 60}m` : ''}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 mt-8">
        PhonePulse Tracker — Academic & Digital Wellbeing Analytics Platform.
      </div>
    </div>
  );
};
