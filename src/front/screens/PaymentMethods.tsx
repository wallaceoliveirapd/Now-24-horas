import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { 
  PageTitle,
  Button,
  ModalBottomSheet,
  Input,
  Chip
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { 
  CreditCard,
  Pencil,
  Trash2
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
  OrderDetails: {
    orderNumber: string;
    orderDate?: string;
    orderId?: string;
  };
  MyOrders: undefined;
  Profile: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type CardType = 'Crédito' | 'Débito';

interface PaymentCard {
  id: string;
  type: CardType;
  lastDigits: string;
  cardName?: string;
}

export function PaymentMethods() {
  const navigation = useNavigation<NavigationProp>();
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [editCardModalVisible, setEditCardModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);
  const [cardType, setCardType] = useState<CardType>('Crédito');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
  });

  // Lista de cartões (mockado - em produção viria de um contexto/API)
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: '1',
      type: 'Crédito',
      lastDigits: '1234',
      cardName: 'Nome do Titular',
    },
    {
      id: '2',
      type: 'Débito',
      lastDigits: '5678',
      cardName: 'Nome do Titular',
    },
  ]);

  // Função para formatar número do cartão (últimos 4 dígitos)
  const formatCardNumber = (lastDigits: string) => {
    return `****${lastDigits}`;
  };

  // Função para resetar formulário
  const resetCardForm = () => {
    setCardForm({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      cpf: '',
    });
    setCardType('Crédito');
    setEditingCard(null);
  };

  // Função para abrir modal de edição
  const handleEditCard = (card: PaymentCard) => {
    setEditingCard(card);
    // Preencher formulário com dados do cartão (dados limitados por segurança)
    setCardForm({
      cardNumber: '',
      cardName: card.cardName || '',
      expiryDate: '',
      cvv: '',
      cpf: '',
    });
    setCardType(card.type);
    setEditCardModalVisible(true);
  };

  // Função para deletar cartão
  const handleDeleteCard = (card: PaymentCard) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cartão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(c => c.id !== card.id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Função para salvar cartão (adicionar ou editar)
  const handleSaveCard = () => {
    // Gerar últimos 4 dígitos do número do cartão (remover espaços)
    const cardNumberDigits = cardForm.cardNumber.replace(/\s/g, '');
    const lastDigits = cardNumberDigits.slice(-4) || '0000';

    const cardData: PaymentCard = {
      id: editingCard?.id || String(Date.now()),
      type: cardType,
      lastDigits: lastDigits,
      cardName: cardForm.cardName,
    };

    if (editingCard) {
      // Editar cartão existente
      setCards(cards.map(card => 
        card.id === editingCard.id ? cardData : card
      ));
      setEditCardModalVisible(false);
    } else {
      // Adicionar novo cartão
      setCards([...cards, cardData]);
      setAddCardModalVisible(false);
    }

    resetCardForm();
  };

  // Função para fechar modal e resetar formulário
  const handleCloseModal = () => {
    if (editCardModalVisible) {
      setEditCardModalVisible(false);
    } else {
      setAddCardModalVisible(false);
    }
    resetCardForm();
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
        <View style={{ backgroundColor: colors.white, flex: 1 }}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header */}
            <PageTitle
              title="Formas de pagamento"
              showCounter={false}
              onBackPress={() => navigation.goBack()}
            />

            {/* Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardsList}>
                {cards.map((card) => (
                  <View key={card.id} style={styles.cardItem}>
                    <View style={styles.cardItemContent}>
                      <View style={styles.cardHeader}>
                        <CreditCard size={20} color={colors.black} strokeWidth={2} />
                        <Text style={styles.cardType}>{card.type}</Text>
                      </View>
                      <Text style={styles.cardDetails}>
                        Cartão de crédito • {formatCardNumber(card.lastDigits)}
                      </Text>
                      {card.cardName && (
                        <Text style={styles.cardName}>{card.cardName}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteCard(card)}
                      activeOpacity={0.7}
                      style={styles.iconButton}
                    >
                      <Trash2 size={24} color={colors.black} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEditCard(card)}
                      activeOpacity={0.7}
                      style={styles.iconButton}
                    >
                      <Pencil size={24} color={colors.black} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomButtonContainer}>
              <Button
                title="Adicionar novo cartão"
                variant="primary"
                size="lg"
                onPress={() => setAddCardModalVisible(true)}
                style={styles.newCardButton}
              />
            </View>
          </KeyboardAvoidingView>

          {/* Modal Adicionar Cartão */}
          <ModalBottomSheet
            visible={addCardModalVisible}
            onClose={handleCloseModal}
            title="Adicionar novo cartão"
            showPrimaryButton={true}
            primaryButtonLabel="Cadastrar cartão"
            primaryButtonOnPress={handleSaveCard}
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

          {/* Modal Editar Cartão */}
          <ModalBottomSheet
            visible={editCardModalVisible}
            onClose={handleCloseModal}
            title="Editar cartão"
            showPrimaryButton={true}
            primaryButtonLabel="Salvar alterações"
            primaryButtonOnPress={handleSaveCard}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  cardsList: {
    gap: spacing.md,
  },
  cardItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(16, 16, 16, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardItemContent: {
    flex: 1,
    gap: spacing.sm + 2, // 10px
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 6px
  },
  cardType: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  cardDetails: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
  },
  cardName: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  newCardButton: {
    width: '100%',
  },
  cardForm: {
    gap: spacing.md,
  },
  cardTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px
  },
  cardTypeChip: {
    // Estilos do Chip já estão no componente
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
});

