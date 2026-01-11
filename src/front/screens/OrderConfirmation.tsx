import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Separator, ReceiptTopPattern, ReceiptBottomPattern, Logo } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { Check, AlertTriangle } from 'lucide-react-native';

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
    orderId?: string;
    paymentError?: {
      message: string;
      code: string;
    };
  };
  OrderDetails: {
    orderNumber: string;
    orderDate?: string;
    orderId?: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OrderConfirmationRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

export function OrderConfirmation() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderConfirmationRouteProp>();
  
  const { orderNumber, deliveryTime, totalPaid, orderId, paymentError } = route.params || {
    orderNumber: '#987374340',
    deliveryTime: '30-40min',
    totalPaid: 4264, // R$ 42,64 em centavos
  };

  const hasPaymentError = !!paymentError;

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
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
        edges={['top', 'bottom']}
      >
        <View style={{ backgroundColor: colors.white, flex: 1 }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Icon (Success or Warning) */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, hasPaymentError ? styles.warningCircle : styles.successCircle]}>
              {hasPaymentError ? (
                <AlertTriangle size={48} color={colors.white} strokeWidth={3} />
              ) : (
                <Check size={48} color={colors.white} strokeWidth={3} />
              )}
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, hasPaymentError && styles.warningTitle]}>
              {hasPaymentError ? 'Pagamento pendente' : 'Pedido confirmado!'}
            </Text>
            <Text style={styles.description}>
              {hasPaymentError 
                ? 'Seu pedido foi criado, mas o pagamento não foi processado. Finalize o pagamento para continuar.'
                : 'Seu pedido foi recebido e está sendo preparado'
              }
            </Text>
            {hasPaymentError && paymentError && (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>
                  {paymentError.message || 'Erro ao processar pagamento'}
                </Text>
              </View>
            )}
          </View>

          {/* Receipt Card */}
          <View style={styles.receiptWrapper}>
            {/* Top Pattern */}
            <ReceiptTopPattern width="100%" height={12} />

            {/* Receipt Content */}
            <View style={styles.receiptContainer}>
              <View style={styles.receiptContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <Logo width={68.64} height={32} />
                </View>

                {/* Order Number */}
                <View style={styles.receiptField}>
                  <Text style={styles.receiptLabel}>Número do pedido</Text>
                  <Text style={styles.receiptValue}>{orderNumber}</Text>
                </View>

                <Separator style={styles.separator} />

                {/* Delivery Time */}
                <View style={styles.receiptField}>
                  <Text style={styles.receiptLabel}>Previsão de entrega</Text>
                  <Text style={[styles.receiptValue, styles.deliveryTimeValue]}>
                    {deliveryTime}
                  </Text>
                </View>

                <Separator style={styles.separator} />

                {/* Total Paid */}
                <View style={styles.receiptField}>
                  <Text style={styles.receiptLabel}>Total pago</Text>
                  <Text style={[styles.receiptValue, styles.totalPaidValue]}>
                    {formatCurrency(totalPaid)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Pattern */}
            <ReceiptBottomPattern width="100%" height={12} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {hasPaymentError ? (
              <>
                <Button
                  title="Finalizar pagamento"
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    if (orderId) {
                      navigation.navigate('OrderDetails', {
                        orderNumber,
                        orderDate: new Date().toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        orderId,
                      });
                    }
                  }}
                  style={styles.actionButton}
                />
                <Button
                  title="Voltar pro início"
                  variant="ghost"
                  size="lg"
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  }}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <>
                <Button
                  title="Acompanhar pedido"
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    navigation.navigate('OrderDetails', {
                      orderNumber,
                      orderDate: new Date().toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      orderId: orderId || orderNumber,
                    });
                  }}
                  style={styles.actionButton}
                />
                <Button
                  title="Voltar pro início"
                  variant="ghost"
                  size="lg"
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  }}
                  style={styles.actionButton}
                />
              </>
            )}
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            {hasPaymentError 
              ? 'Finalize o pagamento para que seu pedido seja processado.'
              : 'Você receberá atualizações sobre o seu pedido em tempo real.'
            }
          </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl, // 40px conforme Figma
    paddingTop: spacing.lg, // 20px conforme Figma
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: spacing.lg, // 24px conforme Figma
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    backgroundColor: colors.green[700],
  },
  warningCircle: {
    backgroundColor: colors.orange[500] || '#f97316',
  },
  titleContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  title: {
    ...typography['2xl'],
    fontWeight: fontWeights.semibold,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 31.2, // 1.3 * 24px
  },
  warningTitle: {
    color: colors.orange[500] || '#f97316',
  },
  errorMessageContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.red[600] ? `${colors.red[600]}15` : '#dc262615',
    borderRadius: borderRadius.md,
    width: '100%',
  },
  errorMessageText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.red[600] || '#dc2626',
    textAlign: 'center',
    lineHeight: 18.2,
  },
  description: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20.8, // 1.3 * 16px
  },
  receiptWrapper: {
    width: '100%',
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: '#FDF9CE',
  },
  receiptContent: {
    padding: spacing.lg, // 20px
    gap: spacing.md, // 16px
  },
  logoContainer: {
    marginBottom: spacing.xs,
  },
  receiptField: {
    gap: spacing.xs, // 4px
  },
  receiptLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  receiptValue: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 20.8, // 1.3 * 16px
  },
  deliveryTimeValue: {
    color: colors.primary,
  },
  totalPaidValue: {
    color: colors.green[700],
  },
  separator: {
    marginVertical: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.sm, // 4px conforme Figma
  },
  actionButton: {
    width: '100%',
  },
  footerText: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 15.6, // 1.3 * 12px
    paddingHorizontal: spacing.md,
  },
});

