import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, combineStyles } from '../../src/lib/styles';
import { ProfileStatCard } from './ProfileStatCard';

interface ProfileStatsProps {
  completedOrders: number;
  totalSpent: string;
  style?: ViewStyle;
}

export function ProfileStats({
  completedOrders,
  totalSpent,
  style
}: ProfileStatsProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <View style={containerStyle}>
      <ProfileStatCard
        value={completedOrders}
        label="Pedidos concluídos"
      />
      <ProfileStatCard
        value={totalSpent}
        label="Total gasto"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

