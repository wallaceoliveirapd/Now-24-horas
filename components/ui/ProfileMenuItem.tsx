import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Badge } from './Badge';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface ProfileMenuItemProps {
  label: string;
  icon: LucideIcon;
  badge?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ProfileMenuItem({
  label,
  icon: Icon,
  badge,
  onPress,
  style
}: ProfileMenuItemProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Icon size={16} color={colors.black} strokeWidth={2} />
        <Text style={styles.label}>{label}</Text>
        {badge !== undefined && (
          <Badge
            label={String(badge)}
            type="Primary"
            style={styles.badge}
          />
        )}
      </View>
      <ChevronRight size={24} color={colors.black} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 6, // 14px
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16,
  },
  badge: {
    marginLeft: spacing.xs,
  },
});

