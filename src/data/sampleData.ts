import { Person, DailyUsageRecord } from '../types';

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: 'sample-person-1',
    name: 'Aarav Sharma',
    age: 21,
    gender: 'Male',
    userType: 'Student',
    phoneModel: 'Samsung Galaxy S24',
    dailyGoalMinutes: 210, // 3h 30m
    createdAt: '2026-08-10T08:00:00.000Z',
    avatarColor: 'from-blue-500 to-indigo-600',
    isSample: true,
  },
  {
    id: 'sample-person-2',
    name: 'Priya Nair',
    age: 29,
    gender: 'Female',
    userType: 'Working Person',
    phoneModel: 'Google Pixel 8 Pro',
    dailyGoalMinutes: 240, // 4h 00m
    createdAt: '2026-08-10T09:00:00.000Z',
    avatarColor: 'from-emerald-500 to-teal-600',
    isSample: true,
  },
  {
    id: 'sample-person-3',
    name: 'Ramesh Patel',
    age: 68,
    gender: 'Male',
    userType: 'Senior Citizen',
    phoneModel: 'OnePlus 11 5G',
    dailyGoalMinutes: 150, // 2h 30m
    createdAt: '2026-08-10T10:00:00.000Z',
    avatarColor: 'from-amber-500 to-orange-600',
    isSample: true,
  },
];

