import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo, useEffect } from 'react';
import { 
  PageTitle,
  Separator,
  Button,
  Skeleton,
  ModalBottomSheet,
  Input,
  PixIcon,
  Chip,
  EmptyState
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { useCart } from '../../contexts/CartContext';
import { useAddress } from '../../contexts/AddressContext';
import { usePaymentCard } from '../../contexts/PaymentCardContext';
import { calculateCouponDiscount } from '../../lib/couponUtils';
import { orderService } from '../../services/order.service';
import { addressService } from '../../services/address.service';
import { paymentService } from '../../services/payment.service';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Wallet, 
  CreditCard, 
  CircleCheck,
  CheckCircle2,
  Plus,
  Home,
  Building2,
  UserRound,
  Edit,
  Trash2,
  Star
} from 'lucide-react-native';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: undefined;
  Checkout: undefined;
  OrderProcessing: {
    orderNumber: string;
    deliveryTime: string;
    totalPaid: number;
  };
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PaymentMethod = string | 'pix'; // string para IDs de cartões, 'pix' para pix

export function Checkout() {
  const navigation = useNavigation<NavigationProp>();
  const { items: cartItems, appliedCoupon, clearCart } = useCart();
  const { addresses, selectedAddressId, setSelectedAddressId, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress();
  const { cards: paymentCards, defaultCard, loading: cardsLoading, addCard: addPaymentCard } = usePaymentCard();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    defaultCard?.id || paymentCards[0]?.id || 'pix'
  );
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [addressesModalVisible, setAddressesModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cardType, setCardType] = useState<'Crédito' | 'Débito'>('Crédito');
  const [addressType, setAddressType] = useState<'Casa' | 'Trabalho' | 'Outro'>('Casa');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
  });
  const [addressForm, setAddressForm] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        // Aguardar carregamento de cartões
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Atualizar método de pagamento selecionado quando cartões carregarem
  useEffect(() => {
    if (!cardsLoading && paymentCards.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultCard?.id || paymentCards[0].id);
    }
  }, [cardsLoading, paymentCards, defaultCard, selectedPaymentMethod]);

  // Calcular tempo de entrega quando endereço for selecionado
  useEffect(() => {
    const fetchDeliveryTime = async () => {
      if (!selectedAddressId) {
        setDeliveryTime('20-40 minutos');
        return;
      }

      try {
        setLoadingDeliveryTime(true);
        const time = await addressService.getDeliveryTime(selectedAddressId);
        setDeliveryTime(time);
      } catch (error) {
        console.error('Erro ao calcular tempo de entrega:', error);
        // Manter tempo padrão em caso de erro
        setDeliveryTime('20-40 minutos');
      } finally {
        setLoadingDeliveryTime(false);
      }
    };

    fetchDeliveryTime();
  }, [selectedAddressId]);

  // Endereço de entrega selecionado
  const deliveryAddress = addresses.find(addr => addr.id === selectedAddressId) || addresses[0] || null;

  // Tempo de entrega (calculado dinamicamente)
  const [deliveryTime, setDeliveryTime] = useState<string>('20-40 minutos');
  const [loadingDeliveryTime, setLoadingDeliveryTime] = useState(false);

  // Calcular totais
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = appliedCoupon 
      ? calculateCouponDiscount(appliedCoupon, subtotal, deliveryFee)
      : 0;
    const total = subtotal + deliveryFee - discount;
    
    return {
      subtotal,
      deliveryFee,
      discount,
      total,
    };
  }, [cartItems, appliedCoupon]);

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Verificar se pode confirmar pagamento
  const canConfirmPayment = selectedAddressId !== null && addresses.length > 0 && cartItems.length > 0 && !creatingOrder;

  // Confirmar pagamento
  const handleConfirmPayment = async () => {
    if (!selectedAddressId) {
      setError('Selecione um endereço de entrega');
      return;
    }

    if (cartItems.length === 0) {
      setError('Carrinho está vazio');
      return;
    }

    try {
      setCreatingOrder(true);
      setError(null);

      // Mapear método de pagamento
      let metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix';
      let cartaoId: string | undefined;

      if (selectedPaymentMethod === 'pix') {
        metodoPagamento = 'pix';
        cartaoId = undefined;
      } else {
        // Buscar cartão selecionado
        const selectedCard = paymentCards.find(card => card.id === selectedPaymentMethod);
        if (!selectedCard) {
          throw new Error('Cartão selecionado não encontrado');
        }
        metodoPagamento = selectedCard.tipo;
        cartaoId = selectedCard.id;
      }

      // Criar pedido
      const response = await orderService.createOrder({
        enderecoId: selectedAddressId,
        metodoPagamento,
        cartaoId,
        observacoes: undefined,
        instrucoesEntrega: undefined,
      });

      const order = response.pedido;

      // Processar pagamento após criar pedido
      let paymentError: any = null;
      try {
        // Preparar dados do pagador
        if (!user?.email) {
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
        if (metodoPagamento === 'pix') {
          // Para PIX, processar pagamento e aguardar webhook
          await paymentService.processOrderPayment(order.id, {
            metodoPagamento: 'pix',
            payer: payerData,
          });
        } else if (cartaoId) {
          // Para cartão, precisamos do token do cartão
          // Por enquanto, vamos processar sem token (o backend pode buscar o token do cartão salvo)
          // TODO: Implementar busca de token do cartão salvo ou solicitar CVV
          await paymentService.processOrderPayment(order.id, {
            metodoPagamento,
            cartaoId,
            payer: payerData,
          });
        }

        console.log('✅ Pagamento processado com sucesso');
      } catch (err: any) {
        console.error('⚠️  Erro ao processar pagamento:', err);
        paymentError = err;
      }

      // Limpar carrinho
      clearCart();

      // Navegar diretamente para OrderConfirmation com informação de erro
      navigation.navigate('OrderConfirmation', {
        orderNumber: order.numeroPedido,
        deliveryTime: order.tempoEntrega || '20-40 minutos',
        totalPaid: order.total,
        orderId: order.id,
        paymentError: paymentError ? {
          message: paymentError.message || 'Erro ao processar pagamento',
          code: paymentError.code || 'PAYMENT_ERROR',
        } : undefined,
      });
    } catch (err: any) {
      console.error('Erro ao criar pedido:', err);
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao criar pedido. Tente novamente.';
      if (err.message) {
        if (err.message.includes('Carrinho')) {
          errorMessage = 'Seu carrinho está vazio. Adicione itens antes de finalizar.';
        } else if (err.message.includes('Endereço')) {
          errorMessage = 'Endereço inválido. Selecione um endereço válido.';
        } else if (err.message.includes('Estoque')) {
          errorMessage = 'Alguns produtos não têm estoque suficiente.';
        } else if (err.message.includes('Cupom')) {
          errorMessage = 'Cupom inválido ou expirado.';
        } else if (err.message.includes('Cartão')) {
          errorMessage = 'Cartão inválido. Verifique os dados do cartão.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setSuccessMessage(null);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Formatar número do cartão (últimos 4 dígitos)
  const formatCardNumber = (lastDigits: string) => {
    return `****${lastDigits}`;
  };

  // Formatar tipo de cartão para exibição
  const formatCardType = (tipo: 'cartao_credito' | 'cartao_debito') => {
    return tipo === 'cartao_credito' ? 'Cartão de crédito' : 'Cartão de débito';
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
          {loading ? (
          <View style={styles.skeletonHeader}>
            <Skeleton width={24} height={24} borderRadius={4} />
            <Skeleton width={150} height={20} borderRadius={4} style={{ marginLeft: spacing.md }} />
            <Skeleton width={24} height={24} borderRadius={4} style={{ marginLeft: 'auto' }} />
          </View>
        ) : (
          <PageTitle
            title="Finalizar pedido"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.skeletonContent}>
            {/* Skeleton Address */}
            <View style={styles.skeletonSectionWrapper}>
              <View style={styles.skeletonSection}>
                <Skeleton width={150} height={18} borderRadius={4} />
                <Skeleton width="100%" height={120} borderRadius={8} style={{ marginTop: spacing.md }} />
              </View>
            </View>

            {/* Skeleton Delivery Time */}
            <View style={styles.skeletonSectionWrapper}>
              <View style={styles.skeletonSection}>
                <Skeleton width={150} height={18} borderRadius={4} />
                <Skeleton width="100%" height={60} borderRadius={8} style={{ marginTop: spacing.md }} />
              </View>
            </View>

            {/* Skeleton Payment */}
            <View style={styles.skeletonSectionWrapper}>
              <View style={styles.skeletonSection}>
                <Skeleton width={150} height={18} borderRadius={4} />
                <Skeleton width="100%" height={80} borderRadius={8} style={{ marginTop: spacing.md }} />
              </View>
            </View>

            {/* Skeleton Order Summary */}
            <View style={styles.skeletonSectionWrapper}>
              <View style={styles.skeletonSection}>
                <Skeleton width={150} height={18} borderRadius={4} />
                <Skeleton width="100%" height={200} borderRadius={8} style={{ marginTop: spacing.md }} />
              </View>
            </View>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* Endereço de entrega - sempre visível */}
            <View style={styles.sectionWrapper}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MapPin size={20} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Endereço de entrega</Text>
                </View>
                
                {addresses.length === 0 ? (
                  <EmptyState
                    type="generic"
                    icon={MapPin}
                    title="Nenhum endereço cadastrado"
                    description="Adicione um endereço para continuar com o pedido"
                    actionLabel="Adicionar endereço"
                    onActionPress={() => setAddAddressModalVisible(true)}
                    style={styles.emptyState}
                  />
                ) : !selectedAddressId ? (
                  <View style={styles.emptyAddressContainer}>
                    <Text style={styles.emptyAddressText}>
                      Selecione um endereço de entrega
                    </Text>
                    <Button
                      title="Selecionar endereço"
                      variant="primary"
                      size="md"
                      onPress={() => setAddressesModalVisible(true)}
                      style={styles.selectAddressButton}
                    />
                  </View>
                ) : deliveryAddress ? (
                  <>
                    <View style={styles.addressCard}>
                      <Text style={styles.addressStreet}>{deliveryAddress.street}</Text>
                      {deliveryAddress.complement && (
                        <Text style={styles.addressLine}>{deliveryAddress.complement}</Text>
                      )}
                      <Text style={styles.addressLine}>
                        {deliveryAddress.neighborhood}, {deliveryAddress.city} - {deliveryAddress.state}
                      </Text>
                      <Text style={styles.addressLine}>CEP: {deliveryAddress.zipCode}</Text>
                    </View>
                    <Button
                      title="Alterar endereço de entrega"
                      variant="ghost"
                      size="md"
                      onPress={() => setAddressesModalVisible(true)}
                      style={styles.changeAddressButton}
                    />
                  </>
                ) : null}
              </View>
            </View>

            {/* Tempo de entrega */}
            {selectedAddressId && (
              <View style={styles.sectionWrapper}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Clock size={20} color={colors.primary} strokeWidth={2} />
                    <View style={styles.sectionHeaderContent}>
                      <Text style={styles.sectionTitle}>Tempo de entrega</Text>
                      {loadingDeliveryTime ? (
                        <Text style={styles.deliveryTime}>Calculando...</Text>
                      ) : (
                        <Text style={styles.deliveryTime}>{deliveryTime}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Forma de pagamento */}
            <View style={styles.sectionWrapper}>
              <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Wallet size={20} color={colors.primary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Forma de pagamento</Text>
              </View>

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
                      {formatCardType(card.tipo)}
                    </Text>
                    <Text style={styles.paymentMethodDetails}>
                      {formatCardNumber(card.ultimosDigitos)}
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

              {/* Botão adicionar novo cartão */}
              <Button
                title="Adicionar novo cartão"
                variant="ghost"
                size="md"
                onPress={() => setAddCardModalVisible(true)}
                style={styles.addCardButtonGhost}
              />
              </View>
            </View>

            {/* Resumo do pedido */}
            <View style={styles.sectionWrapper}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo do pedido</Text>

                {/* Lista de itens */}
                <View style={styles.itemsList}>
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Text 
                        style={styles.orderItemText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.quantity}x {item.title}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        {formatCurrency(item.finalPrice * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <Separator style={styles.separator} />

                {/* Totais */}
                <View style={styles.totalsList}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Taxa de entrega</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totals.deliveryFee)}</Text>
                  </View>
                  {appliedCoupon && (
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, styles.discountLabel]}>Desconto</Text>
                      <Text style={[styles.totalValue, styles.discountValue]}>
                        - {formatCurrency(totals.discount)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Fixed Bottom Bar */}
        {!loading && (
          <View style={styles.bottomBar}>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>
                {formatCurrency(totals.total)}
              </Text>
            </View>
            {error && (
              <View style={styles.messageContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {successMessage && (
              <View style={[styles.messageContainer, styles.successContainer]}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}
            <Button
              title={creatingOrder ? "Processando..." : "Confirmar pagamento"}
              variant="primary"
              size="lg"
              onPress={handleConfirmPayment}
              disabled={!canConfirmPayment}
              loading={creatingOrder}
              style={styles.confirmButton}
            />
          </View>
        )}

        {/* Modal Adicionar Novo Cartão */}
        <ModalBottomSheet
          visible={addCardModalVisible}
          onClose={() => setAddCardModalVisible(false)}
          title="Adicionar novo cartão"
          showPrimaryButton={true}
          primaryButtonLabel={creatingOrder ? "Cadastrando..." : "Cadastrar cartão"}
          primaryButtonOnPress={async () => {
            // Validações
            if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 13) {
              setError('Número do cartão inválido');
              return;
            }
            if (!cardForm.cardName) {
              setError('Nome do titular é obrigatório');
              return;
            }
            if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) {
              setError('Data de validade inválida');
              return;
            }
            if (!cardForm.cvv || cardForm.cvv.length < 3) {
              setError('CVV inválido');
              return;
            }
            if (!cardForm.cpf || cardForm.cpf.replace(/\D/g, '').length < 11) {
              setError('CPF inválido');
              return;
            }

            try {
              setCreatingOrder(true);
              setError(null);

              // Extrair mês e ano da validade
              const [month, year2Digits] = cardForm.expiryDate.split('/');
              // Converter ano de 2 dígitos para 4 dígitos
              const currentYear = new Date().getFullYear();
              const currentCentury = Math.floor(currentYear / 100) * 100;
              const year4Digits = currentCentury + parseInt(year2Digits);
              
              // Garantir que o mês tenha 2 dígitos
              const monthFormatted = month.padStart(2, '0');
              
              const cardNumberDigits = cardForm.cardNumber.replace(/\s/g, '');
              const cpfDigits = cardForm.cpf.replace(/\D/g, '');

              // Adicionar cartão via backend
              const newCard = await addPaymentCard({
                cardNumber: cardNumberDigits,
                cardholderName: cardForm.cardName,
                cardExpirationMonth: monthFormatted,
                cardExpirationYear: year4Digits.toString(),
                securityCode: cardForm.cvv,
                identificationType: 'CPF',
                identificationNumber: cpfDigits,
              });

              // Selecionar o novo cartão
              setSelectedPaymentMethod(newCard.id);
              setAddCardModalVisible(false);
              
              // Resetar formulário
              setCardForm({
                cardNumber: '',
                cardName: '',
                expiryDate: '',
                cvv: '',
                cpf: '',
              });
              setCardType('Crédito');
              
              // Feedback de sucesso
              setSuccessMessage('Cartão adicionado com sucesso!');
              setError(null);
              setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err: any) {
              console.error('Erro ao cadastrar cartão:', err);
              const errorMessage = err.message || 'Erro ao cadastrar cartão. Tente novamente.';
              setError(errorMessage);
              setSuccessMessage(null);
            } finally {
              setCreatingOrder(false);
            }
          }}
          primaryButtonDisabled={creatingOrder}
        >
          <View style={styles.cardForm}>
            {/* Chips de tipo de cartão */}
            <View style={styles.cardTypeChips}>
              <Chip
                label="Crédito"
                state={cardType === 'Crédito' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setCardType('Crédito')}
                style={styles.cardTypeChip}
              />
              <Chip
                label="Débito"
                state={cardType === 'Débito' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setCardType('Débito')}
                style={styles.cardTypeChip}
              />
            </View>
            
            {/* Número do cartão */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Número do cartão *</Text>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardForm.cardNumber}
                onChangeText={(text) => {
                  // Formatar número do cartão (adicionar espaços a cada 4 dígitos)
                  const formatted = text.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setCardForm({ ...cardForm, cardNumber: formatted });
                }}
                keyboardType="numeric"
                maxLength={19} // 16 dígitos + 3 espaços
                state="Default"
                showSearchIcon={false}
              />
            </View>

            {/* Nome no cartão */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nome no cartão *</Text>
              <Input
                placeholder="Nome como no cartão"
                value={cardForm.cardName}
                onChangeText={(text) => setCardForm({ ...cardForm, cardName: text })}
                state="Default"
                showSearchIcon={false}
              />
            </View>

            {/* Validade e CVV lado a lado */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.formFieldHalf]}>
                <Text style={styles.formLabel}>Validade *</Text>
                <Input
                  placeholder="MM/AA"
                  value={cardForm.expiryDate}
                  onChangeText={(text) => {
                    // Formatar MM/AA
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
                    }
                    setCardForm({ ...cardForm, expiryDate: formatted });
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
              <View style={[styles.formField, styles.formFieldHalf]}>
                <Text style={styles.formLabel}>CVV *</Text>
                <Input
                  placeholder="123"
                  value={cardForm.cvv}
                  onChangeText={(text) => {
                    const formatted = text.replace(/\D/g, '').slice(0, 3);
                    setCardForm({ ...cardForm, cvv: formatted });
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
            </View>

            {/* CPF do titular */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>CPF do titular *</Text>
              <Input
                placeholder="000.000.000-00"
                value={cardForm.cpf}
                onChangeText={(text) => {
                  // Formatar CPF
                  const formatted = text.replace(/\D/g, '');
                  let masked = formatted;
                  if (formatted.length <= 11) {
                    masked = formatted
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                  }
                  setCardForm({ ...cardForm, cpf: masked });
                }}
                keyboardType="numeric"
                maxLength={14}
                state="Default"
                showSearchIcon={false}
              />
            </View>
          </View>
        </ModalBottomSheet>

        {/* Modal Lista de Endereços */}
        <ModalBottomSheet
          visible={addressesModalVisible}
          onClose={() => setAddressesModalVisible(false)}
          title="Meus endereços"
          showPrimaryButton={true}
          primaryButtonLabel="Adicionar novo endereço"
          primaryButtonOnPress={() => {
            setAddressesModalVisible(false);
            setTimeout(() => setAddAddressModalVisible(true), 300);
          }}
        >
          <View style={styles.addressesList}>
            {addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;
              const isDefault = address.isDefault || false;
              const getIcon = () => {
                if (address.type === 'Casa') return <Home size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                if (address.type === 'Trabalho') return <Building2 size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                return <MapPin size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
              };
              
              return (
                <View key={address.id} style={[
                  styles.addressItemContainer,
                  isSelected && styles.addressItemContainerSelected
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.addressItem,
                      isSelected && styles.addressItemSelected
                    ]}
                    onPress={() => {
                      setSelectedAddressId(address.id);
                      setAddressesModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressItemContent}>
                      <View style={styles.addressItemHeader}>
                        {getIcon()}
                        <Text style={styles.addressItemType}>{address.type}</Text>
                        {isDefault && (
                          <View style={styles.defaultBadge}>
                            <Star size={12} color={colors.primary} fill={colors.primary} />
                            <Text style={styles.defaultBadgeText}>Padrão</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressItemText}>
                        {address.street}{address.complement ? `, ${address.complement}` : ''}, {address.neighborhood}, {address.city} - {address.state}, CEP: {address.zipCode}
                      </Text>
                    </View>
                    {isSelected && (
                      <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                  
                  {/* Botões de ação */}
                  <View style={styles.addressItemActions}>
                    {!isDefault && (
                      <TouchableOpacity
                        style={styles.addressActionButton}
                        onPress={async () => {
                          try {
                            await setDefaultAddress(address.id);
                            setSuccessMessage('Endereço definido como padrão!');
                            setError(null);
                            setTimeout(() => setSuccessMessage(null), 3000);
                          } catch (err: any) {
                            console.error('Erro ao definir endereço padrão:', err);
                            setError(err.message || 'Erro ao definir endereço padrão');
                            setSuccessMessage(null);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Star size={18} color={colors.primary} />
                        <Text style={styles.addressActionText}>Padrão</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.addressActionButton}
                      onPress={() => {
                        const addressToEdit = addresses.find(addr => addr.id === address.id);
                        if (!addressToEdit) return;

                        // Separar rua e número
                        const [street, ...numberParts] = addressToEdit.street.split(', ');
                        const number = numberParts.join(', ') || '';

                        setEditingAddressId(address.id);
                        setAddressType(addressToEdit.type);
                        setAddressForm({
                          cep: addressToEdit.zipCode,
                          street: street,
                          number: number,
                          complement: addressToEdit.complement || '',
                          neighborhood: addressToEdit.neighborhood,
                          city: addressToEdit.city,
                          state: addressToEdit.state,
                        });
                        setAddressesModalVisible(false);
                        setTimeout(() => {
                          setEditAddressModalVisible(true);
                        }, 300);
                      }}
                      activeOpacity={0.7}
                    >
                      <Edit size={18} color={colors.primary} />
                      <Text style={styles.addressActionText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.addressActionButton,
                        styles.addressActionButtonDanger,
                        deletingAddressId === address.id && { backgroundColor: colors.error }
                      ]}
                      onPress={async () => {
                        if (addresses.length === 1) {
                          setError('Você precisa ter pelo menos um endereço cadastrado');
                          return;
                        }

                        // Confirmação simples (pode melhorar com Alert.alert)
                        if (deletingAddressId === address.id) {
                          try {
                            setDeletingAddressId(address.id);
                            await deleteAddress(address.id);
                            setDeletingAddressId(null);
                            setSuccessMessage('Endereço deletado com sucesso!');
                            setError(null);
                            setTimeout(() => setSuccessMessage(null), 3000);
                          } catch (err: any) {
                            console.error('Erro ao deletar endereço:', err);
                            setError(err.message || 'Erro ao deletar endereço');
                            setSuccessMessage(null);
                            setDeletingAddressId(null);
                          }
                        } else {
                          setDeletingAddressId(address.id);
                          // Reset após 3 segundos se não confirmar
                          setTimeout(() => setDeletingAddressId(null), 3000);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={18} color={deletingAddressId === address.id ? colors.white : colors.error} />
                      <Text style={[
                        styles.addressActionText,
                        deletingAddressId === address.id && styles.addressActionTextDanger
                      ]}>
                        {deletingAddressId === address.id ? 'Confirmar' : 'Deletar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ModalBottomSheet>

        {/* Modal Adicionar/Editar Endereço */}
        <ModalBottomSheet
          visible={addAddressModalVisible || editAddressModalVisible}
          onClose={() => {
            setAddAddressModalVisible(false);
            setEditAddressModalVisible(false);
            setEditingAddressId(null);
            setAddressForm({
              cep: '',
              street: '',
              number: '',
              complement: '',
              neighborhood: '',
              city: '',
              state: '',
            });
            setAddressType('Casa');
            setError(null);
          }}
          title={editingAddressId ? "Editar endereço" : "Adicionar novo endereço"}
          showPrimaryButton={true}
          primaryButtonLabel={saving ? "Salvando..." : (editingAddressId ? "Salvar alterações" : "Adicionar novo endereço")}
          primaryButtonOnPress={async () => {
            // Validações
            if (!addressForm.cep || addressForm.cep.replace(/\D/g, '').length < 8) {
              setError('CEP inválido');
              return;
            }
            if (!addressForm.street) {
              setError('Rua é obrigatória');
              return;
            }
            if (!addressForm.number || addressForm.number.trim() === '') {
              setError('Número é obrigatório');
              return;
            }
            if (!addressForm.neighborhood) {
              setError('Bairro é obrigatório');
              return;
            }
            if (!addressForm.city) {
              setError('Cidade é obrigatória');
              return;
            }
            if (!addressForm.state || addressForm.state.length < 2) {
              setError('Estado é obrigatório');
              return;
            }

            try {
              setSaving(true);
              setError(null);

              const streetWithNumber = addressForm.street + (addressForm.number ? `, ${addressForm.number}` : '');
              
              // Garantir que estado está em maiúsculas
              const estadoFormatado = addressForm.state.toUpperCase().slice(0, 2);

              if (editingAddressId) {
                // Atualizar endereço existente
                await updateAddress(editingAddressId, {
                  type: addressType,
                  street: streetWithNumber,
                  complement: addressForm.complement || '',
                  neighborhood: addressForm.neighborhood,
                  city: addressForm.city,
                  state: estadoFormatado,
                  zipCode: addressForm.cep,
                });
                setEditAddressModalVisible(false);
              } else {
                // Adicionar novo endereço
                await addAddress({
                  type: addressType,
                  street: streetWithNumber,
                  complement: addressForm.complement || '',
                  neighborhood: addressForm.neighborhood,
                  city: addressForm.city,
                  state: estadoFormatado,
                  zipCode: addressForm.cep,
                });
                setAddAddressModalVisible(false);
              }

              // Resetar formulário
              setEditingAddressId(null);
              setAddressForm({
                cep: '',
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
              });
              setAddressType('Casa');
              
              // Feedback de sucesso
              setSuccessMessage(editingAddressId ? 'Endereço atualizado com sucesso!' : 'Endereço adicionado com sucesso!');
              setError(null);
              setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err: any) {
              console.error('Erro ao salvar endereço:', err);
              // Mensagens de erro mais específicas
              let errorMessage = 'Erro ao salvar endereço. Tente novamente.';
              if (err.message) {
                if (err.message.includes('CEP')) {
                  errorMessage = 'CEP inválido. Verifique o CEP informado.';
                } else if (err.message.includes('endereço')) {
                  errorMessage = err.message;
                } else {
                  errorMessage = err.message;
                }
              }
              setError(errorMessage);
              setSuccessMessage(null);
            } finally {
              setSaving(false);
            }
          }}
          primaryButtonDisabled={saving}
        >
          <View style={styles.addressForm}>
            {/* Chips de tipo de endereço */}
            <View style={styles.addressTypeChips}>
              <Chip
                label="Casa"
                state={addressType === 'Casa' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setAddressType('Casa')}
                style={styles.addressTypeChip}
              />
              <Chip
                label="Trabalho"
                state={addressType === 'Trabalho' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setAddressType('Trabalho')}
                style={styles.addressTypeChip}
              />
              <Chip
                label="Outro"
                state={addressType === 'Outro' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setAddressType('Outro')}
                style={styles.addressTypeChip}
              />
            </View>

            {/* CEP */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>CEP *</Text>
              <Input
                placeholder="00000-000"
                value={addressForm.cep}
                onChangeText={async (text) => {
                  const formatted = text.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                  setAddressForm({ ...addressForm, cep: formatted });
                  
                  // Buscar endereço quando CEP estiver completo (8 dígitos)
                  const cepDigits = formatted.replace(/\D/g, '');
                  if (cepDigits.length === 8) {
                    try {
                      setLoadingCep(true);
                      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
                      const data = await response.json();
                      
                      if (!data.erro) {
                        setAddressForm({
                          ...addressForm,
                          cep: formatted,
                          street: data.logradouro || '',
                          neighborhood: data.bairro || '',
                          city: data.localidade || '',
                          state: data.uf || '',
                        });
                      } else {
                        setError('CEP não encontrado');
                      }
                    } catch (error) {
                      console.error('Erro ao buscar CEP:', error);
                      setError('Erro ao buscar CEP. Tente novamente.');
                    } finally {
                      setLoadingCep(false);
                    }
                  }
                }}
                keyboardType="numeric"
                maxLength={9}
                state={loadingCep ? "Loading" : "Default"}
                showSearchIcon={loadingCep}
              />
            </View>

            {/* Rua e Número */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.formFieldHalf]}>
                <Text style={styles.formLabel}>Rua *</Text>
                <Input
                  placeholder="Nome da rua"
                  value={addressForm.street}
                  onChangeText={(text) => setAddressForm({ ...addressForm, street: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
              <View style={[styles.formField, { width: 105 }]}>
                <Text style={styles.formLabel}>Número *</Text>
                <Input
                  placeholder="123"
                  value={addressForm.number}
                  onChangeText={(text) => setAddressForm({ ...addressForm, number: text })}
                  keyboardType="numeric"
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
            </View>

            {/* Complemento */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Complemento</Text>
              <Input
                placeholder="Nome da rua"
                value={addressForm.complement}
                onChangeText={(text) => setAddressForm({ ...addressForm, complement: text })}
                state="Default"
                showSearchIcon={false}
              />
            </View>

            {/* Bairro */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Bairro *</Text>
              <Input
                placeholder="Nome do bairro"
                value={addressForm.neighborhood}
                onChangeText={(text) => setAddressForm({ ...addressForm, neighborhood: text })}
                state="Default"
                showSearchIcon={false}
              />
            </View>

            {/* Cidade e Estado */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.formFieldHalf]}>
                <Text style={styles.formLabel}>Cidade *</Text>
                <Input
                  placeholder="Nome da cidade"
                  value={addressForm.city}
                  onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
              <View style={[styles.formField, { width: 105 }]}>
                <Text style={styles.formLabel}>Estado *</Text>
                <Input
                  placeholder="UF"
                  value={addressForm.state}
                  onChangeText={(text) => setAddressForm({ ...addressForm, state: text.toUpperCase().slice(0, 2) })}
                  maxLength={2}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>
            </View>
          </View>
        </ModalBottomSheet>
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
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  skeletonContent: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonSectionWrapper: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  skeletonSection: {
    gap: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200, // Espaço para a barra fixa inferior
    gap: spacing.sm,
  },
  sectionWrapper: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md + 4, // 12px conforme Figma
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 1, // 9px conforme Figma
  },
  sectionHeaderContent: {
    flex: 1,
    gap: spacing.sm + 1, // 9px conforme Figma
  },
  sectionTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
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
  deliveryTime: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: colors.white,
  },
  paymentCardSelected: {
    backgroundColor: 'rgba(230, 28, 97, 0.06)',
    borderColor: colors.primary,
  },
  paymentCardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentMethodName: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  paymentMethodNameSelected: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  paymentMethodDetails: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  pixIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixText: {
    fontSize: 10,
    fontWeight: fontWeights.bold,
    color: colors.black,
  },
  changeAddressButton: {
    marginTop: spacing.sm,
  },
  addCardButtonGhost: {
    marginTop: spacing.sm,
  },
  cardTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px conforme Figma
  },
  cardTypeChip: {
    // Estilos do Chip já estão no componente
  },
  addressesList: {
    gap: spacing.md,
  },
  addressItemContainer: {
    gap: spacing.sm,
  },
  addressItemContainerSelected: {
    // Estilo adicional se necessário
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 16, 16, 0.1)',
    backgroundColor: colors.white,
  },
  addressItemSelected: {
    backgroundColor: 'rgba(230, 28, 97, 0.06)',
    borderColor: colors.primary,
  },
  addressItemContent: {
    flex: 1,
    gap: spacing.sm + 2, // 10px conforme Figma
  },
  addressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 6px conforme Figma
  },
  addressItemType: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  addressItemText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  addressItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
  },
  addressActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  addressActionButtonDanger: {
    // Background será aplicado dinamicamente no componente
  },
  addressActionText: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.primary,
  },
  addressActionTextDanger: {
    color: colors.white,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(230, 28, 97, 0.1)',
  },
  defaultBadgeText: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  addressForm: {
    gap: spacing.md,
  },
  addressTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px conforme Figma
  },
  addressTypeChip: {
    // Estilos do Chip já estão no componente
  },
  itemsList: {
    gap: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
    maxWidth: '70%',
  },
  orderItemPrice: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  separator: {
    marginVertical: spacing.md,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    padding: spacing.lg,
    gap: spacing.md,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  confirmButton: {
    width: '100%',
  },
  cardForm: {
    gap: spacing.md,
  },
  formField: {
    gap: spacing.sm,
  },
  formFieldHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formLabel: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  emptyState: {
    minHeight: 200,
  },
  emptyAddressContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyAddressText: {
    ...typography.base,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  selectAddressButton: {
    marginTop: spacing.sm,
  },
  messageContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.error || '#dc2626',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  successText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: '#16a34a',
    textAlign: 'center',
  },
  defaultCardLabel: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});

