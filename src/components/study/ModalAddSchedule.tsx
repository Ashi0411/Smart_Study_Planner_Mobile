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
import { Colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultDayOfWeek?: number;
}

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const ModalAddSchedule: React.FC<Props> = ({
  visible,
  onClose,
  defaultDayOfWeek = new Date().getDay(),
}) => {
  const { subjects, addScheduleSession } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [topic, setTopic] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<number>(defaultDayOfWeek);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (!topic.trim()) return;
    addScheduleSession({
      topic: topic.trim(),
      subjectId: selectedSubjectId,
      dayOfWeek,
      startTime,
      endTime,
      location: location.trim() || undefined,
    });
    setTopic('');
    setLocation('');
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
            <Text style={[styles.heading, { color: colors.text }]}>Add Schedule Session</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Topic Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>TOPIC / CLASS NAME</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="e.g. Physics Quantum Mechanics Lecture"
              placeholderTextColor={colors.textSecondary}
              value={topic}
              onChangeText={setTopic}
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

            {/* Day Selector */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>DAY OF WEEK</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d) => {
                const isSelected = dayOfWeek === d.value;
                return (
                  <Pressable
                    key={d.value}
                    onPress={() => setDayOfWeek(d.value)}
                    style={[
                      styles.dayPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundElement,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                      ]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time Pickers */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>START TIME</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>END TIME</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:30"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Location / Room */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>LOCATION / ROOM (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="e.g. Science Auditorium or Zoom Link"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={!topic.trim()}
              style={[
                styles.btn,
                { backgroundColor: topic.trim() ? colors.primary : colors.cardBorder },
              ]}>
              <Text style={[styles.btnText, { color: '#FFF' }]}>Add Session</Text>
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
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
