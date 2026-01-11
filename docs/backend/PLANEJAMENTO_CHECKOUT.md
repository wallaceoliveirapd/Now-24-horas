# Planejamento Completo - Backend de Checkout

## 📋 Visão Geral

Este documento detalha o planejamento completo para implementar o backend da funcionalidade de checkout, incluindo integração com o frontend, validações, tratamento de erros e fluxo completo de criação de pedidos.

## 🎯 Objetivos

1. **Integrar checkout frontend com backend**
   - Criar pedido a partir do carrinho
   - Validar endereço de entrega
   - Processar pagamento
   - Retornar dados do pedido criado

2. **Melhorar UX no frontend**
   - Exibir seção de endereços sempre (com empty state se necessário)
   - Desabilitar botão de finalizar pedido quando não houver endereço selecionado
   - Permitir adicionar primeiro endereço diretamente no checkout

3. **Garantir integridade dos dados**
   - Validar carrinho não vazio
   - Validar endereço válido e ativo
   - Validar estoque antes de criar pedido
   - Validar cupom antes de aplicar desconto

## 📊 Estado Atual

### ✅ O que já existe

#### Backend
- ✅ `OrderService.createOrder()` - Cria pedido a partir do carrinho
- ✅ `OrderService.getOrderById()` - Busca pedido por ID
- ✅ `OrderService.getUserOrders()` - Lista pedidos do usuário
- ✅ `OrderService.cancelOrder()` - Cancela pedido
- ✅ `CartService.getCart()` - Retorna carrinho completo com totais
- ✅ `AddressService` - CRUD completo de endereços
- ✅ `PaymentCardService` - CRUD completo de cartões de pagamento
- ✅ Rota `POST /api/orders` - Criar pedido
- ✅ Rota `GET /api/orders` - Listar pedidos
- ✅ Rota `GET /api/orders/:id` - Detalhes do pedido
- ✅ Rota `POST /api/orders/:id/cancel` - Cancelar pedido
- ✅ Rotas `GET/POST/PUT/DELETE /api/payment-cards` - CRUD de cartões
- ✅ Validações de schema (createOrderSchema)

#### Frontend
- ✅ Tela de Checkout (`Checkout.tsx`)
- ✅ Context de endereços (`AddressContext`)
- ✅ Context de carrinho (`CartContext`)
- ✅ Service de pedidos (`order.service.ts`)
- ✅ Service de endereços (`address.service.ts`)
- ⚠️ Tela de PaymentMethods (`PaymentMethods.tsx`) - ainda usa dados mockados
- ⚠️ Service de cartões de pagamento - precisa ser criado
- ✅ Checkout integrado com backend (implementado)

### ❌ O que falta

#### Backend
- ⚠️ Endpoint para calcular totais do checkout (opcional, pode usar getCart)
- ❌ Cálculo de tempo de entrega baseado em endereço (atualmente fixo)
- ✅ Integração com gateway de pagamento (MercadoPago) - tokenização de cartões
- ⚠️ Processamento de pagamento real (tokenização existe, processamento pendente)

#### Frontend
- ✅ Integração do checkout com backend (implementado)
- ✅ Seção de endereços sempre visível (implementado)
- ✅ Empty state quando não há endereços (implementado)
- ✅ Botão desabilitado quando não há endereço selecionado (implementado)
- ✅ Tratamento de erros na criação do pedido (implementado)
- ✅ Loading states durante criação do pedido (implementado)
- ✅ Navegação para tela de confirmação após criar pedido (implementado)
- ✅ Integração de cartões de pagamento com backend (implementado)
- ✅ Service de cartões de pagamento no frontend (implementado)
- ✅ Context de cartões de pagamento (implementado)
- ⚠️ CRUD completo de endereços no checkout (parcial - só adicionar)
- ❌ Editar endereço no checkout
- ❌ Deletar endereço no checkout
- ❌ Definir endereço como padrão no checkout
- ❌ Exibir tempo de entrega calculado dinamicamente

## 🏗️ Arquitetura

### Fluxo de Checkout

```
1. Usuário acessa Checkout
   ↓
2. Frontend carrega:
   - Carrinho (via CartContext)
   - Endereços (via AddressContext)
   ↓
3. Usuário seleciona/confirma:
   - Endereço de entrega (obrigatório)
   - Método de pagamento
   ↓
4. Frontend valida:
   - Carrinho não vazio
   - Endereço selecionado
   - Método de pagamento selecionado
   ↓
5. Frontend chama: POST /api/orders
   Body: {
     enderecoId: string,
     metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix',
     cartaoId?: string,
     observacoes?: string,
     instrucoesEntrega?: string
   }
   ↓
6. Backend valida:
   - Carrinho não vazio
   - Endereço válido e ativo
   - Estoque suficiente
   - Cupom válido (se aplicado)
   ↓
7. Backend cria pedido:
   - Gera número único
   - Calcula totais
   - Cria itens do pedido
   - Atualiza estoque
   - Aplica cupom
   - Limpa carrinho
   - Cria histórico de status
   - Envia notificação
   ↓
8. Backend retorna pedido criado
   ↓
9. Frontend:
   - Navega para OrderProcessing/OrderConfirmation
   - Exibe número do pedido
   - Exibe tempo de entrega
```

## 📝 Implementação

### Fase 1: Melhorias no Frontend (Checkout)

#### 1.1. Adicionar seção de endereços sempre visível

**Arquivo:** `src/front/screens/Checkout.tsx`

**Mudanças:**
- Remover condicional `{deliveryAddress && (...)}`
- Sempre exibir seção de endereços
- Se não houver endereços, exibir EmptyState
- Se houver endereços mas nenhum selecionado, exibir lista para seleção

