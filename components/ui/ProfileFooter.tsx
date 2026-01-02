import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface ProfileFooterProps {
  appName?: string;
  version?: string;
  style?: ViewStyle;
}

export function ProfileFooter({
  appName = 'Now 24 horas',
  version = 'Versão 1.0.0',
  style
}: ProfileFooterProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      <Text style={styles.title}>{appName}</Text>
      <Text style={styles.version}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 16,
    textAlign: 'center',
  },
  version: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: typography.xs.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});

