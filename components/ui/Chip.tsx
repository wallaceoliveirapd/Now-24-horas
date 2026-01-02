import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { X, LucideIcon } from 'lucide-react-native';

interface ChipProps {
  label: string;
  state?: 'Default' | 'Selected';
  type?: 'Default' | 'With Icon' | 'With Image';
  icon?: LucideIcon;
  iconSource?: ImageSourcePropType;
  showClose?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  style?: ViewStyle;
}

export function Chip({
  label,
  state = 'Default',
  type = 'Default',
  icon: Icon,
  iconSource,
  showClose = true,
  onPress,
  onClose,
  style
}: ChipProps) {
  const isSelected = state === 'Selected';

  const containerStyle = combineStyles(
    styles.container,
    isSelected ? styles.containerSelected : styles.containerDefault,
    style
  );

  const textColor = isSelected ? colors.white : colors.black;
  const closeIconColor = isSelected ? colors.white : colors.black;
  const iconColor = isSelected ? colors.white : colors.black;

  const content = (
    <>
      {/* Icon or Image */}
      {type === 'With Icon' && Icon && (
        <Icon size={16} color={iconColor} strokeWidth={2} />
      )}
      {type === 'With Image' && iconSource && (
        <Image
          source={iconSource}
          style={styles.iconImage}
          resizeMode="cover"
        />
      )}

      {/* Label */}
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>

      {/* Close Button */}
      {showClose && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onClose && onClose();
          }}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X size={16} color={closeIconColor} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={containerStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2, // 10px
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm + 4, // 8px
    borderRadius: 999, // Fully rounded
    alignSelf: 'flex-start',
  },
  containerDefault: {
    backgroundColor: colors.gray[500], // muted
  },
  containerSelected: {
    backgroundColor: colors.primary,
  },
  iconImage: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.sm,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
  },
  closeButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

