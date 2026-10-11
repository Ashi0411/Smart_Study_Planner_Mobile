import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask } from '@/types/study';

export type CalendarMode = 'daily' | 'monthly' | 'yearly';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  activeMode: CalendarMode;
  onChangeMode: (mode: CalendarMode) => void;
  tasks?: StudyTask[];
  isDark?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORTS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_SHORTS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const StudyCalendarCard: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  activeMode,
  onChangeMode,
  tasks = [],
  isDark = false,
}) => {
  const today = useMemo(() => new Date(), []);

  const isSelectedToday = useMemo(() => {
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate, today]);

  // Set of dates (YYYY-MM-DD) that have tasks
  const taskDatesSet = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.dueDate) {
        set.add(t.dueDate.split('T')[0]);
      }
    });
    return set;
  }, [tasks]);

  // Daily Mode: Generate 7-day strip centered on selected week
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay();
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Monthly Mode: Days in current selected month
  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      year,
      month,
      firstDayIndex,
      daysInMonth,
    };
  }, [selectedDate]);

  // Navigation Handlers
  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (activeMode === 'daily') {
      newDate.setDate(selectedDate.getDate() - 7);
    } else if (activeMode === 'monthly') {
      newDate.setMonth(selectedDate.getMonth() - 1);
    } else {
      newDate.setFullYear(selectedDate.getFullYear() - 1);
    }
    onSelectDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (activeMode === 'daily') {
      newDate.setDate(selectedDate.getDate() + 7);
    } else if (activeMode === 'monthly') {
      newDate.setMonth(selectedDate.getMonth() + 1);
    } else {
      newDate.setFullYear(selectedDate.getFullYear() + 1);
    }
    onSelectDate(newDate);
  };

  const handleJumpToToday = () => {
    onSelectDate(new Date());
  };

  // Header Title
  const headerTitle = useMemo(() => {
    const year = selectedDate.getFullYear();
    const monthName = MONTH_NAMES[selectedDate.getMonth()];
    if (activeMode === 'daily') {
      const dateNum = selectedDate.getDate();
      return isSelectedToday ? `Today, ${dateNum} ${monthName}` : `${dateNum} ${monthName} ${year}`;
    }
    if (activeMode === 'monthly') {
      return `${monthName} ${year}`;
    }
    return `${year}`;
  }, [selectedDate, activeMode, isSelectedToday]);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderColor: isDark ? '#334155' : '#EDE9FE',
        },
      ]}>
      {/* Top Controls: Mode Switcher & Navigation Header */}
      <View style={styles.topControlRow}>
        {/* Mode Selector Pills */}
        <View
          style={[
            styles.modePillBar,
            {
              backgroundColor: isDark ? '#0F172A' : '#F5F3FF',
              borderColor: isDark ? '#334155' : '#E0E7FF',
            },
          ]}>
          {(['daily', 'monthly', 'yearly'] as CalendarMode[]).map((mode) => {
            const isActive = activeMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => onChangeMode(mode)}
                style={[styles.modeTab, isActive && styles.modeTabActive]}>
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Today Button (visible if selected date is not today) */}
        {!isSelectedToday && (
          <Pressable
            onPress={handleJumpToToday}
            style={[
              styles.todayBtn,
              {
                backgroundColor: isDark ? '#334155' : '#EDE9FE',
                borderColor: isDark ? '#475569' : '#DDD6FE',
              },
            ]}>
            <Ionicons name="today-outline" size={12} color="#8B5CF6" />
            <Text style={styles.todayBtnText}>Today</Text>
          </Pressable>
        )}
      </View>

      {/* Date Header Title with < > Navigation */}
      <View style={styles.headerTitleRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons
            name={activeMode === 'daily' ? 'calendar-outline' : activeMode === 'monthly' ? 'grid-outline' : 'albums-outline'}
            size={18}
            color="#8B5CF6"
          />
          <Text style={[styles.headerTitleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {headerTitle}
          </Text>
        </View>

        <View style={styles.navArrows}>
          <Pressable
            onPress={handlePrev}
            style={[
              styles.arrowBtn,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
            hitSlop={8}>
            <Ionicons name="chevron-back" size={16} color={isDark ? '#E2E8F0' : '#475569'} />
          </Pressable>
          <Pressable
            onPress={handleNext}
            style={[
              styles.arrowBtn,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
            hitSlop={8}>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#E2E8F0' : '#475569'} />
          </Pressable>
        </View>
      </View>

      {/* ================= VIEW 1: DAILY VIEW (7-Day Strip) ================= */}
      {activeMode === 'daily' && (
        <View style={styles.weekStrip}>
          {weekDays.map((d, index) => {
            const isSelected =
              d.getFullYear() === selectedDate.getFullYear() &&
              d.getMonth() === selectedDate.getMonth() &&
              d.getDate() === selectedDate.getDate();

            const isCurrentToday =
              d.getFullYear() === today.getFullYear() &&
              d.getMonth() === today.getMonth() &&
              d.getDate() === today.getDate();

            const dateStr = d.toISOString().split('T')[0];
            const hasTasks = taskDatesSet.has(dateStr);

            return (
              <Pressable
                key={index}
                onPress={() => onSelectDate(d)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected
                      ? '#8B5CF6'
                      : isDark
                      ? '#0F172A'
                      : '#F8FAFC',
                    borderColor: isSelected
                      ? '#8B5CF6'
                      : isCurrentToday
                      ? '#C084FC'
                      : isDark
                      ? '#334155'
                      : '#E2E8F0',
                  },
                ]}>
                <Text
                  style={[
                    styles.dayWeekLabel,
                    {
                      color: isSelected
                        ? 'rgba(255,255,255,0.85)'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                    },
                  ]}>
                  {WEEKDAY_SHORTS[d.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#FFFFFF'
                        : '#0F172A',
                      fontWeight: isSelected || isCurrentToday ? '800' : '600',
                    },
                  ]}>
                  {d.getDate()}
                </Text>

                {/* Task indicator dot or Today dot */}
                <View style={styles.indicatorContainer}>
                  {hasTasks ? (
                    <View
                      style={[
                        styles.taskDot,
                        { backgroundColor: isSelected ? '#FFFFFF' : '#8B5CF6' },
                      ]}
                    />
                  ) : isCurrentToday ? (
                    <View
                      style={[
                        styles.todayMiniDot,
                        { backgroundColor: isSelected ? '#FFFFFF' : '#C084FC' },
                      ]}
                    />
                  ) : (
                    <View style={styles.emptyDotPlaceholder} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ================= VIEW 2: MONTHLY VIEW (Full Month Grid) ================= */}
      {activeMode === 'monthly' && (
        <View style={styles.monthGridContainer}>
          {/* Weekday headers */}
          <View style={styles.monthWeekdayHeaderRow}>
            {WEEKDAY_SHORTS.map((weekday, idx) => (
              <Text
                key={idx}
                style={[styles.monthWeekdayHeaderText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {weekday.charAt(0)}
              </Text>
            ))}
          </View>

          {/* Month Days Grid */}
          <View style={styles.monthDaysGrid}>
            {/* Blank offset days */}
            {Array.from({ length: monthData.firstDayIndex }).map((_, idx) => (
              <View key={`blank-${idx}`} style={styles.monthDayCell} />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: monthData.daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(monthData.year, monthData.month, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];

              const isSelected =
                selectedDate.getFullYear() === monthData.year &&
                selectedDate.getMonth() === monthData.month &&
                selectedDate.getDate() === dayNum;

              const isCurrentToday =
                today.getFullYear() === monthData.year &&
                today.getMonth() === monthData.month &&
                today.getDate() === dayNum;

              const hasTasks = taskDatesSet.has(dateStr);

              return (
                <Pressable
                  key={`day-${dayNum}`}
                  onPress={() => onSelectDate(dateObj)}
                  style={styles.monthDayCell}>
                  <View
                    style={[
                      styles.monthDayNumberCircle,
                      isSelected && styles.monthDaySelectedCircle,
                      !isSelected && isCurrentToday && styles.monthDayTodayCircle,
                    ]}>
                    <Text
                      style={[
                        styles.monthDayNumberText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isCurrentToday
                            ? '#8B5CF6'
                            : isDark
                            ? '#F8FAFC'
                            : '#0F172A',
                          fontWeight: isSelected || isCurrentToday ? '800' : '500',
                        },
                      ]}>
                      {dayNum}
                    </Text>
                  </View>
                  {hasTasks && (
                    <View
                      style={[
                        styles.monthDayTaskDot,
                        { backgroundColor: isSelected ? '#8B5CF6' : '#8B5CF6' },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ================= VIEW 3: YEARLY VIEW (12-Month Matrix) ================= */}
      {activeMode === 'yearly' && (
        <View style={styles.yearGrid}>
          {MONTH_SHORTS.map((shortName, monthIndex) => {
            const isSelectedMonth =
              selectedDate.getFullYear() === selectedDate.getFullYear() &&
              selectedDate.getMonth() === monthIndex;

            const isCurrentMonth =
              today.getFullYear() === selectedDate.getFullYear() &&
              today.getMonth() === monthIndex;

            // Count tasks in this month
            const yearStr = String(selectedDate.getFullYear());
            const monthStr = String(monthIndex + 1).padStart(2, '0');
            const prefix = `${yearStr}-${monthStr}`;
            const tasksInMonthCount = tasks.filter(
              (t) => t.dueDate && t.dueDate.startsWith(prefix)
            ).length;

            return (
              <Pressable
                key={shortName}
                onPress={() => {
                  const newD = new Date(selectedDate);
                  newD.setMonth(monthIndex);
                  onSelectDate(newD);
                  onChangeMode('monthly');
                }}
                style={[
                  styles.yearMonthCard,
                  {
                    backgroundColor: isSelectedMonth
                      ? '#8B5CF6'
                      : isDark
                      ? '#0F172A'
                      : '#F8FAFC',
                    borderColor: isSelectedMonth
                      ? '#8B5CF6'
                      : isCurrentMonth
                      ? '#C084FC'
                      : isDark
                      ? '#334155'
                      : '#E2E8F0',
                  },
                ]}>
                <Text
                  style={[
                    styles.yearMonthName,
                    {
                      color: isSelectedMonth
                        ? '#FFFFFF'
                        : isDark
                        ? '#FFFFFF'
                        : '#0F172A',
                      fontWeight: isSelectedMonth || isCurrentMonth ? '800' : '600',
                    },
                  ]}>
                  {shortName}
                </Text>
                <Text
                  style={[
                    styles.yearMonthTaskCount,
                    {
                      color: isSelectedMonth
                        ? 'rgba(255,255,255,0.85)'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                    },
                  ]}>
                  {tasksInMonthCount > 0 ? `${tasksInMonthCount} plans` : 'No plans'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modePillBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  modeTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  todayBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Daily View Styles
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  dayWeekLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumberText: {
    fontSize: 14.5,
    marginBottom: 4,
  },
  indicatorContainer: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  todayMiniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyDotPlaceholder: {
    width: 4,
    height: 4,
  },
  // Monthly View Styles
  monthGridContainer: {
    paddingVertical: 4,
  },
  monthWeekdayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  monthWeekdayHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
    minHeight: 38,
  },
  monthDayNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDaySelectedCircle: {
    backgroundColor: '#8B5CF6',
  },
  monthDayTodayCircle: {
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  monthDayNumberText: {
    fontSize: 12.5,
  },
  monthDayTaskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  // Yearly View Styles
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  yearMonthCard: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearMonthName: {
    fontSize: 13,
    marginBottom: 2,
  },
  yearMonthTaskCount: {
    fontSize: 10,
    fontWeight: '500',
  },
});
