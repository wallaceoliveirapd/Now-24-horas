import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Circle, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { QuantitySelector } from './QuantitySelector';

interface SelectionOptionProps {
  id: string;
  title: string;
  description?: string;
  price?: number; // em centavos
  isSelected: boolean;
  onSelect: (id: string) => void;
  type: 'radio' | 'checkbox';
  showQuantity?: boolean;
  quantity?: number;
  onQuantityChange?: (id: string, quantity: number) => void;
  style?: ViewStyle;
}

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export function SelectionOption({
  id,
  title,
  description,
  price,
  isSelected,
  onSelect,
  type,
  showQuantity = false,
  quantity = 1,
  onQuantityChange,
  style
}: SelectionOptionProps) {
  const containerStyle = combineStyles(
    styles.container,
    isSelected ? styles.containerSelected : styles.containerUnselected,
    style
  );

  const handlePress = () => {
    onSelect(id);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity);
    }
  };

  const priceText = price === undefined || price === 0 
    ? 'Grátis'
    : `+ ${formatCurrency(price)}`;

  const priceStyle = price === undefined || price === 0
    ? styles.priceFree
    : styles.priceAdditional;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        {isSelected ? (
          <View style={styles.radioSelected}>
            <Check size={14} color={colors.white} strokeWidth={3} />
          </View>
        ) : (
          <Circle size={24} color={colors.gray[400]} strokeWidth={1.5} />
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
        {showQuantity && isSelected && onQuantityChange && (
          <View style={styles.quantityContainer}>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              min={1}
            />
          </View>
        )}
      </View>

      {/* Price */}
      <Text style={priceStyle} numberOfLines={1}>
        {priceText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  containerSelected: {
    backgroundColor: 'rgba(230, 28, 97, 0.06)',
    borderColor: colors.primary,
  },
  containerUnselected: {
    backgroundColor: colors.white,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  quantityContainer: {
    marginTop: spacing.xs,
  },
  priceFree: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.green[700],
    lineHeight: 16.8, // 14px * 1.2
  },
  priceAdditional: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 16.8, // 14px * 1.2
  },
});

