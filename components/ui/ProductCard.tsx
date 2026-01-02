import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';
import { Plus } from 'lucide-react-native';

interface ProductCardProps {
  title?: string;
  description?: string;
  showDriver?: boolean;
  driverLabel?: string;
  basePrice?: string;
  finalPrice?: string;
  discountValue?: string;
  type?: 'Offer' | 'Default';
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  onAddToCart?: () => void;
}

export function ProductCard({ 
  title = 'Nome do produto com suas linhas no máximo',
  description = 'Nome do produto com suas linhas no máximo',
  showDriver = true,
  driverLabel = 'Label',
  basePrice = 'R$9,98',
  finalPrice = 'R$9,98',
  discountValue = 'R$12',
  type = 'Offer',
  imageSource,
  style,
  onAddToCart
}: ProductCardProps) {
  const containerStyle = combineStyles(
    styles.container,
    style // O estilo passado via prop sobrescreve o padrão (último sobrescreve)
  );

  return (
    <View style={containerStyle}>
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>
        
        {showDriver && (
          <View style={styles.driverTop}>
            <Driver 
              label={driverLabel} 
              type="Primary" 
            />
          </View>
        )}
        
        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={onAddToCart}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.black} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {/* Product Name Container */}
        <View style={styles.nameContainer}>
          <Text 
            style={styles.title} 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <Text 
            style={styles.description} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        </View>

        {/* Price Container */}
        {type === 'Offer' ? (
          <View style={styles.priceContainer}>
            <View style={styles.discountedPriceContainer}>
              {showDriver && (
                <Driver 
                  label={`- ${discountValue}`} 
                  type="Green" 
                />
              )}
              <Text style={styles.basePrice} numberOfLines={1}>
                {basePrice}
              </Text>
            </View>
            <Text style={styles.finalPriceOffer} numberOfLines={1}>
              {finalPrice}
            </Text>
          </View>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={styles.finalPriceDefault} numberOfLines={1}>
              {finalPrice}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 117,
    maxWidth: 117,
    flexDirection: 'column',
    gap: 12,
  },
  imageContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.gray[500],
    borderRadius: borderRadius.md,
    padding: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.sm,
  },
  driverTop: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 7.5,
    right: 8,
    width: 38,
    height: 38,
    borderRadius: 19, // Circular (38/2)
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productInfo: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  nameContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 6,
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16.8, // 14px * 1.2
  },
  description: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  priceContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 2,
  },
  discountedPriceContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  basePrice: {
    fontSize: 10,
    lineHeight: 12, // 10px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  finalPriceOffer: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.green[700],
    lineHeight: 19.2, // 16px * 1.2
  },
  finalPriceDefault: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 19.2, // 16px * 1.2
  },
});

