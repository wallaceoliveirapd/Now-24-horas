import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo, useEffect } from 'react';
import { PageTitle, ProductCard, Input, Skeleton, EmptyState } from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { mockProducts, getImageSource } from '../../data/mockProducts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md; // 16px
const PADDING = spacing.lg; // 24px
const CARD_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - CARD_GAP) / 2;

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
  Favorites: undefined;
  ProductDetails: {
    productId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FavoriteProduct {
  id: string;
  title: string;
  description: string;
  showDriver?: boolean;
  driverLabel?: string;
  basePrice?: string;
  finalPrice: string;
  discountValue?: string;
  type: 'Offer' | 'Default';
}

export function Favorites() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Lista de produtos favoritos (mockado - em produção viria de um contexto/API)
  const [favoriteProducts] = useState<FavoriteProduct[]>(
    mockProducts.slice(0, 4).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      showDriver: p.showDriver,
      driverLabel: p.driverLabel,
      basePrice: p.basePrice,
      finalPrice: p.finalPrice,
      discountValue: p.discountValue,
      type: p.type,
    }))
  );

  // Simular carregamento inicial
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar produtos baseado na busca
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return favoriteProducts;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return favoriteProducts.filter(product => 
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }, [favoriteProducts, searchQuery]);

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
          {/* Header */}
          <PageTitle
            title="Favoritos"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="Buscar produtos favoritos"
                value={searchQuery}
                onChangeText={setSearchQuery}
                state="Default"
                showSearchIcon={true}
              />
            </View>

            {loading ? (
              /* Skeleton Loading */
              <View style={styles.productsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.productCardWrapper}>
                    <Skeleton width="100%" height={117} borderRadius={8} />
                    <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                    <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: spacing.xs }} />
                    <Skeleton width="60%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                  </View>
                ))}
              </View>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <EmptyState
                type="favorites"
                title={searchQuery ? "Nenhum favorito encontrado" : "Nenhum produto favorito"}
                description={searchQuery ? "Tente buscar com outras palavras-chave" : "Comece a adicionar produtos aos seus favoritos"}
                actionLabel={searchQuery ? undefined : "Explorar produtos"}
                onActionPress={searchQuery ? undefined : () => navigation.navigate('Search')}
              />
            ) : (
              /* Products Grid */
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <View key={product.id} style={styles.productCardWrapper}>
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      description={product.description}
                      showDriver={product.showDriver}
                      driverLabel={product.driverLabel}
                      basePrice={product.basePrice}
                      finalPrice={product.finalPrice}
                      discountValue={product.discountValue}
                      type={product.type}
                      imageSource={getImageSource(mockProducts.find(p => p.id === product.id)?.imageUrl)}
                      isFavorite={true}
                      onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                      style={styles.productCard}
                    />
                  </View>
                ))}
              </View>
            )}
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12, // Gap vertical de 12px entre linhas
  },
  productCardWrapper: {
    width: CARD_WIDTH,
    alignSelf: 'flex-start', // Permite que cards de alturas diferentes se alinhem no topo
  },
  productCard: {
    width: '100%',
    maxWidth: '100%',
  },
});

