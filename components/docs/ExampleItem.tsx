import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../src/lib/styles';

interface ExampleItemProps {
  label: string;
  children: ReactNode;
}

export function ExampleItem({ label, children }: ExampleItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    width: '100%',
    overflow: 'visible',
  },
  label: {
    ...typography.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
});
