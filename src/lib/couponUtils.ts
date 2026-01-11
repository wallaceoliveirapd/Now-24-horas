import { AppliedCoupon, CartItem, CouponConditions } from '../contexts/CartContext';

export interface CouponValidationResult {
  isValid: boolean;
  errorMessage?: string;
  calculatedDiscount?: number; // em centavos
}

/**
 * Valida se um cupom pode ser aplicado ao carrinho atual
 */
export function validateCoupon(
  coupon: AppliedCoupon,
  cartItems: CartItem[],
  deliveryFee: number,
  hasDelivery: boolean = true
): CouponValidationResult {
  const conditions = coupon.couponConditions || {};

  // Calcular subtotal do carrinho
  const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  // Verificar valor mínimo do pedido
  if (conditions.minOrderValue !== undefined && subtotal < conditions.minOrderValue) {
    const minValueFormatted = formatCurrency(conditions.minOrderValue);
    return {
      isValid: false,
      errorMessage: `Este cupom exige um valor mínimo de ${minValueFormatted} em produtos`,
    };
  }

  // Verificar se precisa ter entrega
  if (conditions.deliveryRequired && !hasDelivery) {
    return {
      isValid: false,
      errorMessage: 'Este cupom só pode ser usado em pedidos com entrega',
    };
  }

  // Calcular o desconto
  const baseForDiscount = conditions.deliveryNotIncluded ? subtotal : subtotal + deliveryFee;
  let calculatedDiscount = 0;

  if (coupon.discountType === 'fixed' || coupon.discountType === 'fixo') {
    // Desconto fixo em R$
    calculatedDiscount = coupon.discountAmount;
  } else if (coupon.discountType === 'percentage' || coupon.discountType === 'percentual') {
    // Desconto percentual
    calculatedDiscount = Math.floor((baseForDiscount * coupon.discountAmount) / 100);
    
    // Aplicar limite máximo de desconto se especificado (verificar tanto undefined quanto null)
    if (conditions.maxDiscountValue !== undefined && conditions.maxDiscountValue !== null) {
      calculatedDiscount = Math.min(calculatedDiscount, conditions.maxDiscountValue);
    }
  }

  // Verificar se o desconto é maior que o valor base (não pode dar desconto maior que o total)
  const maxPossibleDiscount = conditions.deliveryNotIncluded 
    ? subtotal 
    : subtotal + deliveryFee;
  
  if (calculatedDiscount > maxPossibleDiscount) {
    calculatedDiscount = maxPossibleDiscount;
  }

  return {
    isValid: true,
    calculatedDiscount,
  };
}

/**
 * Calcula o desconto aplicado considerando todas as regras do cupom
 */
export function calculateCouponDiscount(
  coupon: AppliedCoupon,
  subtotal: number,
  deliveryFee: number
): number {
  const conditions = coupon.couponConditions || {};
  const baseForDiscount = conditions.deliveryNotIncluded ? subtotal : subtotal + deliveryFee;
  
  let discount = 0;

  // Aceitar tanto 'fixed' quanto 'fixo' (do backend)
  const isFixed = coupon.discountType === 'fixed' || coupon.discountType === 'fixo';
  const isPercentage = coupon.discountType === 'percentage' || coupon.discountType === 'percentual';

  if (__DEV__) {
    console.log('🔍 calculateCouponDiscount debug:', {
      discountType: coupon.discountType,
      isFixed,
      isPercentage,
      discountAmount: coupon.discountAmount,
      subtotal,
      deliveryFee,
      baseForDiscount,
      conditions,
      deliveryNotIncluded: conditions.deliveryNotIncluded,
    });
  }

  if (isFixed) {
    // Desconto fixo em R$
    discount = coupon.discountAmount;
    if (__DEV__) {
      console.log('💰 Desconto fixo calculado:', discount);
    }
  } else if (isPercentage) {
    // Desconto percentual
    discount = Math.floor((baseForDiscount * coupon.discountAmount) / 100);
    
    if (__DEV__) {
      console.log('💰 Desconto percentual antes do limite:', discount, {
        baseForDiscount,
        percentual: coupon.discountAmount,
        calculo: `(${baseForDiscount} * ${coupon.discountAmount}) / 100 = ${discount}`,
      });
    }
    
    // Aplicar limite máximo de desconto se especificado (verificar tanto undefined quanto null)
    if (conditions.maxDiscountValue !== undefined && conditions.maxDiscountValue !== null) {
      discount = Math.min(discount, conditions.maxDiscountValue);
      if (__DEV__) {
        console.log('💰 Desconto após limite máximo:', discount, { maxDiscountValue: conditions.maxDiscountValue });
      }
    } else {
      if (__DEV__) {
        console.log('💰 Sem limite máximo de desconto, usando valor calculado:', discount);
      }
    }
  } else {
    if (__DEV__) {
      console.warn('⚠️ Tipo de desconto não reconhecido:', coupon.discountType);
    }
  }

  // Não pode dar desconto maior que o valor disponível
  const maxPossibleDiscount = conditions.deliveryNotIncluded 
    ? subtotal 
    : subtotal + deliveryFee;
  
  const finalDiscount = Math.min(discount, maxPossibleDiscount);
  
  if (__DEV__) {
    console.log('💰 Desconto final:', finalDiscount, {
      discountCalculado: discount,
      maxPossibleDiscount,
      final: finalDiscount,
    });
  }
  
  return finalDiscount;
}

/**
 * Formata valor em centavos para formato de moeda brasileira
 */
function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}

