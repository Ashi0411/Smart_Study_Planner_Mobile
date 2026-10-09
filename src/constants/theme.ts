/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#EDF2F7',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#EEF2FF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    tint: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    streak: '#F97316',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F19',
    backgroundElement: '#1A2035',
    backgroundSelected: '#242C48',
    textSecondary: '#94A3B8',
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#1E1B4B',
    card: '#13192B',
    cardBorder: '#232D48',
    tint: '#818CF8',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    streak: '#FB923C',
    border: '#232D48',
  },
} as const;

export const PriorityColors = {
  high: {
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#FCA5A5',
  },
  medium: {
    bg: '#FEF3C7',
    text: '#D97706',
    border: '#FCD34D',
  },
  low: {
    bg: '#ECFDF5',
    text: '#059669',
    border: '#A7F3D0',
  },
} as const;


export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
