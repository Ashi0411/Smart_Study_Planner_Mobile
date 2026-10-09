import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { Colors } from '@/constants/theme';
import { TaskItem } from '@/components/study/TaskItem';
import { ModalAddTask } from '@/components/study/ModalAddTask';

type FilterType = 'all' | 'pending' | 'completed' | 'high';

export default function TasksScreen() {
  const { tasks, subjects } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    // Status filter
    if (activeFilter === 'pending' && t.completed) return false;
    if (activeFilter === 'completed' && !t.completed) return false;
    if (activeFilter === 'high' && t.priority !== 'high') return false;

    // Subject filter
    if (selectedSubjectFilter !== 'all' && t.subjectId !== selectedSubjectFilter) {
      return false;
    }

    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Study Tasks</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {pendingCount} pending • {completedCount} completed
          </Text>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>New Task</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'all', label: `All (${tasks.length})` },
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
                isSelected && { backgroundColor: colors.primary },
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

      {/* Subject Filter Pills */}
      <View style={styles.subjectFilterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
          <Pressable
            onPress={() => setSelectedSubjectFilter('all')}
            style={[
              styles.subPill,
              {
                backgroundColor: selectedSubjectFilter === 'all' ? colors.primary : colors.card,
                borderColor: selectedSubjectFilter === 'all' ? colors.primary : colors.cardBorder,
              },
            ]}>
            <Text
              style={[
                styles.subPillText,
                { color: selectedSubjectFilter === 'all' ? '#FFF' : colors.text },
              ]}>
              All Subjects
            </Text>
          </Pressable>

          {subjects.map((sub) => {
            const isSelected = selectedSubjectFilter === sub.id;
            return (
              <Pressable
                key={sub.id}
                onPress={() => setSelectedSubjectFilter(sub.id)}
                style={[
                  styles.subPill,
                  {
                    backgroundColor: isSelected ? sub.color : colors.card,
                    borderColor: isSelected ? sub.color : colors.cardBorder,
                  },
                ]}>
                <Ionicons
                  name={(sub.icon as any) || 'book'}
                  size={12}
                  color={isSelected ? '#FFF' : sub.color}
                />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
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
