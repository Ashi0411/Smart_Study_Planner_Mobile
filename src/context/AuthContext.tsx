import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  validateEmail,
  evaluatePasswordStrength,
  sanitizeInput,
  bruteForceLimiter,
} from '@/utils/security';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch or create profile in PostgreSQL
  const fetchProfile = useCallback(
    async (
      userId: string,
      userEmail: string,
      userMetaName?: string,
      userMetaAvatar?: string
    ) => {
      // 1. Retrieve persistent local avatar or profile if present
      let persistentAvatar = userMetaAvatar;
      let localProfile: UserProfile | null = null;
      try {
        const stored = await AsyncStorage.getItem('@smart_planner_active_user');
        if (stored) {
          localProfile = JSON.parse(stored);
          if (localProfile?.avatarUrl) {
            persistentAvatar = persistentAvatar || localProfile.avatarUrl;
          }
        }
        if (!persistentAvatar) {
          const storedAvatar = await AsyncStorage.getItem('@smart_planner_user_avatar');
          if (storedAvatar) persistentAvatar = storedAvatar;
        }
      } catch (e) {
        console.warn('Error reading local profile/avatar', e);
      }

      if (!isSupabaseConfigured) {
        if (localProfile) setProfile(localProfile);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const finalAvatar = data?.avatar_url || persistentAvatar;

        if (data && !error) {
          const prof: UserProfile = {
            id: data.id,
            email: userEmail,
            fullName: data.full_name || userMetaName || localProfile?.fullName || 'Student',
            avatarUrl: finalAvatar,
            createdAt: data.created_at,
          };
          setProfile(prof);
          await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(prof));
        } else {
          const prof: UserProfile = {
            id: userId,
            email: userEmail,
            fullName: userMetaName || localProfile?.fullName || 'Student',
            avatarUrl: finalAvatar,
          };
          setProfile(prof);
          await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(prof));
        }
      } catch {
        const fallbackProf: UserProfile = {
          id: userId,
          email: userEmail,
          fullName: userMetaName || localProfile?.fullName || 'Student',
          avatarUrl: persistentAvatar,
        };
        setProfile(fallbackProf);
        await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(fallbackProf));
      }
    },
    []
  );

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      // 1. Instantly load locally cached profile/avatar so UI never flashes empty
      try {
        const stored = await AsyncStorage.getItem('@smart_planner_active_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.fullName !== 'Alex Morgan' && parsed.email !== 'student@smartplanner.io') {
            setProfile(parsed);
          }
        } else {
          const storedAvatar = await AsyncStorage.getItem('@smart_planner_user_avatar');
          if (storedAvatar) {
            setProfile({
              id: 'usr-local',
              email: '',
              fullName: 'Student',
              avatarUrl: storedAvatar,
            });
          }
        }
      } catch (e) {
        console.warn('Error reading local active user', e);
      }

      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await fetchProfile(
            data.session.user.id,
            data.session.user.email || '',
            data.session.user.user_metadata?.full_name,
            data.session.user.user_metadata?.avatar_url
          );
        }
      } catch (err) {
        console.warn('Error reading auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    // Listen to real-time auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(
            newSession.user.id,
            newSession.user.email || '',
            newSession.user.user_metadata?.full_name,
            newSession.user.user_metadata?.avatar_url
          );
        } else if (!newSession) {
          // If no session from Supabase, check local storage
          const stored = await AsyncStorage.getItem('@smart_planner_active_user');
          if (stored) {
            setProfile(JSON.parse(stored));
          } else {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Secure Sign In with rate limiting & sanitization
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    // Check anti-brute force lockout
    const lockout = bruteForceLimiter.isLocked(emailValidation.normalized);
    if (lockout.locked) {
      return {
        success: false,
        error: `Too many failed attempts. For security, please wait ${lockout.remainingSeconds} seconds before trying again.`,
      };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    if (!isSupabaseConfigured) {
      // Offline/Local Mode: Use the user's actual entered email and look up their saved name
      let userFullName = '';
      try {
        const storedAccountsJson = await AsyncStorage.getItem('@smart_planner_local_accounts');
        if (storedAccountsJson) {
          const accounts = JSON.parse(storedAccountsJson);
          const found = accounts.find((a: { email: string; fullName: string }) => a.email.toLowerCase() === emailValidation.normalized);
          if (found) {
            userFullName = found.fullName;
          }
        }
      } catch (e) {
        console.warn('Error reading local accounts', e);
      }

      if (!userFullName) {
        const prefix = emailValidation.normalized.split('@')[0];
        userFullName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }

      const localProfile: UserProfile = {
        id: 'usr-local-' + Date.now(),
        email: emailValidation.normalized,
        fullName: userFullName,
        createdAt: new Date().toISOString(),
      };

      setProfile(localProfile);
      await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(localProfile));
      bruteForceLimiter.reset(emailValidation.normalized);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.normalized,
        password,
      });

      if (error) {
        const failureStatus = bruteForceLimiter.recordFailure(emailValidation.normalized);
        if (failureStatus.locked) {
          return {
            success: false,
            error: `Too many failed attempts. Your account is temporarily locked for ${failureStatus.remainingSeconds} seconds.`,
          };
        }
        return { success: false, error: error.message };
      }

      // Success: reset rate limiter
      bruteForceLimiter.reset(emailValidation.normalized);
      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return { success: false, error: msg };
    }
  };

  // Secure Sign Up with password strength verification
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const sanitizedName = sanitizeInput(fullName);
    if (!sanitizedName) {
      return { success: false, error: 'Full name is required.' };
    }

    // Enforce minimum password strength
    const strength = evaluatePasswordStrength(password);
    if (!strength.criteria.minLength) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    if (strength.score < 2) {
      return {
        success: false,
        error: 'Password is too weak. Please combine uppercase letters, numbers, and symbols.',
      };
    }

    if (!isSupabaseConfigured) {
      // Save account locally so user's exact name & email are displayed
      const localProfile: UserProfile = {
        id: 'usr-local-' + Date.now(),
        email: emailValidation.normalized,
        fullName: sanitizedName,
        createdAt: new Date().toISOString(),
      };

      try {
        const storedAccountsJson = await AsyncStorage.getItem('@smart_planner_local_accounts');
        const accounts = storedAccountsJson ? JSON.parse(storedAccountsJson) : [];
        const filtered = accounts.filter((a: { email: string }) => a.email !== emailValidation.normalized);
        filtered.push({ email: emailValidation.normalized, fullName: sanitizedName });
        await AsyncStorage.setItem('@smart_planner_local_accounts', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Error saving local account', e);
      }

      setProfile(localProfile);
      await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(localProfile));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailValidation.normalized,
        password,
        options: {
          data: {
            full_name: sanitizedName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create initial profile record in PostgreSQL
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: sanitizedName,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // Ignore if table not yet migrated
        }

        const isEmailConfirmed = data.session !== null;
        return {
          success: true,
          confirmationRequired: !isEmailConfirmed,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return { success: false, error: msg };
    }
  };

  // Sign out
  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    try {
      await AsyncStorage.removeItem('@smart_planner_active_user');
      await AsyncStorage.removeItem('@smart_planner_user_avatar');
    } catch (e) {
      console.warn('Error removing active user', e);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Password reset via email
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.normalized);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return { success: false, error: msg };
    }
  };

  // Update profile
  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    const currentProfile: UserProfile = profile || {
      id: user?.id || 'usr-local',
      email: user?.email || '',
      fullName: user?.user_metadata?.full_name || 'Student',
    };

    const updated: UserProfile = { ...currentProfile, ...data };
    setProfile(updated);

    try {
      await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(updated));
      if (updated.avatarUrl) {
        await AsyncStorage.setItem('@smart_planner_user_avatar', updated.avatarUrl);
      } else if (data.avatarUrl === undefined) {
        await AsyncStorage.removeItem('@smart_planner_user_avatar');
      }
    } catch (e) {
      console.warn('Error saving updated profile locally', e);
    }

    if (isSupabaseConfigured && user) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updated.fullName,
            avatar_url: updated.avatarUrl,
          },
        });
      } catch (e) {
        console.warn('Notice updating Supabase user metadata:', e);
      }

      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updated.fullName,
          avatar_url: updated.avatarUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (e: unknown) {
        console.warn('Notice upserting to Supabase profiles:', e);
      }
    }

    return { success: true };
  };

  // Demo user login for testing before Supabase keys are configured
  const demoLogin = async () => {
    const demoProfile: UserProfile = {
      id: 'demo-user-1',
      email: 'student@smartplanner.io',
      fullName: 'Demo Student',
      createdAt: new Date().toISOString(),
    };
    setProfile(demoProfile);
    try {
      await AsyncStorage.setItem('@smart_planner_active_user', JSON.stringify(demoProfile));
    } catch (e) {
      console.warn('Error storing demo user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        demoLogin,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
