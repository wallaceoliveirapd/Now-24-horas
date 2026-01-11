import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useState } from 'react';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface ProductObservationsProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  style?: ViewStyle;
}

export function ProductObservations({
  value,
  onChangeText,
  placeholder = 'Escreva aqui...',
  hint = 'Ex: Bem maduro, sem manchas...',
  maxLength,
  style
}: ProductObservationsProps) {
  const [isFocused, setIsFocused] = useState(false);
  const containerStyle = combineStyles(styles.container, style);
  const inputContainerStyle = combineStyles(
    styles.inputContainer,
    isFocused && styles.inputContainerFocused
  );

  return (
    <View style={containerStyle}>
      <View style={inputContainerStyle}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {hint && (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: colors.gray[500],
    borderRadius: borderRadius.md,
    padding: 14,
    minHeight: 149,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  input: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 18,
    flex: 1,
    minHeight: 121,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
  },
});

