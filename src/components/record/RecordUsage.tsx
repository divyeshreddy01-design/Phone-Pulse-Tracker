import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Smartphone,
  Save,
  HelpCircle,
  BarChart,
  UserCheck,
  PartyPopper
} from 'lucide-react';
import { 
  Person, 
  DailyUsageRecord, 
  AppUsageItem, 
  AppCategory 
} from '../../types';
import { 
  toTotalMinutes, 
  fromTotalMinutes, 
  formatMinutes, 
  calculateGoalStatus 
} from '../../utils/calculations';
import { POPULAR_APPS_SUGGESTIONS } from '../../data/sampleData';
import { CategoryBadge, GoalBadge } from '../common/Badge';

interface RecordUsageProps {
  people: Person[];
  records: DailyUsageRecord[];
  activePersonId: string | null;
  onSaveRecord: (record: Omit<DailyUsageRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onNavigateToDashboard: () => void;
  onAddPersonClick: () => void;
  preselectedRecordId?: string | null;
}

export const RecordUsage: React.FC<RecordUsageProps> = ({
  people,
  records,
  activePersonId,
  onSaveRecord,
  onNavigateToDashboard,
  onAddPersonClick,
  preselectedRecordId,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    activePersonId || (people.length > 0 ? people[0].id : '')
  );

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalHours, setTotalHours] = useState<number>(4);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [apps, setApps] = useState<Array<{ id: string; appName: string; category: AppCategory; hours: number; minutes: number }>>([
    { id: 'app-row-1', appName: 'Instagram', category: 'Social Media', hours: 1, minutes: 15 },
    { id: 'app-row-2', appName: 'YouTube', category: 'Entertainment', hours: 1, minutes: 30 },
    { id: 'app-row-3', appName: 'WhatsApp', category: 'Communication', hours: 0, minutes: 45 },
  ]);
  const [notes, setNotes] = useState('');
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync selected person when prop changes
  useEffect(() => {
    if (activePersonId) {
      setSelectedPersonId(activePersonId);
    } else if (people.length > 0 && !selectedPersonId) {
      setSelectedPersonId(people[0].id);
    }
  }, [activePersonId, people]);

  // Load existing record if person and date match or if preselectedRecordId provided
  useEffect(() => {
    if (!selectedPersonId) return;

    let match: DailyUsageRecord | undefined;
    if (preselectedRecordId) {
      match = records.find(r => r.id === preselectedRecordId);
      if (match) {
        setSelectedPersonId(match.personId);
        setDate(match.date);
      }
    } else {
      match = records.find(r => r.personId === selectedPersonId && r.date === date);
    }

    if (match) {
      setExistingRecordId(match.id);
      const splitTotal = fromTotalMinutes(match.totalScreenMinutes);
      setTotalHours(splitTotal.hours);
      setTotalMinutes(splitTotal.minutes);
      setNotes(match.notes || '');

      setApps(
        match.apps.map(app => {
          const splitApp = fromTotalMinutes(app.minutes);
          return {
            id: app.id,
            appName: app.appName,
            category: app.category,
            hours: splitApp.hours,
            minutes: splitApp.minutes,
          };
        })
      );
    } else if (!preselectedRecordId) {
      setExistingRecordId(null);
      // Keep previous inputs or sensible defaults
    }
  }, [selectedPersonId, date, preselectedRecordId, records]);

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  // Math Calculations in real time
  const totalScreenMinutesVal = toTotalMinutes(totalHours, totalMinutes);
  const appTotalMinutesSum = apps.reduce(
    (sum, app) => sum + toTotalMinutes(app.hours, app.minutes),
    0
  );

  const goalMinutes = selectedPerson?.dailyGoalMinutes || 240;
  const goalStatusResult = calculateGoalStatus(totalScreenMinutesVal, goalMinutes);

  // Validation
  const hasAppExceedWarning = appTotalMinutesSum > totalScreenMinutesVal;
  const unaccountedMinutes = Math.max(0, totalScreenMinutesVal - appTotalMinutesSum);

