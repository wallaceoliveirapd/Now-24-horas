import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LucideIcon, Home } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface BottomMenuItemProps {
  label?: string;
  active?: boolean;
  icon?: LucideIcon;
  onPress?: () => void;
  style?: ViewStyle;
}

export function BottomMenuItem({
  label = 'Label',
  active = false,
  icon: Icon = Home,
  onPress,
  style
}: BottomMenuItemProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const textStyle = combineStyles(
    styles.text,
    active ? styles.textActive : styles.textInactive
  );

  const iconColor = active ? colors.primary : colors.mutedForeground;
  const iconSize = 16;

  const content = (
    <View style={containerStyle}>
      <View style={styles.iconContainer}>
        <Icon 
          size={iconSize} 
          color={iconColor} 
          strokeWidth={2}
          fill="none"
        />
      </View>
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs, // 4px
    padding: 0,
  },
  iconContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  textActive: {
    color: colors.primary,
  },
  textInactive: {
    color: colors.mutedForeground,
  },
});
