import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask } from '@/types/study';
import { useStudy } from '@/context/StudyContext';
import { SubjectBadge } from './SubjectBadge';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  task: StudyTask;
}

export const TaskItem: React.FC<Props> = ({ task }) => {
  const { toggleTask, deleteTask, getCategoryById, getSubcategoryById, colors } = useStudy();
  const category = getCategoryById(task.categoryId);
  const subcategory = getSubcategoryById(task.categoryId, task.subcategoryId);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = task.dueDate === todayStr;
  const isOverdue = !task.completed && task.dueDate < todayStr;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: task.completed ? 0.65 : 1,
        },
      ]}>
      {/* Checkbox */}
      <Pressable
        onPress={() => toggleTask(task.id)}
        hitSlop={8}
        style={[
          styles.checkbox,
          {
            borderColor: task.completed ? colors.primary : colors.textSecondary,
            backgroundColor: task.completed ? colors.primary : 'transparent',
          },
        ]}>
        {task.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </Pressable>

      {/* Main Info */}
      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              color: colors.text,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            },
          ]}>
          {task.title}
        </Text>

        <View style={styles.badgesRow}>
          {category && (
            <SubjectBadge
              category={category}
              subcategoryName={subcategory?.name}
              size="sm"
            />
          )}
          <PriorityBadge priority={task.priority} />

          {/* Due date */}
          <View style={styles.dueWrap}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={isOverdue ? colors.danger : isToday ? colors.warning : colors.textSecondary}
            />
            <Text
              style={[
                styles.dueText,
                {
                  color: isOverdue ? colors.danger : isToday ? colors.warning : colors.textSecondary,
                  fontWeight: isOverdue || isToday ? '700' : '500',
                },
              ]}>
              {isToday ? 'Today' : isOverdue ? 'Overdue' : task.dueDate}
            </Text>
          </View>

          {task.estimatedMinutes ? (
            <View style={styles.dueWrap}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.dueText, { color: colors.textSecondary }]}>
                {task.estimatedMinutes}m
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Delete button */}
      <Pressable
        onPress={() => deleteTask(task.id)}
        hitSlop={8}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}>
        <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueText: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
});
