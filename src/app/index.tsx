import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { ModalAddTask } from '@/components/study/ModalAddTask';
import { ModalAddSchedule } from '@/components/study/ModalAddSchedule';
import { ModalAddWorkPlan } from '@/components/study/ModalAddWorkPlan';
import { ModalAddCategory } from '@/components/study/ModalAddCategory';
import { AccountModal } from '@/components/auth/AccountModal';
import { StudyTask } from '@/types/study';
import { StudyCalendarCard, CalendarMode } from '@/components/study/StudyCalendarCard';



export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const {
    categories,
    tasks,
    themeMode,
    toggleTask,
  } = useStudy();

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isWorkPlanModalVisible, setIsWorkPlanModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);

  // Calendar view modes: daily | monthly | yearly
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('daily');

  const isDark = themeMode === 'dark';

  // Dynamic time greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }, []);

  // Display user name
  const displayName = profile?.fullName || 'Student';

  // Helper for dynamic tasks
  const getTaskCategoryInfo = useCallback((task: StudyTask) => {
    const cat = categories.find((c) => c.id === task.categoryId);
    const sub = cat?.subcategories.find((s) => s.id === task.subcategoryId);
    return {
      categoryName: cat?.name || 'General',
      subcategoryName: sub?.name || cat?.name || 'Work Plans',
      color: cat?.color || '#6366F1',
    };
  }, [categories]);

  // Is the selected calendar date today?
  const isViewingToday = useMemo(() => {
    const now = new Date();
    return (
      selectedCalendarDate.getFullYear() === now.getFullYear() &&
      selectedCalendarDate.getMonth() === now.getMonth() &&
      selectedCalendarDate.getDate() === now.getDate()
    );
  }, [selectedCalendarDate]);

  const selectedDateStr = useMemo(() => {
    return selectedCalendarDate.toISOString().split('T')[0];
  }, [selectedCalendarDate]);

  // Dynamic Plan section title based on calendar selection
  const planSectionTitle = useMemo(() => {
    if (calendarMode === 'yearly') {
      return `Plans for ${selectedCalendarDate.getFullYear()}`;
    }
    if (isViewingToday && calendarMode === 'daily') {
      return "Today's Plan";
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (calendarMode === 'monthly') {
      return `Plans in ${months[selectedCalendarDate.getMonth()]} ${selectedCalendarDate.getFullYear()}`;
    }
    return `Plan for ${selectedCalendarDate.getDate()} ${months[selectedCalendarDate.getMonth()]}`;
  }, [calendarMode, isViewingToday, selectedCalendarDate]);

  // Convert tasks - filter by selected calendar date or mode
  const displayPlanItems = useMemo(() => {
    if (tasks.length === 0) return [];

    let filtered = tasks;
    if (calendarMode === 'yearly') {
      const yearPrefix = `${selectedCalendarDate.getFullYear()}`;
      filtered = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(yearPrefix));
    } else if (calendarMode === 'monthly') {
      const year = selectedCalendarDate.getFullYear();
      const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0');
      const monthPrefix = `${year}-${month}`;
      filtered = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
    } else {
      // Daily mode
      const matched = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(selectedDateStr));
      if (matched.length === 0 && isViewingToday) {
        filtered = tasks.slice(0, 5);
      } else {
        filtered = matched;
      }
    }

    return filtered.slice(0, 6).map((t, index) => {
      const { subcategoryName, color } = getTaskCategoryInfo(t);
      const iconPalette = [
        { bg: '#EDE9FE', color: '#6366F1', icon: 'book-outline' as const },
        { bg: '#E0F2FE', color: '#0284C7', icon: 'calculator-outline' as const },
        { bg: '#DCFCE7', color: '#10B981', icon: 'bulb-outline' as const },
      ];
      const pal = iconPalette[index % iconPalette.length];
      return {
        id: t.id,
        title: t.title,
        duration: t.estimatedMinutes ? `${t.estimatedMinutes}m` : '1h',
        type: subcategoryName,
        progress: t.completed ? 100 : (t.progressPercent ?? 30),
        iconName: pal.icon,
        iconBg: pal.bg,
        iconColor: color || pal.color,
        isUserTask: true,
        completed: t.completed,
      };
    });
  }, [tasks, calendarMode, selectedCalendarDate, selectedDateStr, isViewingToday, getTaskCategoryInfo]);

  // Dynamic Featured Banner calculation
  const featuredStats = useMemo(() => {
    if (tasks.length > 0) {
      const completedCount = tasks.filter((t) => t.completed).length;
      const progressPercent = Math.round((completedCount / tasks.length) * 100);
      const activeTask = tasks.find((t) => !t.completed) || tasks[0];
      return {
        title: activeTask.title,
        subtitle: `Today's Focus: ${completedCount} of ${tasks.length} Plans\nCompleted Successfully`,
        progress: progressPercent,
        btnText: 'View All Plans',
        action: () => router.push('/tasks'),
      };
    }
    return {
      title: 'Study & Work Plans',
      subtitle: `Organize university works & study plans\nTrack your daily focus sessions`,
      progress: 0,
      btnText: '+ Add First Plan',
      action: () => setIsTaskModalVisible(true),
    };
  }, [tasks, router]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          {/* Left Avatar & Greeting */}
          <Pressable
            onPress={() => setIsAccountModalVisible(true)}
            style={styles.profileRow}
            hitSlop={6}>
            <View style={styles.avatarBorder}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={['#6366F1', '#A855F7']}
                  style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.greetingTextCol}>
              <Text style={[styles.greetingSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {greeting}
              </Text>
              <Text
                style={[styles.greetingName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </Pressable>

          {/* Right Notification Bell */}
          <View style={styles.headerRightActions}>
            <Pressable
              onPress={() => setIsWelcomeModalVisible(true)}
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              hitSlop={8}>
              <Ionicons name="sparkles-outline" size={18} color="#6366F1" />
            </Pressable>

            <Pressable
              onPress={() => router.push('/analytics')}
              style={[
                styles.iconCircleBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              hitSlop={8}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={isDark ? '#F8FAFC' : '#1E293B'}
              />
              <View style={styles.notifBadgeDot} />
            </Pressable>
          </View>
        </View>

        {/* Featured Banner Card: Data Structures (Purple Gradient + 3D Books & Cup) */}
        {/* Featured Banner Card (Dynamic & Purple Gradient + 3D Books & Cup) */}
        <LinearGradient
          colors={['#6366F1', '#7C3AED', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredCard}>
          <View style={styles.featuredLeftCol}>
            <Text style={styles.featuredTitle}>{featuredStats.title}</Text>
            <Text style={styles.featuredSub}>{featuredStats.subtitle}</Text>

            {/* Mini Progress Track */}
            <View style={styles.featuredProgressTrack}>
              <View
                style={[
                  styles.featuredProgressFill,
                  { width: `${Math.max(5, featuredStats.progress)}%` },
                ]}
              />
            </View>

            {/* Pill Button */}
            <Pressable onPress={featuredStats.action} style={styles.learnMoreBtn}>
              <Text style={styles.learnMoreBtnText}>{featuredStats.btnText}</Text>
            </Pressable>
          </View>

          {/* Right 3D Books Illustration */}
          <View style={styles.featuredImageWrap}>
            <Image
              source={require('@/assets/images/study_books_3d.jpg')}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        </LinearGradient>

        {/* Interactive Calendar with Daily, Monthly, and Yearly view modes */}
        <StudyCalendarCard
          selectedDate={selectedCalendarDate}
          onSelectDate={setSelectedCalendarDate}
          activeMode={calendarMode}
          onChangeMode={setCalendarMode}
          tasks={tasks}
          isDark={isDark}
        />

        {/* Section: Plan for Selected Date / Today */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {planSectionTitle}
          </Text>
          <Pressable onPress={() => router.push('/tasks')} hitSlop={8}>
            <Text style={[styles.seeAllText, { color: '#6366F1' }]}>See All</Text>
          </Pressable>
        </View>

        {/* Vertical List of Today's Plan Items or Empty State */}
        {displayPlanItems.length > 0 ? (
          <View style={styles.planItemsContainer}>
            {displayPlanItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if ('isUserTask' in item && item.isUserTask) {
                    toggleTask(item.id);
                  } else {
                    setIsTaskModalVisible(true);
                  }
                }}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#F1F5F9',
                  },
                ]}>
                {/* Left Tinted Icon Container */}
                <View style={[styles.planIconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.iconName} size={22} color={item.iconColor} />
                </View>

                {/* Middle Info */}
                <View style={styles.planCardMiddle}>
                  <Text
                    style={[
                      styles.planCardTitle,
                      { color: isDark ? '#FFFFFF' : '#0F172A' },
                      'completed' in item && Boolean((item as any).completed)
                        ? styles.titleCompleted
                        : null,
                    ]}
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.planMetaRow}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text style={[styles.planMetaText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      {item.duration}
                    </Text>
                    <Text style={[styles.planMetaDot, { color: isDark ? '#64748B' : '#CBD5E1' }]}>
                      •
                    </Text>
                    <Text style={[styles.planMetaText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      {item.type}
                    </Text>
                  </View>
                </View>

                {/* Right Circular Progress Gauge */}
                <View style={styles.gaugeContainer}>
                  <View
                    style={[
                      styles.gaugeOuterRing,
                      {
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderTopColor:
                          item.progress > 0 ? '#6366F1' : isDark ? '#334155' : '#E2E8F0',
                        borderRightColor:
                          item.progress >= 50 ? '#6366F1' : isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <Text style={[styles.gaugeText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                      {item.progress}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setIsTaskModalVisible(true)}
            style={[
              styles.emptyPlanCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#EDE9FE',
              },
            ]}>
            <View style={styles.emptyPlanIconCircle}>
              <Ionicons name="calendar-outline" size={28} color="#8B5CF6" />
            </View>
            <Text style={[styles.emptyPlanTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {isViewingToday && calendarMode === 'daily'
                ? 'No Study Plans for Today'
                : `No Plans Scheduled for ${selectedDateStr}`}
            </Text>
            <Text style={[styles.emptyPlanSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {isViewingToday
                ? 'Tap here to create university assignments, exam preparations, or daily revision plans.'
                : `Tap here to create a study plan or university task for this date.`}
            </Text>
            <View style={styles.emptyPlanActionBtn}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.emptyPlanActionBtnText}>Create Plan</Text>
            </View>
          </Pressable>
        )}

        {/* Action Buttons: Create Category & Create Work Plan */}
        <View style={styles.actionButtonsContainer}>
          {/* Create Category Button */}
          <Pressable
            onPress={() => setIsCategoryModalVisible(true)}
            style={({ pressed }) => [
              styles.createCategoryBtn,
              {
                backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF',
                borderColor: isDark ? '#3730A3' : '#E0E7FF',
              },
              pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
            ]}>
            <Ionicons name="folder-outline" size={18} color={isDark ? '#C7D2FE' : '#6366F1'} />
            <Text style={[styles.createCategoryText, { color: isDark ? '#C7D2FE' : '#6366F1' }]}>
              Create Category
            </Text>
          </Pressable>

          {/* Create Work Plan Button */}
          <Pressable
            onPress={() => setIsWorkPlanModalVisible(true)}
            style={({ pressed }) => [
              styles.createWorkPlanBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createWorkPlanGradient}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.createWorkPlanText}>Create Work Plan</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Bottom Tab Bar Spacing */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Screen 1 Welcome / Brand Modal */}
      <Modal
        visible={isWelcomeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsWelcomeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.welcomeModalCard, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <Pressable
              onPress={() => setIsWelcomeModalVisible(false)}
              style={styles.modalCloseBtn}
              hitSlop={10}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#0F172A'} />
            </Pressable>

            {/* StudyZen Logo & Brand */}
            <View style={styles.brandHeader}>
              <View style={styles.brandLogoCircle}>
                <Ionicons name="school" size={18} color="#6366F1" />
              </View>
              <Text style={[styles.brandTitle, { color: isDark ? '#FFF' : '#0F172A' }]}>
                StudyZen
              </Text>
            </View>

            {/* 3D Cute Robot Reading Illustration */}
            <Image
              source={require('@/assets/images/study_ai_mascot.jpg')}
              style={styles.welcomeRobotImage}
              resizeMode="contain"
            />

            {/* Headline */}
            <Text style={[styles.welcomeHeadline, { color: isDark ? '#FFF' : '#0F172A' }]}>
              Daily Focus{'\n'}Better Learning
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Learn better focus stronger grow every day build strong habits success
            </Text>

            {/* Bottom Swipe / Continue Button */}
            <Pressable
              onPress={() => setIsWelcomeModalVisible(false)}
              style={styles.welcomeContinueBtn}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.welcomeGradientBtn}>
                <Ionicons name="chevron-up" size={24} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>



      {/* Function Modals */}
      <ModalAddTask
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        initialDueDate={selectedDateStr}
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
      <AccountModal
        visible={isAccountModalVisible}
        onClose={() => setIsAccountModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarBorder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  greetingTextCol: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  featuredCard: {
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredLeftCol: {
    flex: 1.25,
    paddingRight: 6,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  featuredSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 12,
  },
  featuredProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  featuredProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  learnMoreBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  learnMoreBtnText: {
    color: '#6366F1',
    fontSize: 13,
    fontWeight: '700',
  },
  featuredImageWrap: {
    flex: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImage: {
    width: 118,
    height: 118,
    borderRadius: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  planItemsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  planIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  planCardMiddle: {
    flex: 1,
  },
  planCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  planMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  planMetaDot: {
    fontSize: 12,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  gaugeOuterRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  gaugeText: {
    fontSize: 11,
    fontWeight: '800',
    transform: [{ rotate: '45deg' }],
  },
  emptyPlanCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyPlanIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyPlanSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyPlanActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  emptyPlanActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },
  createCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 8,
  },
  createCategoryText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  createWorkPlanBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  createWorkPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  createWorkPlanText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeModalCard: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  brandLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  welcomeRobotImage: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  welcomeHeadline: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  welcomeContinueBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeGradientBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
