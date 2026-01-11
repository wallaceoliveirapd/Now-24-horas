import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useCallback } from 'react';
import { 
  PageTitle,
  Banner,
  SectionTitle,
  CupomCard,
  Skeleton,
  EmptyState,
  Toast
} from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { useCart, AppliedCoupon } from '../../contexts/CartContext';
import { validateCoupon } from '../../lib/couponUtils';
import { couponService, BackendCoupon } from '../../services/coupon.service';
import { getErrorMessage } from '../../lib/errorMessages';
import { useAuth } from '../../contexts/AuthContext';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Converter cupom do backend para formato do frontend
 */
function convertBackendToAppliedCoupon(backendCoupon: BackendCoupon): AppliedCoupon {
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

  const validUntil = formatDate(backendCoupon.validoAte);
  const validUntilText = validUntil ? `Válido até ${validUntil}` : '';

  // Construir texto de condições
  const conditionsParts: string[] = [];
  
  if (backendCoupon.valorMinimoPedido) {
    const minValue = (backendCoupon.valorMinimoPedido / 100).toFixed(2).replace('.', ',');
    conditionsParts.push(`Válido para pedidos acima de R$ ${minValue}`);
  }
  
  if (backendCoupon.tipoDesconto === 'percentual' && backendCoupon.valorMaximoDesconto) {
    const maxDiscount = (backendCoupon.valorMaximoDesconto / 100).toFixed(2).replace('.', ',');
    conditionsParts.push(`Máximo de R$ ${maxDiscount} de desconto`);
  }
  
  if (!backendCoupon.descontoEntrega) {
    conditionsParts.push('Entrega não inclui desconto');
  }
  
  if (backendCoupon.entregaObrigatoria) {
    conditionsParts.push('Apenas para pedidos com entrega');
  }

  const conditions = conditionsParts.length > 0 
    ? conditionsParts.join('. ') + '.'
    : validUntilText;

  // Mapear condições do cupom
  const couponConditions = {
    minOrderValue: backendCoupon.valorMinimoPedido,
    maxDiscountValue: backendCoupon.valorMaximoDesconto,
    deliveryNotIncluded: !backendCoupon.descontoEntrega,
    deliveryRequired: backendCoupon.entregaObrigatoria,
  };

  return {
    id: backendCoupon.id,
    discountValue,
    description: backendCoupon.descricao || '',
    conditions,
    validUntil: validUntilText,
    couponCode: backendCoupon.codigo,
    discountType: backendCoupon.tipoDesconto,
    discountAmount: backendCoupon.valorDesconto,
    couponConditions,
  };
}

