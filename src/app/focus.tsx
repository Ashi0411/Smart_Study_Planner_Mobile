import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/context/StudyContext';
import { Colors } from '@/constants/theme';
import { FocusMode } from '@/types/study';
import { SubjectBadge } from '@/components/study/SubjectBadge';

const MODE_DURATIONS: Record<FocusMode, number> = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export default function FocusScreen() {
  const { subjects, logFocusSession, todayFocusMinutes } = useStudy();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [mode, setMode] = useState<FocusMode>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Switch mode
  const handleModeChange = useCallback((newMode: FocusMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  }, []);

  const handleSessionComplete = useCallback(() => {
    const durationMinutes = Math.floor(MODE_DURATIONS[mode] / 60);
    logFocusSession(durationMinutes, mode, selectedSubjectId);
    if (mode === 'pomodoro') {
      setSessionsCompletedToday((c) => c + 1);
      Alert.alert(
        '🎉 Focus Session Done!',
        `Awesome work! You completed ${durationMinutes} minutes of focused study. Time for a well-deserved break!`
      );
      handleModeChange('short_break');
    } else {
      Alert.alert('Break Finished', 'Ready to dive back into learning?');
      handleModeChange('pomodoro');
    }
  }, [mode, selectedSubjectId, logFocusSession, handleModeChange]);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleSessionComplete]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Focus Timer</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Master your attention with the Pomodoro technique
          </Text>
        </View>

        {/* Mode Switcher */}
        <View style={[styles.modeTabs, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {(['pomodoro', 'short_break', 'long_break'] as FocusMode[]).map((m) => {
            const isSelected = mode === m;
            const label =
              m === 'pomodoro' ? 'Focus (25m)' : m === 'short_break' ? 'Short Break (5m)' : 'Long Break (15m)';
            return (
              <Pressable
                key={m}
                onPress={() => handleModeChange(m)}
                style={[
                  styles.modeTab,
                  isSelected && {
                    backgroundColor: colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.modeTabText,
                    { color: isSelected ? '#FFF' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Big Circular Display */}
        <View style={styles.timerWrapper}>
          <View
            style={[
              styles.timerRing,
              {
                borderColor: isRunning ? colors.primary : colors.cardBorder,
                backgroundColor: colors.card,
              },
            ]}>
            <Text style={[styles.timeText, { color: colors.text }]}>{timeFormatted}</Text>
            <View style={styles.modeStatusRow}>
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: isRunning ? colors.success : colors.textSecondary },
                ]}
              />
              <Text style={[styles.modeStatusText, { color: colors.textSecondary }]}>
                {isRunning ? 'IN PROGRESS' : 'READY'} • {progressPercent}%
              </Text>
            </View>

            {selectedSubject && (
              <View style={styles.timerSubject}>
                <SubjectBadge subject={selectedSubject} size="sm" />
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={resetTimer}
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="refresh-outline" size={24} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={toggleTimer}
            style={[
              styles.primaryBtn,
              { backgroundColor: isRunning ? colors.danger : colors.primary },
            ]}>
            <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#FFF" />
            <Text style={styles.primaryBtnText}>{isRunning ? 'Pause' : 'Start Focus'}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (timeLeft > 60) setTimeLeft((t) => t - 60);
            }}
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="play-forward-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Subject Picker for Focus */}
        <View style={styles.subjectSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TAG STUDY SUBJECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsRow}>
            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  onPress={() => setSelectedSubjectId(sub.id)}
                  style={[
                    styles.subjectChip,
                    {
                      backgroundColor: isSelected ? sub.color : colors.card,
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
                      styles.subjectChipText,
                      { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                    ]}>
                    {sub.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Daily Stats Summary */}
        <View
          style={[
            styles.statsSummaryCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{todayFocusMinutes}m</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Focused Today</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.success }]}>{sessionsCompletedToday}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions Done</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.streak }]}>4 🔥</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabText: {
    fontSize: 12,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  timerRing: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  timeText: {
    fontSize: 54,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  modeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timerSubject: {
    marginTop: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectSection: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  subjectsRow: {
    flexDirection: 'row',
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  subjectChipText: {
    fontSize: 13,
  },
  statsSummaryCard: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
});
