import { View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { ToggleFavorite } from './ToggleFavorite';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../../src/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  id: string; // ID do produto para identificar no carrinho
  title?: string;
  description?: string;
  basePrice?: string;
  finalPrice?: string;
  type?: 'Offer' | 'Default';
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  onAddToCart?: () => void;
  onPress?: () => void; // Callback ao clicar no card (para navegar para detalhes)
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
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
  basePrice = 'R$9,98',
  finalPrice = 'R$9,98',
  type = 'Offer',
  imageSource,
  style,
  onAddToCart,
  onPress,
  isFavorite = false,
  onFavoriteToggle
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [favorite, setFavorite] = useState(isFavorite);
  
  // Procurar por produtoId primeiro, depois por id (para compatibilidade)
  const cartItem = items.find(item => (item.produtoId || item.id) === id);
  const quantity = cartItem?.quantity || 0;

  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const handleAddToCart = () => {
    // Se há um callback onAddToCart, usar ele (já faz o addItem)
    // Caso contrário, adicionar diretamente
    if (onAddToCart) {
      onAddToCart();
    } else {
      addItem({
        id,
        produtoId: id,
        title: title || '',
        basePrice: basePrice ? parsePriceToCents(basePrice) : 0,
        finalPrice: finalPrice ? parsePriceToCents(finalPrice) : 0,
        type,
        showDriver: false,
        driverLabel: '',
        discountValue: 0,
        imageSource,
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      if (cartItem) {
        removeItem(cartItem.id);
      }
    } else if (cartItem) {
      updateQuantity(cartItem.id, newQuantity);
    } else {
      // Se não está no carrinho e quantidade > 0, adicionar
      handleAddToCart();
      // Depois atualizar a quantidade
      const newCartItem = items.find(item => (item.produtoId || item.id) === id);
      if (newCartItem && newQuantity > 1) {
        updateQuantity(newCartItem.id, newQuantity);
      }
    }
  };

  const handleFavoriteToggle = (newFavorite: boolean) => {
    setFavorite(newFavorite);
    if (onFavoriteToggle) {
      onFavoriteToggle(newFavorite);
    }
  };

  return (
    <TouchableOpacity 
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.95}
      disabled={!onPress}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
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

      {/* Toggle Favorite - canto superior direito, fora do imageContainer */}
      <View style={styles.favoriteContainer}>
        <ToggleFavorite
          isFavorite={favorite}
          onToggle={handleFavoriteToggle}
        />
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

        {/* Price and Quantity Container */}
        <View style={styles.priceQuantityContainer}>
          {/* Price Container */}
          <View style={styles.priceContainer}>
            {type === 'Offer' && basePrice && (
              <Text style={styles.basePrice} numberOfLines={1}>
                {basePrice}
              </Text>
            )}
            <Text 
              style={[
                styles.finalPrice,
                type === 'Offer' ? styles.finalPriceOffer : styles.finalPriceDefault
              ]} 
              numberOfLines={1}
            >
              {finalPrice}
            </Text>
          </View>

          {/* Quantity Selector */}
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            min={0}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F7F8', // #F9FAFB
    borderRadius: borderRadius.xl, // 16px
    padding: spacing.sm + 4, // 12px
    flexDirection: 'column',
    gap: spacing.sm + 4, // 12px
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 111,
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
  },
  favoriteContainer: {
    position: 'absolute',
    right: spacing.sm + 4, // 12px (mesmo padding do container)
    top: spacing.sm + 4, // 12px (mesmo padding do container)
    zIndex: 10,
  },
  productInfo: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: spacing.sm + 4, // 12px
  },
  nameContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 4,
    flexShrink: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 18, // 12px * 1.2
    fontWeight: fontWeights.medium,
    color: colors.black,
    maxHeight: 34, // Máximo 2 linhas * 14.4px
  },
  description: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  priceQuantityContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8px
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  basePrice: {
    fontSize: 10,
    lineHeight: 12, // 10px * 1.2
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 14,
    lineHeight: 16.8, // 14px * 1.2
    fontWeight: fontWeights.semibold,
  },
  finalPriceOffer: {
    color: colors.primary,
  },
  finalPriceDefault: {
    color: colors.black,
  },
});