export function Cupons() {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated } = useAuth();
  const { appliedCoupon, applyCoupon, removeCoupon, items: cartItems } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AppliedCoupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');
  
  // Carregar cupons do backend
  const loadCoupons = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setAvailableCoupons([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const backendCoupons = await couponService.getAvailableCoupons();
      const convertedCoupons = backendCoupons.map(convertBackendToAppliedCoupon);
      
      setAvailableCoupons(convertedCoupons);
    } catch (err: any) {
      console.error('Erro ao carregar cupons:', err);
      const errorMessage = getErrorMessage(err.code || 'UNKNOWN_ERROR');
      setError(errorMessage);
      setAvailableCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Carregar cupons ao montar componente e quando a tela recebe foco
  // Isso garante que cupons usados sejam ocultados após finalizar pedido
  useFocusEffect(
    useCallback(() => {
      loadCoupons();
    }, [loadCoupons])
  );

  // Contar total de cupons
  const totalCoupons = availableCoupons.length;

  // Verificar se um cupom está selecionado
  const isCouponSelected = (couponId: string) => {
    return appliedCoupon?.id === couponId;
  };

  // Mostrar toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Aplicar cupom
  const handleUseCoupon = useCallback(async (coupon: AppliedCoupon) => {
    if (applyingCoupon) return; // Evitar múltiplas aplicações simultâneas

    try {
      setApplyingCoupon(coupon.id);
      
      // Calcular subtotal do carrinho
      const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
      const deliveryFee = 900; // R$ 9,00 em centavos
      const hasDelivery = true; // Por enquanto assumimos que sempre tem entrega
      
      // Validar cupom localmente primeiro (opcional, mas melhora UX)
      const localValidation = validateCoupon(coupon, cartItems, deliveryFee, hasDelivery);
      
      if (!localValidation.isValid) {
        showToast(localValidation.errorMessage || 'Cupom não pode ser aplicado', 'error');
        setApplyingCoupon(null);
        return;
      }

      // Validar cupom no backend (recomendado)
      try {
        await couponService.validateCoupon(coupon.couponCode, subtotal + deliveryFee);
      } catch (validationError: any) {
        const errorMessage = getErrorMessage(validationError.code || 'INVALID_COUPON');
        showToast(errorMessage, 'error');
        setApplyingCoupon(null);
        return;
      }

      // Aplicar cupom via CartContext
      await applyCoupon(coupon.couponCode);
      
      showToast('Cupom aplicado com sucesso!', 'success');
      
      // Navegar de volta após aplicar
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao aplicar cupom:', err);
      const errorMessage = getErrorMessage(err.code || 'UNKNOWN_ERROR');
      showToast(errorMessage, 'error');
    } finally {
      setApplyingCoupon(null);
    }
  }, [applyingCoupon, cartItems, applyCoupon, navigation]);

  // Remover cupom
  const handleRemoveCoupon = useCallback(async (couponId: string) => {
    if (appliedCoupon?.id === couponId) {
      try {
        await removeCoupon();
        showToast('Cupom removido com sucesso', 'success');
      } catch (err: any) {
        console.error('Erro ao remover cupom:', err);
        const errorMessage = getErrorMessage(err.code || 'UNKNOWN_ERROR');
        showToast(errorMessage, 'error');
      }
    }
  }, [appliedCoupon, removeCoupon]);

  // Copiar código do cupom
  const handleCopyCode = useCallback((code: string) => {
    // Por enquanto apenas logar, pode ser implementado com expo-clipboard depois
    console.log('Código do cupom:', code);
    showToast(`Código: ${code}`, 'info');
  }, []);

  return (
    <>
      <StatusBar 
        style="dark"
        backgroundColor={colors.white}
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: colors.white }]} 
        edges={['top']}
      >
        <View style={{ backgroundColor: colors.gray[50], flex: 1 }}>
        {/* Header */}
        <PageTitle
          title="Cupons"
          showCounter={true}
          counterValue={totalCoupons}
          onBackPress={() => navigation.goBack()}
        />

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Banner
              title="Economize mais!"
              description="Selecione um cupom para o seu pedido"
            />
          </View>

          {/* Section Title */}
          <View style={styles.sectionContainer}>
            <SectionTitle
              title="Cupons disponíveis"
              showIcon={false}
              showTimer={false}
              showLink={false}
              showDescription={false}
            />

            {/* Cupons List */}
            {loading ? (
              <View style={styles.cuponsList}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.skeletonCard}>
                    <Skeleton width="100%" height={140} borderRadius={8} />
                  </View>
                ))}
              </View>
            ) : error ? (
              <EmptyState
                type="generic"
                title="Erro ao carregar cupons"
                description={error}
              />
            ) : availableCoupons.length === 0 ? (
              <EmptyState
                type="generic"
                title="Nenhum cupom disponível"
                description="Novos cupons aparecerão aqui quando estiverem disponíveis"
              />
            ) : (
              <View style={styles.cuponsList}>
                {availableCoupons.map((coupon) => {
                  const isSelected = isCouponSelected(coupon.id);
                  const isApplying = applyingCoupon === coupon.id;
                  
                  return (
                    <CupomCard
                      key={coupon.id}
                      state={isSelected ? 'Selected' : 'Default'}
                      discountValue={coupon.discountValue}
                      description={coupon.description}
                      conditions={coupon.conditions}
                      validUntil={coupon.validUntil}
                      couponCode={coupon.couponCode}
                      onUse={() => !isApplying && handleUseCoupon(coupon)}
                      onRemove={() => handleRemoveCoupon(coupon.id)}
                      onCopyCode={() => handleCopyCode(coupon.couponCode)}
                      style={styles.cupomCard}
                    />
                  );
                })}
              </View>
            )}
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
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  bannerContainer: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionContainer: {
    padding: spacing.lg,
    paddingTop: 0,
    width: '100%',
  },
  cuponsList: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
  },
  cupomCard: {
    width: '100%',
  },
  skeletonCard: {
    marginTop: spacing.md,
  },
});
