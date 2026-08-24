import { Person, DailyUsageRecord } from '../types';
import { SAMPLE_PEOPLE, SAMPLE_RECORDS } from '../data/sampleData';

const PEOPLE_STORAGE_KEY = 'phonepulse_people_v1';
const RECORDS_STORAGE_KEY = 'phonepulse_records_v1';
const ACTIVE_PERSON_KEY = 'phonepulse_active_person_v1';
const THEME_STORAGE_KEY = 'phonepulse_theme_v1';
const HAS_SEEN_LANDING_KEY = 'phonepulse_has_seen_landing_v1';

// Initializer
export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (!raw) {
      // Seed with sample people on first run
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(SAMPLE_PEOPLE));
      return SAMPLE_PEOPLE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse people from storage', e);
    return SAMPLE_PEOPLE;
  }
}

export function savePeople(people: Person[]): void {
  localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
}

export function getStoredRecords(): DailyUsageRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      // Seed with sample records on first run
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(SAMPLE_RECORDS));
      return SAMPLE_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse records from storage', e);
    return SAMPLE_RECORDS;
  }
}

export function saveRecords(records: DailyUsageRecord[]): void {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function getActivePersonId(): string | null {
  const stored = localStorage.getItem(ACTIVE_PERSON_KEY);
  if (stored) return stored;
  const people = getStoredPeople();
  return people.length > 0 ? people[0].id : null;
}

export function setActivePersonId(personId: string): void {
  localStorage.setItem(ACTIVE_PERSON_KEY, personId);
}

export function getHasSeenLanding(): boolean {
  return localStorage.getItem(HAS_SEEN_LANDING_KEY) === 'true';
}

export function setHasSeenLanding(seen: boolean): void {
  localStorage.setItem(HAS_SEEN_LANDING_KEY, seen ? 'true' : 'false');
}

// Person CRUD
export function addPerson(person: Omit<Person, 'id' | 'createdAt'>): Person {
  const people = getStoredPeople();
  const avatarGradients = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-fuchsia-600',
  ];
  const newPerson: Person = {
    ...person,
    id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    avatarColor: avatarGradients[people.length % avatarGradients.length],
    isSample: false,
  };
  const updated = [...people, newPerson];
  savePeople(updated);
  setActivePersonId(newPerson.id);
  return newPerson;
}

export function updatePerson(person: Person): void {
  const people = getStoredPeople();
  const updated = people.map(p => p.id === person.id ? person : p);
  savePeople(updated);
}

export function deletePerson(personId: string): void {
  const people = getStoredPeople().filter(p => p.id !== personId);
  savePeople(people);

  // Also remove all usage records associated with this person
  const records = getStoredRecords().filter(r => r.personId !== personId);
  saveRecords(records);

  // If deleted person was active, switch to next available person
  const currentActive = getActivePersonId();
  if (currentActive === personId) {
    if (people.length > 0) {
      setActivePersonId(people[0].id);
    } else {
      localStorage.removeItem(ACTIVE_PERSON_KEY);
    }
  }
}

