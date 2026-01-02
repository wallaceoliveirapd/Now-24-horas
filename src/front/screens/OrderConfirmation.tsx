import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Separator, ReceiptTopPattern, ReceiptBottomPattern, Logo } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { CircleCheck } from 'lucide-react-native';

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
type OrderConfirmationRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

export function OrderConfirmation() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderConfirmationRouteProp>();
  
  const { orderNumber, deliveryTime, totalPaid } = route.params || {
    orderNumber: '#987374340',
    deliveryTime: '30-40min',
    totalPaid: 4264, // R$ 42,64 em centavos
  };

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
        style={styles.safeArea} 
        edges={['top', 'bottom']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <CircleCheck size={80} color={colors.green[700]} strokeWidth={2} />
          </View>

          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Pedido confirmado!</Text>
            <Text style={styles.description}>
              Seu pedido foi recebido e está sendo preparado
            </Text>
          </View>

          {/* Receipt Card */}
          <View style={styles.receiptContainer}>
            {/* Top Pattern */}
            <ReceiptTopPattern width="100%" height={12} />

            {/* Receipt Content */}
            <View style={styles.receiptContent}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Logo width={52} height={24} />
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

            {/* Bottom Pattern */}
            <ReceiptBottomPattern width="100%" height={12} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
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
                  orderId: orderNumber,
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
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Você receberá atualizações sobre o seu pedido em tempo real.
          </Text>
        </ScrollView>
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
    gap: spacing.lg, // 24px conforme Figma
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
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
  description: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20.8, // 1.3 * 16px
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: '#FEFCEA',
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

