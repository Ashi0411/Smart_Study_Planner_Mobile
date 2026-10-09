import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Category,
  Subcategory,
  StudyTask,
  ScheduleSession,
  FocusLog,
  FocusMode,
  WorkPlan,
} from '@/types/study';
import { Colors, ColorPalette } from '@/constants/theme';

const STORAGE_KEYS = {
  CATEGORIES: '@smart_planner_categories_v3',
  TASKS: '@smart_planner_tasks_v3',
  SCHEDULE: '@smart_planner_schedule_v3',
  WORK_PLANS: '@smart_planner_work_plans_v3',
  FOCUS_LOGS: '@smart_planner_focus_logs_v3',
  STREAK: '@smart_planner_streak_v3',
  THEME_MODE: '@smart_planner_theme_mode_v3',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-uni',
    name: 'University',
    color: '#6366F1',
    icon: 'school-outline',
    subcategories: [
      { id: 'sub-uni-1', categoryId: 'cat-uni', name: 'Semester Exams' },
      { id: 'sub-uni-2', categoryId: 'cat-uni', name: 'Assignments' },
      { id: 'sub-uni-3', categoryId: 'cat-uni', name: 'Lectures & Labs' },
    ],
  },
  {
    id: 'cat-cyber',
    name: 'Cybersecurity',
    color: '#10B981',
    icon: 'shield-checkmark-outline',
    subcategories: [
      { id: 'sub-cyb-1', categoryId: 'cat-cyber', name: 'Network Security' },
      { id: 'sub-cyb-2', categoryId: 'cat-cyber', name: 'Penetration Testing' },
      { id: 'sub-cyb-3', categoryId: 'cat-cyber', name: 'CTF & Labs' },
    ],
  },
  {
    id: 'cat-uiux',
    name: 'UI/UX Design',
    color: '#EC4899',
    icon: 'color-palette-outline',
    subcategories: [
      { id: 'sub-ui-1', categoryId: 'cat-uiux', name: 'Figma Mastery' },
      { id: 'sub-ui-2', categoryId: 'cat-uiux', name: 'Design Systems' },
      { id: 'sub-ui-3', categoryId: 'cat-uiux', name: 'User Research' },
    ],
  },
  {
    id: 'cat-eng',
    name: 'English',
    color: '#F59E0B',
    icon: 'language-outline',
    subcategories: [
      { id: 'sub-eng-1', categoryId: 'cat-eng', name: 'IELTS Preparation' },
      { id: 'sub-eng-2', categoryId: 'cat-eng', name: 'Speaking Fluency' },
      { id: 'sub-eng-3', categoryId: 'cat-eng', name: 'Vocabulary & Grammar' },
    ],
  },
  {
    id: 'cat-pers',
    name: 'Personal Goals',
    color: '#8B5CF6',
    icon: 'fitness-outline',
    subcategories: [
      { id: 'sub-per-1', categoryId: 'cat-pers', name: 'Health & Fitness' },
      { id: 'sub-per-2', categoryId: 'cat-pers', name: 'Book Reading' },
      { id: 'sub-per-3', categoryId: 'cat-pers', name: 'Financial Discipline' },
    ],
  },
];

