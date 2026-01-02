import { View, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing, combineStyles } from '../../src/lib/styles';
import { BottomMenuItem } from './BottomMenuItem';

export interface BottomMenuItemData {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onPress?: () => void;
}

interface BottomMenuProps {
  items: BottomMenuItemData[];
  style?: ViewStyle;
}

export function BottomMenu({
  items,
  style
}: BottomMenuProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      {items.map((item, index) => (
        <View key={index} style={styles.itemWrapper}>
          <BottomMenuItem
            label={item.label}
            icon={item.icon}
            active={item.active || false}
            onPress={item.onPress}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.md + 19, // 16px + 19px para acomodar o transform
    paddingBottom: spacing.xl, // 32px
    paddingHorizontal: spacing.lg, // 24px
    width: '100%',
  },
  itemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