**Código:**
```tsx
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
      />
    ) : !selectedAddressId ? (
      <View>
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
      </>
    ) : null}
  </View>
</View>
```

#### 1.2. Desabilitar botão quando não houver endereço selecionado

**Arquivo:** `src/front/screens/Checkout.tsx`

**Mudanças:**
- Adicionar validação `const canConfirmPayment = selectedAddressId !== null && addresses.length > 0`
- Passar `disabled={!canConfirmPayment}` para o Button

**Código:**
```tsx
const canConfirmPayment = selectedAddressId !== null && addresses.length > 0 && cartItems.length > 0;

<Button
  title="Confirmar pagamento"
  variant="primary"
  size="lg"
  onPress={handleConfirmPayment}
  disabled={!canConfirmPayment}
  style={styles.confirmButton}
/>
```

#### 1.3. Integrar criação de pedido com backend

**Arquivo:** `src/front/screens/Checkout.tsx`

**Mudanças:**
- Importar `orderService` do service
- Modificar `handleConfirmPayment` para chamar API
- Adicionar loading state
- Adicionar tratamento de erros
- Navegar para OrderProcessing após sucesso

**Código:**
```tsx
const [creatingOrder, setCreatingOrder] = useState(false);
const [error, setError] = useState<string | null>(null);

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
    if (selectedPaymentMethod === 'pix') {
      metodoPagamento = 'pix';
    } else if (selectedPaymentMethod.startsWith('credit_card_')) {
      // Por enquanto, assumir crédito (futuro: verificar tipo do cartão)
      metodoPagamento = 'cartao_credito';
    } else {
      metodoPagamento = 'cartao_credito';
    }

    // Criar pedido
    const response = await orderService.createOrder({
      enderecoId: selectedAddressId,
      metodoPagamento,
      cartaoId: selectedPaymentMethod !== 'pix' ? selectedPaymentMethod : undefined,
      observacoes: undefined, // Futuro: adicionar campo de observações
      instrucoesEntrega: undefined, // Futuro: adicionar campo de instruções
    });

    const order = response.pedido;

    // Limpar carrinho
    clearCart();

    // Navegar para tela de processamento
    navigation.navigate('OrderProcessing', {
      orderNumber: order.numeroPedido,
      deliveryTime: order.tempoEntrega || '20-40 minutos',
      totalPaid: order.total,
    });
  } catch (err: any) {
    console.error('Erro ao criar pedido:', err);
    setError(err.message || 'Erro ao criar pedido. Tente novamente.');
  } finally {
    setCreatingOrder(false);
  }
};
```

#### 1.4. Adicionar método createOrder no orderService

**Arquivo:** `src/services/order.service.ts`

**Mudanças:**
- Adicionar método `createOrder` que chama `POST /api/orders`

**Código:**
```tsx
/**
 * Criar novo pedido a partir do carrinho
 */
async createOrder(data: {
  enderecoId: string;
  metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  cartaoId?: string;
  observacoes?: string;
  instrucoesEntrega?: string;
}): Promise<{ pedido: Order }> {
  const response = await apiClient.post<{ pedido: Order }>('/api/orders', data);
  return response.data!;
},
```

### Fase 2: Validações e Melhorias no Backend

#### 2.1. Validar schema de criação de pedido

**Arquivo:** `src/back/api/validators/order.validator.ts`

**Verificar se existe e está completo:**
```typescript
import { z } from 'zod';

export const createOrderSchema = z.object({
  enderecoId: z.string().uuid('ID de endereço inválido'),
  metodoPagamento: z.enum(['cartao_credito', 'cartao_debito', 'pix', 'boleto'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  cartaoId: z.string().uuid().optional(),
  observacoes: z.string().max(500).optional(),
  instrucoesEntrega: z.string().max(200).optional(),
});
```

#### 2.2. Melhorar validações no OrderService

**Arquivo:** `src/back/services/order.service.ts`

**Validações já existentes (verificar se estão completas):**
- ✅ Carrinho não vazio
- ✅ Endereço válido e ativo
- ✅ Estoque suficiente
- ✅ Cupom válido (se aplicado)

**Melhorias sugeridas:**
- Adicionar validação de método de pagamento válido
- Adicionar validação de cartãoId quando método for cartão
- Melhorar mensagens de erro

#### 2.3. Calcular tempo de entrega baseado em endereço

**Arquivo:** `src/back/services/order.service.ts`

