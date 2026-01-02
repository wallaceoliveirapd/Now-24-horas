import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { TicketPercent, ChevronRight, X, Minus, Plus } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Driver } from './Driver';

interface CupomBannerProps {
  type?: 'Banner' | 'Cupom Aplicado';
  title?: string;
  description?: string;
  count?: number;
  couponCode?: string;
  discountValue?: string;
  showDiscountValue?: boolean;
  showBadge?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
  showCounter?: boolean;
  style?: ViewStyle;
}

export function CupomBanner({ 
  type = 'Banner',
  title,
  description,
  count = 23,
  couponCode,
  discountValue,
  showDiscountValue = false,
  showBadge = true,
  onPress,
  onRemove,
  quantity: controlledQuantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity,
  showCounter = false,
  style
}: CupomBannerProps) {
  const [internalQuantity, setInternalQuantity] = useState(controlledQuantity || minQuantity);
  const quantity = controlledQuantity !== undefined ? controlledQuantity : internalQuantity;
  
  // Sync internal state when controlled quantity changes
  useEffect(() => {
    if (controlledQuantity !== undefined) {
      setInternalQuantity(controlledQuantity);
    }
  }, [controlledQuantity]);
  
  const isApplied = type === 'Cupom Aplicado';
  
  // Valores padrão baseados no tipo
  const defaultTitle = isApplied ? 'Cupom aplicado' : 'Cupons disponíveis';
  const defaultDescription = isApplied ? (couponCode || 'BEMVINDO20') : 'Economize em seus pedidos';
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  const handleDecrement = () => {
    const newQuantity = Math.max(minQuantity, quantity - 1);
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      setInternalQuantity(newQuantity);
    }
  };

  const handleIncrement = () => {
    const newQuantity = maxQuantity !== undefined 
      ? Math.min(maxQuantity, quantity + 1)
      : quantity + 1;
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      setInternalQuantity(newQuantity);
    }
  };

  const containerStyle = combineStyles(
    isApplied ? styles.containerApplied : styles.container,
    style
  );

  const content = (
    <>
      {/* Ticket Icon */}
      <TicketPercent 
        size={34} 
        color={isApplied ? '#64c943' : colors.black} 
        strokeWidth={2} 
      />

      {/* Text Content */}
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {finalTitle}
          </Text>
          {showBadge && (
            <View style={styles.badgeContainer}>
              {isApplied ? (
                <Driver 
                  label={discountValue || '- R$ 23'} 
                  type="Green" 
                />
              ) : (
                <Driver 
                  label={String(count)} 
                  type="Secondary" 
                />
              )}
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {finalDescription}
        </Text>
      </View>

      {/* Action Icon or Counter */}
      {isApplied ? (
        <TouchableOpacity 
          onPress={onRemove}
          activeOpacity={0.7}
          style={styles.removeButton}
        >
          <X size={24} color={colors.black} strokeWidth={2} />
        </TouchableOpacity>
      ) : showCounter ? (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={handleDecrement}
            disabled={quantity <= minQuantity}
            activeOpacity={0.7}
            style={[
              styles.counterButton,
              styles.counterButtonDecrement,
              quantity <= minQuantity && styles.counterButtonDisabled
            ]}
          >
            <Minus 
              size={16} 
              color={quantity <= minQuantity ? colors.mutedForeground : colors.black} 
              strokeWidth={2.5} 
            />
          </TouchableOpacity>
          <View style={styles.counterValue}>
            <Text style={styles.counterValueText}>{quantity}</Text>
          </View>
          <TouchableOpacity
            onPress={handleIncrement}
            disabled={maxQuantity !== undefined && quantity >= maxQuantity}
            activeOpacity={0.7}
            style={[
              styles.counterButton,
              styles.counterButtonIncrement,
              maxQuantity !== undefined && quantity >= maxQuantity && styles.counterButtonDisabled
            ]}
          >
            <Plus 
              size={16} 
              color={maxQuantity !== undefined && quantity >= maxQuantity ? colors.mutedForeground : colors.black} 
              strokeWidth={2.5} 
            />
          </TouchableOpacity>
        </View>
      ) : (
        <ChevronRight size={24} color={colors.black} strokeWidth={2} />
      )}

      {/* Discount Value (opcional, aparece no final apenas no tipo Banner) */}
      {!isApplied && showDiscountValue && discountValue && (
        <Text style={styles.discountValue} numberOfLines={1}>
          {discountValue}
        </Text>
      )}
    </>
  );

  if (onPress && !isApplied) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        style={containerStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefcea',
    borderWidth: 1,
    borderColor: '#f5ca0f',
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // 10px
    padding: spacing.lg, // 20px
    alignSelf: 'stretch',
    minHeight: 76,
  },
  containerApplied: {
    backgroundColor: '#f4feea',
    borderWidth: 1,
    borderColor: '#64c943',
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // 10px
    padding: spacing.lg, // 20px
    alignSelf: 'stretch',
    minHeight: 76,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs, // 4px
    minWidth: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4px
    width: '100%',
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
  },
  badgeContainer: {
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountValue: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.green[700],
    lineHeight: 19.2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  counterButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDecrement: {
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  counterButtonIncrement: {
    backgroundColor: colors.primary,
    borderLeftWidth: 1,
    borderLeftColor: colors.primary,
  },
  counterButtonDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    minWidth: 40,
    height: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  counterValueText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 19.2,
  },
});

