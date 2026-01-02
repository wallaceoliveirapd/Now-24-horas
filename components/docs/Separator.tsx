import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/lib/styles';

interface SeparatorProps {
  style?: any;
}

export function Separator({ style }: SeparatorProps) {
  return (
    <View style={[styles.separator, style]} />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.md,
  },
});