**Implementação:**
```typescript
/**
 * Calcular tempo de entrega baseado no endereço
 */
private async calculateDeliveryTime(addressId: string): Promise<string> {
  // Buscar endereço
  const [address] = await db
    .select()
    .from(enderecos)
    .where(eq(enderecos.id, addressId))
    .limit(1);

  if (!address) {
    return '20-40 minutos'; // Default
  }

  // Coordenadas do restaurante (configurar nas variáveis de ambiente)
  const RESTAURANT_LAT = parseFloat(process.env.RESTAURANT_LATITUDE || '0');
  const RESTAURANT_LNG = parseFloat(process.env.RESTAURANT_LONGITUDE || '0');

  // Buscar coordenadas do endereço (se disponível)
  // Se não tiver coordenadas, usar CEP para buscar
  let addressLat = address.latitude;
  let addressLng = address.longitude;

  // Se não tiver coordenadas, buscar via API de geocodificação
  if (!addressLat || !addressLng) {
    const coordinates = await this.geocodeAddress(address);
    addressLat = coordinates.lat;
    addressLng = coordinates.lng;
    
    // Salvar coordenadas no banco para próximas consultas
    if (coordinates.lat && coordinates.lng) {
      await db
        .update(enderecos)
        .set({
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        })
        .where(eq(enderecos.id, addressId));
    }
  }

  // Calcular distância (Haversine)
  const distance = this.calculateDistance(
    RESTAURANT_LAT,
    RESTAURANT_LNG,
    addressLat || 0,
    addressLng || 0
  );

  // Calcular tempo baseado na distância
  // Assumindo velocidade média de 30 km/h para entrega
  const averageSpeed = 30; // km/h
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.ceil(timeInHours * 60);

  // Adicionar tempo de preparo (15-20 minutos)
  const prepTime = 15;
  const totalTime = prepTime + timeInMinutes;

  // Arredondar para intervalo de 10 minutos
  const minTime = Math.floor(totalTime / 10) * 10;
  const maxTime = minTime + 20;

  return `${minTime}-${maxTime} minutos`;
}

/**
 * Calcular distância entre duas coordenadas (Haversine)
 */
private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Geocodificar endereço (buscar coordenadas)
 */
private async geocodeAddress(address: any): Promise<{ lat: number | null; lng: number | null }> {
  try {
    // Usar API de geocodificação (ex: Google Maps, OpenStreetMap)
    // Por enquanto, retornar null (pode usar serviço externo)
    const addressString = `${address.rua}, ${address.numero}, ${address.bairro}, ${address.cidade}, ${address.estado}`;
    
    // Exemplo com OpenStreetMap Nominatim (gratuito)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
  }
  
  return { lat: null, lng: null };
}
```

**Atualizar método createOrder:**
```typescript
// No método createOrder, substituir:
tempoEntrega: '20-40 minutos', // Fixo por enquanto

// Por:
tempoEntrega: await this.calculateDeliveryTime(input.enderecoId),
```

**Adicionar campos no schema de endereços (se não existir):**
```typescript
// Em src/back/models/schema.ts
latitude: real('latitude'),
longitude: real('longitude'),
```

### Fase 3: CRUD Completo de Endereços no Checkout

#### 3.1. Estado Atual

**O que já existe:**
- ✅ Modal para adicionar novo endereço
- ✅ Modal para listar endereços
- ✅ Seleção de endereço
- ✅ Integração com `AddressContext`

**O que falta:**
- ❌ Editar endereço diretamente no checkout
- ❌ Deletar endereço diretamente no checkout
- ❌ Definir endereço como padrão no checkout
- ❌ `setDefaultAddress` no AddressContext
- ❌ `isDefault` no tipo Address do context
- ❌ Validação completa do formulário de endereço
- ❌ Feedback visual melhorado na busca de CEP
- ❌ Indicador de endereço padrão na lista

#### 3.2. Adicionar funcionalidade de editar endereço

**Arquivo:** `src/front/screens/Checkout.tsx`

**Implementação:**
```tsx
// Adicionar estado para edição
const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

// Função para abrir modal de edição
const handleEditAddress = (addressId: string) => {
  const address = addresses.find(addr => addr.id === addressId);
  if (!address) return;

  // Separar rua e número
  const [street, ...numberParts] = address.street.split(', ');
  const number = numberParts.join(', ') || '';

  setEditingAddressId(addressId);
  setAddressType(address.type);
  setAddressForm({
    cep: address.zipCode,
    street: street,
    number: number,
    complement: address.complement || '',
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  });
  setAddressesModalVisible(false);
  setTimeout(() => {
    setEditAddressModalVisible(true);
  }, 300);
};

// Função para salvar endereço editado
const handleSaveAddress = async () => {
  // Validações
  if (!addressForm.cep || addressForm.cep.replace(/\D/g, '').length < 8) {
    setError('CEP inválido');
    return;
  }
  if (!addressForm.street) {
    setError('Rua é obrigatória');
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

    if (editingAddressId) {
      // Atualizar endereço existente
      await updateAddress(editingAddressId, {
        type: addressType,
        street: addressForm.street + (addressForm.number ? `, ${addressForm.number}` : ''),
        complement: addressForm.complement || '',
        neighborhood: addressForm.neighborhood,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.cep,
      });
      setEditAddressModalVisible(false);
    } else {
      // Adicionar novo endereço
      await addAddress({
        type: addressType,
        street: addressForm.street + (addressForm.number ? `, ${addressForm.number}` : ''),
        complement: addressForm.complement || '',
        neighborhood: addressForm.neighborhood,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.cep,
      });
      setAddAddressModalVisible(false);
    }

    resetAddressForm();
  } catch (err: any) {
    console.error('Erro ao salvar endereço:', err);
    setError(err.message || 'Erro ao salvar endereço. Tente novamente.');
  } finally {
    setSaving(false);
  }
};
```

**Adicionar botão de editar no modal de lista:**
```tsx
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
      return (
        <View key={address.id} style={styles.addressItemContainer}>
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
            {/* Conteúdo do endereço */}
          </TouchableOpacity>
          <View style={styles.addressItemActions}>
            <TouchableOpacity
              onPress={() => handleEditAddress(address.id)}
              style={styles.addressActionButton}
            >
              <Pencil size={20} color={colors.black} strokeWidth={2} />
            </TouchableOpacity>
            {addresses.length > 1 && (
              <TouchableOpacity
                onPress={() => handleDeleteAddress(address.id)}
                style={styles.addressActionButton}
              >
                <Trash2 size={20} color={colors.red[700]} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    })}
  </View>
</ModalBottomSheet>
```

#### 3.3. Adicionar funcionalidade de deletar endereço

**Arquivo:** `src/front/screens/Checkout.tsx`

