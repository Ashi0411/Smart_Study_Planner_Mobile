import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Subject,
  StudyTask,
  ScheduleSession,
  FocusLog,
  FocusMode,
  WorkPlan,
} from '@/types/study';
import { Colors, ColorPalette } from '@/constants/theme';

const STORAGE_KEYS = {
  TASKS: '@study_planner_tasks_v2',
  SCHEDULE: '@study_planner_schedule_v2',
  SUBJECTS: '@study_planner_subjects_v2',
  WORK_PLANS: '@study_planner_work_plans_v2',
  FOCUS_LOGS: '@study_planner_focus_logs_v2',
  STREAK: '@study_planner_streak_v2',
  THEME_MODE: '@study_planner_theme_mode_v2',
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH', color: '#6366F1', icon: 'calculator' },
  { id: 'sub-2', name: 'Computer Science', code: 'CS', color: '#0EA5E9', icon: 'code-slash' },
  { id: 'sub-3', name: 'Physics', code: 'PHYS', color: '#8B5CF6', icon: 'planet' },
  { id: 'sub-4', name: 'Chemistry', code: 'CHEM', color: '#EC4899', icon: 'flask' },
  { id: 'sub-5', name: 'Literature', code: 'ENG', color: '#F59E0B', icon: 'book' },
];