// Helper to generate dates backwards from a reference date
function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const SAMPLE_RECORDS: DailyUsageRecord[] = [
  // --- Aarav Sharma (Student) ---
  // Today (Day 0)
  {
    id: 'rec-aarav-0',
    personId: 'sample-person-1',
    date: getPastDateString(0),
    totalScreenMinutes: 275, // 4h 35m (Over goal of 3h 30m)
    apps: [
      { id: 'app-1', appName: 'Instagram', category: 'Social Media', minutes: 85 },
      { id: 'app-2', appName: 'YouTube', category: 'Entertainment', minutes: 90 },
      { id: 'app-3', appName: 'WhatsApp', category: 'Communication', minutes: 45 },
      { id: 'app-4', appName: 'Chrome', category: 'Productivity', minutes: 35 },
      { id: 'app-5', appName: 'Duolingo', category: 'Education', minutes: 20 },
    ],
    notes: 'Exam revision session & late-night reels',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Yesterday (Day 1)
  {
    id: 'rec-aarav-1',
    personId: 'sample-person-1',
    date: getPastDateString(1),
    totalScreenMinutes: 240, // 4h 00m
    apps: [
      { id: 'app-6', appName: 'YouTube', category: 'Entertainment', minutes: 80 },
      { id: 'app-7', appName: 'Instagram', category: 'Social Media', minutes: 70 },
      { id: 'app-8', appName: 'WhatsApp', category: 'Communication', minutes: 40 },
      { id: 'app-9', appName: 'Coursera', category: 'Education', minutes: 35 },
      { id: 'app-10', appName: 'Spotify', category: 'Entertainment', minutes: 15 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 2
  {
    id: 'rec-aarav-2',
    personId: 'sample-person-1',
    date: getPastDateString(2),
    totalScreenMinutes: 195, // 3h 15m (Within goal!)
    apps: [
      { id: 'app-11', appName: 'Duolingo', category: 'Education', minutes: 45 },
      { id: 'app-12', appName: 'WhatsApp', category: 'Communication', minutes: 50 },
      { id: 'app-13', appName: 'YouTube', category: 'Entertainment', minutes: 50 },
      { id: 'app-14', appName: 'Notion', category: 'Productivity', minutes: 30 },
      { id: 'app-15', appName: 'Instagram', category: 'Social Media', minutes: 20 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 3
  {
    id: 'rec-aarav-3',
    personId: 'sample-person-1',
    date: getPastDateString(3),
    totalScreenMinutes: 210, // 3h 30m (Exact goal)
    apps: [
      { id: 'app-16', appName: 'Instagram', category: 'Social Media', minutes: 65 },
      { id: 'app-17', appName: 'YouTube', category: 'Entertainment', minutes: 65 },
      { id: 'app-18', appName: 'WhatsApp', category: 'Communication', minutes: 45 },
      { id: 'app-19', appName: 'BGMi', category: 'Games', minutes: 35 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 4
  {
    id: 'rec-aarav-4',
    personId: 'sample-person-1',
    date: getPastDateString(4),
    totalScreenMinutes: 290, // 4h 50m
    apps: [
      { id: 'app-20', appName: 'BGMi', category: 'Games', minutes: 90 },
      { id: 'app-21', appName: 'Instagram', category: 'Social Media', minutes: 80 },
      { id: 'app-22', appName: 'YouTube', category: 'Entertainment', minutes: 70 },
      { id: 'app-23', appName: 'WhatsApp', category: 'Communication', minutes: 50 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 5
  {
    id: 'rec-aarav-5',
    personId: 'sample-person-1',
    date: getPastDateString(5),
    totalScreenMinutes: 180, // 3h 00m (Achieved)
    apps: [
      { id: 'app-24', appName: 'Coursera', category: 'Education', minutes: 60 },
      { id: 'app-25', appName: 'WhatsApp', category: 'Communication', minutes: 40 },
      { id: 'app-26', appName: 'YouTube', category: 'Entertainment', minutes: 45 },
      { id: 'app-27', appName: 'Instagram', category: 'Social Media', minutes: 35 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 6
  {
    id: 'rec-aarav-6',
    personId: 'sample-person-1',
    date: getPastDateString(6),
    totalScreenMinutes: 225, // 3h 45m
    apps: [
      { id: 'app-28', appName: 'YouTube', category: 'Entertainment', minutes: 85 },
      { id: 'app-29', appName: 'Instagram', category: 'Social Media', minutes: 60 },
      { id: 'app-30', appName: 'WhatsApp', category: 'Communication', minutes: 45 },
      { id: 'app-31', appName: 'Chrome', category: 'Productivity', minutes: 35 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },

  // --- Priya Nair (Working Person) ---
  // Today (Day 0)
  {
    id: 'rec-priya-0',
    personId: 'sample-person-2',
    date: getPastDateString(0),
    totalScreenMinutes: 220, // 3h 40m (Goal is 4h 00m -> Achieved!)
    apps: [
      { id: 'app-p1', appName: 'Slack', category: 'Productivity', minutes: 75 },
      { id: 'app-p2', appName: 'Gmail', category: 'Productivity', minutes: 45 },
      { id: 'app-p3', appName: 'WhatsApp', category: 'Communication', minutes: 40 },
      { id: 'app-p4', appName: 'LinkedIn', category: 'Social Media', minutes: 30 },
      { id: 'app-p5', appName: 'Spotify', category: 'Entertainment', minutes: 30 },
    ],
    notes: 'Client sprint meetings & commute podcasts',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 1
  {
    id: 'rec-priya-1',
    personId: 'sample-person-2',
    date: getPastDateString(1),
    totalScreenMinutes: 255, // 4h 15m
    apps: [
      { id: 'app-p6', appName: 'Slack', category: 'Productivity', minutes: 85 },
      { id: 'app-p7', appName: 'Microsoft Teams', category: 'Communication', minutes: 60 },
      { id: 'app-p8', appName: 'Chrome', category: 'Productivity', minutes: 45 },
      { id: 'app-p9', appName: 'Instagram', category: 'Social Media', minutes: 35 },
      { id: 'app-p10', appName: 'Amazon', category: 'Shopping', minutes: 30 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 2
  {
    id: 'rec-priya-2',
    personId: 'sample-person-2',
    date: getPastDateString(2),
    totalScreenMinutes: 210, // 3h 30m
    apps: [
      { id: 'app-p11', appName: 'Slack', category: 'Productivity', minutes: 80 },
      { id: 'app-p12', appName: 'Gmail', category: 'Productivity', minutes: 40 },
      { id: 'app-p13', appName: 'WhatsApp', category: 'Communication', minutes: 45 },
      { id: 'app-p14', appName: 'LinkedIn', category: 'Social Media', minutes: 25 },
      { id: 'app-p15', appName: 'Spotify', category: 'Entertainment', minutes: 20 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 3
  {
    id: 'rec-priya-3',
    personId: 'sample-person-2',
    date: getPastDateString(3),
    totalScreenMinutes: 235,
    apps: [
      { id: 'app-p16', appName: 'Slack', category: 'Productivity', minutes: 90 },
      { id: 'app-p17', appName: 'Gmail', category: 'Productivity', minutes: 50 },
      { id: 'app-p18', appName: 'WhatsApp', category: 'Communication', minutes: 40 },
      { id: 'app-p19', appName: 'Netflix', category: 'Entertainment', minutes: 40 },
      { id: 'app-p20', appName: 'Instagram', category: 'Social Media', minutes: 15 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 4
  {
    id: 'rec-priya-4',
    personId: 'sample-person-2',
    date: getPastDateString(4),
    totalScreenMinutes: 190,
    apps: [
      { id: 'app-p21', appName: 'Slack', category: 'Productivity', minutes: 70 },
      { id: 'app-p22', appName: 'WhatsApp', category: 'Communication', minutes: 45 },
      { id: 'app-p23', appName: 'Kindle', category: 'Education', minutes: 45 },
      { id: 'app-p24', appName: 'Spotify', category: 'Entertainment', minutes: 30 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 5
  {
    id: 'rec-priya-5',
    personId: 'sample-person-2',
    date: getPastDateString(5),
    totalScreenMinutes: 260,
    apps: [
      { id: 'app-p25', appName: 'Netflix', category: 'Entertainment', minutes: 90 },
      { id: 'app-p26', appName: 'Instagram', category: 'Social Media', minutes: 60 },
      { id: 'app-p27', appName: 'WhatsApp', category: 'Communication', minutes: 50 },
      { id: 'app-p28', appName: 'Zomato', category: 'Shopping', minutes: 35 },
      { id: 'app-p29', appName: 'Spotify', category: 'Entertainment', minutes: 25 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },

  // --- Ramesh Patel (Senior Citizen) ---
  // Today (Day 0)
  {
    id: 'rec-ramesh-0',
    personId: 'sample-person-3',
    date: getPastDateString(0),
    totalScreenMinutes: 135, // 2h 15m (Goal is 2h 30m -> Achieved!)
    apps: [
      { id: 'app-r1', appName: 'WhatsApp', category: 'Communication', minutes: 55 },
      { id: 'app-r2', appName: 'YouTube', category: 'Entertainment', minutes: 40 },
      { id: 'app-r3', appName: 'Dailyhunt News', category: 'Education', minutes: 25 },
      { id: 'app-r4', appName: 'Phone Call Log', category: 'Communication', minutes: 15 },
    ],
    notes: 'Family video calls and morning devotional videos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 1
  {
    id: 'rec-ramesh-1',
    personId: 'sample-person-3',
    date: getPastDateString(1),
    totalScreenMinutes: 160, // 2h 40m
    apps: [
      { id: 'app-r5', appName: 'WhatsApp', category: 'Communication', minutes: 70 },
      { id: 'app-r6', appName: 'YouTube', category: 'Entertainment', minutes: 50 },
      { id: 'app-r7', appName: 'Google Maps', category: 'Productivity', minutes: 20 },
      { id: 'app-r8', appName: 'Dailyhunt News', category: 'Education', minutes: 20 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 2
  {
    id: 'rec-ramesh-2',
    personId: 'sample-person-3',
    date: getPastDateString(2),
    totalScreenMinutes: 120, // 2h 00m
    apps: [
      { id: 'app-r9', appName: 'WhatsApp', category: 'Communication', minutes: 50 },
      { id: 'app-r10', appName: 'YouTube', category: 'Entertainment', minutes: 40 },
      { id: 'app-r11', appName: 'Dailyhunt News', category: 'Education', minutes: 30 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
  // Day 3
  {
    id: 'rec-ramesh-3',
    personId: 'sample-person-3',
    date: getPastDateString(3),
    totalScreenMinutes: 145,
    apps: [
      { id: 'app-r12', appName: 'WhatsApp', category: 'Communication', minutes: 65 },
      { id: 'app-r13', appName: 'YouTube', category: 'Entertainment', minutes: 45 },
      { id: 'app-r14', appName: 'Camera & Gallery', category: 'Other', minutes: 20 },
      { id: 'app-r15', appName: 'Dailyhunt News', category: 'Education', minutes: 15 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSample: true,
  },
];

export const POPULAR_APPS_SUGGESTIONS = [
  { name: 'Instagram', category: 'Social Media' as const },
  { name: 'YouTube', category: 'Entertainment' as const },
  { name: 'WhatsApp', category: 'Communication' as const },
  { name: 'Chrome', category: 'Productivity' as const },
  { name: 'Snapchat', category: 'Social Media' as const },
  { name: 'Netflix', category: 'Entertainment' as const },
  { name: 'Spotify', category: 'Entertainment' as const },
  { name: 'Slack', category: 'Productivity' as const },
  { name: 'Gmail', category: 'Productivity' as const },
  { name: 'Duolingo', category: 'Education' as const },
  { name: 'LinkedIn', category: 'Social Media' as const },
  { name: 'Reddit', category: 'Social Media' as const },
  { name: 'Amazon', category: 'Shopping' as const },
  { name: 'Flipkart', category: 'Shopping' as const },
  { name: 'BGMi / PUBG', category: 'Games' as const },
  { name: 'Candy Crush', category: 'Games' as const },
  { name: 'Microsoft Teams', category: 'Communication' as const },
  { name: 'Telegram', category: 'Communication' as const },
  { name: 'Google Maps', category: 'Productivity' as const },
  { name: 'Notion', category: 'Productivity' as const },
];
