import { StyleSheet } from 'react-native';

// Design Tokens
export const colors = {
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#F9FAFB', // Default variant for Driver
    600: '#4b5563',
    700: '#374151',
    800: '#3a3939', // Black variant for Driver
    900: '#111827',
  },
  blue: {
    50: '#eff6ff',
    600: '#2563eb',
    650: '#1c55e6', // Info variant for Driver
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  green: {
    500: '#10b981',
    600: '#16a34a',
    700: '#449200', // Green variant for Driver
  },
  pink: {
    500: '#ec4899',
  },
  orange: {
    500: '#f97316',
  },
  red: {
    600: '#dc2626',
  },
  yellow: {
    500: '#f59e0b',
  },
  primary: '#E61C61',
  secondary: '#FFE02F',
  secondaryLight: '#fff7cd', // Light yellow for CategoryCard discount variant
  mutedForeground: '#4C5564', // Muted text color
  disabled: '#c5c5c5', // Disabled background color
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

// Font Family
export const fontFamily = {
  sans: 'Instrument Sans', // Nome registrado no useFonts
};

export const typography = {
  xs: { fontSize: 10, lineHeight: 14, fontFamily: fontFamily.sans },
  sm: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.sans },
  base: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.sans },
  lg: { fontSize: 18, lineHeight: 28, fontFamily: fontFamily.sans },
  xl: { fontSize: 20, lineHeight: 28, fontFamily: fontFamily.sans },
  '2xl': { fontSize: 24, lineHeight: 32, fontFamily: fontFamily.sans },
  '3xl': { fontSize: 30, lineHeight: 36, fontFamily: fontFamily.sans },
  '4xl': { fontSize: 36, lineHeight: 44, fontFamily: fontFamily.sans },
};

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Utility function to combine styles
export function combineStyles(...styles: any[]) {
  return StyleSheet.flatten(styles.filter(Boolean));
}

