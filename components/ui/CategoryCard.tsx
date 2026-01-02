import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';

interface CategoryCardProps {
  label?: string;
  discountValue?: string;
  discountType?: 'currency' | 'percentage';
  type?: 'Default' | 'Discount';
  iconSource?: ImageSourcePropType;
  style?: ViewStyle;
}

export function CategoryCard({ 
  label = 'Label', 
  discountValue = '12',
  discountType = 'currency',
  type = 'Default',
  iconSource,
  style
}: CategoryCardProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const iconContainerStyle = combineStyles(
    styles.iconContainer,
    type === 'Default' ? styles.iconContainerDefault : styles.iconContainerDiscount
  );

  return (
    <View style={containerStyle}>
      <View style={iconContainerStyle}>
        {iconSource ? (
          <Image 
            source={iconSource} 
            style={styles.icon}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        
        {type === 'Discount' && (
          <View style={styles.discountBadge}>
            <Driver 
              label={
                discountType === 'currency' 
                  ? `Até R$${discountValue} off`
                  : `Até ${discountValue}% off`
              } 
              type="Secondary" 
            />
          </View>
        )}
      </View>
      
      <Text 
        style={styles.label} 
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconContainer: {
    width: '100%',
    height: 63,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerDefault: {
    backgroundColor: colors.gray[500],
  },
  iconContainerDiscount: {
    backgroundColor: colors.secondaryLight,
  },
  icon: {
    width: 50,
    height: 50,
    aspectRatio: 1, // 1:1 aspect ratio
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    aspectRatio: 1, // 1:1 aspect ratio
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: -7.5,
    alignSelf: 'center',
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
    color: colors.black,
    textAlign: 'center',
    width: '100%',
  },
});

