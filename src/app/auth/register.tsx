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
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '@/utils/security';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors, themeMode } = useStudy();
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
      setErrorMessage('Passwords do not match. Please re-enter.');
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
          setSuccessMessage('Account registered successfully! Redirecting...');
          setTimeout(() => {
            router.replace('/');
          }, 1200);
        }
      } else {
        setErrorMessage(result.error || 'Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
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
              New Account
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding */}
          <View style={styles.brandHero}>
            <LinearGradient
              colors={['#8B5CF6', '#C084FC']}
              style={styles.logoBadge}>
              <Ionicons name="person-add" size={30} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.heroHeading, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.heroSubheading, { color: colors.textSecondary }]}>
              Join Smart Life &amp; Learning Planner with encrypted cloud sync &amp; multi-device backup
            </Text>
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

          {/* Input Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="person-outline" size={20} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="e.g. Alex Morgan"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCorrect={false}
              />
            </View>

            {/* Email Address */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              EMAIL ADDRESS
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
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
            </View>

            {/* Password */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="Minimum 8 characters"
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

            {/* Real-time Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Confirm Password */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              CONFIRM PASSWORD
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" />
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textSecondary}
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
                  size={20}
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
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Security Guarantee Badge */}
            <View
              style={[
                styles.guaranteeBox,
                { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="shield-outline" size={16} color="#8B5CF6" />
              <Text style={[styles.guaranteeText, { color: colors.textSecondary }]}>
                Protected by Supabase PostgreSQL Row Level Security (RLS) and encrypted JWT session tokens.
              </Text>
            </View>

            {/* Footer Navigation */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroSubheading: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
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
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  successBannerText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    marginTop: 8,
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
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  guaranteeText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
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
