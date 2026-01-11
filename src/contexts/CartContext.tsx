import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';
import { getImageSource } from '../data/mockProducts';
import { cartService, CartItem as BackendCartItem, AppliedCoupon as BackendCoupon } from '../services/cart.service';
import { BackendCoupon as FullBackendCoupon } from '../services/coupon.service';
import { useAuth } from './AuthContext';

export interface ProductCustomizationItem {
  name: string; // Ex: "Bacon", "Cream cheese"
  additionalPrice?: number; // Preço adicional em centavos (opcional)
}

export interface ProductCustomization {
  label: string; // Ex: "Escolha o tamanho", "Ponto da carne", "Adicionais"
  value?: string; // Ex: "Pequeno (150g)", "Ao ponto" - usado quando há apenas um valor simples
  items?: ProductCustomizationItem[]; // Lista de itens quando há múltiplos itens (ex: adicionais)
  additionalPrice?: number; // Preço adicional total em centavos (usado quando há apenas value simples)
}

export interface CartItem {
  id: string;
  produtoId?: string; // ID do produto original (usado para encontrar itens no carrinho)
  title: string;
  showDriver: boolean;
  driverLabel: string;
  basePrice: number; // em centavos
  finalPrice: number; // em centavos
  discountValue: number; // em centavos
  type: 'Offer' | 'Default';
  quantity: number;
  customizations?: ProductCustomization[]; // Personalizações do produto
  imageSource?: ImageSourcePropType; // Imagem do produto
}

export type DiscountType = 'fixed' | 'percentage' | 'fixo' | 'percentual';
export type CouponConditionType = 'delivery_not_included' | 'delivery_required';

export interface CouponConditions {
  minOrderValue?: number; // em centavos - valor mínimo do pedido
  maxDiscountValue?: number; // em centavos - valor máximo de desconto (para cupons percentuais)
  deliveryNotIncluded?: boolean; // se true, desconto não se aplica à taxa de entrega
  deliveryRequired?: boolean; // se true, cupom só pode ser usado em pedidos com entrega
}

export interface AppliedCoupon {
  id: string;
  discountValue: string; // texto de exibição (ex: "R$ 20 OFF" ou "10% OFF")
  description: string;
  conditions: string; // texto de exibição das condições
  validUntil: string;
  couponCode: string;
  discountType: DiscountType; // 'fixed' (R$) ou 'percentage' (%)
  discountAmount: number; // valor do desconto (em centavos para fixed, ou porcentagem para percentage, ex: 10 para 10%)
  couponConditions?: CouponConditions; // condições específicas do cupom
}

