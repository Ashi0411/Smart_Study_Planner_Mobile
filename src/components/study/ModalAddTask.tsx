import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { Priority } from '@/types/study';
import { Colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ModalAddTask: React.FC<Props> = ({ visible, onClose }) => {
  const { subjects, addTask } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);

  const [dateOptions] = useState(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return {
      todayStr: today.toISOString().split('T')[0],
      tomorrowStr: tomorrow.toISOString().split('T')[0],
      nextWeekStr: nextWeek.toISOString().split('T')[0],
    };
  });

  const [dueDate, setDueDate] = useState<string>(() => dateOptions.todayStr);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      subjectId: selectedSubjectId,
      dueDate,
      priority,
      estimatedMinutes,
    });
    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>Add New Study Task</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Title Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>TASK TITLE</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="e.g. Finish Calculus Homework Chapter 4"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Subject Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>SELECT SUBJECT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    onPress={() => setSelectedSubjectId(sub.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? sub.color : colors.backgroundElement,
                        borderColor: isSelected ? sub.color : colors.cardBorder,
                      },
                    ]}>
                    <Ionicons
                      name={(sub.icon as any) || 'book'}
                      size={14}
                      color={isSelected ? '#FFF' : sub.color}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                      ]}>
                      {sub.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Priority */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>PRIORITY</Text>
            <View style={styles.pillsRow}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const pColor = p === 'high' ? colors.danger : p === 'medium' ? colors.warning : colors.success;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? pColor : colors.backgroundElement,
                        borderColor: isSelected ? pColor : colors.cardBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFF' : colors.text, textTransform: 'capitalize' },
                      ]}>
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Due Date quick picker */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>DUE DATE</Text>
            <View style={styles.pillsRow}>
              {[
                { label: 'Today', date: dateOptions.todayStr },
                { label: 'Tomorrow', date: dateOptions.tomorrowStr },
                { label: 'Next Week', date: dateOptions.nextWeekStr },
              ].map((item) => {
                const isSelected = dueDate === item.date;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setDueDate(item.date)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFF' : colors.text },
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Estimated Minutes */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>ESTIMATED TIME</Text>
            <View style={styles.pillsRow}>
              {[15, 30, 45, 60, 90].map((mins) => {
                const isSelected = estimatedMinutes === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => setEstimatedMinutes(mins)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}>
                    <Text style={[styles.pillText, { color: isSelected ? '#FFF' : colors.text }]}>
                      {mins}m
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={!title.trim()}
              style={[
                styles.btn,
                styles.submitBtn,
                { backgroundColor: title.trim() ? colors.primary : colors.cardBorder },
              ]}>
              <Text style={[styles.btnText, { color: '#FFF' }]}>Create Task</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  submitBtn: {},
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
