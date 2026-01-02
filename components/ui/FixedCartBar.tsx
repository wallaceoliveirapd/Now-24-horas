import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { ShoppingCart } from 'lucide-react-native';

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
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  +{totalItems}
                </Text>
              </View>
            )}
          </View>

          {/* Total Text */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel} numberOfLines={1}>
              Total
            </Text>
            <Text style={styles.totalValue} numberOfLines={1}>
              {formatCurrency(totalPrice)}
            </Text>
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

