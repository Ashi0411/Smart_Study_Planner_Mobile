import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStudy } from '@/context/StudyContext';
import { Colors } from '@/constants/theme';
import { StatCard } from '@/components/study/StatCard';
import { TaskItem } from '@/components/study/TaskItem';
import { ScheduleItem } from '@/components/study/ScheduleItem';
import { ModalAddTask } from '@/components/study/ModalAddTask';
import { ModalAddSchedule } from '@/components/study/ModalAddSchedule';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const {
    todaySchedule,
    tasks,
    streakDays,
    todayFocusMinutes,
    dailyGoalMinutes,
    pendingTasksCount,
    subjects,
  } = useStudy();

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);

  // Today formatted
  const todayDate = new Date();
  const dateFormatted = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate goal progress
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100));

  // Urgent & high-priority tasks (top 3)
  const urgentTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.priority === 'high' ? -1 : 1))
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {dateFormatted.toUpperCase()}
            </Text>
            <Text style={[styles.greetingText, { color: colors.text }]}>Hello, Scholar 🎓</Text>
          </View>

          {/* Streak Badge */}
          <View style={[styles.streakBadge, { backgroundColor: colors.streak + '1F', borderColor: colors.streak + '4D' }]}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={[styles.streakCount, { color: colors.streak }]}>{streakDays} Days</Text>
          </View>
        </View>

        {/* Daily Goal Card */}
        <View
          style={[
            styles.goalCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={[styles.goalTitle, { color: colors.text }]}>Today&apos;s Focus Goal</Text>
              <Text style={[styles.goalSub, { color: colors.textSecondary }]}>
                {todayFocusMinutes} min of {dailyGoalMinutes} min goal reached
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/focus')}
              style={[styles.focusActionBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="play" size={14} color="#FFF" />
              <Text style={styles.focusActionText}>Focus Now</Text>
            </Pressable>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundElement }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progressPercent}% completed
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard
            icon="checkmark-circle-outline"
            iconColor={colors.success}
            value={pendingTasksCount}
            label="Pending Tasks"
          />
          <StatCard
            icon="calendar-outline"
            iconColor={colors.primary}
            value={todaySchedule.length}
            label="Classes Today"
          />
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Schedule</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {todaySchedule.length} sessions planned for today
            </Text>
          </View>

          <Pressable
            onPress={() => setIsScheduleModalVisible(true)}
            style={({ pressed }) => [styles.sectionAddBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionAddText, { color: colors.primary }]}>Add</Text>
          </Pressable>
        </View>

        {todaySchedule.length > 0 ? (
          todaySchedule.map((session) => <ScheduleItem key={session.id} session={session} />)
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
              No scheduled classes today. Enjoy your self-study time!
            </Text>
          </View>
        )}

        {/* Urgent & Priority Tasks Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Urgent Tasks</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Priority assignments & deadlines
            </Text>
          </View>

          <Pressable
            onPress={() => setIsTaskModalVisible(true)}
            style={({ pressed }) => [styles.sectionAddBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionAddText, { color: colors.primary }]}>Add</Text>
          </Pressable>
        </View>

        {urgentTasks.length > 0 ? (
          urgentTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Ionicons name="sparkles-outline" size={32} color={colors.success} />
            <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
              All caught up on urgent tasks!
            </Text>
          </View>
        )}

        {/* View All Tasks Button */}
        <Pressable
          onPress={() => router.push('/tasks')}
          style={[styles.viewAllBtn, { borderColor: colors.cardBorder }]}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Tasks ({tasks.length})</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </Pressable>

        {/* Subjects Carousel / Grid */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enrolled Subjects</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsHorizontal}>
          {subjects.map((sub) => (
            <View
              key={sub.id}
              style={[
                styles.subjectCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <View style={[styles.subjectIconWrap, { backgroundColor: sub.color + '1A' }]}>
                <Ionicons name={(sub.icon as any) || 'book'} size={20} color={sub.color} />
              </View>
              <Text style={[styles.subjectCardCode, { color: sub.color }]}>{sub.code}</Text>
              <Text numberOfLines={1} style={[styles.subjectCardName, { color: colors.text }]}>
                {sub.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modals */}
      <ModalAddTask visible={isTaskModalVisible} onClose={() => setIsTaskModalVisible(false)} />
      <ModalAddSchedule
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  streakFire: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  focusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  focusActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 1,
  },
  sectionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  emptyCardText: {
    fontSize: 13,
    textAlign: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectsHorizontal: {
    flexDirection: 'row',
    marginTop: 4,
  },
  subjectCard: {
    width: 130,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
  },
  subjectIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subjectCardCode: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  subjectCardName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
