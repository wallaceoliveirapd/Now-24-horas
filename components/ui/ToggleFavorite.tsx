import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors, borderRadius, combineStyles } from '../../src/lib/styles';

interface ToggleFavoriteProps {
  isFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  style?: ViewStyle;
}

export function ToggleFavorite({
  isFavorite = false,
  onToggle,
  style
}: ToggleFavoriteProps) {
  const containerStyle = combineStyles(
    styles.container,
    {
      backgroundColor: isFavorite ? colors.secondary : colors.white, // Amarelo quando favoritado, branco quando não
    },
    style
  );

  const handlePress = () => {
    if (onToggle) {
      onToggle(!isFavorite);
    }
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Heart
        size={12}
        color={isFavorite ? colors.primary : colors.mutedForeground} // Primary quando favoritado, mutedForeground quando não
        strokeWidth={2}
        fill={isFavorite ? colors.primary : 'none'} // Preenchido quando favoritado
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 42, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
});
