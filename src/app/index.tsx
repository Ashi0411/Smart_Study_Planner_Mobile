import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Platform,
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
import { StudyTask, Category } from '@/types/study';
import { StudyCalendarCard, CalendarMode } from '@/components/study/StudyCalendarCard';
import { CategoryCard } from '@/components/study/CategoryCard';
import { ModalTaskFolder } from '@/components/study/ModalTaskFolder';
import { ModalCategoryFolder } from '@/components/study/ModalCategoryFolder';
import { ModalAIChat } from '@/components/study/ModalAIChat';
import { ModalLectureNotesHub } from '@/components/study/ModalLectureNotesHub';



export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const {
    categories,
    tasks,
    themeMode,
    lectureNotes,
    quizRecords,
    toggleTask,
  } = useStudy();

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isWorkPlanModalVisible, setIsWorkPlanModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);
  const [isTaskFolderModalVisible, setIsTaskFolderModalVisible] = useState(false);
  const [selectedFolderTask, setSelectedFolderTask] = useState<StudyTask | null>(null);
  const [selectedFolderCategory, setSelectedFolderCategory] = useState<Category | null>(null);
  const [initialSubFolderId, setInitialSubFolderId] = useState<string | undefined>(undefined);
  const [isCategoryFolderModalVisible, setIsCategoryFolderModalVisible] = useState(false);
  const [isAiChatVisible, setIsAiChatVisible] = useState(false);
  const [isNotesHubVisible, setIsNotesHubVisible] = useState(false);
  const [notesHubCategory, setNotesHubCategory] = useState<Category | null>(null);

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


  // Open Category Folder Interface from main category or subcategory
  const handleOpenCategoryFolder = useCallback(
    (cat: Category, subId?: string) => {
      setSelectedFolderCategory(cat);
      setInitialSubFolderId(subId || 'all');
      setIsCategoryFolderModalVisible(true);
    },
    []
  );

  const handleOpenNotesHub = useCallback((cat: Category) => {
    setNotesHubCategory(cat);
    setIsNotesHubVisible(true);
  }, []);

  // Open folder for a clicked task card
  const handleOpenTaskFolder = useCallback(
    (taskId: string) => {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setSelectedFolderTask(found);
        setIsTaskFolderModalVisible(true);
      }
    },
    [tasks]
  );

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
      const subsCount = t.subtasks?.length || 0;
      const subsDone = t.subtasks?.filter((s) => s.completed).length || 0;
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
        subsCount,
        subsDone,
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
      btnText: 'Add First Plan',
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
                    handleOpenTaskFolder(item.id);
                  } else {
                    setIsTaskModalVisible(true);
                  }
                }}
                style={({ pressed, hovered }: any) => [
                  styles.planCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#F1F5F9',
                  },
                  hovered && styles.planCardHovered,
                  pressed && styles.btnPressed,
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
                      name="folder-outline"
                      size={12}
                      color={item.iconColor}
                    />
                    <Text
                      style={[
                        styles.planMetaText,
                        { color: item.iconColor, fontWeight: '700' },
                      ]}>
                      {item.type}
                    </Text>
                    {item.subsCount > 0 ? (
                      <>
                        <Text style={[styles.planMetaDot, { color: isDark ? '#64748B' : '#CBD5E1' }]}>
                          •
                        </Text>
                        <Ionicons
                          name="checkbox-outline"
                          size={12}
                          color={isDark ? '#94A3B8' : '#64748B'}
                        />
                        <Text style={[styles.planMetaText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                          {item.subsDone}/{item.subsCount} steps
                        </Text>
                      </>
                    ) : null}
                    <Text style={[styles.planMetaDot, { color: isDark ? '#64748B' : '#CBD5E1' }]}>
                      •
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text style={[styles.planMetaText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                      {item.duration}
                    </Text>
                  </View>
                </View>

                {/* Right Circular Progress Gauge */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleTask(item.id);
                  }}
                  hitSlop={8}
                  style={styles.gaugeContainer}>
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
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyPlanCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#EDE9FE',
              },
            ]}>
            <View style={styles.emptyPlanIconCircle}>
              <Ionicons name="calendar-outline" size={28} color="#7C3AED" />
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
            <Pressable
              onPress={() => setIsTaskModalVisible(true)}
              style={({ pressed, hovered }: any) => [
                styles.emptyPlanActionBtn,
                (hovered || pressed) && styles.emptyPlanActionBtnHovered,
                pressed && styles.btnPressed,
              ]}>
              <LinearGradient
                colors={['#7C3AED', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyPlanActionGradient}>
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.emptyPlanActionBtnText}>Create Plan</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}


        {/* AI Lecture Notes & Quizzes Hub Section */}
        <View style={styles.notesHubSection}>
          <View style={styles.notesHubSectionHeader}>
            <View style={styles.categoriesSectionTitleRow}>
              <View
                style={[
                  styles.categoriesIconCircle,
                  { backgroundColor: isDark ? '#312E81' : '#EEF2FF' },
                ]}>
                <Ionicons name="sparkles" size={17} color="#6366F1" />
              </View>
              <View>
                <Text
                  style={[
                    styles.categoriesSectionTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  AI Lecture Notes & Quizzes
                </Text>
                <Text
                  style={[
                    styles.categoriesSectionSubtitle,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Upload Notes • Short Notes (සිංහල / EN) • Quizzes
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.notesHubCardsRow}>
            {categories.slice(0, 2).map((cat) => {
              const notesCount = lectureNotes.filter((n) => n.categoryId === cat.id).length;
              const quizCount = quizRecords.filter((q) => q.categoryId === cat.id).length;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleOpenNotesHub(cat)}
                  style={[
                    styles.notesHubCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <View style={[styles.notesHubCardIconWrap, { backgroundColor: cat.color + '1A' }]}>
                    <Ionicons
                      name={(cat.icon as any) || 'school'}
                      size={20}
                      color={cat.color}
                    />
                  </View>
                  <Text style={[styles.notesHubCardName, { color: isDark ? '#FFF' : '#0F172A' }]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.notesHubCardMeta, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {notesCount} notes • {quizCount} quizzes
                  </Text>
                  <View style={[styles.notesHubCardAction, { backgroundColor: cat.color }]}>
                    <Text style={styles.notesHubCardActionText}>Open Hub</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFF" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Categories & Subjects Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesSectionHeader}>
            <View style={styles.categoriesSectionTitleRow}>
              <View
                style={[
                  styles.categoriesIconCircle,
                  { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' },
                ]}>
                <Ionicons name="folder-open" size={17} color="#6366F1" />
              </View>
              <View>
                <Text
                  style={[
                    styles.categoriesSectionTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Work Plan Categories
                </Text>
                <Text
                  style={[
                    styles.categoriesSectionSubtitle,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  {categories.length} active work plan categories
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setIsCategoryModalVisible(true)}
              hitSlop={8}
              style={({ pressed, hovered }: any) => [
                styles.addCategoryHeaderBtn,
                {
                  backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                  borderColor: isDark ? '#3730A3' : '#C7D2FE',
                },
                (hovered || pressed) && { opacity: 0.8 },
              ]}>
              <Ionicons name="add" size={15} color="#6366F1" />
              <Text style={styles.addCategoryHeaderBtnText}>Category</Text>
            </Pressable>
          </View>

          {/* Category Cards List */}
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelectCategory={() => handleOpenCategoryFolder(cat)}
              onSelectSubcategory={(category, subcategory) =>
                handleOpenCategoryFolder(category, subcategory.id)
              }
            />
          ))}
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

      {/* Task Folder & Sub-tasks View with AI Bot */}
      <ModalTaskFolder
        key={selectedFolderTask?.id || 'none'}
        visible={isTaskFolderModalVisible}
        onClose={() => {
          setIsTaskFolderModalVisible(false);
          setSelectedFolderTask(null);
        }}
        task={
          selectedFolderTask
            ? tasks.find((t) => t.id === selectedFolderTask.id) || selectedFolderTask
            : null
        }
      />

      {/* Dedicated AI Study Bot Assistant Modal */}
      <ModalAIChat
        visible={isAiChatVisible}
        onClose={() => setIsAiChatVisible(false)}
      />

      {/* Main Category Folder & Sub-tasks Hub Modal with AI Bot */}
      <ModalCategoryFolder
        key={selectedFolderCategory?.id ? `${selectedFolderCategory.id}-${initialSubFolderId}` : 'none'}
        visible={isCategoryFolderModalVisible}
        onClose={() => {
          setIsCategoryFolderModalVisible(false);
          setSelectedFolderCategory(null);
          setInitialSubFolderId(undefined);
        }}
        category={
          selectedFolderCategory
            ? categories.find((c) => c.id === selectedFolderCategory.id) || selectedFolderCategory
            : null
        }
        initialSubcategoryId={initialSubFolderId}
      />

      {/* Floating AI Study Bot Button */}
      <Pressable
        onPress={() => setIsAiChatVisible(true)}
        style={({ pressed, hovered }: any) => [
          styles.floatingAiFab,
          hovered && styles.floatingAiFabHovered,
          pressed && styles.btnPressed,
        ]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingAiFabGradient}>
          <Ionicons name="sparkles" size={17} color="#FFF" />
          <Text style={styles.floatingAiFabText}>Ask AI Bot</Text>
        </LinearGradient>
      </Pressable>

      {/* AI Lecture Notes & Quizzes Hub Modal */}
      <ModalLectureNotesHub
        visible={isNotesHubVisible}
        onClose={() => setIsNotesHubVisible(false)}
        category={notesHubCategory}
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyPlanActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  emptyPlanActionBtnHovered: {
    transform: [{ translateY: -1.5 }],
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 7,
    elevation: 4,
  },
  emptyPlanActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  categoriesSection: {
    marginTop: 6,
    marginBottom: 20,
  },
  categoriesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  categoriesSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoriesIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  categoriesSectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  addCategoryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  addCategoryHeaderBtnText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '700',
  },
  planCardHovered: {
    transform: [{ translateY: -1.5 }],
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
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
  floatingAiFab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 84 : 76,
    right: 20,
    borderRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  floatingAiFabHovered: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  floatingAiFabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  floatingAiFabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  /* Notes Hub Section styles */
  notesHubSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  notesHubSectionHeader: {
    marginBottom: 12,
  },
  notesHubCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  notesHubCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notesHubCardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notesHubCardName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  notesHubCardMeta: {
    fontSize: 11,
    marginBottom: 10,
  },
  notesHubCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 10,
  },
  notesHubCardActionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
