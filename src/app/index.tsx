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
import { StatCard } from '@/components/study/StatCard';
import { TaskItem } from '@/components/study/TaskItem';
import { ScheduleItem } from '@/components/study/ScheduleItem';
import { WorkPlanCard } from '@/components/study/WorkPlanCard';
import { CategoryCard } from '@/components/study/CategoryCard';
import { ModalAddTask } from '@/components/study/ModalAddTask';
import { ModalAddSchedule } from '@/components/study/ModalAddSchedule';
import { ModalAddWorkPlan } from '@/components/study/ModalAddWorkPlan';
import { ModalAddCategory } from '@/components/study/ModalAddCategory';

export default function HomeScreen() {
  const router = useRouter();

  const {
    categories,
    todaySchedule,
    tasks,
    workPlans,
    streakDays,
    todayFocusMinutes,
    dailyGoalMinutes,
    pendingTasksCount,
    themeMode,
    colors,
    toggleThemeMode,
  } = useStudy();

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isWorkPlanModalVisible, setIsWorkPlanModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);

  // Today formatted
  const todayDate = new Date();
  const dateFormatted = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate goal progress
  const progressPercent = Math.min(100, Math.round((todayFocusMinutes / dailyGoalMinutes) * 100));

  // Filtered work plans if user tapped a category
  const displayedWorkPlans = filterCategoryId
    ? workPlans.filter((p) => p.categoryId === filterCategoryId)
    : workPlans;

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
          <View style={styles.brandingWrap}>
            <Text style={[styles.appName, { color: colors.primary }]}>
              SMART LIFE & LEARNING PLANNER
            </Text>
            <Text style={[styles.greetingText, { color: colors.text }]}>Dashboard 🚀</Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {dateFormatted} • All Goals in One Place
            </Text>
          </View>

          {/* Right Header Actions */}
          <View style={styles.headerActions}>
            <Pressable
              onPress={toggleThemeMode}
              hitSlop={8}
              style={[
                styles.themeBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons
                name={themeMode === 'light' ? 'moon' : 'sunny'}
                size={18}
                color={themeMode === 'light' ? colors.text : '#FBBF24'}
              />
            </Pressable>

            <View
              style={[
                styles.streakBadge,
                { backgroundColor: colors.streak + '1F', borderColor: colors.streak + '4D' },
              ]}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakCount, { color: colors.streak }]}>{streakDays}d</Text>
            </View>
          </View>
        </View>

        {/* AI Custom Work Plan Hero Banner */}
        <View
          style={[
            styles.aiHeroBanner,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <View style={styles.aiHeroContent}>
            <View style={styles.aiPillRow}>
              <View style={[styles.aiPill, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={[styles.aiPillText, { color: colors.primary }]}>AI ASSISTANT</Text>
              </View>
              <Text style={[styles.aiHeroBadge, { color: colors.textSecondary }]}>
                Custom Work Plan Manager
              </Text>
            </View>

            <Text style={[styles.aiHeroTitle, { color: colors.text }]}>
              Custom Work Plans & Sub-Plans
            </Text>
            <Text style={[styles.aiHeroSub, { color: colors.textSecondary }]}>
              Create work plans for University, Cybersecurity, UI/UX, English, or Personal Goals. Generate phased sub-plans automatically with AI!
            </Text>

            <View style={styles.heroButtonsRow}>
              <Pressable
                onPress={() => setIsWorkPlanModalVisible(true)}
                style={[styles.aiActionBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="add-circle" size={17} color="#FFF" />
                <Text style={styles.aiActionBtnText}>+ Add Work Plan</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsCategoryModalVisible(true)}
                style={[styles.catActionBtn, { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="folder-open-outline" size={16} color={colors.text} />
                <Text style={[styles.catActionBtnText, { color: colors.text }]}>+ Category</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Categories & Subcategories Section */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom Categories</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                {categories.length} categories • Manage subcategories & progress
              </Text>
            </View>

            <Pressable
              onPress={() => setIsCategoryModalVisible(true)}
              style={({ pressed }) => [styles.sectionAddBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionAddText, { color: colors.primary }]}>Add Category</Text>
            </Pressable>
          </View>

          {/* Categories Cards */}
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelectCategory={(catId) =>
                setFilterCategoryId(filterCategoryId === catId ? null : catId)
              }
            />
          ))}
        </View>

        {/* Custom Work Plans Section */}
        <View style={[styles.sectionWrap, { marginTop: 14 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {filterCategoryId ? 'Filtered Work Plans' : 'All Work Plans'}
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                {displayedWorkPlans.length} active study & life plan{displayedWorkPlans.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {filterCategoryId && (
                <Pressable
                  onPress={() => setFilterCategoryId(null)}
                  style={[styles.clearFilterBtn, { backgroundColor: colors.backgroundElement }]}>
                  <Text style={[styles.clearFilterText, { color: colors.textSecondary }]}>Clear Filter</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => setIsWorkPlanModalVisible(true)}
                style={({ pressed }) => [styles.sectionAddBtn, pressed && { opacity: 0.7 }]}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.sectionAddText, { color: colors.primary }]}>New Plan</Text>
              </Pressable>
            </View>
          </View>

          {displayedWorkPlans.length > 0 ? (
            displayedWorkPlans.map((plan) => <WorkPlanCard key={plan.id} plan={plan} />)
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="layers-outline" size={32} color={colors.primary} />
              <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No Work Plans Yet</Text>
              <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                Tap &ldquo;+ Add Work Plan&rdquo; above to set your goal and generate sub-plans with AI!
              </Text>
            </View>
          )}
        </View>

        {/* Focus Goal & Quick Stats */}
        <View
          style={[
            styles.goalCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: 14 },
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
            label="Schedule Today"
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
              No scheduled blocks for today. Tap &ldquo;Add&rdquo; to plan a session.
            </Text>
          </View>
        )}

        {/* Tasks Section */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Tasks & Deadlines</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {tasks.length} total tasks
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
            <Ionicons name="checkbox-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
              No tasks added yet. Tap &ldquo;Add&rdquo; or sync sub-plans from a Work Plan!
            </Text>
          </View>
        )}

        {/* View All Tasks Button */}
        {tasks.length > 0 && (
          <Pressable
            onPress={() => router.push('/tasks')}
            style={[styles.viewAllBtn, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Tasks ({tasks.length})</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        )}
      </ScrollView>

      {/* Modals */}
      <ModalAddWorkPlan
        visible={isWorkPlanModalVisible}
        onClose={() => setIsWorkPlanModalVisible(false)}
        defaultCategoryId={filterCategoryId || undefined}
      />
      <ModalAddCategory
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
      />
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandingWrap: {
    flex: 1,
  },
  appName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    gap: 3,
  },
  streakFire: {
    fontSize: 13,
  },
  streakCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiHeroBanner: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  aiHeroContent: {
    gap: 8,
  },
  aiPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiHeroBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  aiHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  aiHeroSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  aiActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  aiActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  catActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  catActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 6,
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
  clearFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  emptyCardText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
});
