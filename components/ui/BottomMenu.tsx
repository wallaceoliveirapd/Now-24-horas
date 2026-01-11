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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: spacing.md, // 16px
    paddingBottom: spacing.xl, // 32px
    paddingHorizontal: 18, // 18px
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  itemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
