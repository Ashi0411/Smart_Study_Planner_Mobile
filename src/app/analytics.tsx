import React, { useState } from 'react';
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

interface DayStat {
  day: string;
  hours: number;
  isPeak?: boolean;
}

const WEEK_DATA: DayStat[] = [
  { day: 'Sun', hours: 1.0 },
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.2 },
  { day: 'Wed', hours: 2.0 },
  { day: 'Thu', hours: 2.5, isPeak: true },
  { day: 'Fri', hours: 3.2 },
  { day: 'Sat', hours: 3.5 },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const { streakDays, themeMode } = useStudy();
  const isDark = themeMode === 'dark';

  const [selectedRange, setSelectedRange] = useState<TimeRange>('Week');
  const [activeTooltipDay, setActiveTooltipDay] = useState<string>('Thu');

  const selectedDayData = WEEK_DATA.find((d) => d.day === activeTooltipDay) || WEEK_DATA[4];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header matching reference Screen 3 */}
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
                onPress={() => setSelectedRange(range)}
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

        {/* 4 Stat Metric Cards (Horizontal Grid matching Screen 3) */}
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
              <Text style={styles.badgePurpleText}>16%</Text>
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              12h 45m
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
              <Text style={styles.badgeBlueText}>12%</Text>
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              18
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
              <Text style={styles.badgeGreenText}>15%</Text>
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              86
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
              <View style={styles.streakDot} />
            </View>
            <Text style={[styles.metricValue, { color: isDark ? '#FFF' : '#0F172A' }]}>
              {streakDays > 0 ? streakDays : 7}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Streak
            </Text>
          </View>
        </View>

        {/* Card: Study Time (Hours) with interactive Line Chart */}
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
              Study Time (Hours)
            </Text>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </View>

          {/* Tooltip Bubble at active day */}
          <View style={styles.tooltipRow}>
            <View style={styles.tooltipPill}>
              <Text style={styles.tooltipText}>{selectedDayData.hours} Hours</Text>
            </View>
          </View>

          {/* Chart Grid with Y-Axis and Bars */}
          <View style={styles.chartContainer}>
            {/* Left Y-Axis */}
            <View style={styles.yAxisLabels}>
              {['4.0', '3.0', '2.0', '1.0', '0.0'].map((label) => (
                <Text
                  key={label}
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

              {/* Day Bars */}
              <View style={styles.barsRow}>
                {WEEK_DATA.map((item) => {
                  const isActive = activeTooltipDay === item.day;
                  const barHeightPercent = Math.min(100, Math.round((item.hours / 4.0) * 100));

                  return (
                    <Pressable
                      key={item.day}
                      onPress={() => setActiveTooltipDay(item.day)}
                      style={styles.dayCol}>
                      {/* Bar Fill & Dot */}
                      <View style={styles.barArea}>
                        {/* Dot on top */}
                        <View
                          style={[
                            styles.chartDot,
                            {
                              bottom: `${barHeightPercent}%`,
                              backgroundColor: isActive ? '#6366F1' : '#A5B4FC',
                              borderColor: '#FFFFFF',
                            },
                          ]}
                        />
                        {/* Vertical Gradient Bar under dot */}
                        <View
                          style={[
                            styles.barColumn,
                            {
                              height: `${barHeightPercent}%`,
                              backgroundColor: isActive
                                ? 'rgba(99, 102, 241, 0.28)'
                                : 'rgba(99, 102, 241, 0.08)',
                            },
                          ]}
                        />
                      </View>

                      {/* Day Label */}
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
                        {item.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Card: Subject Breakdown with Donut Gauge & Legend */}
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
            <View style={styles.donutOuterRing}>
              <View
                style={[
                  styles.donutInnerCircle,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
                ]}>
                <Text style={[styles.donutTotalValue, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  12h 45m
                </Text>
                <Text style={[styles.donutTotalLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Total
                </Text>
              </View>
            </View>
          </View>

          {/* 3-Column Legend Row */}
          <View style={styles.legendRow}>
            {/* Column 1: Structures */}
            <View style={styles.legendCol}>
              <View style={[styles.legendBarIndicator, { backgroundColor: '#6366F1' }]} />
              <View>
                <Text style={[styles.legendName, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Structures
                </Text>
                <Text style={[styles.legendHours, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  4h 30m
                </Text>
              </View>
            </View>

            {/* Column 2: Discrete */}
            <View style={styles.legendCol}>
              <View style={[styles.legendBarIndicator, { backgroundColor: '#EC4899' }]} />
              <View>
                <Text style={[styles.legendName, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Discrete
                </Text>
                <Text style={[styles.legendHours, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  3h 00m
                </Text>
              </View>
            </View>

            {/* Column 3: Solving */}
            <View style={styles.legendCol}>
              <View style={[styles.legendBarIndicator, { backgroundColor: '#10B981' }]} />
              <View>
                <Text style={[styles.legendName, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Solving
                </Text>
                <Text style={[styles.legendHours, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  2h 45m
                </Text>
              </View>
            </View>
          </View>
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
});
