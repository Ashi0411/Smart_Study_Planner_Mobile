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
import { ScheduleItem } from '@/components/study/ScheduleItem';
import { ModalAddSchedule } from '@/components/study/ModalAddSchedule';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function ScheduleScreen() {
  const { schedule } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const todayDayOfWeek = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayDayOfWeek);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Filter sessions for selected day and sort chronologically
  const daySessions = schedule
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayLabel = DAYS.find((d) => d.value === selectedDay)?.label;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Timetable</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {daySessions.length} session{daySessions.length !== 1 ? 's' : ''} on {dayLabel}
          </Text>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add Session</Text>
        </Pressable>
      </View>

      {/* Weekday Strip */}
      <View style={styles.daysStripWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.value;
            const isToday = todayDayOfWeek === d.value;
            return (
              <Pressable
                key={d.value}
                onPress={() => setSelectedDay(d.value)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.dayCardLabel,
                    { color: isSelected ? '#FFF' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}>
                  {d.label}
                </Text>
                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      { backgroundColor: isSelected ? '#FFF' : colors.primary },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sessions List */}
      <FlatList
        data={daySessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScheduleItem session={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={56} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Sessions Scheduled</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You have no classes or study blocks scheduled for this day. Tap &ldquo;Add Session&rdquo; to create one.
            </Text>
          </View>
        }
      />

      {/* Modal Add Schedule */}
      <ModalAddSchedule
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        defaultDayOfWeek={selectedDay}
      />
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
  daysStripWrapper: {
    marginBottom: 16,
  },
  daysScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayCard: {
    width: 52,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayCardLabel: {
    fontSize: 13,
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
