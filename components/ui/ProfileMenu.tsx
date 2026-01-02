import { View, StyleSheet, ViewStyle } from 'react-native';
import { combineStyles } from '../../src/lib/styles';
import { ProfileMenuItem } from './ProfileMenuItem';
import type { LucideIcon } from 'lucide-react-native';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onPress?: () => void;
}

interface ProfileMenuProps {
  items: MenuItem[];
  style?: ViewStyle;
}

export function ProfileMenu({
  items,
  style
}: ProfileMenuProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      {items.map((item) => (
        <ProfileMenuItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          onPress={item.onPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
});

