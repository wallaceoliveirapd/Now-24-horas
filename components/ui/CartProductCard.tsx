import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

interface CartProductCardProps {
  id: string;
  title?: string;
  showDriver?: boolean;
  driverLabel?: string;
  basePrice?: number; // Preço original em centavos
  finalPrice?: number; // Preço final em centavos
  discountValue?: number; // Valor do desconto em centavos
  type?: 'Offer' | 'Default';
  imageSource?: ImageSourcePropType;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove?: (id: string) => void;
  style?: ViewStyle;
}

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100); // Converte de centavos para reais
}

export function CartProductCard({ 
  id,
  title = 'Nome do produto com suas linhas no máximo',
  showDriver = true,
  driverLabel = 'Label',
  basePrice = 998, // R$9,98 em centavos
  finalPrice = 998, // R$9,98 em centavos
  discountValue = 1200, // R$12,00 em centavos
  type = 'Offer',
  imageSource,
  quantity,
  onQuantityChange,
  onRemove,
  style
}: CartProductCardProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(id, quantity + 1);
  };

  const showTrashButton = quantity === 1;

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
        </View>

        {/* Price Container */}
        {type === 'Offer' ? (
          <View style={styles.priceContainer}>
            <View style={styles.discountedPriceContainer}>
              <Text style={styles.basePrice} numberOfLines={1}>
                {formatCurrency(basePrice)}
              </Text>
              {showDriver && (
                <Driver 
                  label={`- ${formatCurrency(discountValue)}`} 
                  type="Green" 
                />
              )}
            </View>
            <Text style={styles.finalPriceOffer} numberOfLines={1}>
              {formatCurrency(finalPrice)}
            </Text>
          </View>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={styles.finalPriceDefault} numberOfLines={1}>
              {formatCurrency(finalPrice)}
            </Text>
          </View>
        )}

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          {showTrashButton ? (
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={handleRemove}
              activeOpacity={0.7}
            >
              <Trash2 
                size={14} 
                color={colors.red[600]} 
                strokeWidth={2.5} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={handleDecrease}
              activeOpacity={0.7}
            >
              <Minus 
                size={14} 
                color={colors.primary} 
                strokeWidth={2.5} 
              />
            </TouchableOpacity>
          )}
          
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={handleIncrease}
            activeOpacity={0.7}
          >
            <Plus 
              size={14} 
              color={colors.primary} 
              strokeWidth={2.5} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm + 2, // 10px
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 117,
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
  productInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
    minWidth: 0,
  },
  nameContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16.8, // 14px * 1.2
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    minWidth: 30,
    height: 30,
    backgroundColor: colors.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  quantityText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 14,
  },
});

