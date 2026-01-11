import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Search, MapPin, Bell, ChevronDown } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';

interface HomeHeaderProps {
  address?: string;
  notificationCount?: number;
  onSearchPress?: () => void;
  onAddressPress?: () => void;
  onNotificationPress?: () => void;
  style?: ViewStyle;
}

export function HomeHeader({ 
  address = 'Rua do amor, 233',
  notificationCount = 2,
  onSearchPress,
  onAddressPress,
  onNotificationPress,
  style
}: HomeHeaderProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      {/* Search Icon Container */}
      <TouchableOpacity 
        onPress={onSearchPress}
        style={styles.searchContainer}
        activeOpacity={0.7}
      >
        <Search size={20} color={colors.mutedForeground} strokeWidth={2} />
      </TouchableOpacity>

      {/* Address Container */}
      <TouchableOpacity 
        style={styles.addressContainer}
        onPress={onAddressPress}
        activeOpacity={0.7}
      >
        <View style={styles.addressContent}>
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressLabel}>Endereço</Text>
            <View style={styles.addressInfo}>
              <MapPin size={14} color={colors.primary} strokeWidth={2} style={styles.mapPinIcon} />
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
                {address}
              </Text>
              <ChevronDown size={10.67} color={colors.mutedForeground} strokeWidth={2} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification Icon Container */}
      <TouchableOpacity 
        onPress={onNotificationPress}
        style={styles.notificationContainer}
        activeOpacity={0.7}
      >
        <Bell size={20} color={colors.mutedForeground} strokeWidth={2} />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    width: '100%',
    minHeight: 40,
  },
  searchContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[100],
    borderRadius: 99, // Circular
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  addressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  addressLabel: {
    ...typography.xs,
    fontSize: 12,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 12,
    paddingBottom: 4,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  addressText: {
    ...typography.xs,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 14,
    flexShrink: 1,
    maxWidth: '70%',
  },
  mapPinIcon: {
    marginBottom: 4,
  },
  notificationContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[100],
    borderRadius: 99, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    left: 20,
    top: 2,
    backgroundColor: colors.secondary, // #FFE02F
    borderRadius: 99, // Circular
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    ...typography.xs,
    fontSize: 10,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 14,
    textAlign: 'center',
  },
});

