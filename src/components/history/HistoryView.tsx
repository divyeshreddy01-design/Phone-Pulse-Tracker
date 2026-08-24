import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Printer, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ArrowUpDown,
  Smartphone,
  PlusCircle,
  X
} from 'lucide-react';
import { Person, DailyUsageRecord, GoalStatus, AppCategory } from '../../types';
import { calculateDailyRecord, formatMinutes } from '../../utils/calculations';
import { GoalBadge, CategoryBadge, UserTypeBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface HistoryViewProps {
  people: Person[];
  records: DailyUsageRecord[];
  onEditRecord: (recordId: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onViewRecord: (recordId: string) => void;
  onPrintRecordReport: (personId: string, date: string) => void;
  onAddRecordClick: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  people,
  records,
  onEditRecord,
  onDeleteRecord,
  onViewRecord,
  onPrintRecordReport,
  onAddRecordClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPersonId, setFilterPersonId] = useState<string>('all');
  const [filterGoalStatus, setFilterGoalStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [recordToDelete, setRecordToDelete] = useState<DailyUsageRecord | null>(null);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        const person = people.find(p => p.id === record.personId);
        const personName = person?.name || '';
        const calc = calculateDailyRecord(record, person);

        // Person filter
        if (filterPersonId !== 'all' && record.personId !== filterPersonId) {
          return false;
        }

        // Goal status filter
        if (filterGoalStatus !== 'all' && calc.goalStatus !== filterGoalStatus) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all') {
          const hasCategory = record.apps.some(a => a.category === filterCategory);
          if (!hasCategory) return false;
        }

        // Search text filter (matches person name, date, app name, notes)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchPerson = personName.toLowerCase().includes(query);
          const matchDate = record.date.toLowerCase().includes(query);
          const matchNotes = (record.notes || '').toLowerCase().includes(query);
          const matchApps = record.apps.some(a => a.appName.toLowerCase().includes(query));
          if (!matchPerson && !matchDate && !matchNotes && !matchApps) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [records, people, filterPersonId, filterGoalStatus, filterCategory, searchTerm, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Usage History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chronological audit log of all recorded Android phone usage sessions and app entries.
          </p>
        </div>

        <button
          onClick={onAddRecordClick}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Day</span>
        </button>
      </div>

      {/* Search and Filters Bar (Requirement 20) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search person, app, date..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Person */}
          <div>
            <select
              value={filterPersonId}
              onChange={e => setFilterPersonId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All People ({people.length})</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Goal Status */}
          <div>
            <select
              value={filterGoalStatus}
              onChange={e => setFilterGoalStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All Goal Statuses</option>
              <option value="Goal Achieved">Goal Achieved</option>
              <option value="Near Goal">Near Goal</option>
              <option value="Goal Exceeded">Goal Exceeded</option>
            </select>
          </div>

          {/* Filter by Category */}
          <div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All App Categories</option>
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
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Showing <strong>{filteredRecords.length}</strong> of {records.length} records</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by Date ({sortOrder === 'desc' ? 'Newest first' : 'Oldest first'})</span>
          </button>
        </div>
      </div>

      {/* History Table (Requirement 19) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No records match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Person</th>
                  <th className="py-3 px-4">Screen Time</th>
                  <th className="py-3 px-4">Apps Recorded</th>
                  <th className="py-3 px-4">Goal Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map(record => {
                  const person = people.find(p => p.id === record.personId);
                  const calc = calculateDailyRecord(record, person);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{record.date}</span>
                        </div>
                      </td>

                      {/* Person */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md bg-gradient-to-tr ${person?.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white text-[10px] font-bold`}>
                            {person?.name.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {person?.name || 'Unknown'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {person?.userType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Screen Time */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display block">
                          {formatMinutes(record.totalScreenMinutes)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Goal: {formatMinutes(person?.dailyGoalMinutes || 240)}
                        </span>
                      </td>

                      {/* Apps Used */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {record.apps.slice(0, 3).map(app => (
                            <span key={app.id} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                              {app.appName} ({formatMinutes(app.minutes)})
                            </span>
                          ))}
                          {record.apps.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{record.apps.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Goal Status */}
                      <td className="py-3.5 px-4">
                        <GoalBadge status={calc.goalStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPrintRecordReport(record.personId, record.date)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print / View Report"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditRecord(record.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        title="Delete Usage Record"
        subtitle="This action will delete the selected day's screen time entry."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the phone usage record for{' '}
            <strong className="text-slate-900 dark:text-white">
              {recordToDelete?.date}
            </strong>
            ?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setRecordToDelete(null)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (recordToDelete) {
                  onDeleteRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }
              }}
              className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
