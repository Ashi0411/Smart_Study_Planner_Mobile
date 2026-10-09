import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/context/StudyContext';
import { ModalAddTask } from '@/components/study/ModalAddTask';
import { ModalAddSchedule } from '@/components/study/ModalAddSchedule';
import { ModalAddWorkPlan } from '@/components/study/ModalAddWorkPlan';
import { ModalAddCategory } from '@/components/study/ModalAddCategory';
import { StudyTask } from '@/types/study';

// Pastel palette for Today's Task horizontal cards
const TODAY_PASTEL_COLORS = [
  { bg: '#FFF1F2', border: '#FFE4E6', dot: '#10B981', darkBg: '#2C161D', darkBorder: '#4C1D2F' }, // Peach / Rose
  { bg: '#ECFDF5', border: '#D1FAE5', dot: '#10B981', darkBg: '#132E27', darkBorder: '#1B4D3E' }, // Mint / Aqua
  { bg: '#F5F3FF', border: '#EDE9FE', dot: '#10B981', darkBg: '#241836', darkBorder: '#3B2554' }, // Lavender
  { bg: '#FFFBEB', border: '#FEF3C7', dot: '#10B981', darkBg: '#2C2314', darkBorder: '#45351A' }, // Soft Amber
  { bg: '#EFF6FF', border: '#DBEAFE', dot: '#10B981', darkBg: '#14233D', darkBorder: '#1E3A8A' }, // Soft Blue
];

