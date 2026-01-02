import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface BadgeProps {
  label?: string;
  type?: 'Default' | 'Success' | 'Primary' | 'Info' | 'Warning';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Badge({ 
  label = 'Label', 
  type = 'Default',
  style,
  onPress
}: BadgeProps) {
  const typeStyles: Record<string, ViewStyle> = {
    Default: { borderColor: colors.gray[300] },
    Success: { borderColor: colors.green[600] },
    Primary: { borderColor: colors.primary },
    Info: { borderColor: colors.blue[600] },
    Warning: { borderColor: colors.orange[500] },
  };

  const badgeStyle = combineStyles(
    styles.badge,
    typeStyles[type],
    type === 'Default' && styles.shadow,
    style
  );

  const content = (
    <Text style={styles.text} numberOfLines={1}>
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={badgeStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={badgeStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 0,
    height: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: typography.xs.fontSize,
    lineHeight: typography.xs.lineHeight,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
});
