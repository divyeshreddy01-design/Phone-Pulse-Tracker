import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Target, 
  Smartphone, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Calendar, 
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  BarChart2,
  CheckCircle,
  FileText,
  Lightbulb,
  PartyPopper,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { Person, DailyUsageRecord } from '../../types';
import { 
  calculateDailyRecord, 
  formatMinutes, 
  CATEGORY_COLORS,
  generateSmartRecommendations,
  calculateWeeklyAnalytics,
  calculateUsageTrends
} from '../../utils/calculations';
import { GoalBadge, UserTypeBadge } from '../common/Badge';

interface DashboardViewProps {
  person: Person | null;
  people: Person[];
  records: DailyUsageRecord[];
  onSelectPerson: (personId: string) => void;
  onRecordUsageClick: () => void;
  onViewAnalyticsClick: () => void;
  onGenerateReportClick: () => void;
  onAddPersonClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  person,
  people,
  records,
  onSelectPerson,
  onRecordUsageClick,
  onViewAnalyticsClick,
  onGenerateReportClick,
  onAddPersonClick,
}) => {
  // If no person selected or available
  if (!person) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Smartphone className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No User Profile Selected
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          Select or create an Android user profile to view your personal dashboard.
        </p>
        <button
          onClick={onAddPersonClick}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
        >
          Create User Profile
        </button>
      </div>
    );
  }

  // Filter records for this person
  const personRecords = records
    .filter(r => r.personId === person.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Date selection for dashboard (defaults to latest recorded day or today)
  const availableDates = personRecords.map(r => r.date);
  const todayStr = new Date().toISOString().split('T')[0];
  const initialDate = availableDates.includes(todayStr) 
    ? todayStr 
    : (availableDates.length > 0 ? availableDates[0] : todayStr);

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [showCelebrationBadge, setShowCelebrationBadge] = useState<boolean>(false);
  const celebratedKeyRef = useRef<string>('');

  // Active record for the selected date
  const activeRecord = personRecords.find(r => r.date === selectedDate);
  const calculated = activeRecord ? calculateDailyRecord(activeRecord, person) : null;
  const recommendations = generateSmartRecommendations(records, person);
  const weeklyAnalytics = calculateWeeklyAnalytics(records, person, selectedDate);
  const trends = calculateUsageTrends(records, person);

  // Subtle confetti burst function
  const triggerGoalConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#10b981', '#6366f1', '#8b5cf6', '#3b82f6', '#f59e0b', '#34d399'],
        ticks: 220,
        gravity: 1.05,
        scalar: 0.9,
        disableForReducedMotion: true,
      });

      setTimeout(() => {
        confetti({
          particleCount: 20,
          angle: 60,
          spread: 40,
          origin: { x: 0.2, y: 0.6 },
          colors: ['#10b981', '#34d399', '#6366f1'],
          ticks: 160,
          gravity: 1.1,
          scalar: 0.75,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 20,
          angle: 120,
          spread: 40,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#10b981', '#34d399', '#8b5cf6'],
          ticks: 160,
          gravity: 1.1,
          scalar: 0.75,
          disableForReducedMotion: true,
        });
      }, 150);
    } catch {
      // safe fallback if canvas is restricted
    }
  };

  // Trigger celebration on date change or initial load if goal is achieved
  useEffect(() => {
    if (calculated && calculated.goalStatus === 'Goal Achieved' && calculated.totalScreenMinutes > 0) {
      const currentKey = `${person.id}-${selectedDate}-${calculated.totalScreenMinutes}`;
      if (celebratedKeyRef.current !== currentKey) {
        celebratedKeyRef.current = currentKey;
        setShowCelebrationBadge(true);
        // Small delay for smooth entry
        const timer = setTimeout(() => {
          triggerGoalConfetti();
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setShowCelebrationBadge(false);
    }
  }, [calculated?.goalStatus, calculated?.totalScreenMinutes, selectedDate, person.id]);

  // App chart data
  const appChartData = calculated?.apps.map(app => ({
    name: app.appName,
    minutes: app.minutes,
    hours: Number((app.minutes / 60).toFixed(2)),
    formatted: app.formattedTime,
    percentage: app.percentage,
    category: app.category,
    color: CATEGORY_COLORS[app.category]?.hex || '#6366f1',
  })) || [];

  // Yesterday comparison
  const selectedDateObj = new Date(selectedDate);
  const yesterdayObj = new Date(selectedDateObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];
  const yesterdayRecord = personRecords.find(r => r.date === yesterdayStr);

  let yesterdayChangeText = 'vs yest.';
  let yesterdayChangeClass = 'text-slate-500';
  if (calculated && yesterdayRecord && yesterdayRecord.totalScreenMinutes > 0) {
    const diffPct = Math.round(((calculated.totalScreenMinutes - yesterdayRecord.totalScreenMinutes) / yesterdayRecord.totalScreenMinutes) * 100);
    if (diffPct > 0) {
      yesterdayChangeText = `+${diffPct}% vs yest.`;
      yesterdayChangeClass = 'text-rose-500 font-bold';
    } else if (diffPct < 0) {
      yesterdayChangeText = `${diffPct}% vs yest.`;
      yesterdayChangeClass = 'text-emerald-500 font-bold';
    } else {
      yesterdayChangeText = '0% vs yest.';
      yesterdayChangeClass = 'text-slate-500 font-medium';
    }
  }

  // Top recommendation
  const primaryRecommendation = recommendations.length > 0 
    ? recommendations[0] 
    : {
        title: 'Smart Recommendation',
        description: 'Maintaining a balanced app diet improves daily focus. Keep tracking your Android apps regularly.'
      };

  // Other personas for comparison teaser
  const otherPersonas = people.filter(p => p.id !== person.id).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Top Banner: Profile Header & Date Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${person.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-lg font-bold shadow-xs`}>
            {person.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                {person.name}
              </h2>
              <UserTypeBadge userType={person.userType} />
              {person.isSample && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                  Sample Data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {person.phoneModel ? `${person.phoneModel} • ` : ''}Daily Target: {formatMinutes(person.dailyGoalMinutes)}
            </p>
          </div>
        </div>

        {/* Date Selector & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {availableDates.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="dashboard-date-select"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {availableDates.map(d => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {d === todayStr ? `Today (${d})` : d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onRecordUsageClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Usage</span>
          </button>
        </div>
      </div>

      {/* Goal Achieved Subtle Celebration Banner */}
      <AnimatePresence>
        {calculated && calculated.goalStatus === 'Goal Achieved' && calculated.totalScreenMinutes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/40 border border-emerald-300 dark:border-emerald-700/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs ring-4 ring-emerald-100 dark:ring-emerald-900/40">
                🎉
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Goal Achieved on {selectedDate === todayStr ? 'Today' : selectedDate}!</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      ✓ Under Limit
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Great self-discipline! You kept screen time <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMinutes(calculated.differenceMinutes)}</span> below your daily target of {formatMinutes(person.dailyGoalMinutes)}.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerGoalConfetti}
              className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Re-play confetti celebration"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Celebrate 🎉</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Summary Cards (Professional Polish Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Today's Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {selectedDate === todayStr ? "Today's Time" : "Screen Time"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {calculated ? formatMinutes(calculated.totalScreenMinutes) : '0m'}
            </span>
            <span className={`text-xs ${yesterdayChangeClass}`}>
              {yesterdayChangeText}
            </span>
          </div>
        </div>

        {/* Card 2: Daily Goal */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Daily Goal
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {formatMinutes(person.dailyGoalMinutes)}
            </span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 font-medium">
              Target
            </span>
          </div>
        </div>

        {/* Card 3: Goal Status with Achieved Animation */}
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-xs relative transition-all ${
          calculated?.goalStatus === 'Goal Achieved' && calculated.totalScreenMinutes > 0
            ? 'border-emerald-300 dark:border-emerald-700/80 ring-2 ring-emerald-500/10'
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Goal Status
            </p>
            {calculated?.goalStatus === 'Goal Achieved' && calculated.totalScreenMinutes > 0 && (
              <button
                onClick={triggerGoalConfetti}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                title="Celebrate achievement"
              >
                <span>🎉</span>
                <span>Achieved</span>
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            {calculated ? (
              calculated.differenceMinutes >= 0 ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatMinutes(calculated.differenceMinutes)} Left
                  </span>
                  <span className="text-xs text-emerald-500 font-bold">
                    ✓ Achieved
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    {formatMinutes(Math.abs(calculated.differenceMinutes))} Over
                  </span>
                  <span className="text-xs text-rose-500 font-bold">
                    ⚠️ Exceeded
                  </span>
                </>
              )
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-400">
                  Unrecorded
                </span>
                <span className="text-xs text-slate-400">Log time</span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Apps Tracked */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Apps Tracked
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {calculated ? calculated.apps.length : 0}
            </span>
            <span className="text-xs text-emerald-500 font-bold">
              Active now
            </span>
          </div>
        </div>
      </div>

      {/* Validation Warning Callout */}
      {calculated?.hasValidationWarning && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{calculated.validationWarningMessage}</span>
        </div>
      )}

      {/* Weekly Screen Time Usage & App Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Screen Time Usage Bar Chart (col-span-2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Weekly Screen Time Usage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                7-day habit breakdown leading up to {selectedDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Usage (Minutes)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyAnalytics.dailyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis 
                  dataKey="shortDay" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="m" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatMinutes(Number(value))}`, 'Screen Time']}
                  labelFormatter={(label: any) => `Day: ${label}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weeklyAnalytics.dailyChartData.map((entry, index) => {
                    const isSelected = entry.date === selectedDate;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isSelected ? '#6366f1' : entry.minutes > entry.goalMinutes ? '#f43f5e' : '#cbd5e1'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* App Distribution (col-span-1) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                App Distribution
              </h3>
              <span className="text-xs text-slate-400">
                {calculated ? `${calculated.apps.length} apps` : '0 apps'}
              </span>
            </div>

            {calculated && calculated.apps.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {calculated.apps.map(app => {
                  const colorConfig = CATEGORY_COLORS[app.category] || { hex: '#6366f1' };
                  return (
                    <div key={app.appName} className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {app.appName}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {app.formattedTime} ({app.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, app.percentage)}%`,
                            backgroundColor: colorConfig.hex,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No apps recorded for this date.
              </div>
            )}
          </div>

          <button
            onClick={onViewAnalyticsClick}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center justify-between"
          >
            <span>Detailed Category Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Smart Recommendation Hero & Persona Compare Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Recommendation Highlight Banner */}
        <div className="bg-indigo-900 dark:bg-indigo-950 rounded-2xl p-6 text-white flex items-center gap-6 shadow-xl shadow-indigo-500/10 border border-indigo-800/60">
          <div className="w-16 h-16 bg-indigo-700 dark:bg-indigo-800 rounded-full flex items-center justify-center text-3xl shrink-0 shadow-inner">
            💡
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1 tracking-tight">
              {primaryRecommendation.title}
            </h4>
            <p className="text-indigo-200 text-sm leading-relaxed">
              {primaryRecommendation.description}
            </p>
          </div>
        </div>

        {/* Compare Trends Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Compare Trends
          </h4>
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Avatar Stack */}
            <div className="flex -space-x-3 shrink-0">
              {people.slice(0, 3).map((p, idx) => (
                <div
                  key={p.id}
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${p.avatarColor || 'from-indigo-500 to-purple-600'} border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-xs`}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {trends.statement || `Compare ${person.name}'s usage habits with other demographic profiles.`}
            </p>

            <button
              onClick={onViewAnalyticsClick}
              className="ml-auto text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline shrink-0 flex items-center gap-1"
            >
              <span>View Comparison</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