// Pastel styling for Pending Task vertical cards
const PENDING_CARD_STYLES = [
  {
    bg: '#F0FDFA',
    border: '#CCFBF1',
    stripe: '#06B6D4',
    progressFill: '#8B5CF6',
    progressTrack: '#E0E7FF',
    darkBg: '#11292B',
    darkBorder: '#164E63',
  },
  {
    bg: '#FFFBEB',
    border: '#FEF3C7',
    stripe: '#F59E0B',
    progressFill: '#F59E0B',
    progressTrack: '#FDE68A',
    darkBg: '#2E2514',
    darkBorder: '#78350F',
  },
  {
    bg: '#F5F3FF',
    border: '#EDE9FE',
    stripe: '#8B5CF6',
    progressFill: '#8B5CF6',
    progressTrack: '#DDD6FE',
    darkBg: '#241836',
    darkBorder: '#4C1D95',
  },
  {
    bg: '#EFF6FF',
    border: '#DBEAFE',
    stripe: '#3B82F6',
    progressFill: '#3B82F6',
    progressTrack: '#BFDBFE',
    darkBg: '#14233D',
    darkBorder: '#1E3A8A',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const {
    categories,
    tasks,
    themeMode,
    colors,
    toggleThemeMode,
    toggleTask,
  } = useStudy();

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isWorkPlanModalVisible, setIsWorkPlanModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Helper to get category & subcategory name for any task
  const getTaskCategoryInfo = (task: StudyTask) => {
    const cat = categories.find((c) => c.id === task.categoryId);
    const sub = cat?.subcategories.find((s) => s.id === task.subcategoryId);
    return {
      categoryName: cat?.name || 'General',
      subcategoryName: sub?.name || cat?.name || 'Work & Projects',
      color: cat?.color || '#8B5CF6',
    };
  };

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        categories.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(q)
    );
  }, [tasks, categories, searchQuery]);

  // Separate Today's tasks from Pending tasks
  const todayTasks = useMemo(() => {
    const list = filteredTasks.filter((t) => t.isToday || t.priority === 'high');
    return list.length > 0 ? list : filteredTasks.slice(0, 3);
  }, [filteredTasks]);

  const pendingTasks = useMemo(() => {
    const todayIds = new Set(todayTasks.map((t) => t.id));
    const list = filteredTasks.filter((t) => !todayIds.has(t.id) && !t.completed);
    return list.length > 0 ? list : filteredTasks.filter((t) => !t.completed);
  }, [filteredTasks, todayTasks]);

  // Overall completion for Hero Card Ring (default to 70% if empty, or calculate dynamically)
  const heroProgress = useMemo(() => {
    if (tasks.length === 0) return 70;
    const completedCount = tasks.filter((t) => t.completed).length;
    const computed = Math.round((completedCount / tasks.length) * 100);
    return computed > 0 ? computed : 70;
  }, [tasks]);

  const isDark = themeMode === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Header matching reference */}
        <View style={styles.topHeader}>
          <Pressable
            hitSlop={10}
            onPress={toggleThemeMode}
            style={styles.iconButton}>
            <Ionicons name="menu-outline" size={26} color={colors.text} />
          </Pressable>

          <Text style={[styles.screenTitle, { color: colors.text }]}>Today</Text>

          <Pressable
            hitSlop={10}
            onPress={() => setIsSearchActive((prev) => !prev)}
            style={styles.iconButton}>
            <Ionicons
              name={isSearchActive ? 'close-outline' : 'search-outline'}
              size={24}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Search bar when toggled */}
        {isSearchActive && (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search tasks, categories..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        )}

        {/* Hero Card: Purple Gradient with Circular Progress */}
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          {/* Left Circular Ring */}
          <View style={styles.circleContainer}>
            <View style={styles.circleOuterRing}>
              <View style={styles.circleInner}>
                <Text style={styles.circlePercentText}>{heroProgress}%</Text>
              </View>
            </View>
          </View>

          {/* Right Hero Info */}
          <View style={styles.heroDetails}>
            <Text style={styles.heroTitle}>Great News!</Text>
            <Text style={styles.heroSubtitle}>Your task is almost done!</Text>
            <Pressable
              onPress={() => router.push('/tasks')}
              style={styles.viewTaskButton}>
              <Text style={styles.viewTaskButtonText}>View Task</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Section: Today's Task */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Today&apos;s Task</Text>
            <View style={styles.purpleCountBadge}>
              <Text style={styles.purpleCountBadgeText}>{todayTasks.length}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/tasks')} hitSlop={8}>
            <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
          </Pressable>
        </View>

        {/* Horizontal Carousel of Pastel Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}>
          {todayTasks.map((task, index) => {
            const colorTheme = TODAY_PASTEL_COLORS[index % TODAY_PASTEL_COLORS.length];
            const { subcategoryName } = getTaskCategoryInfo(task);

            return (
              <Pressable
                key={task.id}
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.todayCard,
                  {
                    backgroundColor: isDark ? colorTheme.darkBg : colorTheme.bg,
                    borderColor: isDark ? colorTheme.darkBorder : colorTheme.border,
                  },
                ]}>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {subcategoryName}
                </Text>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                    task.completed && styles.cardTitleCompleted,
                  ]}
                  numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.greenDot,
                      { backgroundColor: task.completed ? '#6B7280' : colorTheme.dot },
                    ]}
                  />
                  <Text style={[styles.cardDueText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {task.completed ? 'Completed' : task.dueDate || 'Due Today'}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {/* Quick Add Card at end of horizontal list */}
          <Pressable
            onPress={() => setIsTaskModalVisible(true)}
            style={[
              styles.todayAddCard,
              {
                backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.addCardIconCircle}>
              <Ionicons name="add" size={24} color="#8B5CF6" />
            </View>
            <Text style={[styles.addCardText, { color: colors.textSecondary }]}>Add Task</Text>
          </Pressable>
        </ScrollView>

        {/* Section: Pending Task */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Pending Task</Text>
            <View style={styles.purpleCountBadge}>
              <Text style={styles.purpleCountBadgeText}>{pendingTasks.length}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/tasks')} hitSlop={8}>
            <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>See all</Text>
          </Pressable>
        </View>

        {/* Vertical Stack of Wide Cards */}
        <View style={styles.pendingListContainer}>
          {pendingTasks.map((task, index) => {
            const cardTheme = PENDING_CARD_STYLES[index % PENDING_CARD_STYLES.length];
            const { subcategoryName, categoryName } = getTaskCategoryInfo(task);
            const progress = task.progressPercent ?? 65;

            return (
              <Pressable
                key={task.id}
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.pendingCard,
                  {
                    backgroundColor: isDark ? cardTheme.darkBg : cardTheme.bg,
                    borderColor: isDark ? cardTheme.darkBorder : cardTheme.border,
                  },
                ]}>
                {/* Left Colored Accent Stripe */}
                <View style={[styles.accentStripe, { backgroundColor: cardTheme.stripe }]} />

                <View style={styles.pendingCardContent}>
                  <Text style={styles.pendingSubtitle}>
                    {subcategoryName !== 'General' ? subcategoryName : categoryName}
                  </Text>
                  <Text
                    style={[
                      styles.pendingTitle,
                      { color: isDark ? '#FFFFFF' : '#0F172A' },
                      task.completed && styles.cardTitleCompleted,
                    ]}>
                    {task.title}
                  </Text>

                  {/* Progress Bar */}
                  <View
                    style={[
                      styles.progressBarTrack,
                      {
                        backgroundColor: isDark ? '#374151' : cardTheme.progressTrack,
                      },
                    ]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${task.completed ? 100 : progress}%`,
                          backgroundColor: cardTheme.progressFill,
                        },
                      ]}
                    />
                  </View>

                  {/* Footer Row */}
                  <View style={styles.pendingFooterRow}>
                    <Text style={styles.pendingDueDate}>
                      {task.completed ? 'Completed' : task.dueDate || 'Due Soon'}
                    </Text>
                    <Text
                      style={[
                        styles.pendingPercentText,
                        { color: isDark ? '#E5E7EB' : '#0F172A' },
                      ]}>
                      {task.completed ? '100%' : `${progress}%`}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Action Bar for Custom Work Plans, Categories & AI Assistant */}
        <View style={[styles.quickManagerBar, { borderColor: colors.cardBorder }]}>
          <Pressable
            onPress={() => setIsWorkPlanModalVisible(true)}
            style={[styles.managerPillBtn, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="sparkles" size={15} color="#FFF" />
            <Text style={styles.managerPillBtnText}>+ Work Plan</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsCategoryModalVisible(true)}
            style={[
              styles.managerPillBtnSecondary,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Ionicons name="folder-outline" size={15} color={colors.text} />
            <Text style={[styles.managerPillBtnTextSecondary, { color: colors.text }]}>
              + Category
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsTaskModalVisible(true)}
            style={[
              styles.managerPillBtnSecondary,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Ionicons name="add-circle-outline" size={15} color={colors.text} />
            <Text style={[styles.managerPillBtnTextSecondary, { color: colors.text }]}>
              + Task
            </Text>
          </Pressable>
        </View>

        {/* Subtle Bottom Spacing for Bottom Tab Bar */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <ModalAddTask
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
      />
      <ModalAddSchedule
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
      />
      <ModalAddWorkPlan
        visible={isWorkPlanModalVisible}
        onClose={() => setIsWorkPlanModalVisible(false)}
      />
      <ModalAddCategory
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  heroCard: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  circleContainer: {
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOuterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  circleInner: {
    transform: [{ rotate: '45deg' }],
  },
  circlePercentText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  heroDetails: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  viewTaskButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewTaskButtonText: {
    color: '#1E1B4B',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  purpleCountBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  horizontalScrollContent: {
    gap: 12,
    paddingBottom: 22,
  },
  todayCard: {
    width: 148,
    minHeight: 140,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 12,
  },
  cardTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  cardDueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayAddCard: {
    width: 110,
    minHeight: 140,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  addCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addCardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingListContainer: {
    gap: 12,
    marginBottom: 20,
  },
  pendingCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  pendingCardContent: {
    paddingLeft: 18,
    paddingRight: 16,
    paddingVertical: 14,
  },
  pendingSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pendingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingDueDate: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  pendingPercentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickManagerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 8,
  },
  managerPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
  },
  managerPillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  managerPillBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  managerPillBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
  },
});
