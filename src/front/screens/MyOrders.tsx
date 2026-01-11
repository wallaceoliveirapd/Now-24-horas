import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useCallback } from 'react';
import { OrderCard, SectionTitle, Button, Skeleton, EmptyState, PageTitle, ErrorState, Chip } from '../../../components/ui';
import { colors, spacing, typography } from '../../lib/styles';
import type { OrderItem } from '../../../components/ui/OrderCard';
import { 
  orderService, 
  type OrderSummary, 
  type BackendOrderStatus,
  type OrderFilters,
  mapOrderStatus, 
  isOrderInProgress, 
  formatOrderDate 
} from '../../services/order.service';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<BackendOrderStatus | 'todos'>('todos');
  const [pagination, setPagination] = useState({
    pagina: 1,
    temProximaPagina: false,
  });

  // Filtros disponíveis
  const filters: Array<{ label: string; value: BackendOrderStatus | 'todos' }> = [
    { label: 'Todos', value: 'todos' },
    { label: 'Em andamento', value: 'pendente' },
    { label: 'Aguardando pagamento', value: 'aguardando_pagamento' },
    { label: 'Concluídos', value: 'entregue' },
    { label: 'Cancelados', value: 'cancelado' },
  ];

  // Buscar pedidos
  const fetchOrders = useCallback(async (reset: boolean = false, page?: number) => {
    try {
      if (reset) {
        setError(null);
        setLoading(true);
        setPagination({ pagina: 1, temProximaPagina: false });
      } else {
        setLoadingMore(true);
      }

      const currentPage = page || (reset ? 1 : pagination.pagina);
      const filters: OrderFilters = selectedFilter !== 'todos' ? { status: selectedFilter } : {};
      
      const response = await orderService.getOrders({
        ...filters,
        pagina: currentPage,
        limite: 20,
      });

      if (reset) {
        setOrders(response.pedidos);
      } else {
        setOrders(prev => [...prev, ...response.pedidos]);
      }

      setPagination({
        pagina: response.paginacao.pagina,
        temProximaPagina: response.paginacao.temProximaPagina,
      });
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      setError(err.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedFilter, pagination.pagina]);

  // Carregar pedidos na montagem e quando filtro mudar
  useEffect(() => {
    fetchOrders(true);
  }, [selectedFilter]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  // Carregar mais pedidos (paginação infinita)
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.temProximaPagina && !loading) {
      const nextPage = pagination.pagina + 1;
      fetchOrders(false, nextPage);
    }
  }, [loadingMore, pagination.temProximaPagina, pagination.pagina, loading, fetchOrders]);

  // Separar pedidos em "em andamento" e "todos"
  const ongoingOrders = orders.filter(order => isOrderInProgress(order.status));
  const allOrders = orders.filter(order => !isOrderInProgress(order.status));

  // Converter OrderSummary para formato do OrderCard
  const convertToOrderCardData = (order: OrderSummary) => {
    // Usar resumo de itens se disponível
    const items: OrderItem[] = order.resumoItens
      ? order.resumoItens.itens.map(item => ({
          name: item.nomeProduto,
          quantity: item.quantidade,
        }))
      : [];

    return {
      orderNumber: order.numeroPedido,
      orderDate: formatOrderDate(order.criadoEm),
      status: mapOrderStatus(order.status),
      items,
      total: order.total,
      orderId: order.id,
    };
  };

  const handleOrderPress = (orderId: string, orderNumber: string, orderDate: string) => {
    navigation.navigate('OrderDetails', {
      orderId,
      orderNumber,
      orderDate,
    });
  };

  const handlePaymentPress = (orderId: string, orderNumber: string) => {
    // TODO: Navegar para tela de pagamento quando implementada
    console.log('Fazer pagamento para pedido:', orderNumber);
    // navigation.navigate('Payment', { orderId });
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
        <PageTitle
          title="Meus pedidos"
          showCounter={false}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
            
            if (isCloseToBottom && pagination.temProximaPagina && !loadingMore) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Filtros */}
          {!loading && (
            <View style={styles.filtersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContent}
                style={styles.filtersScrollView}
              >
                {filters.map((filter) => (
                  <Chip
                    key={filter.value}
                    label={filter.label}
                    type={selectedFilter === filter.value ? 'Primary' : 'Default'}
                    state={selectedFilter === filter.value ? 'Selected' : 'Default'}
                    onPress={() => setSelectedFilter(filter.value)}
                    style={styles.filterChip}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          {loading ? (
            /* Skeleton Loading */
            <>
              <View style={styles.section}>
                <Skeleton width={150} height={18} borderRadius={4} />
                {[1, 2].map((i) => (
                  <View key={i} style={styles.skeletonOrderCard}>
                    <Skeleton width="100%" height={120} borderRadius={8} style={{ marginTop: spacing.md }} />
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                <Skeleton width={150} height={18} borderRadius={4} />
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.skeletonOrderCard}>
                    <Skeleton width="100%" height={120} borderRadius={8} style={{ marginTop: spacing.md }} />
                  </View>
                ))}
              </View>
            </>
          ) : error ? (
            /* Error State */
            <ErrorState
              type="orders"
              title="Erro ao carregar pedidos"
              description={error}
              retryLabel="Tentar novamente"
              onRetry={fetchOrders}
              actionLabel="Voltar"
              onAction={() => navigation.goBack()}
            />
          ) : ongoingOrders.length === 0 && allOrders.length === 0 ? (
            /* Empty State */
            <EmptyState
              type="orders"
              title="Nenhum pedido encontrado"
              description="Seus pedidos aparecerão aqui quando você fizer uma compra"
              actionLabel="Explorar produtos"
              onActionPress={() => navigation.navigate('Search')}
            />
          ) : (
            <>
              {/* Pedidos em andamento */}
              {ongoingOrders.length > 0 && (
                <View style={styles.section}>
                  <SectionTitle
                    title="Pedidos em andamento"
                    showIcon={false}
                    showTimer={false}
                    showLink={false}
                    showDescription={false}
                  />
                  {ongoingOrders.map((order) => {
                    const cardData = convertToOrderCardData(order);
                    return (
                      <OrderCard
                        key={order.id}
                        orderNumber={cardData.orderNumber}
                        orderDate={cardData.orderDate}
                        status={cardData.status}
                        items={cardData.items}
                        total={cardData.total}
                        onPress={() => handleOrderPress(cardData.orderId!, cardData.orderNumber, cardData.orderDate)}
                        onPaymentPress={
                          cardData.status === 'Aguardando pagamento'
                            ? () => handlePaymentPress(cardData.orderId!, cardData.orderNumber)
                            : undefined
                        }
                        style={styles.orderCard}
                      />
                    );
                  })}
                </View>
              )}

              {/* Todos os pedidos */}
              {allOrders.length > 0 && (
                <View style={styles.section}>
                  <SectionTitle
                    title="Todos os pedidos"
                    showIcon={false}
                    showTimer={false}
                    showLink={false}
                    showDescription={false}
                  />
                  {allOrders.map((order) => {
                    const cardData = convertToOrderCardData(order);
                    return (
                      <OrderCard
                        key={order.id}
                        orderNumber={cardData.orderNumber}
                        orderDate={cardData.orderDate}
                        status={cardData.status}
                        items={cardData.items}
                        total={cardData.total}
                        onPress={() => handleOrderPress(cardData.orderId!, cardData.orderNumber, cardData.orderDate)}
                        onPaymentPress={
                          cardData.status === 'Aguardando pagamento'
                            ? () => handlePaymentPress(cardData.orderId!, cardData.orderNumber)
                            : undefined
                        }
                        style={styles.orderCard}
                      />
                    );
                  })}
                </View>
              )}

              {/* Loading More Indicator */}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingMoreText}>Carregando mais pedidos...</Text>
                </View>
              )}
            </>
          )}
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
  skeletonOrderCard: {
    marginTop: spacing.md,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  filtersScrollView: {
    flexGrow: 0,
  },
  filtersContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  loadingMoreContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingMoreText: {
    ...typography.sm,
    color: colors.mutedForeground,
  },
});

