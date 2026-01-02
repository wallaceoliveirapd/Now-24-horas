import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontWeights } from '../../src/lib/styles';

interface VariantGroupProps {
  title: string;
  children: ReactNode;
}

export function VariantGroup({ title, children }: VariantGroupProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>
      <View style={styles.children}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm * 1.5,
  },
  children: {
    gap: spacing.sm * 1.5,
  },
});