**Implementação:**
```tsx
import { Alert } from 'react-native';
import { Trash2, Pencil } from 'lucide-react-native';

// Função para deletar endereço
const handleDeleteAddress = (addressId: string) => {
  const address = addresses.find(addr => addr.id === addressId);
  if (!address) return;

  Alert.alert(
    'Confirmar exclusão',
    `Tem certeza que deseja excluir este endereço?\n\n${address.street}, ${address.neighborhood}`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);
            await deleteAddress(addressId);
            
            // Se o endereço deletado era o selecionado, selecionar outro
            if (selectedAddressId === addressId) {
              const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
              if (remainingAddresses.length > 0) {
                setSelectedAddressId(remainingAddresses[0].id);
              } else {
                setSelectedAddressId(null);
              }
            }
          } catch (err: any) {
            setError(err.message || 'Erro ao excluir endereço');
          }
        },
      },
    ],
    { cancelable: true }
  );
};
```

**Validações:**
- Não permitir deletar se for o único endereço
- Não permitir deletar se estiver selecionado e for o único
- Mostrar confirmação antes de deletar

#### 3.4. Adicionar funcionalidade de definir como padrão

**Arquivo:** `src/front/screens/Checkout.tsx`

**Implementação:**
```tsx
import { useAddress } from '../../contexts/AddressContext';

// No AddressContext, adicionar método setDefaultAddress se não existir
const { addresses, selectedAddressId, setSelectedAddressId, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress();

// Função para definir como padrão
const handleSetDefaultAddress = async (addressId: string) => {
  try {
    setError(null);
    await setDefaultAddress(addressId);
    setSelectedAddressId(addressId);
  } catch (err: any) {
    setError(err.message || 'Erro ao definir endereço padrão');
  }
};

// Adicionar botão no modal de lista
{address.isDefault ? (
  <View style={styles.defaultBadge}>
    <Text style={styles.defaultBadgeText}>Padrão</Text>
  </View>
) : (
  <TouchableOpacity
    onPress={() => handleSetDefaultAddress(address.id)}
    style={styles.setDefaultButton}
  >
    <Text style={styles.setDefaultButtonText}>Definir como padrão</Text>
  </TouchableOpacity>
)}
```

**Nota:** Antes de usar `setDefaultAddress`, é necessário atualizar o `AddressContext` conforme seção 3.8.

#### 3.5. Modal de edição de endereço

**Arquivo:** `src/front/screens/Checkout.tsx`

**Implementação:**
```tsx
{/* Modal Editar Endereço */}
<ModalBottomSheet
  visible={editAddressModalVisible}
  onClose={() => {
    setEditAddressModalVisible(false);
    setEditingAddressId(null);
    resetAddressForm();
  }}
  title="Editar endereço"
  showPrimaryButton={true}
  primaryButtonLabel={saving ? "Salvando..." : "Salvar alterações"}
  primaryButtonOnPress={handleSaveAddress}
  primaryButtonDisabled={saving}
>
  {/* Mesmo formulário do modal de adicionar, mas preenchido com dados do endereço */}
  <View style={styles.addressForm}>
    {/* Chips de tipo */}
    {/* Campos do formulário */}
  </View>
</ModalBottomSheet>
```

#### 3.6. Melhorias no formulário de endereço

**Validações:**
- CEP: mínimo 8 dígitos
- Rua: obrigatório
- Número: opcional mas recomendado
- Bairro: obrigatório
- Cidade: obrigatório
- Estado: obrigatório, 2 caracteres

**Busca automática de CEP:**
- Já existe, mas pode melhorar feedback
- Mostrar loading durante busca
- Tratar erros de CEP inválido

**UX:**
- Desabilitar botão de salvar durante validação
- Mostrar erros de validação inline
- Feedback visual de campos obrigatórios

#### 3.7. Estilos adicionais

**Arquivo:** `src/front/screens/Checkout.tsx`

```tsx
addressItemContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
},
addressItemActions: {
  flexDirection: 'row',
  gap: spacing.sm,
},
addressActionButton: {
  padding: spacing.sm,
  borderRadius: borderRadius.sm,
},
defaultBadge: {
  backgroundColor: colors.primary,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: borderRadius.sm,
},
defaultBadgeText: {
  ...typography.xs,
  fontWeight: fontWeights.semibold,
  color: colors.white,
},
setDefaultButton: {
  padding: spacing.sm,
},
setDefaultButtonText: {
  ...typography.sm,
  fontWeight: fontWeights.medium,
  color: colors.primary,
},
```

#### 3.8. Atualizar AddressContext

**Arquivo:** `src/contexts/AddressContext.tsx`

**Mudanças necessárias:**

1. **Adicionar `isDefault` ao tipo Address:**
```tsx
export interface Address {
  id: string;
  type: AddressType;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean; // Adicionar
}
```

2. **Atualizar conversão do backend:**
```tsx
function convertBackendToContext(backendAddress: BackendAddress): Address {
  return {
    id: backendAddress.id,
    type: backendAddress.tipo,
    street: backendAddress.rua + (backendAddress.numero ? `, ${backendAddress.numero}` : ''),
    complement: backendAddress.complemento || '',
    neighborhood: backendAddress.bairro,
    city: backendAddress.cidade,
    state: backendAddress.estado,
    zipCode: backendAddress.cep,
    isDefault: backendAddress.isDefault, // Adicionar
  };
}
```