interface CartContextType {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  totalItems: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Converter item do carrinho do backend para formato do context
 */
function convertBackendToContextItem(backendItem: BackendCartItem): CartItem {
  const hasDiscount = backendItem.produto.valorDesconto && backendItem.produto.valorDesconto > 0;
  const finalPrice = backendItem.produto.precoFinal;
  const basePrice = backendItem.produto.precoBase;

  return {
    id: backendItem.id,
    produtoId: backendItem.produtoId || backendItem.produto.id, // Usar produtoId do backend ou id do produto como fallback
    title: backendItem.produto.nome,
    showDriver: false, // Pode ser ajustado conforme necessário
    driverLabel: '',
    basePrice: basePrice,
    finalPrice: finalPrice,
    discountValue: backendItem.produto.valorDesconto || 0,
    type: hasDiscount ? 'Offer' : 'Default',
    quantity: backendItem.quantidade,
    customizations: backendItem.personalizacoes ? (Array.isArray(backendItem.personalizacoes) ? backendItem.personalizacoes as any : []) : undefined,
    imageSource: backendItem.produto.imagemPrincipal ? getImageSource(backendItem.produto.imagemPrincipal) : undefined,
  };
}

/**
 * Converter cupom do backend para formato do context
 * Aceita tanto o tipo simplificado (do cart.service) quanto o completo (do coupon.service)
 */
function convertBackendCoupon(backendCoupon: BackendCoupon | FullBackendCoupon | undefined): AppliedCoupon | null {
  if (!backendCoupon) return null;

  // Formatar valor de desconto
  const discountValue = backendCoupon.tipoDesconto === 'fixo'
    ? `R$ ${(backendCoupon.valorDesconto / 100).toFixed(2).replace('.', ',')} OFF`
    : `${backendCoupon.valorDesconto}% OFF`;

  // Formatar data de validade
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Tentar obter validoAte do cupom completo, senão usar validade do simplificado
  const validUntilDate = 'validoAte' in backendCoupon 
    ? backendCoupon.validoAte 
    : ('validade' in backendCoupon ? backendCoupon.validade : undefined);
  
  const validUntil = formatDate(validUntilDate);
  const validUntilText = validUntil ? `Válido até ${validUntil}` : '';

  // Construir texto de condições
  const conditionsParts: string[] = [];
  
  // Verificar se tem propriedades do cupom completo
  // O backend retorna o cupom completo da tabela cupons, então deve ter todas as propriedades
  const hasFullData = 'valorMinimoPedido' in backendCoupon || 
                      'descontoEntrega' in backendCoupon ||
                      'entregaObrigatoria' in backendCoupon ||
                      'validoAte' in backendCoupon;
  
  if (hasFullData) {
    const fullCoupon = backendCoupon as FullBackendCoupon;
    
    if (fullCoupon.valorMinimoPedido) {
      const minValue = (fullCoupon.valorMinimoPedido / 100).toFixed(2).replace('.', ',');
      conditionsParts.push(`Válido para pedidos acima de R$ ${minValue}`);
    }
    
    if (fullCoupon.tipoDesconto === 'percentual' && fullCoupon.valorMaximoDesconto) {
      const maxDiscount = (fullCoupon.valorMaximoDesconto / 100).toFixed(2).replace('.', ',');
      conditionsParts.push(`Máximo de R$ ${maxDiscount} de desconto`);
    }
    
    if (!fullCoupon.descontoEntrega) {
      conditionsParts.push('Entrega não inclui desconto');
    }
    
    if (fullCoupon.entregaObrigatoria) {
      conditionsParts.push('Apenas para pedidos com entrega');
    }

    // Mapear condições do cupom completo
    const couponConditions: CouponConditions = {
      minOrderValue: fullCoupon.valorMinimoPedido,
      maxDiscountValue: fullCoupon.valorMaximoDesconto,
      deliveryNotIncluded: !fullCoupon.descontoEntrega,
      deliveryRequired: fullCoupon.entregaObrigatoria,
    };

    const conditions = conditionsParts.length > 0 
      ? conditionsParts.join('. ') + '.'
      : validUntilText;

    // Normalizar tipo de desconto: 'fixo' -> 'fixed', 'percentual' -> 'percentage'
    const normalizedDiscountType: 'fixed' | 'percentage' = 
      fullCoupon.tipoDesconto === 'fixo' ? 'fixed' :
      fullCoupon.tipoDesconto === 'percentual' ? 'percentage' :
      fullCoupon.tipoDesconto as 'fixed' | 'percentage';

    return {
      id: backendCoupon.id,
      discountValue,
      description: backendCoupon.descricao || '',
      conditions,
      validUntil: validUntilText,
      couponCode: backendCoupon.codigo,
      discountType: normalizedDiscountType,
      discountAmount: backendCoupon.valorDesconto,
      couponConditions,
    };
  } else {
    // Cupom simplificado (do cart.service) - mas o backend pode retornar propriedades extras
    // Tentar extrair condições mesmo do tipo simplificado
    const coupon = backendCoupon as any;
    
    // Construir condições se disponíveis
    const conditionsParts: string[] = [];
    
    if (coupon.valorMinimoPedido) {
      const minValue = (coupon.valorMinimoPedido / 100).toFixed(2).replace('.', ',');
      conditionsParts.push(`Válido para pedidos acima de R$ ${minValue}`);
    }
    
    if (coupon.tipoDesconto === 'percentual' && coupon.valorMaximoDesconto) {
      const maxDiscount = (coupon.valorMaximoDesconto / 100).toFixed(2).replace('.', ',');
      conditionsParts.push(`Máximo de R$ ${maxDiscount} de desconto`);
    }
    
    if (coupon.descontoEntrega === false) {
      conditionsParts.push('Entrega não inclui desconto');
    }
    
    if (coupon.entregaObrigatoria === true) {
      conditionsParts.push('Apenas para pedidos com entrega');
    }

    const conditions = conditionsParts.length > 0 
      ? conditionsParts.join('. ') + '.'
      : validUntilText;
    
    // Mapear condições do cupom (mesmo que simplificado, pode ter propriedades extras)
    const couponConditions: CouponConditions | undefined = 
      (coupon.valorMinimoPedido !== undefined || coupon.descontoEntrega !== undefined)
        ? {
            minOrderValue: coupon.valorMinimoPedido,
            maxDiscountValue: coupon.valorMaximoDesconto,
            deliveryNotIncluded: coupon.descontoEntrega === false,
            deliveryRequired: coupon.entregaObrigatoria === true,
          }
        : undefined;
    
    // Normalizar tipo de desconto: 'fixo' -> 'fixed', 'percentual' -> 'percentage'
    const normalizedDiscountType: 'fixed' | 'percentage' = 
      coupon.tipoDesconto === 'fixo' ? 'fixed' :
      coupon.tipoDesconto === 'percentual' ? 'percentage' :
      (coupon.tipoDesconto as any) === 'fixed' ? 'fixed' :
      (coupon.tipoDesconto as any) === 'percentage' ? 'percentage' :
      'fixed'; // fallback

    return {
      id: backendCoupon.id,
      discountValue,
      description: backendCoupon.descricao || '',
      conditions,
      validUntil: validUntilText,
      couponCode: backendCoupon.codigo,
      discountType: normalizedDiscountType,
      discountAmount: backendCoupon.valorDesconto,
      couponConditions,
    };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Carregar carrinho do backend
   */
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setAppliedCoupon(null);
      return;
    }

    try {
      setLoading(true);
      const cart = await cartService.getCart();
      
      // Converter itens
      const convertedItems = cart.itens.map(convertBackendToContextItem);
      setItems(convertedItems);

      // Converter cupom
      const convertedCoupon = convertBackendCoupon(cart.cupom);
      if (convertedCoupon) {
        // Debug: verificar se o cupom tem condições
        if (__DEV__) {
          console.log('🎫 Cupom convertido:', {
            id: convertedCoupon.id,
            code: convertedCoupon.couponCode,
            type: convertedCoupon.discountType,
            amount: convertedCoupon.discountAmount,
            hasConditions: !!convertedCoupon.couponConditions,
            conditions: convertedCoupon.couponConditions,
            rawBackendCoupon: cart.cupom, // Log do cupom original do backend
          });
        }
      }
      setAppliedCoupon(convertedCoupon);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      // Em caso de erro, manter array vazio
      setItems([]);
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Carregar carrinho quando autenticação mudar
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItem = useCallback(async (item: Omit<CartItem, 'quantity'>) => {
    if (!isAuthenticated) {
      // Se não autenticado, adicionar localmente (para testes ou modo offline)
      setItems(prevItems => {
        // Procurar por produtoId se disponível, senão usar id
        const searchId = item.produtoId || item.id;
        const existingItem = prevItems.find(i => (i.produtoId || i.id) === searchId);
        if (existingItem) {
          return prevItems.map(i =>
            (i.produtoId || i.id) === searchId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevItems, { ...item, quantity: 1 }];
      });
      return;
    }

    try {
      // Usar produtoId se disponível, senão usar id
      const productId = item.produtoId || item.id;
      
      await cartService.addItem({
        produtoId: productId,
        quantidade: 1,
        personalizacoes: item.customizations as any,
      });

      // Recarregar carrinho do backend
      await loadCart();
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho:', error);
      throw error;
    }
  }, [isAuthenticated, loadCart]);

  const removeItem = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      return;
    }

    try {
      await cartService.removeItem(id);
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }, [isAuthenticated, loadCart]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    if (!isAuthenticated) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      await cartService.updateItemQuantity(id, quantity);
      await loadCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  }, [isAuthenticated, loadCart, removeItem]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setAppliedCoupon(null);
      return;
    }

    try {
      await cartService.clearCart();
      await loadCart();
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  }, [isAuthenticated, loadCart]);

  const applyCoupon = useCallback(async (code: string) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await cartService.applyCoupon(code);
      await loadCart();
    } catch (error: any) {
      console.error('Erro ao aplicar cupom:', error);
      // Relançar erro para que o componente possa tratar
      throw error;
    }
  }, [isAuthenticated, loadCart]);

  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated) {
      setAppliedCoupon(null);
      return;
    }

    try {
      await cartService.removeCoupon();
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover cupom:', error);
      throw error;
    }
  }, [isAuthenticated, loadCart]);

  const setAppliedCouponCallback = useCallback(async (coupon: AppliedCoupon | null) => {
    if (coupon === null) {
      await removeCoupon();
    } else {
      await applyCoupon(coupon.couponCode);
    }
  }, [applyCoupon, removeCoupon]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setAppliedCoupon: setAppliedCouponCallback,
        applyCoupon,
        removeCoupon,
        totalItems,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

