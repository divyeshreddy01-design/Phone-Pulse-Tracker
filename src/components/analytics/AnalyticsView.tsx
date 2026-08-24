import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LineChart, 
  Line, 
  ReferenceLine,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Smartphone, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Person, DailyUsageRecord } from '../../types';
import { 
  calculateDailyRecord, 
  calculateWeeklyAnalytics, 
  calculateMonthlyAnalytics, 
  formatMinutes, 
  CATEGORY_COLORS 
} from '../../utils/calculations';
import { CategoryBadge, GoalBadge } from '../common/Badge';

interface AnalyticsViewProps {
  person: Person | null;
  records: DailyUsageRecord[];
  onRecordUsageClick: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  person,
  records,
  onRecordUsageClick,
}) => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  if (!person) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Smartphone className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No profile selected</h3>
      </div>
    );
  }

  const personRecords = records
    .filter(r => r.personId === person.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculations for all 3 views
  const latestDailyRec = personRecords[0];
  const dailyData = latestDailyRec ? calculateDailyRecord(latestDailyRec, person) : null;
  const weeklyData = calculateWeeklyAnalytics(records, person);
  const monthlyData = calculateMonthlyAnalytics(records, person);

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Usage Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Deep performance analysis for <strong className="text-slate-900 dark:text-white">{person.name}</strong>
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['Daily', 'Weekly', 'Monthly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === tab
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DAILY VIEW */}
      {/* ========================================================================= */}
      {timeframe === 'Daily' && (
        <div className="space-y-6 animate-fadeIn">
          {dailyData ? (
            <>
              {/* Daily KPI summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Screen Time</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-1">
                    {formatMinutes(dailyData.totalScreenMinutes)}
                  </div>
                  <span className="text-xs text-slate-500">Date: {dailyData.date}</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Goal Status</span>
                  <div className="mt-2">
                    <GoalBadge status={dailyData.goalStatus} />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Goal: {formatMinutes(person.dailyGoalMinutes)}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Most-Used App</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white truncate mt-1">
                    {dailyData.mostUsedApp ? dailyData.mostUsedApp.appName : 'None'}
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {dailyData.mostUsedApp ? `${dailyData.mostUsedApp.formattedTime} (${dailyData.mostUsedApp.percentage}%)` : 'No apps'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Apps Count</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-1">
                    {dailyData.apps.length}
                  </div>
                  <span className="text-xs text-slate-500">Recorded applications</span>
                </div>
              </div>

              {/* Daily App Breakdown Table & Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
                  Daily Application Breakdown ({dailyData.date})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                        <th className="pb-3 px-2">App Name</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Usage Duration</th>
                        <th className="pb-3 px-2">% of Screen Time</th>
                        <th className="pb-3 px-2">Visual Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dailyData.apps.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                            {app.appName}
                          </td>
                          <td className="py-3 px-2">
                            <CategoryBadge category={app.category} />
                          </td>
                          <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">
                            {app.formattedTime}
                          </td>
                          <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                            {app.percentage}%
                          </td>
                          <td className="py-3 px-2 w-48">
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, app.percentage)}%`,
                                  backgroundColor: CATEGORY_COLORS[app.category]?.hex || '#6366f1',
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No daily logs recorded yet for {person.name}.</p>
              <button onClick={onRecordUsageClick} className="mt-3 text-xs font-bold text-indigo-600 underline">
                Log today's usage
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WEEKLY VIEW */}
      {/* ========================================================================= */}
      {timeframe === 'Weekly' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Weekly Time</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-1">
                {formatMinutes(weeklyData.totalMinutes)}
              </div>
              <span className="text-xs text-slate-500">{weeklyData.activeDaysCount} active days</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Daily Average</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display mt-1">
                {formatMinutes(weeklyData.avgMinutes)}
              </div>
              <span className="text-xs text-slate-500">Goal: {formatMinutes(person.dailyGoalMinutes)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Highest Usage Day</span>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 truncate mt-1">
                {weeklyData.highestDay.day}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {formatMinutes(weeklyData.highestDay.minutes)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Lowest Usage Day</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 truncate mt-1">
                {weeklyData.lowestDay.day}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {formatMinutes(weeklyData.lowestDay.minutes)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Most-Used App</span>
              <div className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">
                {weeklyData.mostUsedApp ? weeklyData.mostUsedApp.appName : 'None'}
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {weeklyData.mostUsedApp ? weeklyData.mostUsedApp.formattedTime : '0m'}
              </span>
            </div>
          </div>

          {/* Weekly Bar Chart (Mon-Sun) with Daily Goal Threshold Line */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Weekly Screen-Time Distribution (7-Day Overview)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bars above the dashed line exceed the daily goal of {formatMinutes(person.dailyGoalMinutes)}.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-slate-600 dark:text-slate-400">Within Goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-400">Exceeded Goal</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.dailyChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="shortDay" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                  />
                  <YAxis 
                    unit="m" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${formatMinutes(Number(value))} (${item.payload.day})`,
                      'Screen Time',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <ReferenceLine 
                    y={person.dailyGoalMinutes} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    label={{ value: `Goal (${formatMinutes(person.dailyGoalMinutes)})`, fill: '#ef4444', fontSize: 11, position: 'top' }} 
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {weeklyData.dailyChartData.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={entry.isOverGoal ? '#f43f5e' : '#6366f1'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Top Apps & Categories Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Apps List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
                Top Applications This Week
              </h3>
              <div className="space-y-3">
                {weeklyData.topApps.slice(0, 5).map((app, idx) => (
                  <div key={app.appName} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{app.appName}</div>
                        <CategoryBadge category={app.category} size="sm" className="mt-0.5" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {app.formattedTime}
                      </span>
                      <span className="text-[10px] text-slate-400">{app.percentage}% of weekly time</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Categories Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
                Category Distribution
              </h3>
              <div className="space-y-3">
                {weeklyData.categories.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.category}</span>
                      <span className="text-slate-500 font-bold">{cat.formattedTime} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, cat.percentage)}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category]?.hex || '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MONTHLY VIEW */}
      {/* ========================================================================= */}
      {timeframe === 'Monthly' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Monthly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Total Time</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-display mt-1">
                {formatMinutes(monthlyData.totalMinutes)}
              </div>
              <span className="text-xs text-slate-500">{monthlyData.activeDaysCount} active days recorded</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Daily Avg</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display mt-1">
                {formatMinutes(monthlyData.avgMinutes)}
              </div>
              <span className="text-xs text-slate-500">Per active day</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Goal Achievement Rate</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">
                {monthlyData.goalAchievementRate}%
              </div>
              <span className="text-xs text-slate-500">{monthlyData.daysWithinGoal} days within goal</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Highest Usage Peak</span>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 truncate mt-1">
                {monthlyData.highestDay.label}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {formatMinutes(monthlyData.highestDay.minutes)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Top Monthly App</span>
              <div className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">
                {monthlyData.mostUsedApp ? monthlyData.mostUsedApp.appName : 'None'}
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {monthlyData.mostUsedApp ? monthlyData.mostUsedApp.formattedTime : '0m'}
              </span>
            </div>
          </div>

          {/* 30-Day Timeline Area / Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1">
              30-Day Screen-Time Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Track long-term consistency and screen-time trends against your daily goal limit.
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.timelineData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={3}
                  />
                  <YAxis 
                    unit="m" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <Tooltip
                    formatter={(value: any) => [formatMinutes(Number(value)), 'Screen Time']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <ReferenceLine 
                    y={person.dailyGoalMinutes} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                  />
                  <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
