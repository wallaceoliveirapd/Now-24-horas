import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CartProductCard,
  CupomBanner,
  Separator,
  Button,
  PageTitle,
  SkeletonLoader,
  Skeleton
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { useCart, CartItem } from '../../contexts/CartContext';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: undefined;
  Checkout: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100); // Converte de centavos para reais
}

export function Cart() {
  const navigation = useNavigation<NavigationProp>();
  const { items: cartItems, updateQuantity, removeItem, totalItems, appliedCoupon, setAppliedCoupon } = useCart();
  const [loading, setLoading] = useState(true);
  
  // Simular carregamento inicial
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  const hasCoupon = appliedCoupon !== null;
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  // Calcular totais
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = hasCoupon ? couponDiscount : 0;
    const total = subtotal + deliveryFee - discount;
    
    return {
      subtotal,
      deliveryFee,
      discount,
      total,
    };
  }, [cartItems, hasCoupon, couponDiscount]);

  // Animações para o total
  const totalScale = useRef(new Animated.Value(1)).current;
  const totalOpacity = useRef(new Animated.Value(1)).current;
  const totalTranslateY = useRef(new Animated.Value(0)).current;
  const previousTotal = useRef(totals.total);

  // Animar total quando muda
  useEffect(() => {
    if (previousTotal.current !== totals.total) {
      const isIncreasing = totals.total > previousTotal.current;
      
      // Reset valores
      totalScale.setValue(1);
      totalOpacity.setValue(1);
      totalTranslateY.setValue(0);
      
      // Animar
      Animated.parallel([
        Animated.sequence([
          Animated.spring(totalScale, {
            toValue: 1.1,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
          Animated.spring(totalScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
        ]),
        Animated.sequence([
          Animated.timing(totalOpacity, {
            toValue: 0.4,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(totalOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(totalTranslateY, {
            toValue: isIncreasing ? -6 : 6,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
          Animated.spring(totalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 12,
          }),
        ]),
      ]).start();
      
      previousTotal.current = totals.total;
    }
  }, [totals.total]);

  const animatedTotalStyle = {
    transform: [
      { scale: totalScale },
      { translateY: totalTranslateY },
    ],
    opacity: totalOpacity,
  };

  // Atualizar quantidade de um item
  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  // Remover item do carrinho
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  // Aplicar cupom - navegar para página de cupons
  const handleApplyCoupon = () => {
    navigation.navigate('Cupons');
  };

  // Remover cupom
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Finalizar pedido
  const handleCheckout = () => {
    navigation.navigate('Checkout');
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
            <Skeleton width={120} height={20} borderRadius={4} style={{ marginLeft: spacing.md }} />
            <Skeleton width={24} height={24} borderRadius={12} style={{ marginLeft: 'auto' }} />
          </View>
        ) : (
          <PageTitle
            title="Carrinho"
            showCounter={true}
            counterValue={totalItems}
            onBackPress={() => navigation.goBack()}
          />
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.skeletonContent}>
            {/* Skeleton Cart Items - Each in its own section */}
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonItemSection}>
                <View style={styles.skeletonCartItem}>
                  <Skeleton width={80} height={80} borderRadius={8} />
                  <View style={styles.skeletonCartItemContent}>
                    <Skeleton width="80%" height={16} borderRadius={4} />
                    <Skeleton width="60%" height={14} borderRadius={4} style={{ marginTop: spacing.xs }} />
                    <View style={styles.skeletonCartItemPrice}>
                      <Skeleton width={80} height={18} borderRadius={4} />
                    </View>
                  </View>
                  <View style={styles.skeletonCartItemActions}>
                    <Skeleton width={32} height={32} borderRadius={8} />
                    <Skeleton width={40} height={20} borderRadius={4} />
                    <Skeleton width={32} height={32} borderRadius={8} />
                  </View>
                </View>
              </View>
            ))}

            {/* Skeleton Cupom Banner */}
            <View style={styles.skeletonCupomBanner}>
              <Skeleton width="100%" height={80} borderRadius={8} />
            </View>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cart Items - Each item in its own section */}
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemSection}>
                <CartProductCard
                  id={item.id}
                  title={item.title}
                  showDriver={item.showDriver}
                  driverLabel={item.driverLabel}
                  basePrice={item.basePrice}
                  finalPrice={item.finalPrice}
                  discountValue={item.discountValue}
                  type={item.type}
                  quantity={item.quantity}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  customizations={item.customizations}
                />
              </View>
            ))}

            {/* Cupom Banner Section */}
            <View style={styles.cupomSection}>
              {hasCoupon && appliedCoupon ? (
                <CupomBanner
                  type="Cupom Aplicado"
                  couponCode={appliedCoupon.couponCode}
                  discountValue={`- R$ ${(couponDiscount / 100).toFixed(2).replace('.', ',')}`}
                  onRemove={handleRemoveCoupon}
                />
              ) : (
                <CupomBanner
                  type="Banner"
                  title="Aplicar cupom de desconto"
                  description="Economize ainda mais"
                  showBadge={false}
                  onPress={handleApplyCoupon}
                />
              )}
            </View>
          </ScrollView>
        )}

        {/* Fixed Bottom Bar */}
        {loading ? (
          <View style={styles.bottomBar}>
            {/* Skeleton Totals */}
            <View style={styles.skeletonTotalsContainer}>
              <View style={styles.skeletonTotalRow}>
                <Skeleton width={80} height={16} borderRadius={4} />
                <Skeleton width={60} height={16} borderRadius={4} />
              </View>
              <View style={styles.skeletonTotalRow}>
                <Skeleton width={100} height={16} borderRadius={4} />
                <Skeleton width={60} height={16} borderRadius={4} />
              </View>
            </View>

            <Skeleton width="100%" height={1} borderRadius={0} style={{ marginVertical: spacing.md }} />

            {/* Skeleton Final Total */}
            <View style={styles.skeletonFinalTotalRow}>
              <Skeleton width={50} height={19} borderRadius={4} />
              <Skeleton width={80} height={22} borderRadius={4} />
            </View>

            {/* Skeleton Button */}
            <Skeleton width="100%" height={48} borderRadius={8} style={{ marginTop: spacing.sm }} />
          </View>
        ) : (
          <View style={styles.bottomBar}>
            {/* Totals */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxa de entrega</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.deliveryFee)}</Text>
              </View>
              
              {hasCoupon && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.discountLabel]}>Desconto</Text>
                  <Text style={[styles.totalValue, styles.discountValue]}>
                    - {formatCurrency(totals.discount)}
                  </Text>
                </View>
              )}
            </View>

            <Separator />

            {/* Total */}
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Animated.Text style={[styles.finalTotalValue, animatedTotalStyle]}>
                {formatCurrency(totals.total)}
              </Animated.Text>
            </View>

            {/* Checkout Button */}
            <Button
              title="Finalizar pedido"
              variant="primary"
              size="lg"
              onPress={handleCheckout}
              style={styles.checkoutButton}
            />
          </View>
        )}
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
    paddingBottom: 400, // Espaço para a barra fixa
    gap: spacing.sm,
  },
  itemSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cupomSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: 0,
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
  totalsContainer: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 16,
  },
  totalValue: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalTotalLabel: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 19.2,
  },
  finalTotalValue: {
    fontSize: 18,
    lineHeight: 21.6,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  checkoutButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  skeletonContent: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonItemSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  skeletonCartItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeletonCartItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonCartItemPrice: {
    marginTop: spacing.sm,
  },
  skeletonCartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonCupomBanner: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  skeletonTotalsContainer: {
    gap: spacing.sm,
  },
  skeletonTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonFinalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