// Records CRUD
export function addOrUpdateDailyRecord(record: Omit<DailyUsageRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DailyUsageRecord {
  const records = getStoredRecords();
  const now = new Date().toISOString();

  // If existing record for same person and date exists, update it
  const existingIndex = record.id 
    ? records.findIndex(r => r.id === record.id)
    : records.findIndex(r => r.personId === record.personId && r.date === record.date);

  let savedRecord: DailyUsageRecord;

  if (existingIndex >= 0) {
    savedRecord = {
      ...records[existingIndex],
      ...record,
      id: records[existingIndex].id,
      updatedAt: now,
      isSample: false,
    };
    records[existingIndex] = savedRecord;
  } else {
    savedRecord = {
      ...record,
      id: record.id || `record-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      isSample: false,
    };
    records.push(savedRecord);
  }

  saveRecords(records);
  return savedRecord;
}

export function deleteDailyRecord(recordId: string): void {
  const records = getStoredRecords().filter(r => r.id !== recordId);
  saveRecords(records);
}

// Clear / Reset options
export function clearSampleData(): void {
  const people = getStoredPeople().filter(p => !p.isSample);
  const records = getStoredRecords().filter(r => !r.isSample);
  savePeople(people);
  saveRecords(records);
  if (people.length > 0) {
    setActivePersonId(people[0].id);
  } else {
    localStorage.removeItem(ACTIVE_PERSON_KEY);
  }
}

export function resetToSampleData(): void {
  savePeople(SAMPLE_PEOPLE);
  saveRecords(SAMPLE_RECORDS);
  setActivePersonId(SAMPLE_PEOPLE[0].id);
}

export function seedSampleDataIfEmpty(): void {
  const people = getStoredPeople();
  if (people.length === 0) {
    resetToSampleData();
  }
}

// Convenient Aliases
export const getPeople = getStoredPeople;
export const getUsageRecords = getStoredRecords;
export const saveUsageRecords = saveRecords;
export const deleteUsageRecord = deleteDailyRecord;
export const exportDataAsJSON = exportToJSON;
export const exportDataAsCSV = exportToCSV;
export function importDataFromJSON(jsonText: string): { people: Person[]; records: DailyUsageRecord[] } | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed.people && Array.isArray(parsed.people) && parsed.records && Array.isArray(parsed.records)) {
      return { people: parsed.people, records: parsed.records };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(PEOPLE_STORAGE_KEY);
  localStorage.removeItem(RECORDS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_PERSON_KEY);
}

// Export CSV
export function exportToCSV(customPeople?: Person[], customRecords?: DailyUsageRecord[]): void {
  const people = customPeople || getStoredPeople();
  const records = customRecords || getStoredRecords();

  const peopleMap = new Map<string, Person>();
  people.forEach(p => peopleMap.set(p.id, p));

  const headers = [
    'Record_ID',
    'Date',
    'Person_Name',
    'Person_Age',
    'User_Type',
    'Phone_Model',
    'Daily_Goal_Hours',
    'Daily_Goal_Minutes',
    'Total_Screen_Minutes',
    'Total_Screen_Formatted',
    'Goal_Status',
    'App_Name',
    'App_Category',
    'App_Minutes',
    'App_Formatted',
    'App_Percentage_Of_Day',
    'Notes',
  ];

  const rows: string[] = [headers.join(',')];

  records.forEach(rec => {
    const person = peopleMap.get(rec.personId);
    const personName = person ? `"${person.name.replace(/"/g, '""')}"` : 'Unknown';
    const age = person?.age ?? '';
    const userType = person ? `"${person.userType}"` : '';
    const phoneModel = person?.phoneModel ? `"${person.phoneModel.replace(/"/g, '""')}"` : '';
    const goalMins = person?.dailyGoalMinutes || 0;
    const goalHours = (goalMins / 60).toFixed(1);
    const totalScreenHrs = `${Math.floor(rec.totalScreenMinutes / 60)}h ${rec.totalScreenMinutes % 60}m`;
    const goalStatus = rec.totalScreenMinutes <= goalMins 
      ? 'Goal Achieved' 
      : rec.totalScreenMinutes <= goalMins * 1.1 
        ? 'Near Goal' 
        : 'Goal Exceeded';
    const notes = rec.notes ? `"${rec.notes.replace(/"/g, '""')}"` : '""';

    if (rec.apps.length === 0) {
      rows.push([
        rec.id,
        rec.date,
        personName,
        age,
        userType,
        phoneModel,
        goalHours,
        goalMins,
        rec.totalScreenMinutes,
        `"${totalScreenHrs}"`,
        `"${goalStatus}"`,
        '""',
        '""',
        0,
        '""',
        '0%',
        notes,
      ].join(','));
    } else {
      rec.apps.forEach(app => {
        const appPct = rec.totalScreenMinutes > 0 ? ((app.minutes / rec.totalScreenMinutes) * 100).toFixed(1) + '%' : '0%';
        const appFormatted = `${Math.floor(app.minutes / 60)}h ${app.minutes % 60}m`;
        rows.push([
          rec.id,
          rec.date,
          personName,
          age,
          userType,
          phoneModel,
          goalHours,
          goalMins,
          rec.totalScreenMinutes,
          `"${totalScreenHrs}"`,
          `"${goalStatus}"`,
          `"${app.appName.replace(/"/g, '""')}"`,
          `"${app.category}"`,
          app.minutes,
          `"${appFormatted}"`,
          `"${appPct}"`,
          notes,
        ].join(','));
      });
    }
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `phonepulse_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export JSON
export function exportToJSON(customPeople?: Person[], customRecords?: DailyUsageRecord[]): void {
  const data = {
    appName: 'PhonePulse Tracker',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    people: customPeople || getStoredPeople(),
    records: customRecords || getStoredRecords(),
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `phonepulse_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import JSON
export function importFromJSON(jsonText: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed.people || !Array.isArray(parsed.people)) {
      return { success: false, message: 'Invalid file structure: missing people array.' };
    }
    if (!parsed.records || !Array.isArray(parsed.records)) {
      return { success: false, message: 'Invalid file structure: missing records array.' };
    }

    savePeople(parsed.people);
    saveRecords(parsed.records);
    if (parsed.people.length > 0) {
      setActivePersonId(parsed.people[0].id);
    }
    return { success: true, message: `Successfully imported ${parsed.people.length} people and ${parsed.records.length} usage records!` };
  } catch (e: any) {
    return { success: false, message: `Failed to parse JSON: ${e.message}` };
  }
}
