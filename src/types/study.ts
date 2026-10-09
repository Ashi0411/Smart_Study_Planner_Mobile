export type Priority = 'high' | 'medium' | 'low';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // ISO string or YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  estimatedMinutes?: number;
}

export interface ScheduleSession {
  id: string;
  subjectId: string;
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
  subjectId?: string;
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
