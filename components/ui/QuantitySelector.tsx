import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  style?: ViewStyle;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 0,
  max,
  style
}: QuantitySelectorProps) {
  const isActive = quantity > min;
  const isNotActive = !isActive;

  const handleIncrease = () => {
    if (max && quantity >= max) return;
    onQuantityChange(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= min) return;
    onQuantityChange(quantity - 1);
  };

  const containerStyle = combineStyles(styles.container, style);

  // Quando não está ativo (quantity === 0), mostra apenas o botão de adicionar
  if (isNotActive) {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleIncrease}
          activeOpacity={0.7}
        >
          <Plus
            size={13.5}
            color={colors.white}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Quando está ativo (quantity > 0), mostra o seletor completo
  return (
    <View style={containerStyle}>
      {/* Botão de diminuir */}
      <TouchableOpacity
        style={styles.decrementButton}
        onPress={handleDecrease}
        activeOpacity={0.7}
      >
        <Minus
          size={13.5}
          color={colors.black}
          strokeWidth={2}
        />
      </TouchableOpacity>

      {/* Botão de aumentar com badge */}
      <View style={styles.incrementContainer}>
        <TouchableOpacity
          style={styles.incrementButton}
          onPress={handleIncrease}
          activeOpacity={0.7}
        >
          <Plus
            size={13.5}
            color={colors.white}
            strokeWidth={2}
          />
        </TouchableOpacity>
        
        {/* Badge com quantidade */}
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityBadgeText}>
            {quantity}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 42, // Circular
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f0f1f2',
    borderTopLeftRadius: 42,
    borderBottomLeftRadius: 42,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementContainer: {
    position: 'relative',
  },
  incrementButton: {
    width: 30,
    height: 30,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 42,
    borderBottomRightRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    left: 17,
    top: -7.5,
    width: 16,
    height: 16,
    borderRadius: 42, // Circular
    backgroundColor: colors.secondary, // #FFE02F
    borderWidth: 2,
    borderColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeights.medium,
    color: colors.black,
    textAlign: 'center',
  },
});
