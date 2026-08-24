export type UserType = 'Student' | 'Working Person' | 'Senior Citizen' | 'Other';

export type AppCategory = 
  | 'Social Media'
  | 'Education'
  | 'Entertainment'
  | 'Communication'
  | 'Games'
  | 'Productivity'
  | 'Shopping'
  | 'Other';

export type GoalStatus = 'Goal Achieved' | 'Near Goal' | 'Goal Exceeded';

export type TrendDirection = 'Increasing' | 'Decreasing' | 'Stable';

export interface AppUsageItem {
  id: string;
  appName: string;
  category: AppCategory;
  minutes: number;
}

export interface Person {
  id: string;
  name: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | string;
  userType: UserType;
  phoneModel?: string;
  dailyGoalMinutes: number; // Stored in total minutes (e.g. 240 = 4 hours)
  createdAt: string;
  avatarColor?: string;
  isSample?: boolean;
}

export interface DailyUsageRecord {
  id: string;
  personId: string;
  date: string; // YYYY-MM-DD
  totalScreenMinutes: number; // Stored in total minutes
  apps: AppUsageItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface CalculatedAppStat extends AppUsageItem {
  percentage: number; // % of total daily screen time
  formattedTime: string;
}

export interface DailyCalculationResult {
  recordId?: string;
  personId: string;
  date: string;
  totalScreenMinutes: number;
  goalMinutes: number;
  differenceMinutes: number; // positive = under goal, negative = exceeded
  goalStatus: GoalStatus;
  goalAchievementPercent: number; // (actual / goal) * 100
  appsSumMinutes: number;
  hasValidationWarning: boolean;
  validationWarningMessage?: string;
  apps: CalculatedAppStat[];
  categoryBreakdown: {
    category: AppCategory;
    minutes: number;
    percentage: number;
    count: number;
  }[];
  mostUsedApp?: CalculatedAppStat;
}

export interface Recommendation {
  id: string;
  type: 'alert' | 'success' | 'tip' | 'category';
  title: string;
  description: string;
  metric?: string;
  category?: AppCategory;
  priority: 'high' | 'medium' | 'low';
}

export type NavigationTab = 
  | 'landing' 
  | 'dashboard' 
  | 'people' 
  | 'record' 
  | 'history' 
  | 'analytics' 
  | 'trends'
  | 'comparison' 
  | 'recommendations' 
  | 'reports' 
  | 'settings';

export interface NavItem {
  id: NavigationTab;
  label: string;
  iconName: string;
  badge?: string;
}
