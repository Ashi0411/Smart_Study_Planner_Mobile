import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<Props> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, profile, isConfigured, signOut, resetPassword, updateProfile } = useAuth();
  const { colors, themeMode, toggleThemeMode, todayFocusMinutes, streakDays } = useStudy();
  const isDark = themeMode === 'dark';

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow photo library access so you can select your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingImage(true);
        const asset = result.assets[0];
        const selectedUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        await updateProfile({ avatarUrl: selectedUri });
      }
    } catch (err) {
      console.warn('Error picking image:', err);
      Alert.alert('Notice', 'Unable to pick image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await updateProfile({ avatarUrl: undefined });
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    setIsLoading(true);
    try {
      const res = await resetPassword(profile.email);
      if (res.success) {
        Alert.alert('Email Sent', `Password reset instructions were sent to ${profile.email}`);
      } else {
        Alert.alert('Notice', res.error || 'Failed to send reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateAuth = (path: '/auth/login' | '/auth/register') => {
    onClose();
    router.push(path);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                User Account &amp; Security
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {user || profile ? (
              /* Logged In View */
              <View style={styles.loggedInSection}>
                {/* Avatar with Camera Badge */}
                <View style={styles.avatarWrapper}>
                  {profile?.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={styles.profileAvatarImage}
                    />
                  ) : (
                    <LinearGradient
                      colors={['#8B5CF6', '#C084FC']}
                      style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </LinearGradient>
                  )}

                  <Pressable
                    onPress={handlePickAvatar}
                    disabled={isUploadingImage}
                    hitSlop={8}
                    style={styles.cameraIconBadge}>
                    {isUploadingImage ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    )}
                  </Pressable>
                </View>

                {/* Photo Actions Row */}
                <View style={styles.photoActionsRow}>
                  <Pressable
                    onPress={handlePickAvatar}
                    disabled={isUploadingImage}
                    style={[
                      styles.photoActionBtn,
                      { borderColor: colors.cardBorder, backgroundColor: colors.card },
                    ]}>
                    <Ionicons name="image-outline" size={13} color="#8B5CF6" />
                    <Text style={[styles.photoActionBtnText, { color: colors.text }]}>
                      {profile?.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  </Pressable>
                  {Boolean(profile?.avatarUrl) && (
                    <Pressable
                      onPress={handleRemoveAvatar}
                      style={[
                        styles.photoActionBtn,
                        { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
                      ]}>
                      <Ionicons name="trash-outline" size={13} color="#EF4444" />
                      <Text style={[styles.photoActionBtnText, { color: '#EF4444' }]}>
                        Remove
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Text style={[styles.userName, { color: colors.text }]}>
                  {profile?.fullName || 'Active Student'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {profile?.email || user?.email}
                </Text>

                {/* User Stats Card */}
                <View
                  style={[
                    styles.userSummaryCard,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="time" size={16} color="#8B5CF6" />
                    <Text style={[styles.summaryVal, { color: colors.text }]}>
                      {todayFocusMinutes}m
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Today&apos;s Focus
                    </Text>
                  </View>

                  <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />

                  <View style={styles.summaryItem}>
                    <Ionicons name="flame" size={16} color="#F59E0B" />
                    <Text style={[styles.summaryVal, { color: colors.streak }]}>
                      {streakDays}d
                    </Text>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                      Streak
                    </Text>
                  </View>
                </View>

                {/* Reset Password Button */}
                <Pressable
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  style={[
                    styles.secondaryBtn,
                    { borderColor: colors.cardBorder, backgroundColor: colors.backgroundElement },
                  ]}>
                  <Ionicons name="lock-open-outline" size={16} color="#8B5CF6" />
                  <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                    Send Password Reset Email
                  </Text>
                </Pressable>

                {/* Sign Out Button */}
                <Pressable
                  onPress={handleSignOut}
                  disabled={isLoading}
                  style={[styles.signOutBtn, { borderColor: '#FCA5A5' }]}>
                  {isLoading ? (
                    <ActivityIndicator color="#EF4444" size="small" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                      <Text style={styles.signOutBtnText}>Sign Out</Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Guest / Not Logged In View */
              <View style={styles.guestSection}>
                <View style={styles.guestIconBadge}>
                  <Ionicons name="person-circle-outline" size={54} color="#8B5CF6" />
                </View>
                <Text style={[styles.guestTitle, { color: colors.text }]}>
                  Unlock Cloud Sync &amp; Storage
                </Text>
                <Text style={[styles.guestSub, { color: colors.textSecondary }]}>
                  Sign in or create an account with Supabase Auth to protect your study plans with hardware encryption and automatic multi-device backup.
                </Text>

                {/* Action Buttons */}
                <Pressable
                  onPress={() => handleNavigateAuth('/auth/login')}
                  style={styles.primaryAuthBtn}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.gradientBtn}>
                    <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryAuthBtnText}>Sign In</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => handleNavigateAuth('/auth/register')}
                  style={[
                    styles.secondaryAuthBtn,
                    {
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.backgroundElement,
                    },
                  ]}>
                  <Ionicons name="person-add-outline" size={18} color="#8B5CF6" />
                  <Text style={[styles.secondaryAuthBtnText, { color: colors.text }]}>
                    Create Account
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Quick Settings Section */}
            <View style={[styles.settingsSection, { borderTopColor: colors.cardBorder }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={18}
                    color={isDark ? '#8B5CF6' : '#F59E0B'}
                  />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Pressable
                  onPress={toggleThemeMode}
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: isDark ? '#8B5CF6' : '#E2E8F0' },
                  ]}>
                  <View
                    style={[
                      styles.toggleKnob,
                      isDark && { alignSelf: 'flex-end', backgroundColor: '#FFF' },
                    ]}
                  />
                </Pressable>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name="cloud-done-outline"
                    size={18}
                    color={isConfigured ? '#10B981' : '#F59E0B'}
                  />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Supabase Status
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isConfigured ? '#ECFDF5' : '#FEF3C7' },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isConfigured ? '#047857' : '#B45309' },
                    ]}>
                    {isConfigured ? 'Connected' : 'Demo / Standby'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loggedInSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: '#8B5CF6',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  photoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  photoActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 14,
  },
  userSummaryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: '65%',
  },
  secondaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  signOutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  guestSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  guestIconBadge: {
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  guestSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  primaryAuthBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  primaryAuthBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryAuthBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryAuthBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingsSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleBtn: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