interface StudyContextType {
  subjects: Subject[];
  tasks: StudyTask[];
  schedule: ScheduleSession[];
  workPlans: WorkPlan[];
  focusLogs: FocusLog[];
  streakDays: number;
  dailyGoalMinutes: number;
  isLoading: boolean;
  // Theme
  themeMode: 'light' | 'dark';
  colors: ColorPalette;
  toggleThemeMode: () => void;
  // Work Plans & Sub-plans
  addWorkPlan: (plan: Omit<WorkPlan, 'id' | 'createdAt'>) => void;
  toggleSubPlan: (planId: string, subPlanId: string) => void;
  deleteWorkPlan: (planId: string) => void;
  applyWorkPlanToTasks: (planId: string) => void;
  // Tasks Actions
  addTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  // Schedule Actions
  addScheduleSession: (session: Omit<ScheduleSession, 'id' | 'completed'>) => void;
  toggleScheduleSession: (sessionId: string) => void;
  deleteScheduleSession: (sessionId: string) => void;
  // Focus Actions
  logFocusSession: (durationMinutes: number, mode: FocusMode, subjectId?: string) => void;
  getSubjectById: (subjectId?: string) => Subject | undefined;
  // Computed
  todayFocusMinutes: number;
  completedTasksToday: number;
  pendingTasksCount: number;
  todaySchedule: ScheduleSession[];
  clearAllData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  // No hardcoded work plans or tasks by default - user creates them or generates via AI
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [dailyGoalMinutes] = useState<number>(120);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Load from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [
          storedSubjects,
          storedTasks,
          storedSchedule,
          storedWorkPlans,
          storedFocusLogs,
          storedStreak,
          storedTheme,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE),
          AsyncStorage.getItem(STORAGE_KEYS.WORK_PLANS),
          AsyncStorage.getItem(STORAGE_KEYS.FOCUS_LOGS),
          AsyncStorage.getItem(STORAGE_KEYS.STREAK),
          AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        ]);

        if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
        if (storedWorkPlans) setWorkPlans(JSON.parse(storedWorkPlans));
        if (storedFocusLogs) setFocusLogs(JSON.parse(storedFocusLogs));
        if (storedStreak) setStreakDays(JSON.parse(storedStreak));
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeMode(storedTheme);
        }
      } catch (err) {
        console.warn('Failed to load study data from AsyncStorage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Theme toggle
  const toggleThemeMode = async () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, nextMode);
    } catch (e) {
      console.warn('Error saving theme mode', e);
    }
  };

  // Save changes
  const saveTasks = async (newTasks: StudyTask[]) => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (e) {
      console.warn('Error saving tasks', e);
    }
  };

  const saveSchedule = async (newSchedule: ScheduleSession[]) => {
    setSchedule(newSchedule);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(newSchedule));
    } catch (e) {
      console.warn('Error saving schedule', e);
    }
  };

  const saveWorkPlans = async (newPlans: WorkPlan[]) => {
    setWorkPlans(newPlans);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_PLANS, JSON.stringify(newPlans));
    } catch (e) {
      console.warn('Error saving work plans', e);
    }
  };

  const saveFocusLogs = async (newLogs: FocusLog[]) => {
    setFocusLogs(newLogs);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_LOGS, JSON.stringify(newLogs));
    } catch (e) {
      console.warn('Error saving focus logs', e);
    }
  };

  // Work Plans & Sub-plans Actions
  const addWorkPlan = (planData: Omit<WorkPlan, 'id' | 'createdAt'>) => {
    const newPlan: WorkPlan = {
      ...planData,
      id: 'plan-' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveWorkPlans([newPlan, ...workPlans]);
  };

  const toggleSubPlan = (planId: string, subPlanId: string) => {
    const updated = workPlans.map((plan) => {
      if (plan.id === planId) {
        return {
          ...plan,
          subPlans: plan.subPlans.map((sp) =>
            sp.id === subPlanId ? { ...sp, completed: !sp.completed } : sp
          ),
        };
      }
      return plan;
    });
    saveWorkPlans(updated);
  };

  const deleteWorkPlan = (planId: string) => {
    saveWorkPlans(workPlans.filter((p) => p.id !== planId));
  };

  // Apply sub-plans from a Work Plan into actual Study Tasks
  const applyWorkPlanToTasks = (planId: string) => {
    const plan = workPlans.find((p) => p.id === planId);
    if (!plan) return;

    const newTasksToAdd: StudyTask[] = plan.subPlans
      .filter((sp) => !sp.completed)
      .map((sp, idx) => ({
        id: 'task-from-plan-' + Date.now() + '-' + idx,
        title: `${plan.title}: ${sp.title}`,
        subjectId: plan.subjectId,
        dueDate: sp.dueDate || plan.targetDeadline,
        priority: 'high',
        completed: false,
        estimatedMinutes: sp.estimatedMinutes,
      }));

    if (newTasksToAdd.length > 0) {
      saveTasks([...newTasksToAdd, ...tasks]);
    }
  };

  // Task Actions
  const addTask = (taskData: Omit<StudyTask, 'id' | 'completed'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: 'task-' + Date.now().toString(),
      completed: false,
    };
    saveTasks([newTask, ...tasks]);
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const isDone = !t.completed;
        return {
          ...t,
          completed: isDone,
          completedAt: isDone ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Schedule Actions
  const addScheduleSession = (sessionData: Omit<ScheduleSession, 'id' | 'completed'>) => {
    const newSession: ScheduleSession = {
      ...sessionData,
      id: 'sched-' + Date.now().toString(),
      completed: false,
    };
    saveSchedule([...schedule, newSession]);
  };

  const toggleScheduleSession = (sessionId: string) => {
    const updated = schedule.map((s) => (s.id === sessionId ? { ...s, completed: !s.completed } : s));
    saveSchedule(updated);
  };

  const deleteScheduleSession = (sessionId: string) => {
    saveSchedule(schedule.filter((s) => s.id !== sessionId));
  };

  // Focus Actions
  const logFocusSession = (durationMinutes: number, mode: FocusMode, subjectId?: string) => {
    const newLog: FocusLog = {
      id: 'focus-' + Date.now().toString(),
      subjectId,
      mode,
      durationMinutes,
      timestamp: new Date().toISOString(),
    };
    saveFocusLogs([newLog, ...focusLogs]);
  };

  const getSubjectById = (subjectId?: string) => {
    if (!subjectId) return undefined;
    return subjects.find((s) => s.id === subjectId);
  };

  const clearAllData = async () => {
    setTasks([]);
    setSchedule([]);
    setWorkPlans([]);
    setFocusLogs([]);
    setStreakDays(0);
    await AsyncStorage.clear();
  };

  // Computed values
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayDayOfWeek = new Date().getDay();

  const todayFocusMinutes = focusLogs
    .filter((log) => log.timestamp.startsWith(todayDateStr) && log.mode === 'pomodoro')
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  const completedTasksToday = tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayDateStr)
  ).length;

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const todaySchedule = schedule
    .filter((s) => s.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeColors = Colors[themeMode];

  return (
    <StudyContext.Provider
      value={{
        subjects,
        tasks,
        schedule,
        workPlans,
        focusLogs,
        streakDays,
        dailyGoalMinutes,
        isLoading,
        themeMode,
        colors: activeColors,
        toggleThemeMode,
        addWorkPlan,
        toggleSubPlan,
        deleteWorkPlan,
        applyWorkPlanToTasks,
        addTask,
        toggleTask,
        deleteTask,
        addScheduleSession,
        toggleScheduleSession,
        deleteScheduleSession,
        logFocusSession,
        getSubjectById,
        todayFocusMinutes,
        completedTasksToday,
        pendingTasksCount,
        todaySchedule,
        clearAllData,
      }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
