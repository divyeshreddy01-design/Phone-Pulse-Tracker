import { 
  Person, 
  DailyUsageRecord, 
  CalculatedAppStat, 
  DailyCalculationResult, 
  GoalStatus, 
  AppCategory, 
  TrendDirection,
  Recommendation 
} from '../types';

export const CATEGORY_COLORS: Record<AppCategory, { bg: string; text: string; hex: string }> = {
  'Social Media': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', hex: '#f43f5e' },
  'Education': { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', hex: '#6366f1' },
  'Entertainment': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', hex: '#f59e0b' },
  'Communication': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', hex: '#10b981' },
  'Games': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', hex: '#a855f7' },
  'Productivity': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', hex: '#3b82f6' },
  'Shopping': { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', hex: '#ec4899' },
  'Other': { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', hex: '#64748b' },
};

/** Convert total minutes into clean "4h 35m" or "45m" format */
export function formatMinutes(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Convert hours + minutes to total integer minutes */
export function toTotalMinutes(hours: number, minutes: number): number {
  const safeH = Math.max(0, Math.floor(Number(hours) || 0));
  const safeM = Math.max(0, Math.floor(Number(minutes) || 0));
  return safeH * 60 + safeM;
}

/** Split total minutes into hours and minutes */
export function fromTotalMinutes(totalMinutes: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.floor(totalMinutes || 0));
  return {
    hours: Math.floor(safe / 60),
    minutes: safe % 60,
  };
}

/** Calculate goal status & difference text */
export function calculateGoalStatus(actualMinutes: number, goalMinutes: number): {
  status: GoalStatus;
  differenceMinutes: number;
  formattedDifference: string;
  badgeClass: string;
} {
  const diff = goalMinutes - actualMinutes;
  let status: GoalStatus = 'Goal Achieved';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';

  if (actualMinutes > goalMinutes) {
    status = 'Goal Exceeded';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  } else if (actualMinutes >= goalMinutes * 0.9) {
    status = 'Near Goal';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }

  const formattedDifference = diff >= 0
    ? `Goal remaining: ${formatMinutes(diff)}`
    : `Goal exceeded by: ${formatMinutes(Math.abs(diff))}`;

  return {
    status,
    differenceMinutes: diff,
    formattedDifference,
    badgeClass,
  };
}

/** Calculate daily statistics with validation checks */
export function calculateDailyRecord(
  record: DailyUsageRecord,
  person?: Person
): DailyCalculationResult {
  const goalMinutes = person?.dailyGoalMinutes || 240;
  const actualMinutes = record.totalScreenMinutes || 0;
  const appsSumMinutes = record.apps.reduce((sum, app) => sum + (app.minutes || 0), 0);

  const hasValidationWarning = appsSumMinutes > actualMinutes;
  const validationWarningMessage = hasValidationWarning
    ? `App usage (${formatMinutes(appsSumMinutes)}) exceeds recorded total screen time (${formatMinutes(actualMinutes)}). Please check your data.`
    : undefined;

  const { status, differenceMinutes } = calculateGoalStatus(actualMinutes, goalMinutes);
  const goalAchievementPercent = goalMinutes > 0 ? (actualMinutes / goalMinutes) * 100 : 0;

  // Calculate app stats and percentages
  const calculatedApps: CalculatedAppStat[] = record.apps.map(app => {
    const pct = actualMinutes > 0 ? (app.minutes / actualMinutes) * 100 : 0;
    return {
      ...app,
      percentage: Number(pct.toFixed(1)),
      formattedTime: formatMinutes(app.minutes),
    };
  }).sort((a, b) => b.minutes - a.minutes);

  // Category aggregations
  const catMap = new Map<AppCategory, { minutes: number; count: number }>();
  record.apps.forEach(app => {
    const existing = catMap.get(app.category) || { minutes: 0, count: 0 };
    catMap.set(app.category, {
      minutes: existing.minutes + app.minutes,
      count: existing.count + 1,
    });
  });

  const categoryBreakdown = Array.from(catMap.entries()).map(([category, val]) => ({
    category,
    minutes: val.minutes,
    percentage: actualMinutes > 0 ? Number(((val.minutes / actualMinutes) * 100).toFixed(1)) : 0,
    count: val.count,
  })).sort((a, b) => b.minutes - a.minutes);

  return {
    recordId: record.id,
    personId: record.personId,
    date: record.date,
    totalScreenMinutes: actualMinutes,
    goalMinutes,
    differenceMinutes,
    goalStatus: status,
    goalAchievementPercent: Number(goalAchievementPercent.toFixed(1)),
    appsSumMinutes,
    hasValidationWarning,
    validationWarningMessage,
    apps: calculatedApps,
    categoryBreakdown,
    mostUsedApp: calculatedApps.length > 0 ? calculatedApps[0] : undefined,
  };
}

/** Aggregate weekly analytics (7 days up to specified date or latest) */
export function calculateWeeklyAnalytics(
  records: DailyUsageRecord[],
  person: Person,
  endDateStr?: string
) {
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const weekDays: { dateStr: string; dayName: string; shortName: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const shortName = d.toLocaleDateString('en-US', { weekday: 'short' });
    weekDays.push({ dateStr, dayName, shortName });
  }

  const personRecords = records.filter(r => r.personId === person.id);
  const recordMap = new Map<string, DailyUsageRecord>();
  personRecords.forEach(r => recordMap.set(r.date, r));

  let totalMinutes = 0;
  let activeDaysCount = 0;
  let highestDay = { day: 'None', minutes: 0, date: '' };
  let lowestDay = { day: 'None', minutes: Infinity, date: '' };

  const appAggMap = new Map<string, { appName: string; category: AppCategory; minutes: number }>();
  const catAggMap = new Map<AppCategory, number>();

  const dailyChartData = weekDays.map(({ dateStr, dayName, shortName }) => {
    const rec = recordMap.get(dateStr);
    const mins = rec ? rec.totalScreenMinutes : 0;
    
    if (rec && rec.totalScreenMinutes > 0) {
      totalMinutes += mins;
      activeDaysCount++;
      if (mins > highestDay.minutes) {
        highestDay = { day: dayName, minutes: mins, date: dateStr };
      }
      if (mins < lowestDay.minutes) {
        lowestDay = { day: dayName, minutes: mins, date: dateStr };
      }

      rec.apps.forEach(app => {
        const existingApp = appAggMap.get(app.appName) || { appName: app.appName, category: app.category, minutes: 0 };
        appAggMap.set(app.appName, { ...existingApp, minutes: existingApp.minutes + app.minutes });

        const existingCat = catAggMap.get(app.category) || 0;
        catAggMap.set(app.category, existingCat + app.minutes);
      });
    }

    return {
      date: dateStr,
      day: dayName,
      shortDay: shortName,
      minutes: mins,
      hours: Number((mins / 60).toFixed(2)),
      formatted: formatMinutes(mins),
      goalMinutes: person.dailyGoalMinutes,
      goalHours: Number((person.dailyGoalMinutes / 60).toFixed(2)),
      isOverGoal: mins > person.dailyGoalMinutes,
    };
  });

  const avgMinutes = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;
  if (lowestDay.minutes === Infinity) {
    lowestDay = { day: 'None', minutes: 0, date: '' };
  }

  // Top apps
  const topApps = Array.from(appAggMap.values())
    .sort((a, b) => b.minutes - a.minutes)
    .map(a => ({
      ...a,
      formattedTime: formatMinutes(a.minutes),
      percentage: totalMinutes > 0 ? Number(((a.minutes / totalMinutes) * 100).toFixed(1)) : 0,
    }));

  // Top categories
  const categories = Array.from(catAggMap.entries())
    .map(([category, minutes]) => ({
      category,
      minutes,
      formattedTime: formatMinutes(minutes),
      percentage: totalMinutes > 0 ? Number(((minutes / totalMinutes) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    totalMinutes,
    avgMinutes,
    activeDaysCount,
    highestDay,
    lowestDay,
    dailyChartData,
    topApps,
    categories,
    mostUsedApp: topApps[0] || null,
  };
}

/** Aggregate monthly analytics (last 30 days) */
export function calculateMonthlyAnalytics(
  records: DailyUsageRecord[],
  person: Person,
  endDateStr?: string
) {
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const days: { dateStr: string; label: string }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ dateStr, label });
  }

  const personRecords = records.filter(r => r.personId === person.id);
  const recordMap = new Map<string, DailyUsageRecord>();
  personRecords.forEach(r => recordMap.set(r.date, r));

  let totalMinutes = 0;
  let activeDaysCount = 0;
  let highestDay = { label: 'None', minutes: 0, date: '' };
  let lowestDay = { label: 'None', minutes: Infinity, date: '' };
  let daysWithinGoal = 0;

  const appAggMap = new Map<string, { appName: string; category: AppCategory; minutes: number }>();
  const catAggMap = new Map<AppCategory, number>();

  const timelineData = days.map(({ dateStr, label }) => {
    const rec = recordMap.get(dateStr);
    const mins = rec ? rec.totalScreenMinutes : 0;

    if (rec && rec.totalScreenMinutes > 0) {
      totalMinutes += mins;
      activeDaysCount++;
      if (mins <= person.dailyGoalMinutes) {
        daysWithinGoal++;
      }
      if (mins > highestDay.minutes) {
        highestDay = { label, minutes: mins, date: dateStr };
      }
      if (mins < lowestDay.minutes) {
        lowestDay = { label, minutes: mins, date: dateStr };
      }

      rec.apps.forEach(app => {
        const existingApp = appAggMap.get(app.appName) || { appName: app.appName, category: app.category, minutes: 0 };
        appAggMap.set(app.appName, { ...existingApp, minutes: existingApp.minutes + app.minutes });

        const existingCat = catAggMap.get(app.category) || 0;
        catAggMap.set(app.category, existingCat + app.minutes);
      });
    }

    return {
      date: dateStr,
      label,
      minutes: mins,
      hours: Number((mins / 60).toFixed(2)),
      formatted: formatMinutes(mins),
      goalMinutes: person.dailyGoalMinutes,
      goalHours: Number((person.dailyGoalMinutes / 60).toFixed(2)),
    };
  });

  const avgMinutes = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;
  if (lowestDay.minutes === Infinity) {
    lowestDay = { label: 'None', minutes: 0, date: '' };
  }

  const topApps = Array.from(appAggMap.values())
    .sort((a, b) => b.minutes - a.minutes)
    .map(a => ({
      ...a,
      formattedTime: formatMinutes(a.minutes),
      percentage: totalMinutes > 0 ? Number(((a.minutes / totalMinutes) * 100).toFixed(1)) : 0,
    }));

  const categories = Array.from(catAggMap.entries())
    .map(([category, minutes]) => ({
      category,
      minutes,
      formattedTime: formatMinutes(minutes),
      percentage: totalMinutes > 0 ? Number(((minutes / totalMinutes) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const goalAchievementRate = activeDaysCount > 0 ? Math.round((daysWithinGoal / activeDaysCount) * 100) : 0;

  return {
    totalMinutes,
    avgMinutes,
    activeDaysCount,
    highestDay,
    lowestDay,
    timelineData,
    topApps,
    categories,
    mostUsedApp: topApps[0] || null,
    goalAchievementRate,
    daysWithinGoal,
  };
}

/** Calculate usage trends (Current 7-day window vs Previous 7-day window) */
export function calculateUsageTrends(records: DailyUsageRecord[], person: Person) {
  const personRecords = records
    .filter(r => r.personId === person.id && r.totalScreenMinutes > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (personRecords.length === 0) {
    return {
      direction: 'Stable' as TrendDirection,
      percentageChange: 0,
      statement: 'No historical records logged yet to compute trends.',
      currentWeekAvg: 0,
      previousWeekAvg: 0,
      badgeColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
    };
  }

  const currentWindow = personRecords.slice(0, 7);
  const previousWindow = personRecords.slice(7, 14);

  const currentTotal = currentWindow.reduce((acc, r) => acc + r.totalScreenMinutes, 0);
  const currentAvg = currentWindow.length > 0 ? Math.round(currentTotal / currentWindow.length) : 0;

  const previousTotal = previousWindow.reduce((acc, r) => acc + r.totalScreenMinutes, 0);
  const previousAvg = previousWindow.length > 0 ? Math.round(previousTotal / previousWindow.length) : currentAvg;

  let percentageChange = 0;
  let direction: TrendDirection = 'Stable';
  let statement = '';
  let badgeColor = 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40';

  if (previousAvg > 0 && previousWindow.length > 0) {
    const rawPct = ((currentAvg - previousAvg) / previousAvg) * 100;
    percentageChange = Math.round(Math.abs(rawPct));

    if (rawPct > 3) {
      direction = 'Increasing';
      statement = `Your average screen time increased by ${percentageChange}% this week.`;
      badgeColor = 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40';
    } else if (rawPct < -3) {
      direction = 'Decreasing';
      statement = `Your screen time decreased by ${percentageChange}% compared with last week. Great job!`;
      badgeColor = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40';
    } else {
      direction = 'Stable';
      statement = 'Your screen time remained steady and consistent this week.';
      badgeColor = 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40';
    }
  } else {
    // Only 1 week of data available
    statement = `Current daily average is ${formatMinutes(currentAvg)} based on ${currentWindow.length} recorded day(s).`;
  }

  return {
    direction,
    percentageChange,
    statement,
    currentWeekAvg: currentAvg,
    previousWeekAvg: previousAvg,
    badgeColor,
  };
}

/** Generate smart, personalized recommendations based on actual data */
export function generateSmartRecommendations(records: DailyUsageRecord[], person: Person): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const personRecords = records.filter(r => r.personId === person.id);

  if (personRecords.length === 0) {
    return [
      {
        id: 'rec-init',
        type: 'tip',
        title: 'Start Tracking Today',
        description: 'Log your first daily screen time and individual apps to receive customized habit insights.',
        priority: 'medium',
      },
    ];
  }

  // Calculate aggregations
  const latestRecord = [...personRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const weekly = calculateWeeklyAnalytics(records, person);
  const trend = calculateUsageTrends(records, person);

  // 1. Social Media check
  const socialCat = weekly.categories.find(c => c.category === 'Social Media');
  if (socialCat && socialCat.percentage >= 35) {
    recommendations.push({
      id: 'rec-social-high',
      type: 'alert',
      title: 'High Social Media Concentration',
      description: `Social Media makes up ${socialCat.percentage}% of your weekly screen time (${socialCat.formattedTime}). Consider reducing it by 30 minutes per day using Android App Timers.`,
      metric: `${socialCat.percentage}% of total`,
      category: 'Social Media',
      priority: 'high',
    });
  }

  // 2. Goal exceeded check
  if (latestRecord && latestRecord.totalScreenMinutes > person.dailyGoalMinutes) {
    const exceededMins = latestRecord.totalScreenMinutes - person.dailyGoalMinutes;
    const topApp = latestRecord.apps.sort((a, b) => b.minutes - a.minutes)[0];
    recommendations.push({
      id: 'rec-goal-exceeded',
      type: 'alert',
      title: 'Daily Screen-Time Goal Exceeded',
      description: `You exceeded your daily goal of ${formatMinutes(person.dailyGoalMinutes)} by ${formatMinutes(exceededMins)} on your latest log. ${topApp ? `Try setting a daily limit on ${topApp.appName} (${formatMinutes(topApp.minutes)}).` : ''}`,
      metric: `+${formatMinutes(exceededMins)} over`,
      priority: 'high',
    });
  }

  // 3. Positive trend check
  if (trend.direction === 'Decreasing') {
    recommendations.push({
      id: 'rec-trend-good',
      type: 'success',
      title: 'Healthy Progress Detected',
      description: `Great progress! Your average screen time decreased by ${trend.percentageChange}% compared to previous logs. Keep this momentum going!`,
      metric: `-${trend.percentageChange}% reduction`,
      priority: 'medium',
    });
  }

  // 4. Entertainment dominant check
  const entertainmentCat = weekly.categories.find(c => c.category === 'Entertainment');
  if (entertainmentCat && entertainmentCat.percentage > 40) {
    recommendations.push({
      id: 'rec-entertainment-high',
      type: 'tip',
      title: 'Optimize Video & Streaming Habits',
      description: `Entertainment accounts for ${entertainmentCat.formattedTime} this week. Replace 20 minutes of streaming before bed with reading or meditation to improve sleep quality.`,
      category: 'Entertainment',
      priority: 'medium',
    });
  }

  // 5. Productivity encouragement
  const prodCat = weekly.categories.find(c => c.category === 'Productivity' || c.category === 'Education');
  if (!prodCat || prodCat.percentage < 15) {
    recommendations.push({
      id: 'rec-prod-boost',
      type: 'tip',
      title: 'Balance Digital Diet',
      description: 'Educational and productivity apps comprise under 15% of your phone time. Allocate 15 daily minutes to skill-building apps like Duolingo or Coursera.',
      priority: 'low',
    });
  }

  // 6. Digital Wellbeing Score
  return recommendations;
}

/** Calculate Digital Wellbeing Score (0 to 100) */
export function calculateWellbeingScore(records: DailyUsageRecord[], person: Person): {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  color: string;
} {
  const weekly = calculateWeeklyAnalytics(records, person);
  if (weekly.activeDaysCount === 0) {
    return { score: 75, grade: 'Good', color: 'text-indigo-600 dark:text-indigo-400' };
  }

  let score = 100;

  // Penalty for exceeding goal average
  if (weekly.avgMinutes > person.dailyGoalMinutes) {
    const overRatio = (weekly.avgMinutes - person.dailyGoalMinutes) / person.dailyGoalMinutes;
    score -= Math.min(35, Math.round(overRatio * 50));
  } else {
    score += 5; // Bonus for staying within goal
  }

  // Penalty for excessive social media (>35%)
  const social = weekly.categories.find(c => c.category === 'Social Media');
  if (social && social.percentage > 35) {
    score -= Math.min(25, Math.round((social.percentage - 35) * 0.8));
  }

  // Bonus for productivity / education
  const productive = weekly.categories
    .filter(c => c.category === 'Productivity' || c.category === 'Education')
    .reduce((sum, c) => sum + c.percentage, 0);
  if (productive >= 20) {
    score += 10;
  }

  const finalScore = Math.max(10, Math.min(100, score));

  let grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  let color = 'text-emerald-600 dark:text-emerald-400';

  if (finalScore >= 85) {
    grade = 'Excellent';
    color = 'text-emerald-600 dark:text-emerald-400';
  } else if (finalScore >= 70) {
    grade = 'Good';
    color = 'text-blue-600 dark:text-blue-400';
  } else if (finalScore >= 55) {
    grade = 'Fair';
    color = 'text-amber-600 dark:text-amber-400';
  } else {
    grade = 'Needs Attention';
    color = 'text-rose-600 dark:text-rose-400';
  }

  return { score: finalScore, grade, color };
}

/** Calculate multi-person comparison matrix */
export function calculatePeopleComparison(people: Person[], records: DailyUsageRecord[]) {
  return people.map(person => {
    const personRecords = records.filter(r => r.personId === person.id && r.totalScreenMinutes > 0);
    const totalMinutes = personRecords.reduce((acc, r) => acc + r.totalScreenMinutes, 0);
    const avgMinutes = personRecords.length > 0 ? Math.round(totalMinutes / personRecords.length) : 0;
    
    // Days goal achieved
    const daysAchieved = personRecords.filter(r => r.totalScreenMinutes <= person.dailyGoalMinutes).length;
    const goalAchievementPercent = personRecords.length > 0 
      ? Math.round((daysAchieved / personRecords.length) * 100) 
      : 0;

    // App usage totals
    const appMap = new Map<string, { appName: string; category: AppCategory; minutes: number }>();
    const catMap = new Map<AppCategory, number>();

    personRecords.forEach(rec => {
      rec.apps.forEach(app => {
        const curApp = appMap.get(app.appName) || { appName: app.appName, category: app.category, minutes: 0 };
        appMap.set(app.appName, { ...curApp, minutes: curApp.minutes + app.minutes });

        const curCat = catMap.get(app.category) || 0;
        catMap.set(app.category, curCat + app.minutes);
      });
    });

    const topApp = Array.from(appMap.values()).sort((a, b) => b.minutes - a.minutes)[0];
    const topCategory = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const wellbeing = calculateWellbeingScore(records, person);

    return {
      person,
      recordedDaysCount: personRecords.length,
      totalMinutes,
      avgMinutes,
      avgHours: Number((avgMinutes / 60).toFixed(2)),
      formattedAvg: formatMinutes(avgMinutes),
      dailyGoalMinutes: person.dailyGoalMinutes,
      formattedGoal: formatMinutes(person.dailyGoalMinutes),
      daysAchieved,
      goalAchievementPercent,
      mostUsedApp: topApp ? { name: topApp.appName, formattedTime: formatMinutes(topApp.minutes) } : null,
      topCategory: topCategory ? { category: topCategory[0], formattedTime: formatMinutes(topCategory[1]) } : null,
      uniqueAppsCount: appMap.size,
      wellbeingScore: wellbeing.score,
      wellbeingGrade: wellbeing.grade,
    };
  });
}