interface StudyContextType {
  categories: Category[];
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
  // Category operations
  addCategory: (
    data: { name: string; color: string; icon: string },
    initialSubcategories?: string[]
  ) => void;
  deleteCategory: (categoryId: string) => void;
  addSubcategory: (categoryId: string, name: string) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  getCategoryById: (categoryId?: string) => Category | undefined;
  getSubcategoryById: (categoryId?: string, subcategoryId?: string) => Subcategory | undefined;
  getCategoryProgress: (categoryId: string) => number;
  // Work Plans & Sub-plans
  addWorkPlan: (plan: Omit<WorkPlan, 'id' | 'createdAt'>) => void;
  toggleSubPlan: (planId: string, subPlanId: string) => void;
  deleteWorkPlan: (planId: string) => void;
  applyWorkPlanToTasks: (planId: string) => void;
  getWorkPlanProgress: (planId: string) => number;
  // Tasks Actions
  addTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  // Schedule Actions
  addScheduleSession: (session: Omit<ScheduleSession, 'id' | 'completed'>) => void;
  toggleScheduleSession: (sessionId: string) => void;
  deleteScheduleSession: (sessionId: string) => void;
  // Focus Actions
  logFocusSession: (durationMinutes: number, mode: FocusMode, categoryId?: string) => void;
  // Computed
  todayFocusMinutes: number;
  completedTasksToday: number;
  pendingTasksCount: number;
  todaySchedule: ScheduleSession[];
  clearAllData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
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
          storedCategories,
          storedTasks,
          storedSchedule,
          storedWorkPlans,
          storedFocusLogs,
          storedStreak,
          storedTheme,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE),
          AsyncStorage.getItem(STORAGE_KEYS.WORK_PLANS),
          AsyncStorage.getItem(STORAGE_KEYS.FOCUS_LOGS),
          AsyncStorage.getItem(STORAGE_KEYS.STREAK),
          AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        ]);

        if (storedCategories) setCategories(JSON.parse(storedCategories));
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

  // Save changes to storage
  const saveCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
    } catch (e) {
      console.warn('Error saving categories', e);
    }
  };

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

  // Category Operations
  const addCategory = (
    data: { name: string; color: string; icon: string },
    initialSubcategories: string[] = []
  ) => {
    const newCatId = 'cat-' + Date.now().toString();
    const subs: Subcategory[] = initialSubcategories.map((name, idx) => ({
      id: `sub-${newCatId}-${idx}`,
      categoryId: newCatId,
      name,
    }));

    const newCategory: Category = {
      id: newCatId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      subcategories: subs,
    };
    saveCategories([...categories, newCategory]);
  };

  const deleteCategory = (categoryId: string) => {
    saveCategories(categories.filter((c) => c.id !== categoryId));
  };

  const addSubcategory = (categoryId: string, name: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        const newSub: Subcategory = {
          id: `sub-${categoryId}-${Date.now()}`,
          categoryId,
          name: name.trim(),
        };
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSub],
        };
      }
      return cat;
    });
    saveCategories(updated);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter((s) => s.id !== subcategoryId),
        };
      }
      return cat;
    });
    saveCategories(updated);
  };

  const getCategoryById = (categoryId?: string) => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId);
  };

  const getSubcategoryById = (categoryId?: string, subcategoryId?: string) => {
    if (!categoryId || !subcategoryId) return undefined;
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.subcategories.find((s) => s.id === subcategoryId);
  };

  // Work Plans & Sub-plans Operations
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

  const applyWorkPlanToTasks = (planId: string) => {
    const plan = workPlans.find((p) => p.id === planId);
    if (!plan) return;

    const newTasksToAdd: StudyTask[] = plan.subPlans
      .filter((sp) => !sp.completed)
      .map((sp, idx) => ({
        id: 'task-from-plan-' + Date.now() + '-' + idx,
        title: `${plan.title}: ${sp.title}`,
        categoryId: plan.categoryId,
        subcategoryId: plan.subcategoryId,
        workPlanId: plan.id,
        dueDate: sp.dueDate || plan.targetDeadline,
        priority: 'high',
        completed: false,
        estimatedMinutes: sp.estimatedMinutes,
      }));

    if (newTasksToAdd.length > 0) {
      saveTasks([...newTasksToAdd, ...tasks]);
    }
  };

  // Progress Calculations
  const getWorkPlanProgress = (planId: string): number => {
    const plan = workPlans.find((p) => p.id === planId);
    if (!plan || plan.subPlans.length === 0) return 0;
    const done = plan.subPlans.filter((sp) => sp.completed).length;
    return Math.round((done / plan.subPlans.length) * 100);
  };

  const getCategoryProgress = (categoryId: string): number => {
    const catTasks = tasks.filter((t) => t.categoryId === categoryId);
    const catPlans = workPlans.filter((p) => p.categoryId === categoryId);

    let totalItems = catTasks.length;
    let completedItems = catTasks.filter((t) => t.completed).length;

    catPlans.forEach((p) => {
      totalItems += p.subPlans.length;
      completedItems += p.subPlans.filter((sp) => sp.completed).length;
    });

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
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
  const logFocusSession = (durationMinutes: number, mode: FocusMode, categoryId?: string) => {
    const newLog: FocusLog = {
      id: 'focus-' + Date.now().toString(),
      categoryId,
      mode,
      durationMinutes,
      timestamp: new Date().toISOString(),
    };
    saveFocusLogs([newLog, ...focusLogs]);
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
        categories,
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
        addCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        getCategoryById,
        getSubcategoryById,
        getCategoryProgress,
        addWorkPlan,
        toggleSubPlan,
        deleteWorkPlan,
        applyWorkPlanToTasks,
        getWorkPlanProgress,
        addTask,
        toggleTask,
        deleteTask,
        addScheduleSession,
        toggleScheduleSession,
        deleteScheduleSession,
        logFocusSession,
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
