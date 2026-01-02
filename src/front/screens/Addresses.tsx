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
  Home,
  Building2,
  MapPin,
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type AddressType = 'Casa' | 'Trabalho' | 'Outro';

interface Address {
  id: string;
  type: AddressType;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export function Addresses() {
  const navigation = useNavigation<NavigationProp>();
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<AddressType>('Casa');
  const [addressForm, setAddressForm] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Lista de endereços (mockado - em produção viria de um contexto/API)
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'Casa',
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    {
      id: '2',
      type: 'Trabalho',
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    {
      id: '3',
      type: 'Outro',
      street: 'Rua das Flores, 123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  ]);

  // Função para obter o ícone baseado no tipo
  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case 'Casa':
        return <Home size={20} color={colors.black} strokeWidth={2} />;
      case 'Trabalho':
        return <Building2 size={20} color={colors.black} strokeWidth={2} />;
      case 'Outro':
        return <MapPin size={20} color={colors.black} strokeWidth={2} />;
    }
  };

  // Função para formatar endereço completo
  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.complement}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zipCode}`;
  };

  // Função para resetar formulário
  const resetAddressForm = () => {
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
    setEditingAddress(null);
  };

  // Função para abrir modal de edição
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    // Preencher formulário com dados do endereço
    // O street pode vir como "Rua, número" ou apenas "Rua"
    const streetParts = address.street.split(',');
    const streetName = streetParts[0]?.trim() || '';
    const number = streetParts[1]?.trim() || '';
    
    setAddressForm({
      cep: address.zipCode,
      street: streetName,
      number: number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    });
    setAddressType(address.type);
    setEditAddressModalVisible(true);
  };

  // Função para deletar endereço
  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este endereço?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== address.id));
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Função para salvar endereço (adicionar ou editar)
  const handleSaveAddress = () => {
    // Combinar rua e número no formato "Rua, número"
    const fullStreet = addressForm.number 
      ? `${addressForm.street}, ${addressForm.number}`
      : addressForm.street;
    
    const addressData: Address = {
      id: editingAddress?.id || String(Date.now()),
      type: addressType,
      street: fullStreet,
      complement: addressForm.complement,
      neighborhood: addressForm.neighborhood,
      city: addressForm.city,
      state: addressForm.state,
      zipCode: addressForm.cep,
    };

    if (editingAddress) {
      // Editar endereço existente
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id ? addressData : addr
      ));
      setEditAddressModalVisible(false);
    } else {
      // Adicionar novo endereço
      setAddresses([...addresses, addressData]);
      setAddAddressModalVisible(false);
    }

    resetAddressForm();
  };

  // Função para fechar modal e resetar formulário
  const handleCloseModal = () => {
    if (editAddressModalVisible) {
      setEditAddressModalVisible(false);
    } else {
      setAddAddressModalVisible(false);
    }
    resetAddressForm();
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
              title="Meus endereços"
              showCounter={false}
              onBackPress={() => navigation.goBack()}
            />

            {/* Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.addressesList}>
                {addresses.map((address) => (
                  <View key={address.id} style={styles.addressCard}>
                    <View style={styles.addressCardContent}>
                      <View style={styles.addressHeader}>
                        {getAddressIcon(address.type)}
                        <Text style={styles.addressType}>{address.type}</Text>
                      </View>
                      <Text style={styles.addressText}>
                        {formatAddress(address)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(address)}
                      activeOpacity={0.7}
                      style={styles.iconButton}
                    >
                      <Trash2 size={24} color={colors.black} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEditAddress(address)}
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
                title="Novo endereço"
                variant="primary"
                size="lg"
                onPress={() => setAddAddressModalVisible(true)}
                style={styles.newAddressButton}
              />
            </View>
          </KeyboardAvoidingView>

          {/* Modal Adicionar Endereço */}
          <ModalBottomSheet
            visible={addAddressModalVisible}
            onClose={handleCloseModal}
            title="Adicionar novo endereço"
            showPrimaryButton={true}
            primaryButtonLabel="Adicionar novo endereço"
            primaryButtonOnPress={handleSaveAddress}
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
                  placeholder="Apto, Bloco, etc."
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

          {/* Modal Editar Endereço */}
          <ModalBottomSheet
            visible={editAddressModalVisible}
            onClose={handleCloseModal}
            title="Editar endereço"
            showPrimaryButton={true}
            primaryButtonLabel="Salvar alterações"
            primaryButtonOnPress={handleSaveAddress}
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
                  placeholder="Apto, Bloco, etc."
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
  addressesList: {
    gap: spacing.md,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(16, 16, 16, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addressCardContent: {
    flex: 1,
    gap: spacing.sm + 2, // 10px
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 6px
  },
  addressType: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  addressText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2, // 1.3 * 14px
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
  newAddressButton: {
    width: '100%',
  },
  addressForm: {
    gap: spacing.md,
  },
  addressTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px
  },
  addressTypeChip: {
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

