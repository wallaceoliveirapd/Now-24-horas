import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface ProductDetailFooterProps {
  total: number; // em centavos
  onAddToCart: () => void;
  buttonText?: string;
  isLoading?: boolean;
  style?: ViewStyle;
}

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export function ProductDetailFooter({
  total,
  onAddToCart,
  buttonText = 'Add ao carrinho',
  isLoading = false,
  style
}: ProductDetailFooterProps) {
  const containerStyle = combineStyles(styles.container, style);

  return (
    <View style={containerStyle}>
      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onAddToCart}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={15} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.buttonText}>{buttonText}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg, // 20px
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  totalContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  totalLabel: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 19.2, // 16px * 1.2
  },
  totalValue: {
    fontSize: 18,
    lineHeight: 21.6, // 18px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minWidth: 180,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 24,
  },
});

