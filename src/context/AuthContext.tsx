import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const fetchProfile = useCallback(async (userId: string, userEmail: string, userMetaName?: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: userEmail,
          fullName: data.full_name || userMetaName || 'Student',
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
        });
      } else {
        // Fallback default profile if table row hasn't been created yet
        setProfile({
          id: userId,
          email: userEmail,
          fullName: userMetaName || 'Student',
        });
      }
    } catch {
      setProfile({
        id: userId,
        email: userEmail,
        fullName: userMetaName || 'Student',
      });
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
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
            data.session.user.user_metadata?.full_name
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
            newSession.user.user_metadata?.full_name
          );
        } else {
          setProfile(null);
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
      // Demo fallback if keys are missing
      demoLogin();
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
      // Local fallback for demo
      setProfile({
        id: 'usr-demo-' + Date.now(),
        email: emailValidation.normalized,
        fullName: sanitizedName,
      });
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
    if (!profile) return { success: false, error: 'No user logged in.' };

    const updated = { ...profile, ...data };
    setProfile(updated);

    if (isSupabaseConfigured && user) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: updated.fullName,
          avatar_url: updated.avatarUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to sync profile.';
        return { success: false, error: msg };
      }
    }

    return { success: true };
  };

  // Demo user login for testing before Supabase keys are configured
  const demoLogin = () => {
    setProfile({
      id: 'demo-user-1',
      email: 'student@smartplanner.io',
      fullName: 'Alex Morgan',
      createdAt: new Date().toISOString(),
    });
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
