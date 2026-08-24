import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Smartphone,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Person, DailyUsageRecord } from '../../types';
import { calculateUsageTrends, formatMinutes, calculateWeeklyAnalytics } from '../../utils/calculations';

interface TrendsViewProps {
  person: Person | null;
  records: DailyUsageRecord[];
  onRecordUsageClick: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
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

  const trends = calculateUsageTrends(records, person);
  const weekly = calculateWeeklyAnalytics(records, person);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          Usage Trends & Velocity
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Automated habit shifts, momentum tracking, and week-over-week velocity for <strong className="text-slate-900 dark:text-white">{person.name}</strong>.
        </p>
      </div>

      {/* Main Trend Callout Card (Requirement 10) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
              trends.direction === 'Increasing'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800'
                : trends.direction === 'Decreasing'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-800'
            }`}>
              {trends.direction === 'Increasing' && <TrendingUp className="w-7 h-7" />}
              {trends.direction === 'Decreasing' && <TrendingDown className="w-7 h-7" />}
              {trends.direction === 'Stable' && <Minus className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${trends.badgeColor}`}>
                  {trends.direction} Trend
                </span>
                {trends.percentageChange > 0 && (
                  <span className="text-xs font-bold text-slate-500">
                    {trends.percentageChange}% shift
                  </span>
                )}
              </div>

              {/* Dynamic generated statement (Requirement 10) */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mt-2">
                {trends.statement}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calculated by contrasting this week's active daily average against your previous logging cycle.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
            <span className="text-xs text-slate-400 font-medium">Weekly Daily Average</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">
              {formatMinutes(trends.currentWeekAvg)}
            </span>
            <span className="text-[11px] text-slate-500">
              vs {formatMinutes(trends.previousWeekAvg)} last period
            </span>
          </div>
        </div>
      </div>

      {/* Week-over-Week Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Goal Compliance Streak</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-display mt-2 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <span>
              {weekly.dailyChartData.filter(d => d.minutes > 0 && !d.isOverGoal).length} Days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Achieved within daily target of {formatMinutes(person.dailyGoalMinutes)} this week.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Peak Surge Day</span>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display mt-2 truncate">
            {weekly.highestDay.day}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Highest single day load at {formatMinutes(weekly.highestDay.minutes)}.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Best Recovery Day</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-2 truncate">
            {weekly.lowestDay.day}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lowest recorded screen time at {formatMinutes(weekly.lowestDay.minutes)}.
          </p>
        </div>
      </div>
    </div>
  );
};
