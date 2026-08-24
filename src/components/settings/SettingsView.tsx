import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Info, 
  FileSpreadsheet, 
  FileCode, 
  Check, 
  AlertTriangle,
  User,
  Smartphone,
  Save
} from 'lucide-react';
import { Person, DailyUsageRecord } from '../../types';
import { formatMinutes } from '../../utils/calculations';
import { exportDataAsJSON, exportDataAsCSV, importDataFromJSON } from '../../utils/storage';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  people: Person[];
  activePerson: Person | null;
  records: DailyUsageRecord[];
  onUpdatePerson: (person: Person) => void;
  onResetData: () => void;
  onClearAllData: () => void;
  onImportData: (data: { people: Person[]; records: DailyUsageRecord[] }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  darkMode,
  onToggleDarkMode,
  people,
  activePerson,
  records,
  onUpdatePerson,
  onResetData,
  onClearAllData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeGoalInput, setActiveGoalInput] = useState<{ hours: number; minutes: number }>(() => {
    if (!activePerson) return { hours: 4, minutes: 0 };
    return {
      hours: Math.floor(activePerson.dailyGoalMinutes / 60),
      minutes: activePerson.dailyGoalMinutes % 60,
    };
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Goal Update for Active Person
  const handleSaveGoal = () => {
    if (!activePerson) return;
    const totalMinutes = activeGoalInput.hours * 60 + activeGoalInput.minutes;
    if (totalMinutes <= 0) {
      showFeedback('Please set a goal greater than 0 minutes.');
      return;
    }
    const updated: Person = {
      ...activePerson,
      dailyGoalMinutes: totalMinutes,
    };
    onUpdatePerson(updated);
    showFeedback(`Daily goal updated to ${formatMinutes(totalMinutes)} for ${activePerson.name}!`);
  };

  // Handle JSON Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const imported = importDataFromJSON(text);
        if (imported) {
          onImportData(imported);
          showFeedback(`Imported ${imported.people.length} profiles and ${imported.records.length} usage records!`);
        } else {
          showFeedback('Failed to parse import file. Invalid JSON format.');
        }
      } catch (err) {
        showFeedback('Error importing data file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          Application Settings & Data Control
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal goals, export usage archives, customize appearance, and configure data storage.
        </p>
      </div>

      {/* Success / Feedback Notification Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Section 1: Appearance & Theme (Requirement 21) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1">
          Interface Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Toggle between crisp high-contrast Light mode and eye-safe Dark mode.
        </p>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <span className="text-[11px] text-slate-500">
                Smooth visual comfort for prolonged analytical reviews.
              </span>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Switch to {darkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* Section 2: Active Profile Goal Quick Editor (Requirement 17) */}
      {activePerson && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1">
            Active Goal Configuration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Adjust the daily screen-time limit for <strong className="text-slate-900 dark:text-white">{activePerson.name}</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hours Target:
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={activeGoalInput.hours}
                onChange={e => setActiveGoalInput(prev => ({ ...prev, hours: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minutes Target:
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={activeGoalInput.minutes}
                onChange={e => setActiveGoalInput(prev => ({ ...prev, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleSaveGoal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save New Goal</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Data Management, Backup & Export (Requirement 18) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1">
          Data Backup & Portability
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          All data is securely persisted in your browser's local storage. Export archives to preserve logs or migrate to other devices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* JSON Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>Export Full Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Saves all people profiles and full application usage history into an importable JSON file.
              </p>
            </div>
            <button
              onClick={() => {
                exportDataAsJSON(people, records);
                showFeedback('JSON backup downloaded successfully!');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Archive</span>
            </button>
          </div>

          {/* CSV Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export Spreadsheet (CSV)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Generates a clean CSV file of all daily usage records for Excel, Google Sheets, or data science.
              </p>
            </div>
            <button
              onClick={() => {
                exportDataAsCSV(people, records);
                showFeedback('CSV file generated and downloaded!');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Sheet</span>
            </button>
          </div>
        </div>

        {/* File Import Form */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              Restore Data from JSON Backup
            </span>
            <span className="text-[11px] text-slate-500">
              Upload a previously exported PhonePulse JSON backup file.
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select JSON File</span>
          </button>
        </div>
      </div>

      {/* Section 4: Data Reset & Purge Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-950/50 p-6 shadow-xs">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 font-display mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Data Reset Zone</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Reset to default multi-persona sample data or purge all stored entries.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reset to Sample Data</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        title="Clear All Local Data"
        subtitle="Permanent action"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            This will permanently remove all {people.length} person profiles and {records.length} usage records from your browser's storage.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowClearConfirmModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAllData();
                setShowClearConfirmModal(false);
                showFeedback('All local records and profiles have been cleared.');
              }}
              className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              Confirm & Purge Everything
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        title="Reset to Realistic Sample Data"
        subtitle="Student, Working Person, Senior Citizen"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            This will restore the 3 preset personas (Student with 5h target, Working Professional with 3h 30m target, Senior Citizen with 2h target) and 2 weeks of realistic usage logs.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowResetConfirmModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onResetData();
                setShowResetConfirmModal(false);
                showFeedback('Reset to default sample profiles and usage records!');
              }}
              className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
