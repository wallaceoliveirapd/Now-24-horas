import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';
import { ChevronLeft } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface PageTitleProps {
  title: string;
  showCounter?: boolean;
  counterValue?: number;
  showIconRight?: boolean;
  rightIcon?: LucideIcon;
  onBackPress?: () => void;
  onRightIconPress?: () => void;
  style?: ViewStyle;
}

export function PageTitle({
  title,
  showCounter = true,
  counterValue = 0,
  showIconRight = false,
  rightIcon: RightIcon,
  onBackPress,
  onRightIconPress,
  style
}: PageTitleProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={colors.black} strokeWidth={2} />
      </TouchableOpacity>

      {/* Title and Counter */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {showCounter && counterValue > 0 && (
          <Driver
            label={String(counterValue)}
            type="Primary"
          />
        )}
      </View>

      {/* Right Icon */}
      <View style={styles.rightIconContainer}>
        {showIconRight && RightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            activeOpacity={0.7}
          >
            <RightIcon size={24} color={colors.black} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  rightIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

