import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';

interface ProductDetailInfoProps {
  title: string;
  description?: string;
  basePrice?: string;
  finalPrice: string;
  discountValue?: string;
  showDiscount?: boolean;
  unitLabel?: string;
  style?: ViewStyle;
}

export function ProductDetailInfo({
  title,
  description,
  basePrice,
  finalPrice,
  discountValue,
  showDiscount = false,
  unitLabel = '/un',
  style
}: ProductDetailInfoProps) {
  const containerStyle = combineStyles(styles.container, style);
  const finalPriceStyle = combineStyles(
    styles.finalPrice,
    !showDiscount && styles.finalPriceNoDiscount
  );

  return (
    <View style={containerStyle}>
      {/* Product Description Container */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Price Container */}
      <View style={styles.priceContainer}>
        <View style={styles.priceInfoContainer}>
          {basePrice && (
            <Text style={styles.basePrice} numberOfLines={1}>
              {basePrice}
            </Text>
          )}
          {showDiscount && discountValue && (
            <Driver
              label={`- ${discountValue}`}
              type="Green"
            />
          )}
        </View>
        <View style={styles.finalPriceContainer}>
          <Text style={finalPriceStyle} numberOfLines={1}>
            {finalPrice}
          </Text>
          <Text style={styles.unitLabel} numberOfLines={1}>
            {unitLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg + 4, // 20px
    paddingVertical: spacing.lg + 4, // 20px
    flexDirection: 'column',
    gap: spacing.md + 4, // 12px
  },
  descriptionContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.xs, // 4px
    alignItems: 'flex-start',
  },
  title: {
    ...typography.base,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'left',
  },
  priceContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.xs, // 4px
  },
  priceInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4px
    justifyContent: 'flex-start',
  },
  basePrice: {
    fontSize: 10,
    lineHeight: 12, // 10px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  finalPriceContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs, // 4px
    justifyContent: 'flex-start',
  },
  finalPrice: {
    fontSize: 24,
    lineHeight: 28.8, // 24px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.green[700],
  },
  finalPriceNoDiscount: {
    color: colors.black,
  },
  unitLabel: {
    fontSize: 10,
    lineHeight: 12, // 10px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
  },
});

