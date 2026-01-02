import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { MapPin, ShoppingCart } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';

interface HomeHeaderProps {
  firstName?: string;
  address?: string;
  cartCount?: number;
  onAddressPress?: () => void;
  onCartPress?: () => void;
  style?: ViewStyle;
}

export function HomeHeader({ 
  firstName = 'Wallace',
  address = 'Av. Rua do Amor, 256',
  cartCount = 9,
  onAddressPress,
  onCartPress,
  style
}: HomeHeaderProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      {/* MapPin Icon and User Info */}
      <View style={styles.leftSection}>
        <TouchableOpacity 
          onPress={onAddressPress}
          activeOpacity={0.7}
        >
          <MapPin size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Olá,</Text>
            <Text style={styles.firstNameText} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          
          <Text style={styles.addressText} numberOfLines={1}>
            {address}
          </Text>
        </View>
      </View>

      {/* Shopping Cart Icon */}
      <TouchableOpacity 
        onPress={onCartPress}
        style={styles.cartIconContainer}
        activeOpacity={0.7}
      >
        <ShoppingCart size={24} color={colors.white} strokeWidth={2} />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Driver 
              label={`+${cartCount}`} 
              type="Secondary" 
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  greetingText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 18,
  },
  firstNameText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 18,
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.gray[100],
  },
  cartIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});

