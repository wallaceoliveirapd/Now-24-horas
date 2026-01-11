import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, borderRadius, combineStyles } from '../../src/lib/styles';

interface ProfileStatCardProps {
  value: string | number;
  label: string;
  style?: ViewStyle;
}

export function ProfileStatCard({
  value,
  label,
  style
}: ProfileStatCardProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: 11,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  label: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 16,
  },
});

