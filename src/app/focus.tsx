import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudy } from '@/context/StudyContext';
import { useAuth } from '@/context/AuthContext';
import { FocusMode } from '@/types/study';
import { SubjectBadge } from '@/components/study/SubjectBadge';

const MODE_DURATIONS: Record<FocusMode, number> = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export default function FocusScreen() {
  const router = useRouter();
  const { categories, logFocusSession, todayFocusMinutes, streakDays, colors, themeMode, toggleThemeMode } = useStudy();
  const { user, profile, isConfigured, signOut, resetPassword } = useAuth();
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<'profile' | 'timer'>('profile');
  const [mode, setMode] = useState<FocusMode>('pomodoro');
  const [selectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(0);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Switch timer mode
  const handleModeChange = useCallback((newMode: FocusMode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  }, []);

  const handleSessionComplete = useCallback(() => {
    const durationMinutes = Math.floor(MODE_DURATIONS[mode] / 60);
    logFocusSession(durationMinutes, mode, selectedCategoryId);
    if (mode === 'pomodoro') {
      setSessionsCompletedToday((c) => c + 1);
      Alert.alert(
        '🎉 Focus Session Done!',
        `Awesome work! You completed ${durationMinutes} minutes of focused work. Time for a well-deserved break!`
      );
      handleModeChange('short_break');
    } else {
      Alert.alert('Break Finished', 'Ready to dive back into your goals?');
      handleModeChange('pomodoro');
    }
  }, [mode, selectedCategoryId, logFocusSession, handleModeChange]);

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

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await signOut();
      Alert.alert('Signed Out', 'You have been signed out securely.');
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    try {
      const res = await resetPassword(profile.email);
      if (res.success) {
        Alert.alert('Email Sent', `Instructions sent to ${profile.email}`);
      } else {
        Alert.alert('Notice', res.error || 'Failed to send reset email.');
      }
    } catch {
      Alert.alert('Error', 'Unable to send reset instructions.');
    }
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Segmented Control: Profile & Focus Timer */}
        <View
          style={[
            styles.segmentBar,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <Pressable
            onPress={() => setActiveTab('profile')}
            style={[
              styles.segmentItem,
              activeTab === 'profile' && { backgroundColor: '#8B5CF6' },
            ]}>
            <Ionicons
              name="person"
              size={15}
              color={activeTab === 'profile' ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'profile' ? '#FFF' : colors.textSecondary },
              ]}>
              User Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('timer')}
            style={[
              styles.segmentItem,
              activeTab === 'timer' && { backgroundColor: '#8B5CF6' },
            ]}>
            <Ionicons
              name="timer"
              size={15}
              color={activeTab === 'timer' ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'timer' ? '#FFF' : colors.textSecondary },
              ]}>
              Focus Timer
            </Text>
          </Pressable>
        </View>

        {activeTab === 'profile' ? (
          /* USER ACCOUNT & SUPABASE CLOUD VIEW */
          <View style={styles.profileSection}>
            {user || profile ? (
              <View style={styles.userCard}>
                <LinearGradient
                  colors={['#8B5CF6', '#C084FC']}
                  style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>

                <Text style={[styles.profileName, { color: colors.text }]}>
                  {profile?.fullName || 'Active Student'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {profile?.email || user?.email}
                </Text>

                <View style={styles.accountBadgeRow}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                    <Text style={styles.verifiedBadgeText}>Authenticated</Text>
                  </View>
                  <View
                    style={[
                      styles.configBadge,
                      { backgroundColor: isConfigured ? '#ECFDF5' : '#FEF3C7' },
                    ]}>
                    <Text
                      style={[
                        styles.configBadgeText,
                        { color: isConfigured ? '#047857' : '#B45309' },
                      ]}>
                      {isConfigured ? 'Supabase Live' : 'Demo Account'}
                    </Text>
                  </View>
                </View>

                {/* Cloud Security Architecture Info */}
                <View
                  style={[
                    styles.securityCard,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  <Text style={[styles.securityCardHeading, { color: colors.text }]}>
                    Supabase Cloud Security Architecture
                  </Text>

                  <View style={styles.securityPoint}>
                    <Ionicons name="key" size={16} color="#8B5CF6" />
                    <View style={styles.securityPointTextWrap}>
                      <Text style={[styles.securityPointTitle, { color: colors.text }]}>
                        Hardware-Backed KeyStore Token
                      </Text>
                      <Text style={[styles.securityPointDesc, { color: colors.textSecondary }]}>
                        Stored in iOS Keychain / Android KeyStore using AES-GCM encryption.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.securityPoint}>
                    <Ionicons name="shield" size={16} color="#10B981" />
                    <View style={styles.securityPointTextWrap}>
                      <Text style={[styles.securityPointTitle, { color: colors.text }]}>
                        PostgreSQL Row Level Security (RLS)
                      </Text>
                      <Text style={[styles.securityPointDesc, { color: colors.textSecondary }]}>
                        Database policies enforce strict isolation per user ID.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.securityPoint}>
                    <Ionicons name="cloud-upload" size={16} color="#06B6D4" />
                    <View style={styles.securityPointTextWrap}>
                      <Text style={[styles.securityPointTitle, { color: colors.text }]}>
                        Supabase Storage Integration
                      </Text>
                      <Text style={[styles.securityPointDesc, { color: colors.textSecondary }]}>
                        Encrypted bucket storage for avatars and study attachments.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Account Actions */}
                <View style={styles.actionsList}>
                  <Pressable
                    onPress={handleResetPassword}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}>
                    <Ionicons name="lock-closed-outline" size={18} color="#8B5CF6" />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      Send Password Reset Email
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={toggleThemeMode}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}>
                    <Ionicons
                      name={isDark ? 'sunny-outline' : 'moon-outline'}
                      size={18}
                      color="#F59E0B"
                    />
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      Switch to {isDark ? 'Light' : 'Dark'} Mode
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSignOut}
                    disabled={isSignOutLoading}
                    style={[styles.actionButton, styles.signOutAction]}>
                    {isSignOutLoading ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                        <Text style={styles.signOutActionText}>Sign Out</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.loggedOutCard}>
                <View style={styles.loggedOutIconCircle}>
                  <Ionicons name="person-circle-outline" size={60} color="#8B5CF6" />
                </View>
                <Text style={[styles.loggedOutTitle, { color: colors.text }]}>
                  Supabase Cloud Account
                </Text>
                <Text style={[styles.loggedOutSub, { color: colors.textSecondary }]}>
                  Log in or register to sync all your tasks, schedules, and custom work plans securely across devices.
                </Text>

                <Pressable
                  onPress={() => router.push('/auth/login')}
                  style={styles.authBtnPrimary}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.authBtnGradient}>
                    <Ionicons name="log-in-outline" size={18} color="#FFF" />
                    <Text style={styles.authBtnPrimaryText}>Sign In</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/auth/register')}
                  style={[
                    styles.authBtnSecondary,
                    {
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.card,
                    },
                  ]}>
                  <Ionicons name="person-add-outline" size={18} color="#8B5CF6" />
                  <Text style={[styles.authBtnSecondaryText, { color: colors.text }]}>
                    Create Account
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* FOCUS TIMER VIEW */
          <View style={styles.timerSection}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Focus Timer</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Master your attention with the Pomodoro technique
              </Text>
            </View>

            {/* Mode Switcher */}
            <View
              style={[
                styles.modeTabs,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              {(['pomodoro', 'short_break', 'long_break'] as FocusMode[]).map((m) => {
                const isSelected = mode === m;
                const label =
                  m === 'pomodoro'
                    ? 'Focus (25m)'
                    : m === 'short_break'
                    ? 'Short Break (5m)'
                    : 'Long Break (15m)';
                return (
                  <Pressable
                    key={m}
                    onPress={() => handleModeChange(m)}
                    style={[
                      styles.modeTab,
                      isSelected && {
                        backgroundColor: '#8B5CF6',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.modeTabText,
                        {
                          color: isSelected ? '#FFF' : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
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
                    backgroundColor: colors.card,
                    borderColor: isRunning ? '#8B5CF6' : colors.cardBorder,
                  },
                ]}>
                <Text style={[styles.timeText, { color: colors.text }]}>{timeFormatted}</Text>
                <View style={styles.modeStatusRow}>
                  <View
                    style={[
                      styles.pulseDot,
                      {
                        backgroundColor: isRunning ? '#10B981' : colors.textSecondary,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.modeStatusText,
                      { color: isRunning ? '#10B981' : colors.textSecondary },
                    ]}>
                    {isRunning ? 'IN PROGRESS' : 'PAUSED'}
                  </Text>
                </View>

                {selectedCategory && (
                  <View style={styles.timerSubject}>
                    <SubjectBadge category={selectedCategory} />
                  </View>
                )}
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <Pressable
                onPress={resetTimer}
                style={[
                  styles.secondaryIconBtn,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}>
                <Ionicons name="refresh" size={22} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={toggleTimer}
                style={[styles.primaryBtn, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={24}
                  color="#FFF"
                  style={{ marginLeft: isRunning ? 0 : 2 }}
                />
                <Text style={styles.primaryBtnText}>{isRunning ? 'Pause' : 'Start Focus'}</Text>
              </Pressable>
            </View>

            {/* Stats Row */}
            <View
              style={[
                styles.statsRow,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>{todayFocusMinutes}m</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today&apos;s Focus</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {sessionsCompletedToday}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.streak }]}>{streakDays}d</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  profileSection: {
    alignSelf: 'stretch',
  },
  userCard: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 12,
  },
  accountBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  configBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  configBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  securityCard: {
    alignSelf: 'stretch',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    gap: 12,
  },
  securityCardHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  securityPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  securityPointTextWrap: {
    flex: 1,
  },
  securityPointTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  securityPointDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionsList: {
    alignSelf: 'stretch',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutAction: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    justifyContent: 'center',
  },
  signOutActionText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  loggedOutCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loggedOutIconCircle: {
    marginBottom: 10,
  },
  loggedOutTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  loggedOutSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  authBtnPrimary: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  authBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  authBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  authBtnSecondary: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  authBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timerSection: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  timerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  timeText: {
    fontSize: 50,
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
    marginTop: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
});
