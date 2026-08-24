import React from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { Person, DailyUsageRecord } from '../../types';
import { 
  generateSmartRecommendations, 
  calculateWellbeingScore, 
  formatMinutes,
  calculateWeeklyAnalytics 
} from '../../utils/calculations';
import { CategoryBadge } from '../common/Badge';

interface RecommendationsViewProps {
  person: Person | null;
  records: DailyUsageRecord[];
  onRecordUsageClick: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  person,
  records,
  onRecordUsageClick,
}) => {
  if (!person) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Smartphone className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No user profile selected</h3>
      </div>
    );
  }

  const recommendations = generateSmartRecommendations(records, person);
  const wellbeing = calculateWellbeingScore(records, person);
  const weekly = calculateWeeklyAnalytics(records, person);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Algorithmic Habit Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          Smart Recommendations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalized habit recommendations derived from <strong className="text-slate-900 dark:text-white">{person.name}</strong>'s actual Android phone logs.
        </p>
      </div>

      {/* Top Banner: Digital Wellbeing Assessment */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold block mb-1">
              Overall Digital Health Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-display text-white">
                {wellbeing.score}
              </span>
              <span className="text-sm text-indigo-200">/ 100</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
                Grade: {wellbeing.grade}
              </span>
            </div>
            <p className="text-xs text-indigo-100/80 mt-3 max-w-xl leading-relaxed">
              Assessed from goal adherence ({weekly.activeDaysCount} active days), social media concentration, and weekly distribution balance.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Daily Target:</span>
              <span className="font-bold">{formatMinutes(person.dailyGoalMinutes)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Weekly Avg:</span>
              <span className="font-bold">{formatMinutes(weekly.avgMinutes)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-200">Most Used:</span>
              <span className="font-bold">{weekly.mostUsedApp ? weekly.mostUsedApp.appName : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Actionable Recommendations List (Requirement 11) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
          Active Recommendations ({recommendations.length})
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  rec.type === 'alert'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800'
                    : rec.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {rec.type === 'alert' && <AlertCircle className="w-5 h-5" />}
                  {rec.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {rec.type === 'tip' && <Lightbulb className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h4>
                    {rec.category && <CategoryBadge category={rec.category} size="sm" />}
                    {rec.metric && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rec.metric}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>

              {/* Action pill */}
              <div className="self-end sm:self-center shrink-0">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  rec.priority === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                }`}>
                  {rec.priority === 'high' ? 'High Priority' : 'Optimization Tip'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Digital Wellbeing Strategies */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Recommended Android Digital Wellbeing Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              1. Android App Timers
            </strong>
            Set a 45-minute daily limit on Social Media & Video apps directly in Android Settings &gt; Digital Wellbeing.
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              2. Bedtime Mode / Grayscale
            </strong>
            Turn the display black-and-white 30 minutes before sleep to reduce dopamine triggers and phone stimulation.
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <strong className="block text-slate-900 dark:text-white font-bold mb-1">
              3. Focus Mode
            </strong>
            Pause distracting notifications while studying or working to minimize impulsive screen un-locks.
          </div>
        </div>
      </div>
    </div>
  );
};
