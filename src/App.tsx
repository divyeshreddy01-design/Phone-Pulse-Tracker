import React, { useState, useEffect } from 'react';
import { 
  Person, 
  DailyUsageRecord, 
  NavigationTab 
} from './types';
import { 
  getPeople, 
  savePeople, 
  getUsageRecords, 
  saveUsageRecords, 
  getActivePersonId, 
  setActivePersonId, 
  seedSampleDataIfEmpty, 
  clearAllData,
  deletePerson as deletePersonStorage,
  deleteUsageRecord as deleteRecordStorage
} from './utils/storage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LandingHero } from './components/landing/LandingHero';
import { PeopleList } from './components/people/PeopleList';
import { PersonModal } from './components/people/PersonModal';
import { RecordUsage } from './components/record/RecordUsage';
import { DashboardView } from './components/dashboard/DashboardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { TrendsView } from './components/trends/TrendsView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { ComparisonView } from './components/comparison/ComparisonView';
import { HistoryView } from './components/history/HistoryView';
import { ReportView } from './components/reports/ReportView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<NavigationTab>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('phonepulse_theme') === 'dark';
  });

  // Data State
  const [people, setPeople] = useState<Person[]>([]);
  const [records, setRecords] = useState<DailyUsageRecord[]>([]);
  const [activePersonId, setActivePersonIdState] = useState<string | null>(null);

  // Modals & Editing State
  const [personModalOpen, setPersonModalOpen] = useState<boolean>(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Report preselection state (for jumping to report from history)
  const [reportPersonId, setReportPersonId] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState<string | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync dark mode class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('phonepulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('phonepulse_theme', 'light');
    }
  }, [darkMode]);

  // Initial Data Seeding & Hydration
  useEffect(() => {
    seedSampleDataIfEmpty();
    const loadedPeople = getPeople();
    const loadedRecords = getUsageRecords();
    const savedActiveId = getActivePersonId();

    setPeople(loadedPeople);
    setRecords(loadedRecords);

    if (savedActiveId && loadedPeople.some(p => p.id === savedActiveId)) {
      setActivePersonIdState(savedActiveId);
    } else if (loadedPeople.length > 0) {
      setActivePersonIdState(loadedPeople[0].id);
      setActivePersonId(loadedPeople[0].id);
    }
  }, []);

  // Helper to get active person object
  const activePerson = people.find(p => p.id === activePersonId) || (people.length > 0 ? people[0] : null);

  // Person Handlers
  const handleSelectPerson = (id: string) => {
    setActivePersonIdState(id);
    setActivePersonId(id);
  };

  const handleSavePerson = (personData: Omit<Person, 'id' | 'createdAt'>) => {
    if (editingPerson) {
      // Update
      const updatedPeople = people.map(p => 
        p.id === editingPerson.id ? { ...p, ...personData } : p
      );
      setPeople(updatedPeople);
      savePeople(updatedPeople);
      showToast(`Updated profile for ${personData.name}`);
    } else {
      // Create new
      const newPerson: Person = {
        ...personData,
        id: `person-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updatedPeople = [...people, newPerson];
      setPeople(updatedPeople);
      savePeople(updatedPeople);
      setActivePersonIdState(newPerson.id);
      setActivePersonId(newPerson.id);
      showToast(`Added profile for ${newPerson.name}`);
    }
    setPersonModalOpen(false);
    setEditingPerson(null);
  };

  const handleDeletePerson = (id: string) => {
    deletePersonStorage(id);
    const updatedPeople = people.filter(p => p.id !== id);
    const updatedRecords = records.filter(r => r.personId !== id);
    setPeople(updatedPeople);
    setRecords(updatedRecords);

    if (activePersonId === id) {
      const nextId = updatedPeople.length > 0 ? updatedPeople[0].id : null;
      setActivePersonIdState(nextId);
      if (nextId) setActivePersonId(nextId);
    }
    showToast('Person profile deleted.');
  };

  // Usage Record Handlers
  const handleSaveUsageRecord = (record: DailyUsageRecord) => {
    const existingIndex = records.findIndex(r => r.id === record.id);
    let updatedRecords: DailyUsageRecord[];
    if (existingIndex >= 0) {
      updatedRecords = records.map(r => r.id === record.id ? record : r);
      showToast('Usage record updated.');
    } else {
      updatedRecords = [record, ...records];
      showToast('Usage record successfully saved!');
    }
    setRecords(updatedRecords);
    saveUsageRecords(updatedRecords);
    setEditingRecordId(null);
    setCurrentView('dashboard');
  };

  const handleDeleteRecord = (id: string) => {
    deleteRecordStorage(id);
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    showToast('Usage record deleted.');
  };

  // Quick jump to print specific record report
  const handlePrintRecordReport = (personId: string, date: string) => {
    setReportPersonId(personId);
    setReportDate(date);
    setActivePersonIdState(personId);
    setCurrentView('reports');
  };

  // Reset & Clear handlers
  const handleResetData = () => {
    localStorage.removeItem('phonepulse_initialized');
    seedSampleDataIfEmpty();
    const loadedPeople = getPeople();
    const loadedRecords = getUsageRecords();
    setPeople(loadedPeople);
    setRecords(loadedRecords);
    if (loadedPeople.length > 0) {
      setActivePersonIdState(loadedPeople[0].id);
      setActivePersonId(loadedPeople[0].id);
    }
    showToast('Reset to realistic sample dataset.');
  };

  const handleClearAllData = () => {
    clearAllData();
    setPeople([]);
    setRecords([]);
    setActivePersonIdState(null);
    showToast('All stored data cleared.');
  };

  const handleImportData = (data: { people: Person[]; records: DailyUsageRecord[] }) => {
    setPeople(data.people);
    setRecords(data.records);
    savePeople(data.people);
    saveUsageRecords(data.records);
    if (data.people.length > 0) {
      setActivePersonIdState(data.people[0].id);
      setActivePersonId(data.people[0].id);
    }
    showToast(`Imported ${data.people.length} profiles and ${data.records.length} logs!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-xl border border-slate-700 dark:border-slate-300 animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* When on Landing view, render full landing page experience */}
      {currentView === 'landing' ? (
        <div className="flex-1 flex flex-col">
          <LandingHero
            people={people}
            records={records}
            onGetStarted={() => setCurrentView('people')}
            onSelectSamplePerson={(personId) => {
              handleSelectPerson(personId);
              setCurrentView('dashboard');
            }}
          />
        </div>
      ) : (
        /* Main App Workspace Layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Responsive Sidebar (No-print) */}
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              setMobileMenuOpen(false);
              setEditingRecordId(null);
              setCurrentView(view);
            }}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Navbar */}
            <Navbar
              people={people}
              activePersonId={activePersonId}
              onSelectPerson={handleSelectPerson}
              onAddPerson={() => {
                setEditingPerson(null);
                setPersonModalOpen(true);
              }}
              onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(prev => !prev)}
              onGoToLanding={() => setCurrentView('landing')}
              currentView={currentView}
              onRecordUsageClick={() => setCurrentView('record')}
            />

            {/* View Router */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {/* 1. Dashboard View */}
              {currentView === 'dashboard' && (
                <DashboardView
                  person={activePerson}
                  people={people}
                  records={records}
                  onSelectPerson={handleSelectPerson}
                  onRecordUsageClick={() => setCurrentView('record')}
                  onViewAnalyticsClick={() => setCurrentView('analytics')}
                  onGenerateReportClick={() => setCurrentView('reports')}
                  onAddPersonClick={() => {
                    setEditingPerson(null);
                    setPersonModalOpen(true);
                  }}
                />
              )}

              {/* 2. People / Users View */}
              {currentView === 'people' && (
                <PeopleList
                  people={people}
                  records={records}
                  activePersonId={activePersonId}
                  onSelectPerson={handleSelectPerson}
                  onAddPerson={() => {
                    setEditingPerson(null);
                    setPersonModalOpen(true);
                  }}
                  onEditPerson={(p) => {
                    setEditingPerson(p);
                    setPersonModalOpen(true);
                  }}
                  onDeletePerson={handleDeletePerson}
                  onRecordUsageForPerson={(pId) => {
                    handleSelectPerson(pId);
                    setCurrentView('record');
                  }}
                  onViewPersonDashboard={(pId) => {
                    handleSelectPerson(pId);
                    setCurrentView('dashboard');
                  }}
                />
              )}

              {/* 3. Record Usage View */}
              {currentView === 'record' && (
                <RecordUsage
                  people={people}
                  activePersonId={activePersonId}
                  editingRecordId={editingRecordId}
                  records={records}
                  onSaveRecord={handleSaveUsageRecord}
                  onCancel={() => {
                    setEditingRecordId(null);
                    setCurrentView('dashboard');
                  }}
                  onAddPerson={() => {
                    setEditingPerson(null);
                    setPersonModalOpen(true);
                  }}
                />
              )}

              {/* 4. Analytics View */}
              {currentView === 'analytics' && (
                <AnalyticsView
                  person={activePerson}
                  records={records}
                  onRecordUsageClick={() => setCurrentView('record')}
                />
              )}

              {/* 5. Usage Trends View */}
              {currentView === 'trends' && (
                <TrendsView
                  person={activePerson}
                  records={records}
                  onRecordUsageClick={() => setCurrentView('record')}
                />
              )}

              {/* 6. Smart Recommendations View */}
              {currentView === 'recommendations' && (
                <RecommendationsView
                  person={activePerson}
                  records={records}
                  onRecordUsageClick={() => setCurrentView('record')}
                />
              )}

              {/* 7. Comparison View */}
              {currentView === 'comparison' && (
                <ComparisonView
                  people={people}
                  records={records}
                  onAddPersonClick={() => {
                    setEditingPerson(null);
                    setPersonModalOpen(true);
                  }}
                />
              )}

              {/* 8. Usage History View */}
              {currentView === 'history' && (
                <HistoryView
                  people={people}
                  records={records}
                  onEditRecord={(recId) => {
                    setEditingRecordId(recId);
                    setCurrentView('record');
                  }}
                  onDeleteRecord={handleDeleteRecord}
                  onViewRecord={(recId) => {
                    const r = records.find(x => x.id === recId);
                    if (r) {
                      handleSelectPerson(r.personId);
                      setCurrentView('dashboard');
                    }
                  }}
                  onPrintRecordReport={handlePrintRecordReport}
                  onAddRecordClick={() => {
                    setEditingRecordId(null);
                    setCurrentView('record');
                  }}
                />
              )}

              {/* 9. Reports & A4 Printing View */}
              {currentView === 'reports' && (
                <ReportView
                  people={people}
                  records={records}
                  initialPersonId={reportPersonId || activePersonId}
                  initialDate={reportDate}
                />
              )}

              {/* 10. Settings View */}
              {currentView === 'settings' && (
                <SettingsView
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(prev => !prev)}
                  people={people}
                  activePerson={activePerson}
                  records={records}
                  onUpdatePerson={(updatedP) => {
                    const next = people.map(p => p.id === updatedP.id ? updatedP : p);
                    setPeople(next);
                    savePeople(next);
                  }}
                  onResetData={handleResetData}
                  onClearAllData={handleClearAllData}
                  onImportData={handleImportData}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Add/Edit Person Modal */}
      <PersonModal
        isOpen={personModalOpen}
        onClose={() => {
          setPersonModalOpen(false);
          setEditingPerson(null);
        }}
        personToEdit={editingPerson}
        onSave={handleSavePerson}
      />
    </div>
  );
}
