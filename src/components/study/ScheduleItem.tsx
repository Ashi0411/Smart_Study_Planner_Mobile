import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleSession } from '@/types/study';
import { useStudy } from '@/context/StudyContext';
import { Colors } from '@/constants/theme';
import { SubjectBadge } from './SubjectBadge';

interface Props {
  session: ScheduleSession;
}

export const ScheduleItem: React.FC<Props> = ({ session }) => {
  const { toggleScheduleSession, deleteScheduleSession, getSubjectById } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const subject = getSubjectById(session.subjectId);
  const accentColor = subject?.color || colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: session.completed ? 0.65 : 1,
        },
      ]}>
      {/* Subject accent left bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Time column */}
      <View style={styles.timeColumn}>
        <Text style={[styles.timeStart, { color: colors.text }]}>{session.startTime}</Text>
        <Text style={[styles.timeEnd, { color: colors.textSecondary }]}>{session.endTime}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {subject && <SubjectBadge subject={subject} size="sm" />}
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.topic,
            {
              color: colors.text,
              textDecorationLine: session.completed ? 'line-through' : 'none',
            },
          ]}>
          {session.topic}
        </Text>

        {session.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {session.location}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleScheduleSession(session.id)}
          hitSlop={8}
          style={[
            styles.checkBtn,
            {
              borderColor: session.completed ? colors.success : colors.cardBorder,
              backgroundColor: session.completed ? colors.success : 'transparent',
            },
          ]}>
          <Ionicons
            name="checkmark"
            size={14}
            color={session.completed ? '#FFF' : colors.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={() => deleteScheduleSession(session.id)}
          hitSlop={8}
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}>
          <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  accentBar: {
    width: 5,
    alignSelf: 'stretch',
  },
  timeColumn: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeStart: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeEnd: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  headerRow: {
    marginBottom: 4,
  },
  topic: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
});
