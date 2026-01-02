import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Separator, OrderStepsIcon } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { ChevronLeft, MapPin, Wallet, CreditCard } from 'lucide-react-native';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: undefined;
  Checkout: undefined;
  OrderConfirmation: {
    orderNumber: string;
    deliveryTime: string;
    totalPaid: number;
  };
  OrderDetails: {
    orderNumber: string;
    orderDate?: string;
    orderId?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderStatus {
  step: 'Confirmação' | 'Preparação' | 'Entrega' | 'Entregue';
  state: 'Default' | 'Current' | 'Complete';
  label: string;
  date?: string;
}

export function OrderDetails() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  
  const { orderNumber, orderDate, orderId } = route.params || {
    orderNumber: '#99489500',
    orderDate: '06/12/2025 às 00:09',
    orderId: 'ORD-1238235659680',
  };

  // Determinar status do pedido (mockado - em produção viria da API)
  const getOrderStatus = (): OrderStatus[] => {
    // Exemplo: pedido está em "Preparação"
    return [
      {
        step: 'Confirmação',
        state: 'Complete',
        label: 'Confirmado',
        date: '02/12/2025 às 14:00',
      },
      {
        step: 'Preparação',
        state: 'Current',
        label: 'Preparando',
      },
      {
        step: 'Entrega',
        state: 'Default',
        label: 'Em entrega',
      },
      {
        step: 'Entregue',
        state: 'Default',
        label: 'Entregue',
      },
    ];
  };

  const orderStatus = getOrderStatus();

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Dados mockados do pedido
  const orderItems = [
    { name: 'Nome do produto', quantity: 3, price: 900 }, // R$9,00 em centavos
    { name: 'Nome do produto', quantity: 1, price: 900 },
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 900; // R$9,00
  const discount = 900; // R$9,00
  const total = subtotal + deliveryFee - discount;

  const deliveryAddress = {
    street: 'Rua das Flores, 123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  };

  return (
    <>
      <StatusBar 
        style="dark"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: colors.white }]} 
        edges={['top']}
      >
        <View style={{ backgroundColor: colors.gray[50], flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.black} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pedido {orderNumber}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status do pedido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status do pedido</Text>
            <View style={styles.timelineContainer}>
              {orderStatus.map((status, index) => (
                <View key={index} style={styles.timelineItem}>
                  <OrderStepsIcon
                    step={status.step}
                    state={status.state}
                    showConnector={index < orderStatus.length - 1}
                  />
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        status.state === 'Current' && styles.timelineLabelCurrent,
                        status.state === 'Complete' && styles.timelineLabelComplete,
                      ]}
                    >
                      {status.label}
                    </Text>
                    {status.date && (
                      <Text style={styles.timelineDate}>{status.date}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Informações do pedido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do pedido</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data do pedido</Text>
              <Text style={styles.infoValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número do pedido</Text>
              <Text style={styles.infoValue}>{orderId}</Text>
            </View>
          </View>

          {/* Endereço de entrega */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Endereço de entrega</Text>
            </View>
            <View style={styles.addressCard}>
              <Text style={styles.addressStreet}>{deliveryAddress.street}</Text>
              <Text style={styles.addressLine}>{deliveryAddress.complement}</Text>
              <Text style={styles.addressLine}>
                {deliveryAddress.neighborhood}, {deliveryAddress.city} - {deliveryAddress.state}
              </Text>
              <Text style={styles.addressLine}>CEP: {deliveryAddress.zipCode}</Text>
            </View>
          </View>

          {/* Forma de pagamento */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Forma de pagamento</Text>
            </View>
            <View style={styles.paymentCard}>
              <CreditCard size={24} color={colors.black} strokeWidth={2} />
              <View style={styles.paymentCardContent}>
                <Text style={styles.paymentMethodName}>Cartão de crédito</Text>
                <Text style={styles.paymentMethodDetails}>****5678</Text>
              </View>
            </View>
          </View>

          {/* Resumo do pedido */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo do pedido</Text>
            
            {/* Itens do pedido */}
            <View style={styles.itemsList}>
              {orderItems.map((item, index) => (
                <View key={index} style={styles.orderItemRow}>
                  <Text style={styles.orderItemText}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            <Separator style={styles.separator} />

            {/* Totais */}
            <View style={styles.totalsList}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxa de entrega</Text>
                <Text style={styles.totalValue}>{formatCurrency(deliveryFee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.discountLabel]}>Desconto</Text>
                <Text style={[styles.totalValue, styles.discountValue]}>
                  - {formatCurrency(discount)}
                </Text>
              </View>
            </View>

            {/* Total final */}
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Fazer novo pedido"
              variant="primary"
              size="lg"
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
              style={styles.actionButton}
            />
            <Button
              title="Ver todos os pedidos"
              variant="ghost"
              size="lg"
              onPress={() => {
                // TODO: Navegar para lista de pedidos
                console.log('Ver todos os pedidos');
              }}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  timelineContainer: {
    gap: spacing.md + 10, // 26px conforme Figma
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md - 4, // 12px conforme Figma
    alignItems: 'flex-start',
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  timelineLabel: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  timelineLabelCurrent: {
    color: colors.primary,
  },
  timelineLabelComplete: {
    color: colors.green[700],
  },
  timelineDate: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.green[700],
    lineHeight: 16,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  infoValue: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  addressCard: {
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addressStreet: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 20.8, // 1.3 * 16px
  },
  addressLine: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4, // 12px
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    height: 70,
  },
  paymentCardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentMethodName: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
  },
  paymentMethodDetails: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  itemsList: {
    gap: spacing.sm,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  orderItemPrice: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  separator: {
    marginVertical: 0,
  },
  totalsList: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  totalValue: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  discountLabel: {
    color: colors.green[700],
  },
  discountValue: {
    color: colors.green[700],
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  finalTotalLabel: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 19.2, // 1.2 * 16px
  },
  finalTotalValue: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    lineHeight: 21.6, // 1.2 * 18px
  },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});

