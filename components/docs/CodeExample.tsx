import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/lib/styles';

interface CodeExampleProps {
  code: string;
  language?: string;
}

export function CodeExample({ code, language = 'tsx' }: CodeExampleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotRed]} />
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={[styles.dot, styles.dotGreen]} />
        </View>
        <Text style={styles.language}>{language}</Text>
      </View>
      <Text style={styles.code}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotRed: {
    backgroundColor: colors.red[600],
  },
  dotYellow: {
    backgroundColor: colors.yellow[500],
  },
  dotGreen: {
    backgroundColor: colors.green[500],
  },
  language: {
    ...typography.xs,
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
  code: {
    fontSize: typography.xs.fontSize,
    lineHeight: 20,
    color: colors.gray[300],
    fontFamily: 'monospace',
  },
});
