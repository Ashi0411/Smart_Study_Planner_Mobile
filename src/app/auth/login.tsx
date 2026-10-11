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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, resetPassword, demoLogin, isConfigured } = useAuth();
  const { themeMode } = useStudy();
  const isDark = themeMode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/');
      } else {
        setErrorMessage(result.error || 'Failed to sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive a password reset link.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setInfoMessage('Password reset instructions have been sent to your email.');
      } else {
        setErrorMessage(res.error || 'Could not send reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    demoLogin();
    router.replace('/');
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
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.heroHeading, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.heroSubheading, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Sign in to access your study plans, tasks &amp; focus progress
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
              <View style={[styles.switchTab, styles.switchTabActive]}>
                <Text style={styles.switchTextActive}>Sign In</Text>
              </View>
              <Pressable
                onPress={() => router.push('/auth/register')}
                style={styles.switchTab}>
                <Text style={[styles.switchText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Status Alert Messages */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {infoMessage && (
            <View style={styles.infoBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.infoBannerText}>{infoMessage}</Text>
            </View>
          )}

          {/* Offline notice */}
          {!isConfigured && (
            <View
              style={[
                styles.noticeBanner,
                { backgroundColor: isDark ? '#1E293B' : '#EDE9FE', borderColor: '#DDD6FE' },
              ]}>
              <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
              <Text style={[styles.noticeBannerText, { color: isDark ? '#C4B5FD' : '#6D28D9' }]}>
                Offline Safe Mode: Your account will be securely saved on this device.
              </Text>
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
            {/* Email Field */}
            <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>
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
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')}>
                  <Ionicons name="close-circle" size={18} color={isDark ? '#64748B' : '#94A3B8'} />
                </Pressable>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.passwordLabelRow}>
              <Text style={[styles.inputLabel, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                PASSWORD
              </Text>
              <Pressable onPress={handleForgotPassword} hitSlop={6}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>
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
                placeholder="Enter your password"
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

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
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
                    <Text style={styles.submitButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Quick Demo Button */}
            {!isConfigured && (
              <Pressable
                onPress={handleDemo}
                style={[
                  styles.demoButton,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <Ionicons name="flash-outline" size={16} color="#F59E0B" />
                <Text style={[styles.demoButtonText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
                  Instant Demo Login
                </Text>
              </Pressable>
            )}

            {/* Footer Navigation */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Don&apos;t have an account?
              </Text>
              <Pressable onPress={() => router.push('/auth/register')} hitSlop={8}>
                <Text style={styles.footerLink}> Sign Up</Text>
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
    marginBottom: 20,
  },
  mascotHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#C084FC',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
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
    marginBottom: 18,
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
  infoBanner: {
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
  infoBannerText: {
    flex: 1,
    color: '#059669',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
    marginBottom: 14,
    gap: 8,
  },
  noticeBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
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
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
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
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 11,
    marginTop: 10,
    gap: 6,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
