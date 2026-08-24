import React from 'react';
import { AppCategory, GoalStatus, UserType } from '../../types';
import { CATEGORY_COLORS } from '../../utils/calculations';

interface CategoryBadgeProps {
  category: AppCategory;
  className?: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '', size = 'sm' }) => {
  const meta = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm font-medium';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md ${meta.bg} ${meta.text} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.hex }} />
      <span className="whitespace-nowrap">{category}</span>
    </span>
  );
 };

interface GoalBadgeProps {
  status: GoalStatus;
  className?: string;
}

export const GoalBadge: React.FC<GoalBadgeProps> = ({ status, className = '' }) => {
  let colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  let dotColor = 'bg-emerald-500';

  if (status === 'Goal Exceeded') {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    dotColor = 'bg-rose-500';
  } else if (status === 'Near Goal') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    dotColor = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${colorStyles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="whitespace-nowrap">{status}</span>
    </span>
  );
};

interface UserTypeBadgeProps {
  userType: UserType;
  className?: string;
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ userType, className = '' }) => {
  const styles: Record<UserType, string> = {
    'Student': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'Working Person': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    'Senior Citizen': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'Other': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${styles[userType] || styles['Other']} ${className}`}>
      {userType}
    </span>
  );
};
