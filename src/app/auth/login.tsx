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
  const { colors, themeMode } = useStudy();
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
      setErrorMessage('Please enter your email above to receive a password reset link.');
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
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
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
            <Text style={[styles.topBarTitle, { color: colors.textSecondary }]}>
              Account Access
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding */}
          <View style={styles.brandHero}>
            <LinearGradient
              colors={['#8B5CF6', '#C084FC']}
              style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.heroHeading, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.heroSubheading, { color: colors.textSecondary }]}>
              Sign in to sync your work plans, tasks, and achievements with Supabase
            </Text>

            {/* Security Badge */}
            <View
              style={[
                styles.securityTag,
                { backgroundColor: isDark ? '#1F2937' : '#F3E8FF', borderColor: '#DDD6FE' },
              ]}>
              <Ionicons name="lock-closed" size={13} color="#8B5CF6" />
              <Text style={styles.securityTagText}>
                AES-GCM Keychain • Row-Level Security
              </Text>
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

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              EMAIL ADDRESS
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <Ionicons name="mail-outline" size={20} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.passwordLabelRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                PASSWORD
              </Text>
              <Pressable onPress={handleForgotPassword} hitSlop={6}>
                <Text style={styles.forgotPasswordText}>Forgot?</Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
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
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.9 },
                isLoading && { opacity: 0.7 },
              ]}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
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

            {/* Quick Demo Button if Supabase keys not set yet */}
            {!isConfigured && (
              <Pressable
                onPress={handleDemo}
                style={[
                  styles.demoButton,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}>
                <Ionicons name="flash-outline" size={16} color="#F59E0B" />
                <Text style={[styles.demoButtonText, { color: colors.text }]}>
                  Instant Demo Login (Offline / Preview)
                </Text>
              </Pressable>
            )}

            {/* Footer Navigation */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don&apos;t have an account?
              </Text>
              <Pressable onPress={() => router.push('/auth/register')} hitSlop={8}>
                <Text style={styles.footerLink}> Create Account</Text>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  securityTagText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    gap: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
  },
});
