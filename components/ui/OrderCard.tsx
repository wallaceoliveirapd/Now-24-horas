import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Badge } from './Badge';
import { Separator } from './Separator';
import { Button } from './Button';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../src/lib/styles';
import { Box } from 'lucide-react-native';

export type OrderStatus = 'Aguardando pagamento' | 'Cancelado' | 'Concluído' | 'Pendente';

export interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderCardProps {
  orderNumber: string;
  orderDate: string;
  status?: OrderStatus;
  items?: OrderItem[];
  total: number; // em centavos
  onPress?: () => void;
  onPaymentPress?: () => void;
  style?: ViewStyle;
}

export function OrderCard({
  orderNumber,
  orderDate,
  status = 'Concluído',
  items = [],
  total,
  onPress,
  onPaymentPress,
  style,
}: OrderCardProps) {
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Calcular total de itens
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Determinar tipo do badge baseado no status
  const getBadgeType = (): 'Default' | 'Success' | 'Primary' | 'Info' | 'Warning' => {
    switch (status) {
      case 'Concluído':
        return 'Success';
      case 'Cancelado':
        return 'Primary';
      case 'Aguardando pagamento':
        return 'Info';
      case 'Pendente':
        return 'Warning';
      default:
        return 'Default';
    }
  };

  // Determinar label do badge
  const getBadgeLabel = (): string => {
    return status;
  };

  // Determinar estilos do card baseado no status
  const getCardStyle = () => {
    if (status === 'Pendente') {
      return [styles.card, styles.cardPendente, style];
    }
    return [styles.card, style];
  };

  const cardContent = (
    <View style={getCardStyle()}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.orderNumber} numberOfLines={1}>
            Pedido {orderNumber}
          </Text>
          <Badge
            label={getBadgeLabel()}
            type={getBadgeType()}
            style={styles.badgeStyle}
          />
        </View>
        <Text style={styles.orderDate}>{orderDate}</Text>
      </View>

      {/* Items Info */}
      <View style={styles.itemsInfo}>
        <View style={styles.itemsHeader}>
          <Box size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={styles.itemsCount}>{totalItems} itens</Text>
        </View>
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.quantity}x {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Separator style={styles.separator} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      {/* Payment Button (only for "Aguardando pagamento") */}
      {status === 'Aguardando pagamento' && (
        <Button
          title="Fazer pagamento"
          variant="primary"
          size="md"
          onPress={onPaymentPress || (() => {})}
          style={styles.paymentButton}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.container}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{cardContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: 11, // Conforme Figma
  },
  cardPendente: {
    backgroundColor: '#FEFCEA', // Amarelo claro conforme Figma
    borderColor: '#e68b1c', // Cor warning conforme Figma
  },
  header: {
    gap: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 1, // 9px conforme Figma
    flexWrap: 'wrap',
  },
  orderNumber: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
    flex: 1,
    minWidth: 0,
  },
  badgeStyle: {
    height: 16,
  },
  orderDate: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  itemsInfo: {
    gap: spacing.xs,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemsCount: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 15.6, // 1.3 * 12px
  },
  itemsList: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  separator: {
    marginVertical: 0,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    lineHeight: 19.2, // 1.2 * 16px
  },
  totalLabel: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 19.2, // 1.2 * 16px
  },
  totalValue: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    lineHeight: 21.6, // 1.2 * 18px
  },
  paymentButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
});