3. **Adicionar `setDefaultAddress` ao contexto:**
```tsx
interface AddressContextType {
  // ... outros campos
  setDefaultAddress: (id: string) => Promise<void>; // Adicionar
}

// Implementação
const setDefaultAddress = useCallback(async (id: string) => {
  if (!isAuthenticated) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const backendAddress = await addressService.setDefaultAddress(id);
    
    // Atualizar todos os endereços: apenas o selecionado é padrão
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    
    // Selecionar o endereço padrão
    setSelectedAddressId(id);
  } catch (error) {
    console.error('Erro ao definir endereço padrão:', error);
    throw error;
  }
}, [isAuthenticated]);

// Adicionar ao Provider
<AddressContext.Provider
  value={{
    // ... outros valores
    setDefaultAddress, // Adicionar
  }}
>
```

### Fase 4: CRUD de Cartões de Pagamento

#### 4.1. Criar Service de Cartões no Frontend

**Arquivo:** `src/services/payment-card.service.ts` (novo)

**Implementação:**
```typescript
/**
 * Service de Cartões de Pagamento
 */

import { apiClient } from './api/client';

export interface PaymentCard {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito';
  ultimosDigitos: string;
  nomeCartao: string;
  bandeira?: string;
  mesValidade: number;
  anoValidade: number;
  cartaoPadrao: boolean;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export const paymentCardService = {
  /**
   * Listar cartões do usuário
   */
  async getCards(): Promise<PaymentCard[]> {
    const response = await apiClient.get<{ cartoes: PaymentCard[] }>('/api/payment-cards');
    return response.data!.cartoes;
  },

  /**
   * Obter cartão por ID
   */
  async getCardById(id: string): Promise<PaymentCard> {
    const response = await apiClient.get<{ cartao: PaymentCard }>(`/api/payment-cards/${id}`);
    return response.data!.cartao;
  },

  /**
   * Adicionar cartão
   */
  async addCard(data: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }): Promise<PaymentCard> {
    const response = await apiClient.post<{ cartao: PaymentCard }>('/api/payment-cards', data);
    return response.data!.cartao;
  },

  /**
   * Atualizar cartão
   */
  async updateCard(id: string, data: {
    nomeCartao?: string;
    mesValidade?: number;
    anoValidade?: number;
  }): Promise<PaymentCard> {
    const response = await apiClient.put<{ cartao: PaymentCard }>(`/api/payment-cards/${id}`, data);
    return response.data!.cartao;
  },

  /**
   * Definir cartão como padrão
   */
  async setDefaultCard(id: string): Promise<PaymentCard> {
    const response = await apiClient.patch<{ cartao: PaymentCard }>(`/api/payment-cards/${id}/set-default`);
    return response.data!.cartao;
  },

  /**
   * Remover cartão
   */
  async deleteCard(id: string): Promise<void> {
    await apiClient.delete(`/api/payment-cards/${id}`);
  },
};
```

#### 4.2. Criar Context de Cartões

**Arquivo:** `src/contexts/PaymentCardContext.tsx` (novo)

**Implementação:**
```typescript
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { paymentCardService, PaymentCard } from '../services/payment-card.service';
import { useAuth } from './AuthContext';

interface PaymentCardContextType {
  cards: PaymentCard[];
  defaultCard: PaymentCard | null;
  loading: boolean;
  addCard: (cardData: any) => Promise<void>;
  updateCard: (id: string, data: any) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  loadCards: () => Promise<void>;
}

const PaymentCardContext = createContext<PaymentCardContextType | undefined>(undefined);

export function PaymentCardProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultCard = cards.find(card => card.cartaoPadrao) || null;

  const loadCards = useCallback(async () => {
    if (!isAuthenticated) {
      setCards([]);
      return;
    }

    try {
      setLoading(true);
      const loadedCards = await paymentCardService.getCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const addCard = useCallback(async (cardData: any) => {
    const newCard = await paymentCardService.addCard(cardData);
    setCards(prev => [...prev, newCard]);
  }, []);

  const updateCard = useCallback(async (id: string, data: any) => {
    const updatedCard = await paymentCardService.updateCard(id, data);
    setCards(prev => prev.map(card => card.id === id ? updatedCard : card));
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    await paymentCardService.deleteCard(id);
    setCards(prev => prev.filter(card => card.id !== id));
  }, []);

  const setDefaultCard = useCallback(async (id: string) => {
    const updatedCard = await paymentCardService.setDefaultCard(id);
    setCards(prev => prev.map(card => 
      card.id === id ? updatedCard : { ...card, cartaoPadrao: false }
    ));
  }, []);

  return (
    <PaymentCardContext.Provider
      value={{
        cards,
        defaultCard,
        loading,
        addCard,
        updateCard,
        deleteCard,
        setDefaultCard,
        loadCards,
      }}
    >
      {children}
    </PaymentCardContext.Provider>
  );
}

export function usePaymentCard() {
  const context = useContext(PaymentCardContext);
  if (!context) {
    throw new Error('usePaymentCard must be used within a PaymentCardProvider');
  }
  return context;
}
```

#### 4.3. Integrar PaymentMethods com Backend

**Arquivo:** `src/front/screens/PaymentMethods.tsx`

**Mudanças:**
- Substituir estado mockado por `usePaymentCard()`
- Integrar CRUD com backend
- Adicionar loading states
- Adicionar tratamento de erros

**Código:**
```tsx
import { usePaymentCard } from '../../contexts/PaymentCardContext';

export function PaymentMethods() {
  const { cards, loading, addCard, updateCard, deleteCard, setDefaultCard } = usePaymentCard();
  
  // Substituir useState mockado por dados do context
  // Resto da implementação similar, mas usando métodos do context
}
```

#### 4.4. Integrar Cartões no Checkout

**Arquivo:** `src/front/screens/Checkout.tsx`

