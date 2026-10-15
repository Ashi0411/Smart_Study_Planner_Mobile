import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTask } from '@/types/study';
import { useStudy } from '@/context/StudyContext';
import { SubjectBadge } from './SubjectBadge';
import { PriorityBadge } from './PriorityBadge';
import { ModalTaskFolder } from './ModalTaskFolder';

interface Props {
  task: StudyTask;
}

export const TaskItem: React.FC<Props> = ({ task }) => {
  const {
    toggleTask,
    deleteTask,
    getCategoryById,
    getSubcategoryById,
    toggleTaskSubItem,
    addTaskSubItem,
    deleteTaskSubItem,
    updateTaskSubItem,
    colors,
  } = useStudy();

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubTitle, setEditingSubTitle] = useState('');
  const [newSubTitle, setNewSubTitle] = useState('');
  const [isModalFolderVisible, setIsModalFolderVisible] = useState(false);

  const category = getCategoryById(task.categoryId);
  const subcategory = getSubcategoryById(task.categoryId, task.subcategoryId);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = task.dueDate === todayStr;
  const isOverdue = !task.completed && task.dueDate < todayStr;

  const subtasks = task.subtasks || [];
  const completedSubs = subtasks.filter((s) => s.completed).length;

  const handleSaveEditSub = (subId: string) => {
    if (!editingSubTitle.trim()) return;
    updateTaskSubItem(task.id, subId, editingSubTitle.trim());
    setEditingSubId(null);
    setEditingSubTitle('');
  };

  const handleAddNewSub = () => {
    if (!newSubTitle.trim()) return;
    addTaskSubItem(task.id, newSubTitle.trim());
    setNewSubTitle('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: task.completed ? 0.75 : 1,
        },
      ]}>
      {/* Top Main Row */}
      <View style={styles.topRow}>
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
          <Pressable onPress={() => setIsExpanded(!isExpanded)}>
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
          </Pressable>

          <View style={styles.badgesRow}>
            {category && (
              <SubjectBadge
                category={category}
                subcategoryName={subcategory?.name}
                size="sm"
              />
            )}
            <PriorityBadge priority={task.priority} />

            {/* Subtasks counter badge */}
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              style={[
                styles.subsBadge,
                {
                  backgroundColor: isExpanded
                    ? (category?.color || colors.primary) + '22'
                    : colors.backgroundElement,
                  borderColor: isExpanded
                    ? category?.color || colors.primary
                    : colors.cardBorder,
                },
              ]}>
              <Ionicons
                name="layers-outline"
                size={11}
                color={category?.color || colors.primary}
              />
              <Text
                style={[
                  styles.subsBadgeText,
                  { color: category?.color || colors.primary },
                ]}>
                {subtasks.length > 0 ? `${completedSubs}/${subtasks.length} steps` : 'Steps'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={11}
                color={category?.color || colors.primary}
              />
            </Pressable>

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

        {/* Right Action Icons: Folder/AI & Delete */}
        <View style={styles.rightActions}>
          <Pressable
            onPress={() => setIsModalFolderVisible(true)}
            hitSlop={8}
            style={styles.actionBtn}>
            <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => deleteTask(task.id)}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.5 }]}>
            <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Expandable Sub-tasks Checklist */}
      {isExpanded && (
        <View style={[styles.expandedBox, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.expandedHeader}>
            <Text style={[styles.expandedTitle, { color: colors.textSecondary }]}>
              SUB-TASKS ({completedSubs}/{subtasks.length})
            </Text>
            <Pressable
              onPress={() => setIsModalFolderVisible(true)}
              style={styles.openAiFolderLink}>
              <Ionicons name="sparkles" size={12} color="#8B5CF6" />
              <Text style={styles.openAiFolderText}>AI Bot & Folder</Text>
            </Pressable>
          </View>

          {/* Subtask list */}
          {subtasks.map((st) => {
            const isEditingThis = editingSubId === st.id;
            if (isEditingThis) {
              return (
                <View
                  key={st.id}
                  style={[
                    styles.subtaskRow,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: category?.color || colors.primary,
                    },
                  ]}>
                  <TextInput
                    style={[styles.subtaskEditInput, { color: colors.text }]}
                    value={editingSubTitle}
                    onChangeText={setEditingSubTitle}
                    autoFocus
                    onSubmitEditing={() => handleSaveEditSub(st.id)}
                    returnKeyType="done"
                  />
                  <View style={styles.subtaskActionButtons}>
                    <Pressable
                      onPress={() => handleSaveEditSub(st.id)}
                      hitSlop={6}
                      style={[
                        styles.miniBtnCheck,
                        { backgroundColor: category?.color || colors.primary },
                      ]}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </Pressable>
                    <Pressable
                      onPress={() => setEditingSubId(null)}
                      hitSlop={6}
                      style={styles.miniBtnClose}>
                      <Ionicons name="close" size={13} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={st.id}
                style={[
                  styles.subtaskRow,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <Pressable
                  onPress={() => toggleTaskSubItem(task.id, st.id)}
                  style={styles.subtaskCheckArea}>
                  <View
                    style={[
                      styles.subCheckbox,
                      st.completed && {
                        backgroundColor: category?.color || colors.primary,
                        borderColor: category?.color || colors.primary,
                      },
                    ]}>
                    {st.completed && <Ionicons name="checkmark" size={11} color="#FFF" />}
                  </View>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      { color: colors.text },
                      st.completed && styles.subtaskTitleDone,
                    ]}>
                    {st.title}
                  </Text>
                </Pressable>

                <View style={styles.subtaskActionButtons}>
                  <Pressable
                    onPress={() => {
                      setEditingSubId(st.id);
                      setEditingSubTitle(st.title);
                    }}
                    hitSlop={6}
                    style={styles.miniActionBtn}>
                    <Ionicons name="pencil-outline" size={13} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteTaskSubItem(task.id, st.id)}
                    hitSlop={6}
                    style={styles.miniActionBtn}>
                    <Ionicons name="trash-outline" size={13} color={colors.danger || '#EF4444'} />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {/* Quick Add Subtask row */}
          <View style={[styles.addSubRow, { borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.addSubInput, { color: colors.text }]}
              placeholder="Add step or sub-task..."
              placeholderTextColor={colors.textSecondary}
              value={newSubTitle}
              onChangeText={setNewSubTitle}
              onSubmitEditing={handleAddNewSub}
            />
            <Pressable
              onPress={handleAddNewSub}
              disabled={!newSubTitle.trim()}
              style={[
                styles.addSubBtn,
                {
                  backgroundColor: newSubTitle.trim()
                    ? category?.color || colors.primary
                    : colors.cardBorder,
                },
              ]}>
              <Ionicons name="add" size={14} color="#FFF" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Modal Task Folder (with AI Bot) */}
      <ModalTaskFolder
        visible={isModalFolderVisible}
        onClose={() => setIsModalFolderVisible(false)}
        task={task}
        folderCategoryName={category?.name}
        folderSubcategoryName={subcategory?.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  subsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  subsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueText: {
    fontSize: 11,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  actionBtn: {
    padding: 6,
  },
  /* Expanded subtasks */
  expandedBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  openAiFolderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openAiFolderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  subtaskCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  subtaskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  subtaskActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniActionBtn: {
    padding: 3,
  },
  subtaskEditInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  miniBtnCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnClose: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  addSubInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
  },
  addSubBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

