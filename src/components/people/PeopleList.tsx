import React, { useState } from 'react';
import { 
  UserPlus, 
  Eye, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FileText, 
  Smartphone, 
  Clock, 
  Target, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Person, DailyUsageRecord } from '../../types';
import { calculateDailyRecord, formatMinutes } from '../../utils/calculations';
import { GoalBadge, UserTypeBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface PeopleListProps {
  people: Person[];
  records: DailyUsageRecord[];
  onAddPerson: () => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
  onViewUsage: (personId: string) => void;
  onAddUsage: (personId: string) => void;
  onGenerateReport: (personId: string) => void;
}

export const PeopleList: React.FC<PeopleListProps> = ({
  people,
  records,
  onAddPerson,
  onEditPerson,
  onDeletePerson,
  onViewUsage,
  onAddUsage,
  onGenerateReport,
}) => {
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  // Helper to find latest/today's record for a person
  const getTodayOrLatestRecord = (personId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRec = records.find(r => r.personId === personId && r.date === todayStr);
    if (todayRec) return { record: todayRec, isToday: true };

    const personRecs = records
      .filter(r => r.personId === personId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return personRecs.length > 0 ? { record: personRecs[0], isToday: false } : null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            People & Profiles
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage tracked Android users, view goal statuses, and compare phone usage habits.
          </p>
        </div>
        <button
          onClick={onAddPerson}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Another Person</span>
        </button>
      </div>

      {/* People Grid */}
      {people.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No people registered yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Add your first person to start tracking Android screen time and individual apps.
          </p>
          <button
            onClick={onAddPerson}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-indigo-700 transition-colors"
          >
            Add First Person
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {people.map(person => {
            const latest = getTodayOrLatestRecord(person.id);
            const calculated = latest ? calculateDailyRecord(latest.record, person) : null;
            const personRecordCount = records.filter(r => r.personId === person.id).length;

            return (
              <div
                key={person.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Card Banner */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${person.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-lg font-bold shadow-sm`}>
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                              {person.name}
                            </h3>
                            {person.isSample && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                Sample
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <UserTypeBadge userType={person.userType} />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {person.age} yrs {person.gender && person.gender !== 'Prefer not to say' ? `• ${person.gender}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete quick icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditPerson(person)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Person Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPersonToDelete(person)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Person"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Phone Model */}
                    {person.phoneModel && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{person.phoneModel}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Metrics */}
                  <div className="p-5 space-y-3">
                    {/* Goal & Today metrics */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Daily Goal
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                          <Target className="w-3.5 h-3.5 text-indigo-500" />
                          {formatMinutes(person.dailyGoalMinutes)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          {latest?.isToday ? "Today's Time" : "Latest Recorded"}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {calculated ? formatMinutes(calculated.totalScreenMinutes) : 'No logs'}
                        </span>
                      </div>
                    </div>

                    {/* Goal Status Badge & Difference */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Goal Status:
                      </span>
                      {calculated ? (
                        <GoalBadge status={calculated.goalStatus} />
                      ) : (
                        <span className="text-xs text-slate-400">Not recorded</span>
                      )}
                    </div>

                    {calculated && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                        {calculated.differenceMinutes >= 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatMinutes(calculated.differenceMinutes)} under goal
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            {formatMinutes(Math.abs(calculated.differenceMinutes))} over goal
                          </span>
                        )}
                      </div>
                    )}

                    {/* Recorded Days count */}
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center justify-between pt-1">
                      <span>Historical Logged Days</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {personRecordCount} day{personRecordCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onViewUsage(person.id)}
                    className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onAddUsage(person.id)}
                    className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Log</span>
                  </button>

                  <button
                    onClick={() => onGenerateReport(person.id)}
                    className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!personToDelete}
        onClose={() => setPersonToDelete(null)}
        title="Delete Person Profile"
        subtitle="This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Permanent Deletion Warning</p>
              <p>
                Deleting <strong className="text-slate-900 dark:text-white">{personToDelete?.name}</strong> will also permanently remove all of their recorded daily screen time logs and app usage history.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setPersonToDelete(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (personToDelete) {
                  onDeletePerson(personToDelete.id);
                  setPersonToDelete(null);
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