**Mudanças:**
- Importar `usePaymentCard`
- Carregar cartões do backend
- Exibir cartões salvos
- Permitir selecionar cartão salvo ou adicionar novo
- Usar `cartaoId` real ao criar pedido

**Código:**
```tsx
import { usePaymentCard } from '../../contexts/PaymentCardContext';

export function Checkout() {
  const { cards, defaultCard, addCard } = usePaymentCard();
  
  // Usar cartões do backend ao invés de mockados
  // Ao criar pedido, usar cartaoId real
}
```

### Fase 5: Tratamento de Erros e UX

#### 5.1. Exibir erros no frontend

**Arquivo:** `src/front/screens/Checkout.tsx`

**Adicionar:**
- Toast ou modal de erro
- Mensagens específicas para cada tipo de erro
- Retry automático em alguns casos

**Código:**
```tsx
import { Toast } from '../../../components/ui';

// No handleConfirmPayment, após catch:
if (err.code === 'EMPTY_CART') {
  Toast.show('Seu carrinho está vazio', 'error');
} else if (err.code === 'ADDRESS_NOT_FOUND') {
  Toast.show('Endereço não encontrado. Selecione outro endereço.', 'error');
} else if (err.code === 'INSUFFICIENT_STOCK') {
  Toast.show('Alguns produtos estão sem estoque. Verifique seu carrinho.', 'error');
} else {
  Toast.show(err.message || 'Erro ao criar pedido. Tente novamente.', 'error');
}
```

#### 5.2. Loading states

**Arquivo:** `src/front/screens/Checkout.tsx`

**Adicionar:**
- Loading no botão durante criação
- Desabilitar todos os campos durante criação
- Skeleton ou spinner durante loading

**Código:**
```tsx
<Button
  title={creatingOrder ? "Processando..." : "Confirmar pagamento"}
  variant="primary"
  size="lg"
  onPress={handleConfirmPayment}
  disabled={!canConfirmPayment || creatingOrder}
  loading={creatingOrder}
  style={styles.confirmButton}
/>
```

## 🧪 Testes

### Testes Manuais

1. **Teste: Checkout sem endereços**
   - Acessar checkout sem ter endereços cadastrados
   - Verificar empty state exibido
   - Adicionar primeiro endereço
   - Verificar se endereço é selecionado automaticamente
   - Verificar se botão é habilitado

2. **Teste: Checkout com endereços**
   - Acessar checkout com endereços cadastrados
   - Verificar se endereço padrão é selecionado
   - Alterar endereço
   - Verificar se botão permanece habilitado

3. **Teste: CRUD de Endereços no Checkout**
   - **Adicionar endereço:**
     - Clicar em "Adicionar endereço" no empty state
     - Preencher formulário
     - Buscar CEP e verificar preenchimento automático
     - Salvar e verificar se aparece na lista
   - **Editar endereço:**
     - Abrir lista de endereços
     - Clicar em editar
     - Modificar dados
     - Salvar e verificar alterações
   - **Deletar endereço:**
     - Abrir lista de endereços
     - Clicar em deletar
     - Confirmar exclusão
     - Verificar se endereço foi removido
     - Tentar deletar único endereço (deve bloquear)
   - **Definir como padrão:**
     - Abrir lista de endereços
     - Clicar em "Definir como padrão"
     - Verificar se badge "Padrão" aparece
     - Verificar se endereço é selecionado automaticamente

4. **Teste: Criar pedido**
   - Selecionar endereço
   - Selecionar método de pagamento
   - Clicar em "Confirmar pagamento"
   - Verificar loading state
   - Verificar navegação para OrderProcessing
   - Verificar carrinho limpo

5. **Teste: Erros**
   - Tentar criar pedido sem endereço (botão desabilitado)
   - Tentar criar pedido com carrinho vazio
   - Tentar criar pedido com produto sem estoque
   - Verificar mensagens de erro apropriadas
   - Testar validações do formulário de endereço
   - Testar CEP inválido

### Testes de Integração

1. **Teste: Fluxo completo**
   - Adicionar produtos ao carrinho
   - Aplicar cupom
   - Ir para checkout
   - Selecionar endereço
   - Criar pedido
   - Verificar pedido criado no backend
   - Verificar estoque atualizado
   - Verificar cupom aplicado

## 📋 Checklist de Implementação

### Frontend
- [x] Adicionar seção de endereços sempre visível
- [x] Adicionar EmptyState quando não houver endereços
- [x] Desabilitar botão quando não houver endereço selecionado
- [x] Integrar `handleConfirmPayment` com backend
- [x] Adicionar método `createOrder` no `orderService`
- [x] Adicionar loading states
- [x] Adicionar tratamento de erros
- [x] Criar `payment-card.service.ts`
- [x] Criar `PaymentCardContext`
- [x] Integrar PaymentMethods com backend
- [x] Integrar cartões no Checkout
- [x] Adicionar endereço no checkout
- [ ] Editar endereço no checkout
- [ ] Deletar endereço no checkout
- [ ] Definir endereço como padrão no checkout
- [ ] Validações completas do formulário de endereço
- [ ] Melhorar busca de CEP com feedback
- [ ] Adicionar Toast para feedback
- [ ] Exibir tempo de entrega calculado dinamicamente
- [ ] Testar fluxo completo

### Backend
- [ ] Verificar validações do schema
- [ ] Testar endpoint `POST /api/orders`
- [ ] Verificar mensagens de erro
- [ ] Implementar cálculo de tempo de entrega
- [ ] Adicionar campos latitude/longitude no schema de endereços
- [ ] Implementar geocodificação de endereços
- [ ] Testar cálculo de distância
- [ ] Testar com diferentes cenários:
  - [ ] Carrinho vazio
  - [ ] Endereço inválido
  - [ ] Estoque insuficiente
  - [ ] Cupom inválido
  - [ ] Método de pagamento inválido
  - [ ] Cartão inválido
  - [ ] Endereço com/sem coordenadas

