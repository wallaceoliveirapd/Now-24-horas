import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';
import { Plus, Heart, Minus } from 'lucide-react-native';
import { useCart } from '../../src/contexts/CartContext';
import { useEffect, useRef } from 'react';

interface ProductCardProps {
  id: string; // ID do produto para identificar no carrinho
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
  isFavorite?: boolean;
}

// Helper para converter preço em string (R$9,98) para centavos (998)
function parsePriceToCents(priceString: string): number {
  const cleaned = priceString.replace('R$', '').replace(/\./g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return Math.round(value * 100);
}

export function ProductCard({ 
  id,
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
  onAddToCart,
  isFavorite = false
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find(item => item.id === id);
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;
  
  // Animações
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const counterScale = useRef(new Animated.Value(1)).current;
  const plusButtonScale = useRef(new Animated.Value(1)).current;
  const minusButtonScale = useRef(new Animated.Value(1)).current;
  const previousQuantity = useRef(quantity);
  
  // Animar quando quantidade muda
  useEffect(() => {
    if (previousQuantity.current !== quantity) {
      if (quantity > previousQuantity.current) {
        // Aumentou - animação de "pop"
        counterScale.setValue(1);
        Animated.sequence([
          Animated.spring(counterScale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
          Animated.spring(counterScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
          }),
        ]).start();
      }
      previousQuantity.current = quantity;
    }
  }, [quantity]);
  
  const animatedAddButtonStyle = {
    transform: [{ scale: addButtonScale }],
  };
  
  const animatedCounterStyle = {
    transform: [{ scale: counterScale }],
  };
  
  const animatedPlusButtonStyle = {
    transform: [{ scale: plusButtonScale }],
  };
  
  const animatedMinusButtonStyle = {
    transform: [{ scale: minusButtonScale }],
  };
  
  const handlePlusPress = () => {
    plusButtonScale.setValue(1);
    Animated.sequence([
      Animated.spring(plusButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(plusButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    handleIncreaseQuantity();
  };
  
  const handleMinusPress = () => {
    minusButtonScale.setValue(1);
    Animated.sequence([
      Animated.spring(minusButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(minusButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    handleDecreaseQuantity();
  };

  const containerStyle = combineStyles(
    styles.container,
    style // O estilo passado via prop sobrescreve o padrão (último sobrescreve)
  );

  const handleAddToCart = () => {
    // Animar botão ao pressionar
    addButtonScale.setValue(1);
    Animated.sequence([
      Animated.spring(addButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(addButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    
    if (onAddToCart) {
      onAddToCart();
    }
    
    addItem({
      id,
      title,
      showDriver,
      driverLabel: driverLabel || '',
      basePrice: basePrice ? parsePriceToCents(basePrice) : 0,
      finalPrice: finalPrice ? parsePriceToCents(finalPrice) : 0,
      discountValue: discountValue ? parsePriceToCents(discountValue) : 0,
      type,
    });
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };

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
        
        {/* Favorite Indicator */}
        {isFavorite && (
          <View style={[
            styles.favoriteIndicator,
            !showDriver && styles.favoriteIndicatorNoBadge
          ]}>
            <Heart size={10} color={colors.black} strokeWidth={2} />
          </View>
        )}
        
        {/* Add to Cart Button or Counter */}
        {!isInCart ? (
          <Animated.View style={[styles.addToCartButtonContainer, animatedAddButtonStyle]}>
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Plus size={20} color={colors.black} strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.counterContainer}>
            <Animated.View style={animatedMinusButtonStyle}>
              <TouchableOpacity 
                style={styles.counterButton}
                onPress={handleMinusPress}
                activeOpacity={0.7}
              >
                <Minus size={14} color={colors.black} strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.counterDisplay, animatedCounterStyle]}>
              <Text style={styles.counterText}>{quantity}</Text>
            </Animated.View>
            <Animated.View style={animatedPlusButtonStyle}>
              <TouchableOpacity 
                style={styles.counterButtonPlus}
                onPress={handlePlusPress}
                activeOpacity={0.7}
              >
                <Plus size={14} color={colors.white} strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>
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
    alignSelf: 'flex-start', // Permite que o card cresça verticalmente
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
  favoriteIndicator: {
    position: 'absolute',
    top: spacing.sm, // 8px - mesma posição do driver
    right: 45, // Posicionado à esquerda do driver quando tem badge
    width: 16,
    height: 16,
    borderRadius: 8, // Circular (16/2)
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIndicatorNoBadge: {
    right: spacing.sm, // 8px - canto superior direito quando não tem badge
  },
  addToCartButtonContainer: {
    position: 'absolute',
    bottom: 7.5,
    right: 8,
  },
  addToCartButton: {
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
  counterContainer: {
    position: 'absolute',
    bottom: 7.5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15, // Circular (30/2)
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary, // Borda vermelha
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonPlus: {
    width: 30,
    height: 30,
    borderRadius: 15, // Circular (30/2)
    backgroundColor: colors.primary, // Fundo vermelho
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterDisplay: {
    width: 30,
    height: 30,
    borderRadius: 15, // Circular (30/2)
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 14,
    textAlign: 'center',
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

