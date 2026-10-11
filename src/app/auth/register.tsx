import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '@/utils/security';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { themeMode } = useStudy();
  const isDark = themeMode === 'dark';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const strength = evaluatePasswordStrength(password);
    if (!strength.criteria.minLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password, fullName);

      if (result.success) {
        if (result.confirmationRequired) {
          setSuccessMessage(
            'Account created! We sent a confirmation link to your email. Please verify to activate your account.'
          );
        } else {
          setSuccessMessage('Account registered successfully! Welcome to StudyZen!');
          setTimeout(() => {
            router.replace('/');
          }, 1000);
        }
      } else {
        setErrorMessage(result.error || 'Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header Bar */}
          <View style={styles.topBar}>
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons name="arrow-back" size={20} color={isDark ? '#F8FAFC' : '#1E293B'} />
            </Pressable>
            <View style={styles.appBrandPill}>
              <Ionicons name="sparkles" size={14} color="#8B5CF6" />
              <Text style={styles.appBrandText}>StudyZen</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding with 3D Mascot */}
          <View style={styles.brandHero}>
            <View style={styles.mascotHalo}>
              <Image
                source={require('@/assets/images/study_ai_mascot.jpg')}
                style={styles.mascotImage}
                resizeMode="cover"
              />
              <View style={styles.sparkleBadge}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.heroHeading, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Create Account
            </Text>
            <Text style={[styles.heroSubheading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Join StudyZen to organize university tasks, schedules &amp; study habits
            </Text>

            {/* Segmented Auth Switcher */}
            <View
              style={[
                styles.switchContainer,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Pressable onPress={() => router.push('/auth/login')} style={styles.switchTab}>
                <Text style={[styles.switchText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Sign In
                </Text>
              </Pressable>
              <View style={[styles.switchTab, styles.switchTabActive]}>
                <Text style={styles.switchTextActive}>Create Account</Text>
              </View>
            </View>
          </View>

          {/* Status Banners */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            {/* Full Name */}
            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>
              FULL NAME
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons name="person-outline" size={19} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="e.g. John Doe"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={fullName}
                onChangeText={setFullName}
                autoCorrect={false}
              />
            </View>

            {/* Email Address */}
            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569', marginTop: 12 }]}>
              EMAIL ADDRESS
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons name="mail-outline" size={19} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="student@example.com"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569', marginTop: 12 }]}>
              PASSWORD
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons name="lock-closed-outline" size={19} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="Minimum 8 characters"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                hitSlop={8}>
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
              </Pressable>
            </View>

            {/* Real-time Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Confirm Password */}
            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569', marginTop: 12 }]}>
              CONFIRM PASSWORD
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons name="shield-checkmark-outline" size={19} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                placeholder="Re-enter your password"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              {confirmPassword.length > 0 && (
                <Ionicons
                  name={
                    password === confirmPassword && password.length >= 8
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={19}
                  color={
                    password === confirmPassword && password.length >= 8
                      ? '#10B981'
                      : '#EF4444'
                  }
                />
              )}
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                isLoading && { opacity: 0.7 },
              ]}>
              <LinearGradient
                colors={['#6366F1', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtnContent}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Security Guarantee Badge */}
            <View
              style={[
                styles.guaranteeBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F5F3FF',
                  borderColor: isDark ? '#334155' : '#EDE9FE',
                },
              ]}>
              <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
              <Text style={[styles.guaranteeText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                End-to-end security: Protected by encrypted storage &amp; cloud authentication.
              </Text>
            </View>

            {/* Footer Navigation */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push('/auth/login')} hitSlop={8}>
                <Text style={styles.footerLink}> Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  appBrandText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  mascotHalo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#C084FC',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    backgroundColor: '#EDE9FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  heroSubheading: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    width: '100%',
    maxWidth: 320,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  switchTabActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  switchTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  successBannerText: {
    flex: 1,
    color: '#059669',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
    marginBottom: 6,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
    marginTop: 14,
    gap: 8,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
});
