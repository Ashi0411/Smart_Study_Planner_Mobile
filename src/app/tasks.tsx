import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useStudy } from '@/context/StudyContext';
import { TaskItem } from '@/components/study/TaskItem';
import { ModalAddTask } from '@/components/study/ModalAddTask';
import { ModalLectureNotesHub } from '@/components/study/ModalLectureNotesHub';

type FilterType = 'all' | 'pending' | 'completed' | 'high';

export default function TasksScreen() {
  const { tasks, categories, colors } = useStudy();
  const params = useLocalSearchParams<{ categoryId?: string; subcategoryId?: string }>();

  const [selectedCatId, setSelectedCatId] = useState<string>(
    params.categoryId || categories[0]?.id || 'cat-uni-works'
  );
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>(
    params.subcategoryId || 'all'
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState<boolean>(false);

  // Filtering - strictly show tasks relevant to this category!
  const filteredTasks = tasks.filter((t) => {
    if (activeCategory && t.categoryId !== activeCategory.id) {
      return false;
    }

    // Status filter
    if (activeFilter === 'pending' && t.completed) return false;
    if (activeFilter === 'completed' && !t.completed) return false;
    if (activeFilter === 'high' && t.priority !== 'high') return false;

    // Subcategory filter
    if (
      selectedSubcategoryFilter !== 'all' &&
      t.subcategoryId !== selectedSubcategoryFilter
    ) {
      return false;
    }

    return true;
  });

  const categoryTasks = tasks.filter(
    (t) => !activeCategory || t.categoryId === activeCategory.id
  );
  const pendingCount = categoryTasks.filter((t) => !t.completed).length;
  const completedCount = categoryTasks.filter((t) => t.completed).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Works Hub Selector (University Works vs English Work) */}
      <View style={[styles.mainHubSelector, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {categories.map((cat) => {
          const isSelected = activeCategory?.id === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                setSelectedCatId(cat.id);
                setSelectedSubcategoryFilter('all');
              }}
              style={[
                styles.hubTab,
                isSelected && { backgroundColor: cat.color },
              ]}>
              <Ionicons
                name={(cat.icon as any) || 'folder'}
                size={16}
                color={isSelected ? '#FFF' : cat.color}
              />
              <Text
                style={[
                  styles.hubTabText,
                  { color: isSelected ? '#FFF' : colors.text },
                ]}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activeCategory?.name || 'University Works'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {pendingCount} pending • {completedCount} completed
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => setIsNotesModalVisible(true)}
            style={[styles.notesBtn, { backgroundColor: activeCategory?.color + '18', borderColor: activeCategory?.color + '40' }]}>
            <Ionicons name="document-text" size={16} color={activeCategory?.color || colors.primary} />
            <Text style={[styles.notesBtnText, { color: activeCategory?.color || colors.primary }]}>Notes & Quizzes</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsModalVisible(true)}
            style={[styles.addBtn, { backgroundColor: activeCategory?.color || colors.primary }]}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Task</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'all', label: `All (${categoryTasks.length})` },
          { key: 'high', label: 'Urgent 🔥' },
          { key: 'completed', label: `Done (${completedCount})` },
        ].map((f) => {
          const isSelected = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key as FilterType)}
              style={[
                styles.filterTab,
                isSelected && { backgroundColor: activeCategory?.color || colors.primary },
              ]}>
              <Text
                style={[
                  styles.filterTabText,
                  { color: isSelected ? '#FFF' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                ]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Subcategory Filter Pills for Active Category */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <View style={styles.subjectFilterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
            <Pressable
              onPress={() => setSelectedSubcategoryFilter('all')}
              style={[
                styles.subPill,
                {
                  backgroundColor: selectedSubcategoryFilter === 'all' ? activeCategory.color : colors.card,
                  borderColor: selectedSubcategoryFilter === 'all' ? activeCategory.color : colors.cardBorder,
                },
              ]}>
              <Text
                style={[
                  styles.subPillText,
                  { color: selectedSubcategoryFilter === 'all' ? '#FFF' : colors.text },
                ]}>
                All Subcategories
              </Text>
            </Pressable>

            {activeCategory.subcategories.map((sub) => {
              const isSelected = selectedSubcategoryFilter === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  onPress={() => setSelectedSubcategoryFilter(sub.id)}
                  style={[
                    styles.subPill,
                    {
                      backgroundColor: isSelected ? activeCategory.color : colors.card,
                      borderColor: isSelected ? activeCategory.color : colors.cardBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.subPillText,
                      { color: isSelected ? '#FFF' : colors.text },
                    ]}>
                    {sub.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem task={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tasks Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeFilter === 'completed'
                ? 'No completed tasks yet. Finish a pending task!'
                : 'All clear! Tap "New Task" above to add an assignment or reading goal.'}
            </Text>
          </View>
        }
      />

      {/* Modal Add Task */}
      <ModalAddTask visible={isModalVisible} onClose={() => setIsModalVisible(false)} />

      {/* Modal Lecture Notes & Quizzes */}
      <ModalLectureNotesHub
        visible={isNotesModalVisible}
        onClose={() => setIsNotesModalVisible(false)}
        category={activeCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainHubSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
  },
  hubTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 11,
  },
  hubTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  notesBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabText: {
    fontSize: 12,
  },
  subjectFilterWrap: {
    marginBottom: 12,
  },
  subjectScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
