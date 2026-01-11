import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Button, Separator, OrderStepsIcon, PageTitle, Skeleton, ErrorState, Dialog, PixIcon } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { MapPin, Wallet, CreditCard, CircleCheck, Plus } from 'lucide-react-native';
import { orderService, type Order, formatOrderDate, formatCurrency, isOrderInProgress } from '../../services/order.service';
import { usePaymentCard } from '../../contexts/PaymentCardContext';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/payment.service';

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
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderStatus {
  step: 'Confirmação' | 'Preparação' | 'Entrega' | 'Entregue';
  state: 'Default' | 'Current' | 'Complete' | 'Error';
  label: string;
  date?: string;
}

export function OrderDetails() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  
  const { orderNumber, orderDate, orderId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { cards: paymentCards, defaultCard, loading: cardsLoading, addCard: addPaymentCard } = usePaymentCard();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Buscar pedido
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('ID do pedido não fornecido');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Erro ao buscar pedido:', err);
        setError(err.message || 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Mapear histórico de status para timeline com labels dinâmicos
  const getOrderStatus = (): OrderStatus[] => {
    if (!order) return [];

    const status = order.status;
    const historico = order.historicoStatus || [];
    
    // Encontrar datas de cada transição
    const confirmadoDate = historico.find(h => h.statusNovo === 'confirmado')?.criadoEm;
    const preparandoDate = historico.find(h => h.statusNovo === 'preparando')?.criadoEm;
    const saiuParaEntregaDate = historico.find(h => h.statusNovo === 'saiu_para_entrega')?.criadoEm;
    const entregueDate = historico.find(h => h.statusNovo === 'entregue')?.criadoEm;

    // Status auxiliares
    const isPendente = status === 'pendente';
    const isAguardandoPagamento = status === 'aguardando_pagamento';
    const isCancelado = status === 'cancelado';
    const isConfirmado = ['confirmado', 'preparando', 'saiu_para_entrega', 'entregue'].includes(status);
    const isPreparando = status === 'preparando';
    const isPreparado = ['saiu_para_entrega', 'entregue'].includes(status);
    const isSaiuParaEntrega = status === 'saiu_para_entrega';
    const isEntregue = status === 'entregue';

    // Step 1: Confirmação
    let confirmacaoLabel: string;
    let confirmacaoState: 'Default' | 'Current' | 'Complete' | 'Error';
    
    if (isCancelado) {
      // Pedido cancelado
      confirmacaoLabel = 'Pedido cancelado';
      confirmacaoState = 'Error';
    } else if (isConfirmado) {
      // Já foi confirmado
      confirmacaoLabel = 'Confirmado';
      confirmacaoState = 'Complete';
    } else if (isAguardandoPagamento) {
      // Aguardando pagamento
      confirmacaoLabel = 'Aguardando pagamento';
      confirmacaoState = 'Current';
    } else {
      // Ainda aguardando confirmação
      confirmacaoLabel = 'Aguardando confirmação';
      confirmacaoState = 'Current';
    }

    // Step 2: Preparação
    let preparacaoLabel: string;
    let preparacaoState: 'Default' | 'Current' | 'Complete';
    
    if (isPreparado) {
      // Já foi preparado
      preparacaoLabel = 'Preparado';
      preparacaoState = 'Complete';
    } else if (isPreparando) {
      // Está preparando
      preparacaoLabel = 'Preparando';
      preparacaoState = 'Current';
    } else {
      // Ainda não começou a preparação
      preparacaoLabel = 'Preparando';
      preparacaoState = 'Default';
    }

    // Step 3: Entrega
    let entregaLabel: string;
    let entregaState: 'Default' | 'Current' | 'Complete';
    
    if (isEntregue) {
      // Já foi entregue
      entregaLabel = 'Saiu para entrega';
      entregaState = 'Complete';
    } else if (isSaiuParaEntrega) {
      // Saiu para entrega
      entregaLabel = 'Saiu para entrega';
      entregaState = 'Current';
    } else if (isPreparando) {
      // Ainda preparando, aguardando motorista
      entregaLabel = 'Aguardando motorista';
      entregaState = 'Default';
    } else {
      // Ainda não chegou na etapa de entrega
      entregaLabel = 'Aguardando motorista';
      entregaState = 'Default';
    }

    // Step 4: Entregue
    let entregueState: 'Default' | 'Current' | 'Complete';
    if (isEntregue) {
      entregueState = 'Complete';
    } else {
      entregueState = 'Default';
    }

    return [
      {
        step: 'Confirmação',
        state: confirmacaoState,
        label: confirmacaoLabel,
        date: confirmadoDate ? formatOrderDate(confirmadoDate) : undefined,
      },
      {
        step: 'Preparação',
        state: preparacaoState,
        label: preparacaoLabel,
        date: preparandoDate ? formatOrderDate(preparandoDate) : undefined,
      },
      {
        step: 'Entrega',
        state: entregaState,
        label: entregaLabel,
        date: saiuParaEntregaDate ? formatOrderDate(saiuParaEntregaDate) : undefined,
      },
      {
        step: 'Entregue',
        state: entregueState,
        label: 'Entregue',
        date: entregueDate ? formatOrderDate(entregueDate) : undefined,
      },
    ];
  };

  // Formatar método de pagamento
  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'cartao_credito':
        return 'Cartão de crédito';
      case 'cartao_debito':
        return 'Cartão de débito';
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto';
      default:
        return method;
    }
  };

  // Verificar se pode cancelar
  const canCancel = order && isOrderInProgress(order.status) && order.status !== 'cancelado';
  const needsPayment = order && (order.status === 'pendente' || order.status === 'aguardando_pagamento');
  
  // Carregar cartões quando precisar de pagamento
  useEffect(() => {
    if (needsPayment && paymentCards.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultCard?.id || paymentCards[0].id || 'pix');
    }
  }, [needsPayment, paymentCards, defaultCard, selectedPaymentMethod]);

  // Processar pagamento
  const handleProcessPayment = async () => {
    if (!order || !selectedPaymentMethod || !user) return;

    try {
      setProcessingPayment(true);
      setPaymentError(null);

      // Preparar dados do pagador
      if (!user.email) {
        throw new Error('Email do usuário não encontrado');
      }

      const payerData = {
        email: user.email,
        firstName: user.nomeCompleto?.split(' ')[0] || '',
        lastName: user.nomeCompleto?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF' as const,
          number: user.cpf?.replace(/\D/g, '') || '',
        },
      };

      // Processar pagamento
      if (selectedPaymentMethod === 'pix') {
        await paymentService.processOrderPayment(order.id, {
          metodoPagamento: 'pix',
          payer: payerData,
        });
      } else {
        const selectedCard = paymentCards.find(card => card.id === selectedPaymentMethod);
        if (!selectedCard) {
          throw new Error('Cartão selecionado não encontrado');
        }
        
        await paymentService.processOrderPayment(order.id, {
          metodoPagamento: selectedCard.tipo,
          cartaoId: selectedCard.id,
          payer: payerData,
        });
      }

      // Recarregar pedido para atualizar status
      const updatedOrder = await orderService.getOrderById(order.id);
      setOrder(updatedOrder);
    } catch (err: any) {
      console.error('Erro ao processar pagamento:', err);
      setPaymentError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancelar pedido
  const handleCancelOrder = async () => {
    if (!order || !orderId) return;

    try {
      setCanceling(true);
      await orderService.cancelOrder(orderId, cancelReason || undefined);
      
      // Recarregar pedido para atualizar status
      const updatedOrder = await orderService.getOrderById(orderId);
      setOrder(updatedOrder);
      setShowCancelModal(false);
      setCancelReason('');
      
      Alert.alert(
        'Pedido cancelado',
        'Seu pedido foi cancelado com sucesso.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert(
        'Erro ao cancelar',
        err.message || 'Não foi possível cancelar o pedido. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setCanceling(false);
    }
  };

  // Formatar endereço completo
  const formatAddress = (address: Order['endereco']): string => {
    const parts = [
      `${address.rua}, ${address.numero}`,
      address.complemento,
      `${address.bairro}, ${address.cidade} - ${address.estado}`,
      `CEP: ${address.cep}`,
    ].filter(Boolean);
    return parts.join('\n');
  };

  const orderStatus = getOrderStatus();

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
          title={`Pedido ${orderNumber}`}
          showCounter={false}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            /* Loading State */
            <>
              <View style={styles.section}>
                <Skeleton width={150} height={18} borderRadius={4} />
                <View style={{ marginTop: spacing.md, gap: spacing.md }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} width="100%" height={60} borderRadius={8} />
                  ))}
                </View>
              </View>
            </>
          ) : error ? (
            /* Error State */
            <ErrorState
              type="orders"
              title="Erro ao carregar pedido"
              description={error}
              retryLabel="Tentar novamente"
              onRetry={() => {
                setLoading(true);
                if (orderId) {
                  orderService.getOrderById(orderId)
                    .then(setOrder)
                    .catch((err: any) => setError(err.message || 'Erro ao carregar pedido'))
                    .finally(() => setLoading(false));
                }
              }}
              actionLabel="Voltar"
              onAction={() => navigation.goBack()}
            />
          ) : !order ? (
            /* No Order State */
            <ErrorState
              type="not_found"
              title="Pedido não encontrado"
              description="O pedido solicitado não foi encontrado"
              actionLabel="Voltar"
              onAction={() => navigation.goBack()}
            />
          ) : (
            <>
              {/* Status do pedido */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status do pedido</Text>
                <View style={styles.timelineContainer}>
                  {orderStatus.map((status, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <OrderStepsIcon
                        step={status.step}
                        state={status.state === 'Error' ? 'Default' : status.state}
                        showConnector={index < orderStatus.length - 1}
                      />
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            status.state === 'Current' && styles.timelineLabelCurrent,
                            status.state === 'Complete' && styles.timelineLabelComplete,
                            status.state === 'Error' && styles.timelineLabelError,
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

              {/* Seção de pagamento pendente */}
              {needsPayment && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Wallet size={20} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Finalizar pagamento</Text>
                  </View>
                  <Text style={styles.paymentPendingText}>
                    Seu pedido foi criado, mas o pagamento ainda não foi processado. Selecione uma forma de pagamento para finalizar.
                  </Text>

                  {paymentError && (
                    <View style={styles.paymentErrorContainer}>
                      <Text style={styles.paymentErrorText}>{paymentError}</Text>
                    </View>
                  )}

                  {/* Cartões salvos */}
                  {paymentCards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.paymentCard,
                        selectedPaymentMethod === card.id && styles.paymentCardSelected
                      ]}
                      onPress={() => setSelectedPaymentMethod(card.id)}
                      activeOpacity={0.7}
                    >
                      <CreditCard size={24} color={selectedPaymentMethod === card.id ? colors.primary : colors.black} strokeWidth={2} />
                      <View style={styles.paymentCardContent}>
                        <Text style={[
                          styles.paymentMethodName,
                          selectedPaymentMethod === card.id && styles.paymentMethodNameSelected
                        ]}>
                          {card.tipo === 'cartao_credito' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                        </Text>
                        <Text style={styles.paymentMethodDetails}>
                          •••• {card.ultimosDigitos}
                        </Text>
                        {card.cartaoPadrao && (
                          <Text style={styles.defaultCardLabel}>Padrão</Text>
                        )}
                      </View>
                      {selectedPaymentMethod === card.id && (
                        <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  ))}

                  {/* Pix */}
                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      selectedPaymentMethod === 'pix' && styles.paymentCardSelected
                    ]}
                    onPress={() => setSelectedPaymentMethod('pix')}
                    activeOpacity={0.7}
                  >
                    <PixIcon size={24} color={selectedPaymentMethod === 'pix' ? colors.primary : colors.black} />
                    <View style={styles.paymentCardContent}>
                      <Text style={[
                        styles.paymentMethodName,
                        selectedPaymentMethod === 'pix' && styles.paymentMethodNameSelected
                      ]}>
                        Pix
                      </Text>
                    </View>
                    {selectedPaymentMethod === 'pix' && (
                      <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  {/* Botão para processar pagamento */}
                  <Button
                    title={processingPayment ? 'Processando...' : 'Finalizar pagamento'}
                    variant="primary"
                    size="lg"
                    onPress={handleProcessPayment}
                    disabled={!selectedPaymentMethod || processingPayment}
                    loading={processingPayment}
                    style={styles.processPaymentButton}
                  />
                </View>
              )}

              {/* Informações do pedido */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações do pedido</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Data do pedido</Text>
                  <Text style={styles.infoValue}>
                    {orderDate || formatOrderDate(order.criadoEm)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Número do pedido</Text>
                  <Text style={styles.infoValue}>
                    {orderNumber || order.numeroPedido}
                  </Text>
                </View>
                {order.tempoEntrega && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tempo de entrega</Text>
                    <Text style={styles.infoValue}>{order.tempoEntrega}</Text>
                  </View>
                )}
              </View>

              {/* Endereço de entrega */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MapPin size={20} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Endereço de entrega</Text>
                </View>
                <View style={styles.addressCard}>
                  <Text style={styles.addressStreet}>
                    {order.endereco.rua}, {order.endereco.numero}
                  </Text>
                  {order.endereco.complemento && (
                    <Text style={styles.addressLine}>{order.endereco.complemento}</Text>
                  )}
                  <Text style={styles.addressLine}>
                    {order.endereco.bairro}, {order.endereco.cidade} - {order.endereco.estado}
                  </Text>
                  <Text style={styles.addressLine}>CEP: {order.endereco.cep}</Text>
                </View>
              </View>

              {/* Forma de pagamento (só mostra se não precisa pagar) */}
              {!needsPayment && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Wallet size={20} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.sectionTitle}>Forma de pagamento</Text>
                  </View>
                  <View style={styles.paymentCardInfo}>
                    <CreditCard size={24} color={colors.black} strokeWidth={2} />
                    <View style={styles.paymentCardInfoContent}>
                      <Text style={styles.paymentMethodInfoName}>
                        {getPaymentMethodLabel(order.metodoPagamento)}
                      </Text>
                      {order.cartaoId && (
                        <Text style={styles.paymentMethodInfoDetails}>Cartão salvo</Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Resumo do pedido */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo do pedido</Text>
                
                {/* Itens do pedido */}
                <View style={styles.itemsList}>
                  {order.itens.map((item) => (
                    <View key={item.id} style={styles.orderItemRow}>
                      <Text style={styles.orderItemText}>
                        {item.quantidade}x {item.nomeProduto}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        {formatCurrency(item.precoTotal)}
                      </Text>
                    </View>
                  ))}
                </View>

                <Separator style={styles.separator} />

                {/* Totais */}
                <View style={styles.totalsList}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Taxa de entrega</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.taxaEntrega)}</Text>
                  </View>
                  {order.desconto > 0 && (
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, styles.discountLabel]}>Desconto</Text>
                      <Text style={[styles.totalValue, styles.discountValue]}>
                        - {formatCurrency(order.desconto)}
                      </Text>
                    </View>
                  )}
                  {order.cupom && (
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Cupom aplicado</Text>
                      <Text style={styles.totalValue}>{order.cupom.codigo}</Text>
                    </View>
                  )}
                </View>

                {/* Total final */}
                <View style={styles.finalTotalRow}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>
                    {formatCurrency(order.total)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {canCancel && (
                  <Button
                    title="Cancelar pedido"
                    variant="ghost"
                    size="lg"
                    onPress={() => setShowCancelModal(true)}
                    style={[styles.actionButton, styles.cancelButton]}
                    textColor={colors.red[600] || '#dc2626'}
                  />
                )}
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
                    navigation.navigate('MyOrders');
                  }}
                  style={styles.actionButton}
                />
              </View>
            </>
          )}
        </ScrollView>
        </View>
      </SafeAreaView>

      {/* Dialog de Cancelamento */}
      <Dialog
        visible={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
        }}
        title="Cancelar pedido"
        description="Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
        primaryButtonLabel="Cancelar pedido"
        primaryButtonVariant="error"
        primaryButtonOnPress={handleCancelOrder}
        primaryButtonDisabled={canceling}
        primaryButtonLoading={canceling}
        secondaryButtonLabel="Voltar"
        secondaryButtonVariant="ghost"
        secondaryButtonOnPress={() => {
          setShowCancelModal(false);
          setCancelReason('');
        }}
      />
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
    overflow: 'visible',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md - 4, // 12px conforme Figma
    alignItems: 'flex-start',
    overflow: 'visible',
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
  timelineLabelError: {
    color: colors.red[600] || '#dc2626',
  },
  paymentPendingText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  paymentErrorContainer: {
    backgroundColor: colors.red[600] ? `${colors.red[600]}15` : '#dc262615',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  paymentErrorText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.red[600] || '#dc2626',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  paymentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  paymentCardContent: {
    flex: 1,
    gap: 2,
  },
  paymentMethodName: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
  },
  paymentMethodNameSelected: {
    color: colors.primary,
  },
  paymentMethodDetails: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  defaultCardLabel: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    marginTop: 2,
  },
  processPaymentButton: {
    marginTop: spacing.md,
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
  // Estilos para seção de forma de pagamento (exibida quando pago)
  paymentCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4, // 12px
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    height: 70,
  },
  paymentCardInfoContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentMethodInfoName: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
  },
  paymentMethodInfoDetails: {
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
  cancelButton: {
    borderColor: colors.red[600] || '#dc2626',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: colors.red[600] || '#dc2626',
  },
});

