import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useRef, useEffect } from 'react';
import { 
  HomeHeader, 
  CategoryGrid, 
  CategoryItem, 
  Input, 
  ImageSlider, 
  SliderItem, 
  SectionTitle, 
  ProductCard,
  BottomMenu,
  BottomMenuItemData,
  CupomBanner,
  FixedCartBar,
  Skeleton
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { Home as HomeIcon, Search, Receipt, User } from 'lucide-react-native';
import { useCart } from '../../contexts/CartContext';

// Importar imagens das categorias
const categoryImages = {
  todos: require('../images/category/todos.png'),
  frios: require('../images/category/frios.png'),
  lanche: require('../images/category/lanche.png'),
  carne: require('../images/category/carne.png'),
  limpeza: require('../images/category/limpeza.png'),
  mercearia: require('../images/category/mercearia.png'),
  vinho: require('../images/category/vinho.png'),
  bebida: require('../images/category/bebida.png'),
};

type RootStackParamList = {
      Home: undefined;
      ComponentShowcase: undefined;
      Cart: undefined;
      Cupons: undefined;
      Search: undefined;
      MyOrders: undefined;
    };

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function Home() {
  const navigation = useNavigation<NavigationProp>();
  const { items: cartItems, totalItems, appliedCoupon } = useCart();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const cartBarOpacity = useRef(new Animated.Value(0)).current;
  const cartBarTranslateY = useRef(new Animated.Value(20)).current;
  const [popularProducts, setPopularProducts] = useState([
    { id: '1', title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: true, driverLabel: 'Label', basePrice: 'R$9,98', finalPrice: 'R$9,98', discountValue: 'R$12', type: 'Offer' as const },
    { id: '2', title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: false, finalPrice: 'R$9,98', type: 'Default' as const },
    { id: '3', title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: true, driverLabel: 'Label', basePrice: 'R$9,98', finalPrice: 'R$9,98', discountValue: 'R$12', type: 'Offer' as const },
    { id: '4', title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: false, finalPrice: 'R$9,98', type: 'Default' as const },
  ]);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerRef = useRef<View>(null);

  // Simular carregamento inicial
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const loadMoreProducts = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    // Simular carregamento de mais produtos
    setTimeout(() => {
      const newProducts = [
        { id: String(popularProducts.length + 1), title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: true, driverLabel: 'Label', basePrice: 'R$9,98', finalPrice: 'R$9,98', discountValue: 'R$12', type: 'Offer' as const },
        { id: String(popularProducts.length + 2), title: 'Nome do produto com suas linhas no máximo', description: 'Nome do produto com suas linha...', showDriver: false, finalPrice: 'R$9,98', type: 'Default' as const },
      ];
      setPopularProducts([...popularProducts, ...newProducts]);
      setLoadingMore(false);
    }, 1000);
  };

  // Calcular total do carrinho
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    return subtotal + deliveryFee - discount;
  };

  const totalPrice = calculateTotal();

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Verificar se o header está visível
    const scrollY = contentOffset.y;
    const headerVisible = scrollY < headerHeight - 50; // 50px de margem
    const wasHeaderVisible = isHeaderVisible;
    setIsHeaderVisible(headerVisible);
    
    // Animar a barra de carrinho quando o header sair da tela
    if (!headerVisible && wasHeaderVisible && totalItems > 0) {
      // Mostrar barra
      Animated.parallel([
        Animated.timing(cartBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cartBarTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (headerVisible && !wasHeaderVisible) {
      // Esconder barra
      Animated.parallel([
        Animated.timing(cartBarOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cartBarTranslateY, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Verificar se chegou ao final para carregar mais produtos
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreProducts();
    }
  };

  const handleHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular atualização de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Categorias para o grid
  const categories: CategoryItem[] = [
    { label: 'Bebidas', type: 'Default', iconSource: categoryImages.bebida },
    { label: 'Vinhos', type: 'Default', iconSource: categoryImages.vinho },
    { label: 'Carnes', type: 'Default', iconSource: categoryImages.carne },
    { label: 'Lanches', type: 'Default', iconSource: categoryImages.lanche },
    { label: 'Mercearia', type: 'Default', iconSource: categoryImages.mercearia },
    { label: 'Limpeza', type: 'Default', iconSource: categoryImages.limpeza },
    { label: 'Frios', type: 'Default', iconSource: categoryImages.frios },
    { label: 'Todos', type: 'Default', iconSource: categoryImages.todos },
  ];

  // Slider items
  const sliderItems: SliderItem[] = [
    {
      id: '1',
      type: 'image',
      source: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=450&fit=crop' },
      title: 'Pratos Deliciosos',
      description: 'Descubra os melhores pratos preparados com ingredientes frescos e selecionados',
    },
    {
      id: '2',
      type: 'image',
      source: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=450&fit=crop' },
      // Sem título e descrição
    },
    {
      id: '3',
      type: 'image',
      source: { uri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=450&fit=crop' },
      title: 'Hambúrgueres Artesanais',
      description: 'Saboreie nossos hambúrgueres feitos com carnes nobres e pães artesanais',
    },
    {
      id: '4',
      type: 'image',
      source: { uri: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=450&fit=crop' },
      // Sem título e descrição
    },
    {
      id: '5',
      type: 'image',
      source: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop' },
      title: 'Pizzas Tradicionais',
      description: 'Pizzas feitas no forno a lenha com ingredientes de primeira qualidade',
    },
  ];

  // Data final para o timer (3 horas, 12 minutos, 34 segundos a partir de agora)
  const timerEndDate = new Date(Date.now() + 3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 34 * 1000);

  // Menu items
  const menuItems: BottomMenuItemData[] = [
    { label: 'Início', icon: HomeIcon, active: true, onPress: () => navigation.navigate('Home') },
    { label: 'Buscar', icon: Search, active: false, onPress: () => navigation.navigate('Search') },
    { label: 'Pedidos', icon: Receipt, active: false, onPress: () => navigation.navigate('MyOrders') },
    { label: 'Perfil', icon: User, active: false },
  ];

  return (
    <>
      <StatusBar 
        style={refreshing || isHeaderVisible ? "light" : "dark"}
        backgroundColor={refreshing || isHeaderVisible ? colors.primary : colors.white}
      />
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: refreshing ? colors.primary : (isHeaderVisible ? colors.primary : colors.white) }]} 
        edges={['top']}
      >
        <View style={styles.container}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.white}
                colors={[colors.white]}
                progressBackgroundColor={colors.primary}
              />
            }
          >
            {loading ? (
              <>
                {/* Skeleton Header */}
                <View style={styles.skeletonHeaderContainer}>
                  <Skeleton width="100%" height={120} borderRadius={0} />
                </View>

                {/* Skeleton Content */}
                <View style={styles.skeletonContent}>
                  {/* Skeleton Category Grid */}
                  <View style={styles.skeletonCategoryGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} width={70} height={70} borderRadius={8} />
                    ))}
                  </View>

                  {/* Skeleton Input */}
                  <Skeleton width="100%" height={40} borderRadius={8} />

                  {/* Skeleton Cupom Banner */}
                  <Skeleton width="100%" height={80} borderRadius={8} />

                  {/* Skeleton Image Slider */}
                  <Skeleton width="100%" height={220} borderRadius={8} />
                </View>

                {/* Skeleton Products Section */}
                <View style={styles.skeletonProductsSection}>
                  <View style={styles.skeletonSectionTitle}>
                    <Skeleton width={150} height={18} borderRadius={4} />
                  </View>
                  <View style={styles.skeletonProductsScroll}>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} width={117} height={180} borderRadius={8} />
                    ))}
                  </View>
                </View>

                {/* Skeleton Popular Section */}
                <View style={styles.skeletonPopularSection}>
                  <View style={styles.skeletonSectionTitle}>
                    <Skeleton width={150} height={18} borderRadius={4} />
                  </View>
                  <View style={styles.skeletonPopularGrid}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <View key={i} style={styles.skeletonPopularCard}>
                        <Skeleton width="100%" height={117} borderRadius={8} />
                        <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                        <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: spacing.xs }} />
                        <Skeleton width="60%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Header (não mais fixo - dentro do scroll) */}
                <View 
                  ref={headerRef}
                  onLayout={handleHeaderLayout}
                  style={[styles.header, { backgroundColor: colors.primary }]}
                >
                  <HomeHeader 
                    firstName="Wallace"
                    address="Av. Rua do Amor, 256"
                    cartCount={totalItems}
                    onCartPress={() => navigation.navigate('Cart')}
                  />
                </View>

                {/* Content */}
                <View style={styles.content}>
          {/* Category Grid */}
          <CategoryGrid 
            categories={categories}
            columns={4}
          />

          {/* Search Input */}
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Input 
              placeholder="Buscar itens"
              state="Default"
              editable={false}
            />
          </TouchableOpacity>

          {/* Cupom Banner */}
          <CupomBanner 
            type="Banner"
            title="Cupons disponíveis"
            description="Economize em seus pedidos"
            count={23}
            onPress={() => navigation.navigate('Cupons')}
          />

          {/* Image Slider */}
          <ImageSlider 
            items={sliderItems}
            height={220}
            autoPlay={true}
            autoPlayInterval={3000}
          />
        </View>

        {/* Ofertas do dia Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <SectionTitle 
              title="Ofertas do dia"
              showIcon={false}
              showTimer={false}
              showLink={true}
              linkText="Ver tudo"
              showDescription={false}
              style={styles.sectionTitleStyle}
            />
          </View>

          {/* Products Horizontal Scroll */}
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
            style={styles.productsScrollView}
            bounces={false}
            decelerationRate="fast"
            snapToInterval={137} // 117 (largura do card) + 10 (gap) + 10 (padding)
            snapToAlignment="start"
            scrollEventThrottle={16}
          >
            <ProductCard 
              title="Nome do produto"
              description="Nome do produto"
              showDriver={true}
              driverLabel="Label"
              basePrice="R$9,98"
              finalPrice="R$9,98"
              discountValue="R$12"
              type="Offer"
            />
            <ProductCard 
              title="Nome do produto"
              description="Nome do produto"
              showDriver={false}
              finalPrice="R$9,98"
              type="Default"
            />
            <ProductCard 
              title="Nome do produto"
              description="Nome do produto"
              showDriver={true}
              driverLabel="Label"
              basePrice="R$9,98"
              finalPrice="R$9,98"
              discountValue="R$12"
              type="Offer"
            />
            <ProductCard 
              title="Nome do produto"
              description="Nome do produto"
              showDriver={true}
              driverLabel="Label"
              basePrice="R$9,98"
              finalPrice="R$9,98"
              discountValue="R$12"
              type="Offer"
            />
          </ScrollView>
        </View>

        {/* Mais populares Section - Grid com scroll infinito */}
        <View style={styles.popularSection}>
          <View style={styles.popularSectionHeader}>
            <SectionTitle 
              title="Mais populares"
              showIcon={false}
              showTimer={false}
              showLink={true}
              linkText="Ver tudo"
              showDescription={false}
              style={styles.sectionTitleStyle}
            />
          </View>

          {/* Grid de produtos com scroll infinito */}
          <View style={styles.popularGrid}>
            {popularProducts.map((item) => (
              <View 
                key={item.id} 
                style={styles.popularCardWrapper}
              >
                <ProductCard 
                  title={item.title}
                  description={item.description}
                  showDriver={item.showDriver}
                  driverLabel={item.driverLabel}
                  basePrice={item.basePrice}
                  finalPrice={item.finalPrice}
                  discountValue={item.discountValue}
                  type={item.type}
                  style={styles.popularCard}
                />
              </View>
            ))}
            {loadingMore && (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingMoreText}>Carregando...</Text>
              </View>
            )}
          </View>
        </View>

                {/* Link to Component Showcase */}
                <View style={styles.content}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ComponentShowcase')}
                    style={styles.componentLink}
                  >
                    <Text style={styles.componentLinkText}>
                      Ver Componentes →
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          {/* Fixed Cart Bar - aparece quando header não está visível */}
          {!isHeaderVisible && totalItems > 0 && (
            <Animated.View 
              style={[
                styles.fixedCartBarContainer,
                {
                  opacity: cartBarOpacity,
                  transform: [{ translateY: cartBarTranslateY }],
                }
              ]}
            >
              <FixedCartBar
                totalItems={totalItems}
                totalPrice={totalPrice}
                onPress={() => navigation.navigate('Cart')}
              />
            </Animated.View>
          )}

          {/* Bottom Menu */}
          <BottomMenu items={menuItems} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2, // Espaço para o BottomMenu e FixedCartBar
    backgroundColor: colors.white, // Cor branca para o conteúdo
    overflow: 'visible', // Permite que os cards saiam das bordas
  },
  content: {
    paddingHorizontal: 20, // 20px conforme design
    paddingVertical: spacing.lg, // 24px
    gap: spacing.lg, // 24px
    overflow: 'visible', // Permite que os cards saiam das bordas
  },
  productsSection: {
    width: '100%',
    marginTop: spacing.lg, // Espaçamento superior igual ao gap do content
  },
  productsSectionHeader: {
    paddingLeft: 20, // Padding no lado esquerdo
    paddingRight: 20, // Padding no lado direito
  },
  sectionTitleStyle: {
    paddingRight: 0,
    marginRight: 0,
  },
  productsScrollView: {
    width: '100%',
  },
  productsScroll: {
    gap: spacing.sm + 2, // 10px
    paddingLeft: 20, // Padding apenas no primeiro card
    paddingRight: 20, // Padding no final do carrossel para que o último card não fique colado na tela
  },
  popularSection: {
    width: '100%',
    marginTop: spacing.lg,
    paddingHorizontal: 20,
  },
  popularSectionHeader: {
    marginBottom: spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  popularCardWrapper: {
    width: '48%', // 2 colunas com gap
  },
  popularCard: {
    width: '100%', // Fill do container - sobrescreve a largura fixa de 117px
    maxWidth: '100%', // Sobrescreve o maxWidth fixo de 117px
  },
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  loadingMoreText: {
    ...typography.sm,
    color: colors.mutedForeground,
  },
  componentLink: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
      componentLinkText: {
        ...typography.base,
        color: colors.primary,
        fontWeight: fontWeights.semibold,
      },
      fixedCartBarContainer: {
        position: 'absolute',
        bottom: 105, // Acima do BottomMenu (altura do menu + margem)
        left: 0, // Reduzir padding lateral para aumentar largura
        right: 0,
        zIndex: 10,
      },
      skeletonHeaderContainer: {
        width: '100%',
      },
      skeletonContent: {
        paddingHorizontal: 20,
        paddingVertical: spacing.lg,
        gap: spacing.lg,
      },
      skeletonCategoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
      },
      skeletonProductsSection: {
        width: '100%',
        marginTop: spacing.lg,
        paddingHorizontal: 20,
      },
      skeletonSectionTitle: {
        marginBottom: spacing.md,
      },
      skeletonProductsScroll: {
        flexDirection: 'row',
        gap: spacing.sm + 2,
        paddingLeft: 20,
        paddingRight: 20,
      },
      skeletonPopularSection: {
        width: '100%',
        marginTop: spacing.lg,
        paddingHorizontal: 20,
      },
      skeletonPopularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
      },
      skeletonPopularCard: {
        width: '48%',
        marginBottom: spacing.md,
      },
    });
