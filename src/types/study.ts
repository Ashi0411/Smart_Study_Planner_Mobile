export type Priority = 'high' | 'medium' | 'low';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface SubPlan {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
}

export interface WorkPlan {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId?: string;
  goalDescription?: string;
  targetDeadline: string; // YYYY-MM-DD
  subPlans: SubPlan[];
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId?: string;
  workPlanId?: string;
  dueDate: string; // ISO string or YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  estimatedMinutes?: number;
}

export interface ScheduleSession {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  topic: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  location?: string;
  completed: boolean;
}

export type FocusMode = 'pomodoro' | 'short_break' | 'long_break';

export interface FocusLog {
  id: string;
  categoryId?: string;
  mode: FocusMode;
  durationMinutes: number;
  timestamp: string;
}

export interface StudyStats {
  todayFocusMinutes: number;
  completedTasksToday: number;
  currentStreakDays: number;
  weeklyGoalHours: number;
  studyScore: number;
}
