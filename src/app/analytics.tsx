import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { StatCard } from '@/components/study/StatCard';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Mock study hours distribution for visual chart
const WEEK_HOURS = [2.5, 3.2, 1.8, 4.0, 2.8, 1.5, 0.5];
const MAX_HOURS = 4.0;

export default function AnalyticsScreen() {
  const {
    categories,
    tasks,
    focusLogs,
    streakDays,
    todayFocusMinutes,
    clearAllData,
    colors,
  } = useStudy();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalFocusSessions = focusLogs.filter((f) => f.mode === 'pomodoro').length;
  const totalHours = ((todayFocusMinutes + 210) / 60).toFixed(1); // includes sample history

  const handleReset = () => {
    Alert.alert(
      'Clear Planner Data?',
      'This will clear tasks, schedule, work plans, and focus history so you can start fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Planner Cleared', 'Your planner data has been reset to empty!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Study Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your study consistency and progress
          </Text>
        </View>

        {/* Top Metric Cards */}
        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            iconColor={colors.streak}
            value={`${streakDays} Days`}
            label="Study Streak"
            sublabel="Top 5% student"
          />
          <StatCard
            icon="checkmark-done-circle"
            iconColor={colors.success}
            value={`${taskCompletionRate}%`}
            label="Task Rate"
            sublabel={`${completedTasks}/${totalTasks} done`}
          />
        </View>

        <View style={[styles.statsRow, { marginTop: 10 }]}>
          <StatCard
            icon="time"
            iconColor={colors.primary}
            value={`${totalHours} hrs`}
            label="Weekly Focus"
            sublabel="Goal: 15 hrs"
          />
          <StatCard
            icon="bulb"
            iconColor={colors.warning}
            value={`${totalFocusSessions}`}
            label="Pomodoros"
            sublabel="High Focus"
          />
        </View>

        {/* Weekly Study Hours Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Study Hours</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Hours logged per day</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgePillText, { color: colors.primary }]}>Avg 2.4h / day</Text>
            </View>
          </View>

          {/* Bar Chart Visualization */}
          <View style={styles.barsContainer}>
            {WEEK_DAYS.map((day, idx) => {
              const hours = WEEK_HOURS[idx];
              const heightPercent = Math.round((hours / MAX_HOURS) * 100);
              const isToday = idx === 3; // Thu/Fri example
              return (
                <View key={day} style={styles.barCol}>
                  <Text style={[styles.barHoursText, { color: colors.textSecondary }]}>{hours}h</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.backgroundElement }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: isToday ? colors.primary : colors.tint,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barDayText,
                      { color: isToday ? colors.primary : colors.textSecondary, fontWeight: isToday ? '700' : '500' },
                    ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Category Time Distribution</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Focus allocation by category</Text>

          <View style={styles.subjectList}>
            {categories.map((cat, idx) => {
              // Sample percentages
              const percent = [35, 25, 20, 12, 8][idx] || 10;
              return (
                <View key={cat.id} style={styles.subjectRow}>
                  <View style={styles.subjectRowInfo}>
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.subjectName, { color: colors.text }]}>{cat.name}</Text>
                    <Text style={[styles.subjectPercent, { color: colors.textSecondary }]}>{percent}%</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percent}%`, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Reset button */}
        <Pressable
          onPress={handleReset}
          style={[styles.resetBtn, { borderColor: colors.cardBorder }]}>
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset Sample Data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chartCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barHoursText: {
    fontSize: 10,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 11,
    marginTop: 6,
  },
  subjectList: {
    marginTop: 14,
    gap: 12,
  },
  subjectRow: {
    gap: 6,
  },
  subjectRowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  subjectPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
