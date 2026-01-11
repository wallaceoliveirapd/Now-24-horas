import { View, Text, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useCallback } from 'react';
import { PageTitle, ProductCard, Skeleton, EmptyState } from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { productService, Product } from '../../services/product.service';
import type { RootStackParamList as AppRootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md; // 16px
const PADDING = spacing.lg; // 24px
const CARD_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - CARD_GAP) / 2;

type NavigationProp = NativeStackNavigationProp<AppRootStackParamList>;
type ProductListRouteProp = RouteProp<AppRootStackParamList, 'ProductList'>;

export function ProductListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductListRouteProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const { title, filterType, categoryId } = route.params || {
    title: 'Produtos',
    filterType: undefined,
    categoryId: undefined,
  };

  // Função para carregar produtos do backend
  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      let loadedProducts: Product[] = [];

      if (filterType === 'offer') {
        // Produtos em oferta
        loadedProducts = await productService.getOffersProducts(100); // Limite alto para mostrar todos
      } else if (filterType === 'popular') {
        // Produtos populares
        loadedProducts = await productService.getPopularProducts(100); // Limite alto para mostrar todos
      } else if (filterType === 'category' && categoryId) {
        // Produtos por categoria
        const response = await productService.getProducts({
          categoriaId: categoryId,
          limite: 100, // Limite alto para mostrar todos
        });
        loadedProducts = response.produtos;
      } else {
        // Sem filtro específico, carregar todos
        const response = await productService.getProducts({
          limite: 100,
        });
        loadedProducts = response.produtos;
      }

      setProducts(loadedProducts);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar produtos'));
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, categoryId]);

  // Carregar produtos quando a tela montar ou filtros mudarem
  useEffect(() => {
    setLoading(true);
    loadProducts();
  }, [loadProducts]);

  // Função de refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  // Converter produtos do backend para formato do ProductCard
  const convertProductToCard = useCallback((product: Product) => {
    // Garantir que os preços sejam números válidos
    let preco = 0;
    if (product.preco !== undefined && product.preco !== null) {
      const precoNum = typeof product.preco === 'string' ? parseFloat(product.preco) : product.preco;
      if (!isNaN(precoNum) && precoNum > 0) {
        preco = precoNum;
      }
    }
    
    let precoPromocional: number | undefined = undefined;
    if (product.precoPromocional !== undefined && product.precoPromocional !== null) {
      const precoPromoNum = typeof product.precoPromocional === 'string' 
        ? parseFloat(product.precoPromocional) 
        : product.precoPromocional;
      if (!isNaN(precoPromoNum) && precoPromoNum > 0) {
        precoPromocional = precoPromoNum;
      }
    }
    
    const hasDiscount = precoPromocional && precoPromocional < preco && preco > 0;
    const discountPercent = hasDiscount && preco > 0
      ? Math.round(((preco - precoPromocional!) / preco) * 100)
      : undefined;

    // Calcular preço final (usar promocional se houver, senão usar preço normal)
    const precoFinal = precoPromocional && precoPromocional < preco ? precoPromocional : preco;
    
    // Formatar preços (garantir que não seja NaN)
    const formatPrice = (price: number): string => {
      if (!price || isNaN(price) || price <= 0) return 'R$ 0,00';
      return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
    };

    return {
      id: product.id,
      title: product.nome || 'Produto sem nome',
      description: product.descricao || '',
      showDriver: product.maisPopular || false,
      driverLabel: product.maisPopular ? 'Popular' : undefined,
      basePrice: hasDiscount ? formatPrice(preco) : undefined,
      finalPrice: formatPrice(precoFinal),
      discountValue: discountPercent ? `${discountPercent}%` : undefined,
      type: (product.emOferta ? 'Offer' : 'Default') as 'Offer' | 'Default',
      imageSource: product.imagemUrl ? { uri: product.imagemUrl } : undefined,
    };
  }, []);

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
            title={title}
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {loading ? (
              /* Skeleton Loading */
              <View style={styles.productsGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={styles.productCardWrapper}>
                    <Skeleton width="100%" height={117} borderRadius={8} />
                    <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                    <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: spacing.xs }} />
                    <Skeleton width="60%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                  </View>
                ))}
              </View>
            ) : error ? (
              /* Error State */
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error.message || 'Erro ao carregar produtos. Toque para tentar novamente.'}
                </Text>
                <Text style={styles.retryText} onPress={loadProducts}>
                  Tentar novamente
                </Text>
              </View>
            ) : products.length === 0 ? (
              /* Empty State */
              <EmptyState
                type="search"
                title="Nenhum produto encontrado"
                description="Não há produtos disponíveis nesta categoria no momento"
              />
            ) : (
              /* Products Grid */
              <View style={styles.productsGrid}>
                {products.map((product) => {
                  const cardData = convertProductToCard(product);
                  return (
                    <View key={product.id} style={styles.productCardWrapper}>
                      <ProductCard
                        {...cardData}
                        onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                        style={styles.productCard}
                      />
                    </View>
                  );
                })}
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
    paddingHorizontal: spacing.md, // 16px
    paddingBottom: spacing.xl,
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
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: colors.red?.[600] || '#DC2626',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

