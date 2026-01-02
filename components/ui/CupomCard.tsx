import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Badge } from './Badge';
import { BadgePercent, Copy, Trash2 } from 'lucide-react-native';

interface CupomCardProps {
  state?: 'Default' | 'Selected';
  discountValue?: string;
  description?: string;
  conditions?: string;
  validUntil?: string;
  couponCode?: string;
  onUse?: () => void;
  onRemove?: () => void;
  onCopyCode?: () => void;
  style?: ViewStyle;
}

export function CupomCard({
  state = 'Default',
  discountValue = 'R$ 20 OFF',
  description = 'Ganhe 20% de desconto na primeira compra',
  conditions = 'Válido para pedidos acima de R$ 50,00',
  validUntil = 'Válido até 30/12/2025',
  couponCode = 'BEMVINDO10',
  onUse,
  onRemove,
  onCopyCode,
  style
}: CupomCardProps) {
  const isSelected = state === 'Selected';
  
  const containerStyle = combineStyles(
    styles.container,
    isSelected ? styles.containerSelected : styles.containerDefault,
    style
  );

  const iconColor = isSelected ? colors.green[700] : colors.black;
  const discountTextColor = isSelected ? colors.green[700] : colors.black;

  return (
    <View style={containerStyle}>
      {/* Header with Discount */}
      <View style={styles.headerContainer}>
        <View style={styles.discountContainer}>
          <BadgePercent size={24} color={iconColor} strokeWidth={2} />
          <Text style={[styles.discountText, { color: discountTextColor }]} numberOfLines={1}>
            {discountValue}
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>

      {/* Conditions */}
      <Text style={styles.conditions} numberOfLines={1}>
        {conditions}
      </Text>

      {/* Valid Until Badge */}
      <Badge
        label={validUntil}
        type="Default"
        style={styles.validUntilBadge}
      />

      {/* Coupon Code and Actions */}
      <View style={styles.actionsContainer}>
        {/* Coupon Code */}
        <TouchableOpacity
          onPress={onCopyCode}
          style={styles.couponCodeContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.couponCode} numberOfLines={1}>
            {couponCode}
          </Text>
          <Copy size={16} color={colors.black} strokeWidth={2} />
        </TouchableOpacity>

        {/* Action Buttons */}
        {isSelected ? (
          <>
            <View style={styles.appliedButton}>
              <Text style={styles.appliedButtonText}>Aplicado</Text>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onUse}
            style={styles.useButton}
            activeOpacity={0.7}
          >
            <Text style={styles.useButtonText}>Usar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 271,
    flexDirection: 'column',
    gap: 11,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  containerDefault: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  containerSelected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.green[700],
  },
  headerContainer: {
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  discountText: {
    fontSize: 16,
    lineHeight: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
  },
  description: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 14px * 1.3
  },
  conditions: {
    fontSize: 12,
    lineHeight: 15.6, // 12px * 1.3
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  validUntilBadge: {
    alignSelf: 'flex-start',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    width: '100%',
  },
  couponCodeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // 10px
    backgroundColor: colors.gray[500],
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    minHeight: 40,
  },
  couponCode: {
    flex: 1,
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
  },
  useButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  useButtonText: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  appliedButton: {
    backgroundColor: colors.green[700],
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  appliedButtonText: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  removeButton: {
    width: 41,
    height: 41,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

