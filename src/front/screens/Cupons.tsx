import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { 
  PageTitle,
  Banner,
  SectionTitle,
  CupomCard
} from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { useCart } from '../../contexts/CartContext';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Cupom {
  id: string;
  discountValue: string;
  description: string;
  conditions: string;
  validUntil: string;
  couponCode: string;
  discountAmount: number; // em centavos
}

export function Cupons() {
  const navigation = useNavigation<NavigationProp>();
  const { appliedCoupon, setAppliedCoupon } = useCart();
  
  // Lista de cupons disponíveis
  const [availableCoupons] = useState<Cupom[]>([
    {
      id: '1',
      discountValue: 'R$ 20 OFF',
      description: 'Ganhe 20% de desconto na primeira compra',
      conditions: 'Válido para pedidos acima de R$ 50,00',
      validUntil: 'Válido até 30/12/2025',
      couponCode: 'BEMVINDO10',
      discountAmount: 2000, // R$ 20,00
    },
    {
      id: '2',
      discountValue: 'R$ 15 OFF',
      description: 'Desconto especial para novos clientes',
      conditions: 'Válido para pedidos acima de R$ 30,00',
      validUntil: 'Válido até 31/12/2025',
      couponCode: 'NOVO15',
      discountAmount: 1500, // R$ 15,00
    },
    {
      id: '3',
      discountValue: 'R$ 10 OFF',
      description: 'Cupom de desconto para qualquer pedido',
      conditions: 'Válido para pedidos acima de R$ 20,00',
      validUntil: 'Válido até 15/01/2026',
      couponCode: 'DESCONTO10',
      discountAmount: 1000, // R$ 10,00
    },
  ]);

  // Contar total de cupons
  const totalCoupons = availableCoupons.length;

  // Verificar se um cupom está selecionado
  const isCouponSelected = (couponId: string) => {
    return appliedCoupon?.id === couponId;
  };

  // Aplicar cupom
  const handleUseCoupon = (coupon: Cupom) => {
    setAppliedCoupon(coupon);
    // Navegar de volta após aplicar
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  // Remover cupom
  const handleRemoveCoupon = (couponId: string) => {
    if (appliedCoupon?.id === couponId) {
      setAppliedCoupon(null);
    }
  };

  // Copiar código do cupom
  const handleCopyCode = (code: string) => {
    // Aqui você pode implementar a funcionalidade de copiar para clipboard
    console.log('Copiar código:', code);
  };

  return (
    <>
      <StatusBar 
        style="dark"
        backgroundColor={colors.white}
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
            <View style={styles.cuponsList}>
              {availableCoupons.map((coupon) => {
                const isSelected = isCouponSelected(coupon.id);
                return (
                  <CupomCard
                    key={coupon.id}
                    state={isSelected ? 'Selected' : 'Default'}
                    discountValue={coupon.discountValue}
                    description={coupon.description}
                    conditions={coupon.conditions}
                    validUntil={coupon.validUntil}
                    couponCode={coupon.couponCode}
                    onUse={() => handleUseCoupon(coupon)}
                    onRemove={() => handleRemoveCoupon(coupon.id)}
                    onCopyCode={() => handleCopyCode(coupon.couponCode)}
                    style={styles.cupomCard}
                  />
                );
              })}
            </View>
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
});

