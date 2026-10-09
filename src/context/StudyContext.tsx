import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, StudyTask, ScheduleSession, FocusLog, FocusMode } from '@/types/study';

const STORAGE_KEYS = {
  TASKS: '@study_planner_tasks',
  SCHEDULE: '@study_planner_schedule',
  SUBJECTS: '@study_planner_subjects',
  FOCUS_LOGS: '@study_planner_focus_logs',
  STREAK: '@study_planner_streak',
};

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH 101', color: '#6366F1', icon: 'calculator' },
  { id: 'sub-2', name: 'Computer Science', code: 'CS 202', color: '#0EA5E9', icon: 'code-slash' },
  { id: 'sub-3', name: 'Physics', code: 'PHYS 150', color: '#8B5CF6', icon: 'planet' },
  { id: 'sub-4', name: 'Chemistry', code: 'CHEM 110', color: '#EC4899', icon: 'flask' },
  { id: 'sub-5', name: 'Literature', code: 'ENG 105', color: '#F59E0B', icon: 'book' },
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Complete Linear Algebra Assignment 4',
    subjectId: 'sub-1',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    priority: 'high',
    completed: false,
    estimatedMinutes: 60,
  },
  {
    id: 'task-2',
    title: 'Implement Binary Search Tree in TypeScript',
    subjectId: 'sub-2',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
    priority: 'high',
    completed: false,
    estimatedMinutes: 90,
  },
  {
    id: 'task-3',
    title: 'Review Thermodynamics Chapter 5',
    subjectId: 'sub-3',
    dueDate: new Date().toISOString().split('T')[0], // Today
    priority: 'medium',
    completed: true,
    completedAt: new Date().toISOString(),
    estimatedMinutes: 45,
  },
  {
    id: 'task-4',
    title: 'Read Organic Chemistry reaction mechanisms',
    subjectId: 'sub-4',
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    priority: 'low',
    completed: false,
    estimatedMinutes: 30,
  },
];

export const INITIAL_SCHEDULE: ScheduleSession[] = [
  {
    id: 'sched-1',
    subjectId: 'sub-1',
    topic: 'Differential Calculus & Matrix Operations',
    dayOfWeek: 1, // Mon
    startTime: '08:30',
    endTime: '10:00',
    location: 'Hall B-201',
    completed: false,
  },
  {
    id: 'sched-2',
    subjectId: 'sub-2',
    topic: 'Data Structures: Hash Tables & Graphs',
    dayOfWeek: 1, // Mon
    startTime: '10:30',
    endTime: '12:00',
    location: 'CS Lab 3',
    completed: false,
  },
  {
    id: 'sched-3',
    subjectId: 'sub-3',
    topic: 'Quantum Mechanics Problem Solving',
    dayOfWeek: 2, // Tue
    startTime: '09:00',
    endTime: '10:30',
    location: 'Science Auditorium',
    completed: false,
  },
  {
    id: 'sched-4',
    subjectId: 'sub-4',
    topic: 'Organic Synthesis Lab Session',
    dayOfWeek: 3, // Wed
    startTime: '13:00',
    endTime: '15:00',
    location: 'Chemistry Lab A',
    completed: false,
  },
  {
    id: 'sched-5',
    subjectId: 'sub-2',
    topic: 'Algorithms: Dynamic Programming Workshop',
    dayOfWeek: 4, // Thu
    startTime: '14:00',
    endTime: '16:00',
    location: 'Main Lab',
    completed: false,
  },
  {
    id: 'sched-6',
    subjectId: 'sub-5',
    topic: 'Modern Poetry Analysis & Discussion',
    dayOfWeek: 5, // Fri
    startTime: '11:00',
    endTime: '12:30',
    location: 'Library Annex 2',
    completed: false,
  },
];

interface StudyContextType {
  subjects: Subject[];
  tasks: StudyTask[];
  schedule: ScheduleSession[];
  focusLogs: FocusLog[];
  streakDays: number;
  dailyGoalMinutes: number;
  isLoading: boolean;
  // Actions
  addTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addScheduleSession: (session: Omit<ScheduleSession, 'id' | 'completed'>) => void;
  toggleScheduleSession: (sessionId: string) => void;
  deleteScheduleSession: (sessionId: string) => void;
  logFocusSession: (durationMinutes: number, mode: FocusMode, subjectId?: string) => void;
  getSubjectById: (subjectId?: string) => Subject | undefined;
  todayFocusMinutes: number;
  completedTasksToday: number;
  pendingTasksCount: number;
  todaySchedule: ScheduleSession[];
  resetToSampleData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [tasks, setTasks] = useState<StudyTask[]>(INITIAL_TASKS);
  const [schedule, setSchedule] = useState<ScheduleSession[]>(INITIAL_SCHEDULE);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([
    {
      id: 'f-1',
      subjectId: 'sub-1',
      mode: 'pomodoro',
      durationMinutes: 25,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'f-2',
      subjectId: 'sub-2',
      mode: 'pomodoro',
      durationMinutes: 25,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [dailyGoalMinutes] = useState<number>(120);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedSubjects = await AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS);
        const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
        const storedSchedule = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);
        const storedFocusLogs = await AsyncStorage.getItem(STORAGE_KEYS.FOCUS_LOGS);
        const storedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);

        if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
        if (storedFocusLogs) setFocusLogs(JSON.parse(storedFocusLogs));
        if (storedStreak) setStreakDays(JSON.parse(storedStreak));
      } catch (err) {
        console.warn('Failed to load study data from AsyncStorage', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

  const saveFocusLogs = async (newLogs: FocusLog[]) => {
    setFocusLogs(newLogs);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_LOGS, JSON.stringify(newLogs));
    } catch (e) {
      console.warn('Error saving focus logs', e);
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

  // Reset to initial sample data
  const resetToSampleData = async () => {
    setSubjects(INITIAL_SUBJECTS);
    setTasks(INITIAL_TASKS);
    setSchedule(INITIAL_SCHEDULE);
    setStreakDays(4);
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

  // Filter today's schedule sessions, sorted by start time
  const todaySchedule = schedule
    .filter((s) => s.dayOfWeek === todayDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <StudyContext.Provider
      value={{
        subjects,
        tasks,
        schedule,
        focusLogs,
        streakDays,
        dailyGoalMinutes,
        isLoading,
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
        resetToSampleData,
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
