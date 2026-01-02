import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontWeights } from '../../src/lib/styles';

interface ShowcaseSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ShowcaseSection({ title, description, children }: ShowcaseSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.sm,
    color: colors.gray[600],
  },
});
