import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStudy } from '@/context/StudyContext';

type TimeRange = 'Day' | 'Week' | 'Month' | 'All Time';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsScreen() {
  const router = useRouter();
  const { streakDays, themeMode, focusLogs, categories, tasks } = useStudy();
  const isDark = themeMode === 'dark';

  const [selectedRange, setSelectedRange] = useState<TimeRange>('Week');

  const [activeTooltipLabel, setActiveTooltipLabel] = useState<string>('');

  // Filter logs & compute dynamic stats based on selected time range
  const rangeStats = useMemo(() => {
    const now = new Date();
    let filtered = focusLogs;

    if (selectedRange === 'Day') {
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();
      filtered = focusLogs.filter((l) => {
        if (!l.timestamp) return false;
        const d = new Date(l.timestamp);
        return (
          d.getFullYear() === todayYear &&
          d.getMonth() === todayMonth &&
          d.getDate() === todayDate
        );
      });
    } else if (selectedRange === 'Week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = focusLogs.filter((l) => l.timestamp && new Date(l.timestamp) >= oneWeekAgo);
    } else if (selectedRange === 'Month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = focusLogs.filter((l) => l.timestamp && new Date(l.timestamp) >= oneMonthAgo);
    }

    const totalMinutes = filtered.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const formattedStudyTime =
      hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;

    const sessionsCount = filtered.length;

    // Focus score computed from task completion rate or focus habit
    const completedTasks = tasks.filter((t) => t.completed).length;
    const focusScore =
      tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : sessionsCount > 0
        ? Math.min(100, sessionsCount * 25)
        : 0;

    // Subject breakdown from user's actual categories
    const categoryMinutesMap: Record<string, number> = {};
    filtered.forEach((log) => {
      const catId = log.categoryId || 'cat-general';
      categoryMinutesMap[catId] = (categoryMinutesMap[catId] || 0) + log.durationMinutes;
    });

    const categoryBreakdown = Object.entries(categoryMinutesMap)
      .map(([catId, minutes]) => {
        const cat = categories.find((c) => c.id === catId);
        const cH = Math.floor(minutes / 60);
        const cM = minutes % 60;
        const formatted =
          cH > 0 ? `${cH}h ${cM > 0 ? `${cM}m` : ''}`.trim() : `${cM}m`;
        return {
          id: catId,
          name: cat?.name || 'General',
          color: cat?.color || '#8B5CF6',
          minutes,
          formatted,
          percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);

    return {
      totalMinutes,
      formattedStudyTime,
      sessionsCount,
      focusScore,
      categoryBreakdown,
    };
  }, [focusLogs, selectedRange, tasks, categories]);

  // Compute chart points adaptively based on selectedRange (Day, Week, Month, All Time)
  const chartData = useMemo(() => {
    const now = new Date();

    if (selectedRange === 'Day') {
      // 7 Time slots throughout the day
      const daySlots = [
        { label: '6 AM', fullLabel: 'Morning (6 - 9 AM)', start: 6, end: 9 },
        { label: '9 AM', fullLabel: 'Mid-Morning (9 AM - 12 PM)', start: 9, end: 12 },
        { label: '12 PM', fullLabel: 'Noon (12 - 3 PM)', start: 12, end: 15 },
        { label: '3 PM', fullLabel: 'Afternoon (3 - 6 PM)', start: 15, end: 18 },
        { label: '6 PM', fullLabel: 'Evening (6 - 9 PM)', start: 18, end: 21 },
        { label: '9 PM', fullLabel: 'Night (9 PM - 12 AM)', start: 21, end: 24 },
        { label: '12 AM', fullLabel: 'Late Night (12 - 6 AM)', start: 0, end: 6 },
      ];

      const slotHours: Record<string, number> = {};
      daySlots.forEach((s) => {
        slotHours[s.label] = 0;
      });

      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();

      focusLogs.forEach((log) => {
        if (!log.timestamp) return;
        const d = new Date(log.timestamp);
        if (
          d.getFullYear() === todayYear &&
          d.getMonth() === todayMonth &&
          d.getDate() === todayDate
        ) {
          const hour = d.getHours();
          const targetSlot = daySlots.find((s) => hour >= s.start && hour < s.end);
          if (targetSlot) {
            slotHours[targetSlot.label] += (log.durationMinutes || 0) / 60;
          }
        }
      });

      const maxH = Math.max(...Object.values(slotHours), 0);

      return daySlots.map((s) => ({
        label: s.label,
        fullLabel: s.fullLabel,
        hours: Number((slotHours[s.label] || 0).toFixed(1)),
        isPeak: maxH > 0 && slotHours[s.label] === maxH,
      }));
    }

    if (selectedRange === 'Week') {
      const currentDayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const dayHoursMap: Record<string, number> = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
      };

      const dayFullMap: Record<string, string> = {
        Sun: 'Sunday',
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
      };

      focusLogs.forEach((log) => {
        if (!log.timestamp) return;
        const logDate = new Date(log.timestamp);
        if (logDate >= startOfWeek) {
          const dayName = DAYS_OF_WEEK[logDate.getDay()];
          if (dayName) {
            dayHoursMap[dayName] =
              (dayHoursMap[dayName] || 0) + (log.durationMinutes || 0) / 60;
          }
        }
      });

      const maxHours = Math.max(...Object.values(dayHoursMap), 0);

      return DAYS_OF_WEEK.map((day) => ({
        label: day,
        fullLabel: dayFullMap[day] || day,
        hours: Number((dayHoursMap[day] || 0).toFixed(1)),
        isPeak: maxHours > 0 && dayHoursMap[day] === maxHours,
      }));
    }

    if (selectedRange === 'Month') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const weeks = [
        { label: 'W1', fullLabel: 'Week 1 (Day 1 - 7)', start: 1, end: 7 },
        { label: 'W2', fullLabel: 'Week 2 (Day 8 - 14)', start: 8, end: 14 },
        { label: 'W3', fullLabel: 'Week 3 (Day 15 - 21)', start: 15, end: 21 },
        { label: 'W4', fullLabel: 'Week 4 (Day 22 - 28)', start: 22, end: 28 },
        { label: 'W5', fullLabel: 'Week 5 (Day 29 - End)', start: 29, end: 31 },
      ];

      const weekHours: Record<string, number> = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0 };

      focusLogs.forEach((log) => {
        if (!log.timestamp) return;
        const d = new Date(log.timestamp);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          const dateNum = d.getDate();
          const targetW = weeks.find((w) => dateNum >= w.start && dateNum <= w.end);
          if (targetW) {
            weekHours[targetW.label] += (log.durationMinutes || 0) / 60;
          }
        }
      });

      const maxH = Math.max(...Object.values(weekHours), 0);

      return weeks.map((w) => ({
        label: w.label,
        fullLabel: w.fullLabel,
        hours: Number((weekHours[w.label] || 0).toFixed(1)),
        isPeak: maxH > 0 && weekHours[w.label] === maxH,
      }));
    }

    // All Time: Last 6 months
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const pastMonths: { label: string; fullLabel: string; year: number; month: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      pastMonths.push({
        label: monthNames[mIdx],
        fullLabel: `${monthNames[mIdx]} ${yr}`,
        year: yr,
        month: mIdx,
      });
    }

    const monthHours: Record<string, number> = {};
    pastMonths.forEach((m) => {
      monthHours[m.label] = 0;
    });

    focusLogs.forEach((log) => {
      if (!log.timestamp) return;
      const d = new Date(log.timestamp);
      const targetM = pastMonths.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
      if (targetM) {
        monthHours[targetM.label] += (log.durationMinutes || 0) / 60;
      }
    });

    const maxH = Math.max(...Object.values(monthHours), 0);

    return pastMonths.map((m) => ({
      label: m.label,
      fullLabel: m.fullLabel,
      hours: Number((monthHours[m.label] || 0).toFixed(1)),
      isPeak: maxH > 0 && monthHours[m.label] === maxH,
    }));
  }, [focusLogs, selectedRange]);

  const selectedPoint = useMemo(() => {
    if (activeTooltipLabel) {
      const found = chartData.find((p) => p.label === activeTooltipLabel);
      if (found) return found;
    }
    const peakOrFirst = chartData.find((p) => p.isPeak && p.hours > 0) || chartData[0];
    return peakOrFirst;
  }, [chartData, activeTooltipLabel]);

  const maxChartHours = Math.max(...chartData.map((d) => d.hours), 1);
  const yMax = maxChartHours > 4 ? Math.ceil(maxChartHours) : 4.0;
  const yAxisLabels = [
    yMax.toFixed(1),
    (yMax * 0.75).toFixed(1),
    (yMax * 0.5).toFixed(1),
    (yMax * 0.25).toFixed(1),
    '0.0',
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconCircleBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
            hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#0F172A'} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Overview
          </Text>

          <Pressable
            onPress={() => router.push('/schedule')}
            style={[
              styles.iconCircleBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
            hitSlop={8}>
            <Ionicons name="calendar-outline" size={18} color={isDark ? '#FFF' : '#0F172A'} />
          </Pressable>
        </View>

        {/* Time Range Segmented Pills: Day | Week | Month | All Time */}
        <View
          style={[
            styles.rangeSelectorBar,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#F1F5F9',
            },
          ]}>
          {(['Day', 'Week', 'Month', 'All Time'] as TimeRange[]).map((range) => {
            const isSelected = selectedRange === range;
            return (
              <Pressable
                key={range}
                onPress={() => {
                  setSelectedRange(range);
                  setActiveTooltipLabel('');
                }}
                style={[
                  styles.rangePill,
                  isSelected && styles.rangePillActive,
                ]}>
                <Text
                  style={[
                    styles.rangePillText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 4 Stat Metric Cards (Dynamic & Real-time) */}
        <View style={styles.metricGrid}>
          {/* Card 1: Study Time */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#F1F5F9',
              },
            ]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="locate-outline" size={14} color="#6366F1" />
              </View>
              {rangeStats.totalMinutes > 0 && (
                <Text style={styles.badgePurpleText}>Active</Text>
              )}
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              {rangeStats.formattedStudyTime}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Study Time
            </Text>
          </View>

          {/* Card 2: Sessions */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#F1F5F9',
              },
            ]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="hourglass-outline" size={14} color="#0284C7" />
              </View>
              {rangeStats.sessionsCount > 0 && (
                <Text style={styles.badgeBlueText}>{rangeStats.sessionsCount}</Text>
              )}
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              {rangeStats.sessionsCount}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Sessions
            </Text>
          </View>

          {/* Card 3: Focus Score */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#F1F5F9',
              },
            ]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="trending-up-outline" size={14} color="#10B981" />
              </View>
              {rangeStats.focusScore > 0 && (
                <Text style={styles.badgeGreenText}>{rangeStats.focusScore}%</Text>
              )}
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              {rangeStats.focusScore}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Focus Score
            </Text>
          </View>

          {/* Card 4: Streak */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#F1F5F9',
              },
            ]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flame-outline" size={14} color="#D97706" />
              </View>
              {streakDays > 0 && <View style={styles.streakDot} />}
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              {streakDays}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Streak
            </Text>
          </View>
        </View>

        {/* Card: Study Time (Hours) with interactive Line & Bar Chart */}
        <View
          style={[
            styles.chartSectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#F1F5F9',
            },
          ]}>
          <View style={styles.chartTitleRow}>
            <Text style={[styles.chartCardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {selectedRange === 'Day'
                ? 'Hourly Study Time (Hours)'
                : selectedRange === 'Week'
                ? 'Daily Study Time (Hours)'
                : selectedRange === 'Month'
                ? 'Weekly Study Time (Hours)'
                : 'Monthly Study Time (Hours)'}
            </Text>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </View>

          {/* Tooltip Bubble at active point */}
          <View style={styles.tooltipRow}>
            <View style={styles.tooltipPill}>
              <Text style={styles.tooltipText}>
                {selectedPoint.fullLabel || selectedPoint.label}: {selectedPoint.hours} Hours
              </Text>
            </View>
          </View>

          {/* Chart Grid with Y-Axis and Bars */}
          <View style={styles.chartContainer}>
            {/* Left Y-Axis */}
            <View style={styles.yAxisLabels}>
              {yAxisLabels.map((label, idx) => (
                <Text
                  key={idx}
                  style={[styles.yAxisText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Plot Area with Vertical Bars and Connected Dots */}
            <View style={styles.plotArea}>
              {/* Horizontal Grid lines */}
              <View style={styles.gridLinesWrap}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.gridLine,
                      { borderColor: isDark ? '#334155' : '#F1F5F9' },
                    ]}
                  />
                ))}
              </View>

              {/* Data Bars */}
              <View style={styles.barsRow}>
                {chartData.map((item) => {
                  const isActive = selectedPoint.label === item.label;
                  const barHeightPercent =
                    yMax > 0 ? Math.min(100, Math.round((item.hours / yMax) * 100)) : 0;

                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => setActiveTooltipLabel(item.label)}
                      style={styles.dayCol}>
                      {/* Bar Fill & Dot */}
                      <View style={styles.barArea}>
                        {/* Dot on top */}
                        <View
                          style={[
                            styles.chartDot,
                            {
                              bottom: `${Math.max(2, barHeightPercent)}%`,
                              backgroundColor: isActive
                                ? '#6366F1'
                                : item.hours > 0
                                ? '#A5B4FC'
                                : isDark
                                ? '#334155'
                                : '#CBD5E1',
                              borderColor: '#FFFFFF',
                            },
                          ]}
                        />
                        {/* Vertical Gradient Bar under dot */}
                        <View
                          style={[
                            styles.barColumn,
                            {
                              height: `${Math.max(4, barHeightPercent)}%`,
                              backgroundColor: isActive
                                ? 'rgba(99, 102, 241, 0.35)'
                                : item.hours > 0
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'transparent',
                            },
                          ]}
                        />
                      </View>

                      {/* Label */}
                      <Text
                        style={[
                          styles.dayLabelText,
                          {
                            color: isActive
                              ? '#6366F1'
                              : isDark
                              ? '#94A3B8'
                              : '#64748B',
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Card: Subject Breakdown with Dynamic Categories or Empty State */}
        <View
          style={[
            styles.chartSectionCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#F1F5F9',
              marginBottom: 40,
            },
          ]}>
          <View style={styles.chartTitleRow}>
            <Text style={[styles.chartCardTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Subject Breakdown
            </Text>
            <Ionicons
              name="options-outline"
              size={18}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </View>

          {/* Donut Gauge Ring */}
          <View style={styles.donutContainer}>
            <View
              style={[
                styles.donutOuterRing,
                rangeStats.totalMinutes === 0 && {
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderTopColor: isDark ? '#334155' : '#E2E8F0',
                  borderRightColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View
                style={[
                  styles.donutInnerCircle,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                ]}>
                <Text style={[styles.donutTotalValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {rangeStats.formattedStudyTime}
                </Text>
                <Text style={[styles.donutTotalLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Total
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Subject List or Empty State */}
          {rangeStats.categoryBreakdown.length > 0 ? (
            <View style={styles.legendRow}>
              {rangeStats.categoryBreakdown.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.legendCol}>
                  <View style={[styles.legendBarIndicator, { backgroundColor: item.color }]} />
                  <View>
                    <Text
                      style={[styles.legendName, { color: isDark ? '#94A3B8' : '#64748B' }]}
                      numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.legendHours, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                      {item.formatted}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySubjectContainer}>
              <View style={styles.emptySubjectIconCircle}>
                <Ionicons name="pie-chart-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={[styles.emptySubjectTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                No Subject Activity Yet
              </Text>
              <Text style={[styles.emptySubjectSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Complete focus timer sessions or university tasks to view your real-time subject distribution.
              </Text>
              <Pressable
                onPress={() => router.push('/focus')}
                style={styles.startFocusBtn}>
                <Ionicons name="timer-outline" size={15} color="#FFFFFF" />
                <Text style={styles.startFocusBtnText}>Start Focus Session</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
    gap: 4,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  rangePillActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rangePillText: {
    fontSize: 13,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePurpleText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeBlueText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartSectionCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tooltipRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  tooltipPill: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
  },
  yAxisLabels: {
    height: 130,
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingBottom: 20,
  },
  yAxisText: {
    fontSize: 10,
    fontWeight: '500',
  },
  plotArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  gridLinesWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'space-between',
  },
  gridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    zIndex: 5,
  },
  barColumn: {
    width: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  dayLabelText: {
    fontSize: 11,
    marginTop: 6,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  donutOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 14,
    borderColor: '#6366F1',
    borderTopColor: '#EC4899',
    borderRightColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-30deg' }],
  },
  donutInnerCircle: {
    width: 114,
    height: 114,
    borderRadius: 57,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '30deg' }],
  },
  donutTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  donutTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  legendCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  legendBarIndicator: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  legendName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  legendHours: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptySubjectContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptySubjectIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptySubjectTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubjectSub: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  startFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  startFocusBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