## 🚀 Próximos Passos

### Prioridade Alta

1. **CRUD de Cartões no Frontend**
   - [ ] Criar `payment-card.service.ts`
   - [ ] Criar `PaymentCardContext`
   - [ ] Integrar PaymentMethods com backend
   - [ ] Integrar cartões no Checkout
   - [ ] Testar fluxo completo de cartões

2. **Cálculo de Tempo de Entrega**
   - [ ] Adicionar campos latitude/longitude no schema
   - [ ] Implementar geocodificação de endereços
   - [ ] Implementar cálculo de distância (Haversine)
   - [ ] Implementar cálculo de tempo baseado em distância
   - [ ] Atualizar `createOrder` para usar tempo calculado
   - [ ] Testar com diferentes endereços

### Prioridade Média

3. **Integração com Gateway de Pagamento**
   - Integrar MercadoPago (tokenização já existe)
   - Processar pagamento real
   - Webhook para confirmação

4. **Cálculo Dinâmico de Taxa de Entrega**
   - Baseado em distância
   - Baseado em horário
   - Baseado em tipo de entrega

5. **Melhorias no Tempo de Entrega**
   - Considerar trânsito atual (API de trânsito)
   - Considerar horário do dia
   - Considerar dia da semana
   - Cache de cálculos

### Prioridade Baixa

6. **Observações e Instruções**
   - Campo de observações do pedido
   - Campo de instruções de entrega
   - Exibir nas telas de pedido

7. **Otimizações**
   - Cache de coordenadas de endereços
   - Cache de cálculos de tempo
   - Batch de geocodificação

## 📍 CRUD Completo de Endereços no Checkout - Detalhamento

### Estado Atual

