import { StyleSheet } from 'react-native';

// Workaround temporário: converter classes Tailwind para StyleSheet
// Use isso enquanto o bug do NativeWind v4 não é corrigido
export const tw = StyleSheet.create({
  // Layout
  'flex-1': { flex: 1 },
  'flex-row': { flexDirection: 'row' },
  'items-center': { alignItems: 'center' },
  'justify-center': { justifyContent: 'center' },
  'w-full': { width: '100%' },
  
  // Spacing
  'px-4': { paddingHorizontal: 16 },
  'py-6': { paddingVertical: 24 },
  'mb-4': { marginBottom: 16 },
  'mb-8': { marginBottom: 32 },
  
  // Colors
  'bg-white': { backgroundColor: '#ffffff' },
  'bg-gray-50': { backgroundColor: '#f9fafb' },
  'bg-gray-100': { backgroundColor: '#f3f4f6' },
  'bg-blue-600': { backgroundColor: '#2563eb' },
  'bg-gray-600': { backgroundColor: '#4b5563' },
  'text-white': { color: '#ffffff' },
  'text-gray-900': { color: '#111827' },
  'text-gray-600': { color: '#4b5563' },
  'text-blue-600': { color: '#2563eb' },
  
  // Typography
  'text-sm': { fontSize: 14 },
  'text-base': { fontSize: 16 },
  'text-lg': { fontSize: 18 },
  'text-xl': { fontSize: 20 },
  'text-2xl': { fontSize: 24 },
  'text-3xl': { fontSize: 30 },
  'text-4xl': { fontSize: 36 },
  'font-semibold': { fontWeight: '600' },
  'font-bold': { fontWeight: '700' },
  'text-center': { textAlign: 'center' },
  
  // Borders
  'rounded': { borderRadius: 4 },
  'rounded-lg': { borderRadius: 8 },
  'rounded-xl': { borderRadius: 12 },
  'border': { borderWidth: 1 },
  'border-2': { borderWidth: 2 },
  'border-b': { borderBottomWidth: 1 },
  'border-gray-200': { borderColor: '#e5e7eb' },
  'border-gray-300': { borderColor: '#d1d5db' },
  'border-blue-600': { borderColor: '#2563eb' },
  'border-green-600': { borderColor: '#16a34a' },
  'border-pink-500': { borderColor: '#ec4899' },
  'border-orange-500': { borderColor: '#f97316' },
  
  // Transparent
  'bg-transparent': { backgroundColor: 'transparent' },
});

