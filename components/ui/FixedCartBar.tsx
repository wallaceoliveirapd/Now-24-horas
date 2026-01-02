import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { ShoppingCart } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

interface FixedCartBarProps {
  totalItems?: number;
  totalPrice?: number; // em centavos
  onPress?: () => void;
  style?: ViewStyle;
}

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100); // Converte de centavos para reais
}

export function FixedCartBar({
  totalItems = 0,
  totalPrice = 9900, // R$99,00 em centavos
  onPress,
  style
}: FixedCartBarProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const showBadge = totalItems > 0;
  
  // Animações para o preço
  const priceScale = useRef(new Animated.Value(1)).current;
  const priceOpacity = useRef(new Animated.Value(1)).current;
  const priceTranslateY = useRef(new Animated.Value(0)).current;
  const previousPrice = useRef(totalPrice);
  
  // Animações para o badge
  const badgeScale = useRef(new Animated.Value(1)).current;
  const previousItems = useRef(totalItems);

  // Animar preço quando muda
  useEffect(() => {
    if (previousPrice.current !== totalPrice) {
      const isIncreasing = totalPrice > previousPrice.current;
      
      // Reset valores
      priceScale.setValue(1);
      priceOpacity.setValue(1);
      priceTranslateY.setValue(0);
      
      // Animação de escala e movimento
      Animated.parallel([
        Animated.sequence([
          Animated.spring(priceScale, {
            toValue: 1.15,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
          Animated.spring(priceScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
        ]),
        Animated.sequence([
          Animated.timing(priceOpacity, {
            toValue: 0.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(priceOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(priceTranslateY, {
            toValue: isIncreasing ? -8 : 8,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
          Animated.spring(priceTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
        ]),
      ]).start();
      
      previousPrice.current = totalPrice;
    }
  }, [totalPrice]);

  // Animar badge quando quantidade muda
  useEffect(() => {
    if (previousItems.current !== totalItems && totalItems > 0) {
      badgeScale.setValue(1);
      
      Animated.sequence([
        Animated.sequence([
          Animated.spring(badgeScale, {
            toValue: 1.3,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
          Animated.spring(badgeScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
          }),
        ]),
      ]).start();
      
      previousItems.current = totalItems;
    }
  }, [totalItems]);

  const animatedPriceStyle = {
    transform: [
      { scale: priceScale },
      { translateY: priceTranslateY },
    ],
    opacity: priceOpacity,
  };

  const animatedBadgeStyle = {
    transform: [
      { scale: badgeScale },
    ],
    // Rotação não suportada com useNativeDriver, usando apenas scale
  };

  return (
    <BlurView
      intensity={12}
      tint="light"
      style={containerStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchableContent}
      >
        {/* Left Section: Cart Icon and Total */}
        <View style={styles.leftSection}>
          {/* Cart Icon with Badge */}
          <View style={styles.iconContainer}>
            <ShoppingCart size={24} color={colors.black} strokeWidth={2} />
            {showBadge && (
              <Animated.View style={[styles.badgeContainer, animatedBadgeStyle]}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  +{totalItems}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Total Text */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel} numberOfLines={1}>
              Total
            </Text>
            <Animated.Text style={[styles.totalValue, animatedPriceStyle]} numberOfLines={1}>
              {formatCurrency(totalPrice)}
            </Animated.Text>
          </View>
        </View>

        {/* Right Section: Button */}
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText} numberOfLines={1}>
            Ver Carrinho
          </Text>
        </View>
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: spacing.sm + 4, // 8px
    paddingVertical: spacing.sm + 4, // 8px
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -9,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.xs.fontSize,
    lineHeight: typography.xs.lineHeight,
    fontFamily: typography.xs.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  totalContainer: {
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  totalLabel: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
  },
  totalValue: {
    fontSize: 16,
    lineHeight: 19.2, // 16px * 1.2
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.sm.fontSize,
    lineHeight: typography.sm.lineHeight,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
});