#### Backend ✅
- ✅ `AddressService` completo com todos os métodos
- ✅ Rotas REST completas (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- ✅ Endpoint `set-default` para definir endereço padrão
- ✅ Validações de schema
- ✅ Busca de CEP via API externa

#### Frontend ⚠️
- ✅ `AddressContext` com CRUD básico
- ✅ Integração no Checkout (parcial)
- ✅ Modal para adicionar endereço
- ✅ Modal para listar endereços
- ❌ `setDefaultAddress` não exposto no context
- ❌ `isDefault` não incluído no tipo Address
- ❌ Editar endereço no checkout
- ❌ Deletar endereço no checkout
- ❌ Definir como padrão no checkout

### Implementação Necessária

#### 1. Atualizar AddressContext

**Arquivo:** `src/contexts/AddressContext.tsx`

**Mudanças:**
- Adicionar `isDefault` ao tipo `Address`
- Atualizar `convertBackendToContext` para incluir `isDefault`
- Adicionar `setDefaultAddress` ao contexto
- Expor `setDefaultAddress` no Provider

#### 2. Adicionar funcionalidades no Checkout

**Arquivo:** `src/front/screens/Checkout.tsx`

**Funcionalidades:**
- Editar endereço existente
- Deletar endereço (com validação)
- Definir endereço como padrão
- Melhorar UX do formulário
- Validações completas

#### 3. Melhorias de UX

- Indicador visual de endereço padrão
- Botões de ação (editar/deletar) na lista
- Confirmação antes de deletar
- Feedback visual durante operações
- Validações inline no formulário

### Fluxo de Uso

```
1. Usuário acessa Checkout
   ↓
2. Se não houver endereços:
   - Exibe EmptyState
   - Botão "Adicionar endereço"
   ↓
3. Se houver endereços:
   - Exibe lista de endereços
   - Endereço padrão selecionado automaticamente
   - Botão "Alterar endereço" abre modal
   ↓
4. No modal de endereços:
   - Lista todos os endereços
   - Indicador de endereço padrão (badge)
   - Botão editar (ícone lápis)
   - Botão deletar (ícone lixeira)
   - Botão "Definir como padrão"
   - Botão "Adicionar novo endereço"
   ↓
5. Ao editar:
   - Abre modal com formulário preenchido
   - Permite modificar todos os campos
   - Salva alterações
   ↓
6. Ao deletar:
   - Mostra confirmação
   - Valida se não é o único endereço
   - Remove e seleciona outro se necessário
   ↓
7. Ao definir como padrão:
   - Atualiza badge "Padrão"
   - Seleciona automaticamente
   - Atualiza no backend
```

### Testes de Endereços no Checkout

- [ ] Adicionar primeiro endereço no checkout
- [ ] Adicionar endereço adicional no checkout
- [ ] Editar endereço existente
- [ ] Deletar endereço (com validação)
- [ ] Deletar único endereço (deve bloquear)
- [ ] Definir endereço como padrão
- [ ] Selecionar endereço na lista
- [ ] Validações do formulário
- [ ] Busca de CEP automática
- [ ] Feedback visual durante operações

## 💳 CRUD de Cartões de Pagamento - Detalhamento

### Estado Atual

#### Backend ✅
- ✅ `PaymentCardService` completo com todos os métodos
- ✅ Rotas REST completas (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- ✅ Integração com MercadoPago para tokenização
- ✅ Validações de schema
- ✅ Soft delete (desativação)
- ✅ Cartão padrão automático

#### Frontend ❌
- ❌ Service de cartões não existe
- ❌ Context de cartões não existe
- ❌ PaymentMethods usa dados mockados
- ❌ Checkout não integra com cartões salvos

### Implementação Frontend

#### 1. Service de Cartões

**Arquivo:** `src/services/payment-card.service.ts`

**Funcionalidades:**
- `getCards()` - Listar cartões do usuário
- `getCardById(id)` - Obter cartão específico
- `addCard(data)` - Adicionar novo cartão (tokeniza no MercadoPago)
- `updateCard(id, data)` - Atualizar dados do cartão
- `setDefaultCard(id)` - Definir cartão como padrão
- `deleteCard(id)` - Remover cartão (soft delete)

**Dados do Cartão:**
```typescript
interface PaymentCard {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito';
  ultimosDigitos: string; // "1234"
  nomeCartao: string;
  bandeira?: string; // "visa", "mastercard", etc
  mesValidade: number;
  anoValidade: number;
  cartaoPadrao: boolean;
  ativo: boolean;
}
```

#### 2. Context de Cartões

**Arquivo:** `src/contexts/PaymentCardContext.tsx`

**Funcionalidades:**
- Gerenciar estado dos cartões
- Carregar cartões ao autenticar
- Cache local dos cartões
- Sincronização com backend
- Gerenciar cartão padrão

**Hooks:**
- `usePaymentCard()` - Acesso ao context
- `cards` - Lista de cartões
- `defaultCard` - Cartão padrão
- `addCard()`, `updateCard()`, `deleteCard()`, `setDefaultCard()`

#### 3. Integração no Checkout

**Mudanças necessárias:**
- Carregar cartões do backend ao abrir checkout
- Exibir cartões salvos como opções
- Permitir selecionar cartão salvo
- Permitir adicionar novo cartão
- Usar `cartaoId` real ao criar pedido
- Validar cartão selecionado antes de criar pedido

**Fluxo:**
```
1. Usuário abre Checkout
   ↓
2. Frontend carrega cartões do backend
   ↓
3. Exibe cartões salvos como opções
   ↓
4. Usuário seleciona cartão ou adiciona novo
   ↓
5. Ao criar pedido, envia cartaoId real
```

### Testes de Cartões

- [ ] Listar cartões do usuário
- [ ] Adicionar novo cartão
- [ ] Tokenização no MercadoPago
- [ ] Atualizar cartão
- [ ] Definir cartão como padrão
- [ ] Remover cartão
- [ ] Selecionar cartão no checkout
- [ ] Criar pedido com cartão selecionado
- [ ] Validar cartão antes de criar pedido

## ⏱️ Cálculo de Tempo de Entrega - Detalhamento

### Estado Atual

- ❌ Tempo fixo: "20-40 minutos"
- ❌ Não considera distância
- ❌ Não considera trânsito
- ❌ Não considera horário

### Implementação

#### 1. Estrutura de Dados

**Adicionar ao schema de endereços:**
```typescript
latitude: real('latitude'),
longitude: real('longitude'),
```

**Variáveis de ambiente:**
```env
RESTAURANT_LATITUDE=-23.5505
RESTAURANT_LONGITUDE=-46.6333
```

#### 2. Geocodificação de Endereços

**Opções de API:**
1. **OpenStreetMap Nominatim** (gratuito, sem chave)
   - Limite: 1 requisição/segundo
   - Uso: Desenvolvimento e produção pequena

2. **Google Maps Geocoding API** (pago, mais preciso)
   - Uso: Produção com alto volume

3. **ViaCEP + Geocodificação** (híbrido)
   - Buscar CEP primeiro
   - Geocodificar depois

**Implementação:**
- Buscar coordenadas ao criar/atualizar endereço
- Salvar coordenadas no banco
- Reutilizar coordenadas salvas
- Atualizar se endereço mudar

#### 3. Cálculo de Distância

**Fórmula Haversine:**
```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

#### 4. Cálculo de Tempo

**Fórmula:**
```
Tempo Total = Tempo de Preparo + Tempo de Entrega

Tempo de Preparo = 15-20 minutos (fixo)
Tempo de Entrega = Distância / Velocidade Média

Velocidade Média = 30 km/h (configurável)
```

**Intervalo:**
- Arredondar para múltiplos de 10 minutos
- Adicionar margem de segurança (20 minutos)
- Exemplo: 25 minutos → "20-40 minutos"

#### 5. Melhorias Futuras

**Considerar:**
- Trânsito atual (API de trânsito)
- Horário do dia (rush hour)
- Dia da semana (finais de semana)
- Condições climáticas
- Histórico de entregas na região

**Cache:**
- Cachear cálculos por endereço
- Atualizar periodicamente
- Invalidar se endereço mudar

### Testes de Tempo de Entrega

- [ ] Calcular tempo para endereço próximo (5km)
- [ ] Calcular tempo para endereço distante (20km)
- [ ] Geocodificar endereço sem coordenadas
- [ ] Reutilizar coordenadas salvas
- [ ] Validar tempo mínimo (não menos que 20min)
- [ ] Validar tempo máximo (não mais que 120min)
- [ ] Testar com endereço inválido (fallback)

## 📚 Referências

- [Documentação Order Service](./order.service.ts)
- [Documentação Cart Service](./cart.service.ts)
- [Documentação Address Service](./address.service.ts)
- [Documentação Payment Card Service](./payment-card.service.ts)
- [Planejamento Integração Frontend](../frontend/PLANEJAMENTO_INTEGRACAO.md)
- [Planejamento Integração Cupons](../frontend/PLANEJAMENTO_INTEGRACAO_CUPONS.md)
- [MercadoPago Tokenização](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
- [OpenStreetMap Nominatim](https://nominatim.org/release-docs/develop/api/Overview/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

