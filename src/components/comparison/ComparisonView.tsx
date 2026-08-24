import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Target, 
  Smartphone, 
  Award, 
  BarChart2, 
  GitCompare, 
  PieChart as PieIcon,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { Person, DailyUsageRecord } from '../../types';
import { calculatePeopleComparison, formatMinutes, CATEGORY_COLORS } from '../../utils/calculations';
import { UserTypeBadge } from '../common/Badge';

interface ComparisonViewProps {
  people: Person[];
  records: DailyUsageRecord[];
  onAddPersonClick: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  people,
  records,
  onAddPersonClick,
}) => {
  // If fewer than 2 people, show prompt to add or explore sample data
  if (people.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Users className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No User Profiles Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Add multiple people to compare Android phone habits across students, working professionals, and seniors.
        </p>
        <button
          onClick={onAddPersonClick}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
        >
          Add First Person
        </button>
      </div>
    );
  }

  const comparisonData = calculatePeopleComparison(people, records);

  // Screen time comparison chart data
  const chartData = comparisonData.map(c => ({
    name: c.person.name,
    userType: c.person.userType,
    avgHours: c.avgHours,
    avgMinutes: c.avgMinutes,
    goalHours: Number((c.dailyGoalMinutes / 60).toFixed(2)),
    goalMinutes: c.dailyGoalMinutes,
    goalAchievementPercent: c.goalAchievementPercent,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Multi-User Demographic Study</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Multiple-Person Habit Comparison
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare Android screen time, primary apps, and goal consistency between <strong>Students</strong>, <strong>Working Professionals</strong>, and <strong>Senior Citizens</strong>.
          </p>
        </div>
      </div>

      {/* Comparison Overview Chart: Average Daily Screen Time vs Goal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Average Daily Screen Time vs. Daily Goal Limit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hours spent daily on Android devices per person
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <YAxis unit="h" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} hours`,
                  name === 'avgHours' ? 'Average Daily Usage' : 'Daily Goal Target',
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend 
                formatter={(val) => val === 'avgHours' ? 'Average Daily Usage (Hours)' : 'Daily Target Limit (Hours)'}
              />
              <Bar dataKey="avgHours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="goalHours" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">
          Cross-Persona Comparative Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-3">Person Profile</th>
                <th className="pb-3 px-3">User Category</th>
                <th className="pb-3 px-3">Daily Goal</th>
                <th className="pb-3 px-3">Average Screen Time</th>
                <th className="pb-3 px-3">Goal Adherence</th>
                <th className="pb-3 px-3">Most Used Application</th>
                <th className="pb-3 px-3">Primary Category</th>
                <th className="pb-3 px-3">Wellbeing Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {comparisonData.map(row => (
                <tr key={row.person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${row.person.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {row.person.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {row.person.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {row.person.phoneModel || 'Android Phone'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <UserTypeBadge userType={row.person.userType} />
                  </td>

                  <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {row.formattedGoal}
                  </td>

                  <td className="py-4 px-3">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                      {row.formattedAvg}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {row.recordedDaysCount} days recorded
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{row.goalAchievementPercent}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {row.daysAchieved} of {row.recordedDaysCount} days
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    {row.mostUsedApp ? (
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {row.mostUsedApp.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {row.mostUsedApp.formattedTime} total
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-4 px-3">
                    {row.topCategory ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.topCategory.category}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-4 px-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {row.wellbeingScore} ({row.wellbeingGrade})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
