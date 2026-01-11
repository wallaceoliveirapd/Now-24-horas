import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface CategoryCardProps {
  label?: string;
  discountValue?: string;
  discountType?: 'currency' | 'percentage';
  type?: 'Default' | 'Discount';
  iconSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CategoryCard({ 
  label = 'Label', 
  discountValue = '12',
  discountType = 'currency',
  type = 'Default',
  iconSource,
  onPress,
  style
}: CategoryCardProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const content = (
    <View style={containerStyle}>
      {/* Icon Container */}
      <View style={styles.iconContainer}>
        {iconSource ? (
          <Image 
            source={iconSource} 
            style={styles.icon}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      
      {/* Label */}
      <Text 
        style={styles.label} 
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    width: 86,
    height: 86,
    backgroundColor: colors.gray[100], // #F9FAFB
    borderRadius: borderRadius.xl, // 16px
    padding: spacing.sm + 4, // 12px
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2, // 10px
    overflow: 'hidden',
  },
  iconContainer: {
    flex: 1,
    width: '100%',
    borderRadius: borderRadius.md, // 8px
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
  icon: {
    width: '100%',
    height: '100%',
    aspectRatio: 1, // 1:1 aspect ratio
  },
  iconPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
  },
  label: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textAlign: 'center',
    width: '100%',
  },
});
