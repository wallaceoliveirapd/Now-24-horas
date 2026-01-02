import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
  Chip
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { useCart } from '../../contexts/CartContext';
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
  UserRound
} from 'lucide-react-native';

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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PaymentMethod = 'credit_card_1' | 'credit_card_2' | 'pix';

export function Checkout() {
  const navigation = useNavigation<NavigationProp>();
  const { items: cartItems, appliedCoupon, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card_1');
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [addressesModalVisible, setAddressesModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
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
  
  // Lista de endereços (mockado)
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      type: 'Casa' as const,
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    {
      id: '2',
      type: 'Trabalho' as const,
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    {
      id: '3',
      type: 'Outro' as const,
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  ]);
  
  const [selectedAddressId, setSelectedAddressId] = useState('1');

  // Simular carregamento inicial
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Endereço de entrega selecionado
  const deliveryAddress = addresses.find(addr => addr.id === selectedAddressId) || addresses[0];

  // Tempo de entrega (mockado)
  const deliveryTime = '20-40 minutos';

  // Calcular totais
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = appliedCoupon?.discountAmount || 0;
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

  // Confirmar pagamento
  const handleConfirmPayment = () => {
    // Gerar número do pedido aleatório
    const orderNumber = `#${Math.floor(Math.random() * 1000000000)}`;
    
    // Navegar para tela de confirmação
    navigation.navigate('OrderConfirmation', {
      orderNumber,
      deliveryTime: deliveryTime,
      totalPaid: totals.total,
    });
    
    // Limpar carrinho após confirmar pedido
    clearCart();
  };

  // Formatar número do cartão (últimos 4 dígitos)
  const formatCardNumber = (lastDigits: string = '1234') => {
    return `****${lastDigits}`;
  };

  // Dados dos cartões (usando useState para poder adicionar novos)
  const [creditCards, setCreditCards] = useState([
    { id: 'credit_card_1' as PaymentMethod, lastDigits: '1234' },
    { id: 'credit_card_2' as PaymentMethod, lastDigits: '5678' },
  ]);

  return (
    <>
      <StatusBar 
        style="dark"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView 
        style={styles.safeArea} 
        edges={['top']}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
          >
            {/* Endereço de entrega */}
            <View style={styles.sectionWrapper}>
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
                <Button
                  title="Alterar endereço de entrega"
                  variant="ghost"
                  size="md"
                  onPress={() => setAddressesModalVisible(true)}
                  style={styles.changeAddressButton}
                />
              </View>
            </View>

            {/* Tempo de entrega */}
            <View style={styles.sectionWrapper}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={20} color={colors.primary} strokeWidth={2} />
                  <View style={styles.sectionHeaderContent}>
                    <Text style={styles.sectionTitle}>Tempo de entrega</Text>
                    <Text style={styles.deliveryTime}>{deliveryTime}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Forma de pagamento */}
            <View style={styles.sectionWrapper}>
              <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Wallet size={20} color={colors.primary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Forma de pagamento</Text>
              </View>

              {/* Cartões de crédito */}
              {creditCards.map((card) => (
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
                      Cartão de crédito
                    </Text>
                    <Text style={styles.paymentMethodDetails}>
                      {formatCardNumber(card.lastDigits)}
                    </Text>
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
            <Button
              title="Confirmar pagamento"
              variant="primary"
              size="lg"
              onPress={handleConfirmPayment}
              style={styles.confirmButton}
            />
          </View>
        )}
        </KeyboardAvoidingView>

        {/* Modal Adicionar Novo Cartão */}
        <ModalBottomSheet
          visible={addCardModalVisible}
          onClose={() => setAddCardModalVisible(false)}
          title="Adicionar novo cartão"
          showPrimaryButton={true}
          primaryButtonLabel="Cadastrar cartão"
          primaryButtonOnPress={() => {
            // Aqui você pode validar e salvar o cartão
            console.log('Cadastrar cartão', cardForm);
            // Gerar últimos 4 dígitos do número do cartão (remover espaços)
            const cardNumberDigits = cardForm.cardNumber.replace(/\s/g, '');
            const lastDigits = cardNumberDigits.slice(-4) || '0000';
            // Adicionar novo cartão à lista
            const newCardId = `credit_card_${creditCards.length + 1}` as PaymentMethod;
            setCreditCards([...creditCards, {
              id: newCardId,
              lastDigits: lastDigits,
            }]);
            // Selecionar o novo cartão
            setSelectedPaymentMethod(newCardId);
            setAddCardModalVisible(false);
            // Resetar formulário
            setCardForm({
              cardNumber: '',
              cardName: '',
              expiryDate: '',
              cvv: '',
              cpf: '',
            });
          }}
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
            setAddAddressModalVisible(true);
          }}
        >
          <View style={styles.addressesList}>
            {addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;
              const getIcon = () => {
                if (address.type === 'Casa') return <Home size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                if (address.type === 'Trabalho') return <Building2 size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                return <MapPin size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
              };
              
              return (
                <TouchableOpacity
                  key={address.id}
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
                    </View>
                    <Text style={styles.addressItemText}>
                      {address.street}, {address.complement}, {address.neighborhood}, {address.city} - {address.state}, CEP: {address.zipCode}
                    </Text>
                  </View>
                  {isSelected && (
                    <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ModalBottomSheet>

        {/* Modal Adicionar Endereço */}
        <ModalBottomSheet
          visible={addAddressModalVisible}
          onClose={() => {
            setAddAddressModalVisible(false);
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
          }}
          title="Adicionar novo endereço"
          showPrimaryButton={true}
          primaryButtonLabel="Adicionar novo endereço"
          primaryButtonOnPress={() => {
            const newAddress = {
              id: String(addresses.length + 1),
              type: addressType,
              street: addressForm.street,
              complement: addressForm.complement,
              neighborhood: addressForm.neighborhood,
              city: addressForm.city,
              state: addressForm.state,
              zipCode: addressForm.cep,
            };
            setAddresses([...addresses, newAddress]);
            setSelectedAddressId(newAddress.id);
            setAddAddressModalVisible(false);
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
          }}
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
                      }
                    } catch (error) {
                      console.error('Erro ao buscar CEP:', error);
                    }
                  }
                }}
                keyboardType="numeric"
                maxLength={9}
                state="Default"
                showSearchIcon={false}
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
  keyboardAvoidingView: {
    flex: 1,
  },
});

