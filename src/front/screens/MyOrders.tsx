import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderCard, SectionTitle, Button } from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { ChevronLeft } from 'lucide-react-native';
import type { OrderItem } from '../../../components/ui/OrderCard';

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
  MyOrders: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MyOrders() {
  const navigation = useNavigation<NavigationProp>();

  // Dados mockados dos pedidos
  const ongoingOrders: Array<{
    orderNumber: string;
    orderDate: string;
    status: 'Pendente' | 'Aguardando pagamento' | 'Concluído' | 'Cancelado';
    items: OrderItem[];
    total: number;
  }> = [
    {
      orderNumber: '#99489500',
      orderDate: '06/12/2025 às 00:09',
      status: 'Pendente',
      items: [
        { name: 'Nome do produto', quantity: 3 },
        { name: 'Nome do produto', quantity: 1 },
      ],
      total: 900, // R$9,00 em centavos
    },
  ];

  const allOrders: Array<{
    orderNumber: string;
    orderDate: string;
    status: 'Pendente' | 'Aguardando pagamento' | 'Concluído' | 'Cancelado';
    items: OrderItem[];
    total: number;
  }> = [
    {
      orderNumber: '#99489500',
      orderDate: '06/12/2025 às 00:09',
      status: 'Concluído',
      items: [
        { name: 'Nome do produto', quantity: 3 },
        { name: 'Nome do produto', quantity: 1 },
      ],
      total: 900,
    },
    {
      orderNumber: '#99489501',
      orderDate: '05/12/2025 às 14:30',
      status: 'Cancelado',
      items: [
        { name: 'Nome do produto', quantity: 2 },
      ],
      total: 1800,
    },
    {
      orderNumber: '#99489502',
      orderDate: '04/12/2025 às 10:15',
      status: 'Aguardando pagamento',
      items: [
        { name: 'Nome do produto', quantity: 1 },
      ],
      total: 1200,
    },
  ];

  const handleOrderPress = (orderNumber: string, orderDate: string) => {
    navigation.navigate('OrderDetails', {
      orderNumber,
      orderDate,
      orderId: orderNumber,
    });
  };

  const handlePaymentPress = (orderNumber: string) => {
    // TODO: Navegar para tela de pagamento
    console.log('Fazer pagamento para pedido:', orderNumber);
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
          <Text style={styles.headerTitle}>Meus pedidos</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pedidos em andamento */}
          <View style={styles.section}>
            <SectionTitle
              title="Pedidos em andamento"
              showIcon={false}
              showTimer={false}
              showLink={false}
              showDescription={false}
            />
            {ongoingOrders.map((order) => (
              <OrderCard
                key={order.orderNumber}
                orderNumber={order.orderNumber}
                orderDate={order.orderDate}
                status={order.status}
                items={order.items}
                total={order.total}
                onPress={() => handleOrderPress(order.orderNumber, order.orderDate)}
                onPaymentPress={
                  order.status === 'Aguardando pagamento'
                    ? () => handlePaymentPress(order.orderNumber)
                    : undefined
                }
                style={styles.orderCard}
              />
            ))}
          </View>

          {/* Todos os pedidos */}
          <View style={styles.section}>
            <SectionTitle
              title="Todos os pedidos"
              showIcon={false}
              showTimer={false}
              showLink={false}
              showDescription={false}
            />
            {allOrders.map((order) => (
              <OrderCard
                key={order.orderNumber}
                orderNumber={order.orderNumber}
                orderDate={order.orderDate}
                status={order.status}
                items={order.items}
                total={order.total}
                onPress={() => handleOrderPress(order.orderNumber, order.orderDate)}
                onPaymentPress={
                  order.status === 'Aguardando pagamento'
                    ? () => handlePaymentPress(order.orderNumber)
                    : undefined
                }
                style={styles.orderCard}
              />
            ))}
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
    fontSize: 18,
    fontFamily: 'Instrument Sans',
    fontWeight: '600',
    color: colors.black,
    lineHeight: 16,
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
    gap: 0,
  },
  orderCard: {
    marginTop: spacing.md,
  },
});