  // App handlers
  const handleAddApp = () => {
    const newId = `app-row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setApps(prev => [
      ...prev,
      { id: newId, appName: '', category: 'Productivity', hours: 0, minutes: 30 },
    ]);
  };

  const handleRemoveApp = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
  };

  const handleAppChange = (
    id: string,
    field: 'appName' | 'category' | 'hours' | 'minutes',
    val: any
  ) => {
    setApps(prev =>
      prev.map(app => {
        if (app.id === id) {
          if (field === 'appName') {
            // Check if appName matches known popular app to auto-select category
            const matchPopular = POPULAR_APPS_SUGGESTIONS.find(
              p => p.name.toLowerCase() === String(val).toLowerCase()
            );
            return {
              ...app,
              appName: val,
              category: matchPopular ? matchPopular.category : app.category,
            };
          }
          return { ...app, [field]: val };
        }
        return app;
      })
    );
  };

  const handleQuickAddPopularApp = (name: string, category: AppCategory) => {
    // Check if already in list
    const existing = apps.find(a => a.appName.toLowerCase() === name.toLowerCase());
    if (existing) {
      // Just focus or skip
      return;
    }
    const newId = `app-row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setApps(prev => [
      ...prev,
      { id: newId, appName: name, category, hours: 0, minutes: 45 },
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedPersonId) {
      newErrors.person = 'Please select a person';
    }

    if (!date) {
      newErrors.date = 'Please select a valid date';
    }

    if (totalScreenMinutesVal <= 0) {
      newErrors.totalTime = 'Total screen time must be greater than 0';
    } else if (totalScreenMinutesVal > 24 * 60) {
      newErrors.totalTime = 'Total screen time cannot exceed 24 hours in a single day';
    }

    // Clean up empty apps or validate app names
    const cleanedApps: AppUsageItem[] = [];
    for (const app of apps) {
      const appMins = toTotalMinutes(app.hours, app.minutes);
      if (app.appName.trim() && appMins > 0) {
        cleanedApps.push({
          id: app.id,
          appName: app.appName.trim(),
          category: app.category,
          minutes: appMins,
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveRecord({
      id: existingRecordId || undefined,
      personId: selectedPersonId,
      date,
      totalScreenMinutes: totalScreenMinutesVal,
      apps: cleanedApps,
      notes: notes.trim() || undefined,
    });

    const isGoalAchieved = selectedPerson && totalScreenMinutesVal <= selectedPerson.dailyGoalMinutes;

    if (isGoalAchieved) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#8b5cf6', '#3b82f6', '#f59e0b', '#34d399'],
          ticks: 200,
          gravity: 1.1,
          scalar: 0.9,
          disableForReducedMotion: true,
        });
      } catch {
        // safe fallback
      }
      setSuccessMessage(`🎉 Goal Achieved! Recorded ${formatMinutes(totalScreenMinutesVal)} for ${selectedPerson.name} on ${date} (${formatMinutes(selectedPerson.dailyGoalMinutes - totalScreenMinutesVal)} within daily limit)!`);
    } else {
      setSuccessMessage(`Successfully recorded phone usage for ${selectedPerson?.name || 'user'} on ${date}!`);
    }

    setTimeout(() => setSuccessMessage(null), 4500);
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Smartphone className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          No People Registered
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          Please add at least one person before recording Android phone usage.
        </p>
        <button
          onClick={onAddPersonClick}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl"
        >
          Add Person Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
              Record Phone Usage
            </h2>
            {existingRecordId && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                Editing Existing Log
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter daily Android screen hours and individual app times with automatic percentage calculation.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          className="self-start sm:self-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <BarChart className="w-4 h-4" />
          <span>View in Dashboard</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          {/* Section 1: Person & Date Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Person Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Select Person <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPersonId}
                onChange={e => setSelectedPersonId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.userType} • Goal: {formatMinutes(p.dailyGoalMinutes)})
                  </option>
                ))}
              </select>
              {errors.person && <p className="text-xs text-rose-500 mt-1">{errors.person}</p>}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Section 2: Daily Screen Time */}
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Daily Screen Time
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Android device active display time for this day.
                </p>
              </div>

              {/* Goal comparison status badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Goal ({formatMinutes(goalMinutes)}):</span>
                <GoalBadge status={goalStatusResult.status} />
              </div>
            </div>

            {/* Total Hours and Minutes inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Hours:
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={totalHours}
                  onChange={e => setTotalHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Minutes:
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={totalMinutes}
                  onChange={e => setTotalMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Calculated Total:
                </span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-display">
                  {formatMinutes(totalScreenMinutesVal)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {goalStatusResult.formattedDifference}
                </span>
              </div>
            </div>
            {errors.totalTime && <p className="text-xs text-rose-500">{errors.totalTime}</p>}
          </div>

          {/* Section 3: Individual App Usage */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  App Usage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Record individual app breakdown. Percentages are automatically computed against total screen time.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add App</span>
              </button>
            </div>

            {/* Quick Popular App Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Add Popular Android Apps:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_APPS_SUGGESTIONS.slice(0, 10).map(sug => {
                  const isAdded = apps.some(a => a.appName.toLowerCase() === sug.name.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={sug.name}
                      onClick={() => handleQuickAddPopularApp(sug.name, sug.category)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isAdded
                          ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-default'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                    >
                      + {sug.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apps Table / List */}
            {apps.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  No individual apps added yet.
                </p>
                <button
                  type="button"
                  onClick={handleAddApp}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline"
                >
                  Click to add your first app
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {apps.map((app, index) => {
                  const appMinutesVal = toTotalMinutes(app.hours, app.minutes);
                  const percentage = totalScreenMinutesVal > 0 
                    ? Number(((appMinutesVal / totalScreenMinutesVal) * 100).toFixed(1)) 
                    : 0;

                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
                    >
                      {/* App Name */}
                      <div className="lg:col-span-4">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                          App Name
                        </label>
                        <input
                          type="text"
                          value={app.appName}
                          onChange={e => handleAppChange(app.id, 'appName', e.target.value)}
                          placeholder="e.g. YouTube, WhatsApp, Instagram"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      {/* Category */}
                      <div className="lg:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                          Category
                        </label>
                        <select
                          value={app.category}
                          onChange={e => handleAppChange(app.id, 'category', e.target.value as AppCategory)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="Social Media">Social Media</option>
                          <option value="Education">Education</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Communication">Communication</option>
                          <option value="Games">Games</option>
                          <option value="Productivity">Productivity</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Usage Time (Hours & Minutes) */}
                      <div className="lg:col-span-3 flex items-center gap-2">
                        <div className="w-1/2">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                            Hours
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={app.hours}
                            onChange={e => handleAppChange(app.id, 'hours', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                            Mins
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={app.minutes}
                            onChange={e => handleAppChange(app.id, 'minutes', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Percentage & Delete */}
                      <div className="lg:col-span-2 flex items-center justify-between gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatMinutes(appMinutesVal)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveApp(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Remove app"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Tally and Validation Warning */}
            <div className="pt-3">
              {hasAppExceedWarning && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-sm">
                      App usage exceeds the recorded total screen time. Please check your data.
                    </strong>
                    <p className="mt-0.5">
                      Individual apps total <strong>{formatMinutes(appTotalMinutesSum)}</strong>, but recorded daily screen time is <strong>{formatMinutes(totalScreenMinutesVal)}</strong> (Exceeded by {formatMinutes(appTotalMinutesSum - totalScreenMinutesVal)}).
                    </p>
                  </div>
                </div>
              )}

              {!hasAppExceedWarning && appTotalMinutesSum > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>
                      Apps Sum: <strong>{formatMinutes(appTotalMinutesSum)}</strong> of {formatMinutes(totalScreenMinutesVal)} ({((appTotalMinutesSum / totalScreenMinutesVal) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  {unaccountedMinutes > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Uncategorized / System Time: {formatMinutes(unaccountedMinutes)} ({((unaccountedMinutes / totalScreenMinutesVal) * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Optional Notes */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Notes or Context (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Late night gaming session, online study webinar, client calls"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>{existingRecordId ? 'Update Phone Usage' : 'Save Phone Usage'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
