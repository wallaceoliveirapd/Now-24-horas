import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Dimensions, RefreshControl, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PageTitle,
  Chip,
  SectionTitle,
  ProductCard,
  SkeletonLoader,
  ModalBottomSheet,
  Badge,
  Skeleton,
  EmptyState,
  FixedCartBar
} from '../../../components/ui';
import { colors, spacing, borderRadius, typography, fontWeights } from '../../lib/styles';
import { ChevronLeft, Search as SearchIcon, Settings2 } from 'lucide-react-native';
import { useCart } from '../../contexts/CartContext';
import { calculateCouponDiscount } from '../../lib/couponUtils';
import { useSearchData, SearchFilters } from '../hooks/useSearchData';
import { Product } from '../../services/product.service';
import { Category } from '../../services/category.service';

// Importar imagens das categorias
const categoryImages = {
  todos: require('../images/category/todos.png'),
  bebida: require('../images/category/bebida.png'),
  vinho: require('../images/category/vinho.png'),
  carne: require('../images/category/carne.png'),
  lanche: require('../images/category/lanche.png'),
  mercearia: require('../images/category/mercearia.png'),
  limpeza: require('../images/category/limpeza.png'),
  frios: require('../images/category/frios.png'),
};

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: {
    categoryId?: string;
    focusInput?: boolean;
  };
  ProductDetails: {
    productId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>;

interface CategoryChip {
  id: string;
  label: string;
  iconSource?: any;
}

export function Search() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const { addItem, items: cartItems, totalItems, appliedCoupon } = useCart();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);
  const chipsScrollViewRef = useRef<ScrollView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showCartBar, setShowCartBar] = useState(false);
  const cartBarOpacity = useRef(new Animated.Value(0)).current;
  const cartBarTranslateY = useRef(new Animated.Value(20)).current;
  // Estados temporários no modal
  const [tempSortBy, setTempSortBy] = useState<string>('Relevância');
  const [tempPriceRange, setTempPriceRange] = useState<string>('Todos');
  // Estados aplicados (refletem na tela)
  const [appliedSortBy, setAppliedSortBy] = useState<string | null>(null);
  const [appliedPriceRange, setAppliedPriceRange] = useState<string | null>(null);
  // Estado para rastrear quando está mudando de categoria (para mostrar skeleton)
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  // Hook de busca
  const {
    products: backendProducts,
    categories: backendCategories,
    loading,
    error,
    refreshing,
    hasMore,
    totalResults,
    search: performSearch,
    loadMore,
    refresh,
  } = useSearchData();

  // Converter categorias do backend para formato de chips
  const categoryChips: CategoryChip[] = useMemo(() => {
    // Adicionar "Todos" como primeiro chip
    const todosChip: CategoryChip = {
      id: 'todos',
      label: 'Todos',
      iconSource: categoryImages.todos,
    };

    // Se não há categorias do backend, retornar apenas "Todos"
    if (backendCategories.length === 0) {
      if (__DEV__) {
        console.warn('⚠️ Search: Nenhuma categoria do backend, usando apenas "Todos"');
      }
      return [todosChip];
    }

    // Separar categorias principais e outras (já devem vir ordenadas do hook)
    // Mas vamos garantir a ordem: principais primeiro (já ordenadas por ordem), depois outras
    const principalCategories = backendCategories.filter(cat => cat.principal === true);
    const otherCategories = backendCategories.filter(cat => cat.principal !== true);

    // Converter categorias do backend (principais primeiro, depois outras)
    const allCategoriesToConvert = [...principalCategories, ...otherCategories];
    const convertedCategories = allCategoriesToConvert.map((category) => {
      // Mapear ícone da categoria
      const getCategoryImage = () => {
        if (category.icone) {
          return { uri: category.icone };
        }
        // Fallback para imagens locais baseado no slug
        const slugToImage: Record<string, any> = {
          bebidas: categoryImages.bebida,
          vinhos: categoryImages.vinho,
          carnes: categoryImages.carne,
          lanches: categoryImages.lanche,
          mercearia: categoryImages.mercearia,
          limpeza: categoryImages.limpeza,
          frios: categoryImages.frios,
        };
        return slugToImage[category.slug] || categoryImages.todos;
      };

      return {
        id: category.id,
        label: category.nome,
        iconSource: getCategoryImage(),
      };
    });

    return [todosChip, ...convertedCategories];
  }, [backendCategories]);

  // Converter produtos do backend para formato do ProductCard
  const convertProductToCard = useCallback((product: Product) => {
    // Garantir que os preços sejam números válidos
    // O backend retorna preços em centavos como number
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

  // Aplicar parâmetros da navegação
  useEffect(() => {
    const { categoryId, focusInput } = route.params || {};
    
    if (categoryId) {
      setSelectedCategory(categoryId);
      // A busca será feita automaticamente pelo useEffect que monitora selectedCategory
    }
    
    if (focusInput) {
      // Focar no input após um pequeno delay para garantir que a tela está renderizada
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [route.params]);

  // Estado para armazenar posições acumuladas dos chips
  const [chipPositions, setChipPositions] = useState<{ [key: string]: number }>({});

  // Scroll automático para o chip selecionado
  useEffect(() => {
    if (!chipsScrollViewRef.current || !selectedCategory) return;

    const position = chipPositions[selectedCategory];
    if (position !== undefined) {
      const screenWidth = Dimensions.get('window').width;
      const paddingLeft = spacing.md; // 16px
      // Centralizar o chip na tela
      const scrollPosition = position - (screenWidth / 2) + 50; // +50 para compensação visual
      
      setTimeout(() => {
        chipsScrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 100);
    } else {
      // Fallback: usar estimativa se posição não estiver disponível
      const categoryIndex = categoryChips.findIndex(cat => cat.id === selectedCategory);
      if (categoryIndex === -1) return;

      setTimeout(() => {
        const estimatedChipWidth = 90;
        const gap = 12; // spacing.md - 4
        const paddingLeft = spacing.md; // 16px
        const screenWidth = Dimensions.get('window').width;
        const scrollPosition = paddingLeft + (categoryIndex * (estimatedChipWidth + gap)) - (screenWidth / 2) + (estimatedChipWidth / 2);
        
        chipsScrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 150);
    }
  }, [selectedCategory, chipPositions, categoryChips]);

  // Mapear ordenação do UI para API
  const mapSortByToAPI = useCallback((sortBy: string): SearchFilters['ordenarPor'] | undefined => {
    switch (sortBy) {
      case 'Menor preço':
        return 'preco_asc';
      case 'Maior preço':
        return 'preco_desc';
      case 'Avaliação':
        return 'popularidade';
      case 'Relevância':
      default:
        return undefined;
    }
  }, []);

  // Mapear faixa de preço do UI para API (em centavos)
  const mapPriceRangeToAPI = useCallback((priceRange: string): { precoMin?: number; precoMax?: number } => {
    switch (priceRange) {
      case 'Até R$ 10':
        return { precoMax: 1000 }; // R$ 10,00 em centavos
      case 'R$ 10-25':
        return { precoMin: 1000, precoMax: 2500 }; // R$ 10,00 a R$ 25,00
      case 'R$ 25-50':
        return { precoMin: 2500, precoMax: 5000 }; // R$ 25,00 a R$ 50,00
      case 'Acima de R$ 50':
        return { precoMin: 5000 }; // Acima de R$ 50,00
      case 'Todos':
      default:
        return {};
    }
  }, []);

  // Ref para controlar se já foi feita a busca inicial
  const isInitialMount = useRef(true);
  // Ref para debounce do useEffect
  const filterDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buscar produtos quando query, categoria ou filtros mudarem
  useEffect(() => {
    // Ignorar a primeira renderização (hook já busca inicialmente)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Limpar timer anterior para evitar múltiplas requisições
    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }

    // Debounce de 600ms para mudanças de filtros (reduz rate limit)
    filterDebounceTimerRef.current = setTimeout(() => {
      const filters: SearchFilters = {
        categoriaId: selectedCategory !== 'todos' ? selectedCategory : undefined,
        ordenarPor: appliedSortBy ? mapSortByToAPI(appliedSortBy) : undefined,
        ...mapPriceRangeToAPI(appliedPriceRange || 'Todos'),
      };

      performSearch(searchQuery, filters);
    }, 600);

    // Cleanup
    return () => {
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }
    };
  }, [selectedCategory, searchQuery, appliedSortBy, appliedPriceRange, performSearch, mapSortByToAPI, mapPriceRangeToAPI]);

  // Handler para mudança de texto na busca
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    // A busca será feita automaticamente pelo useEffect acima com debounce do hook
  }, []);

  // Handler para mudança de categoria
  const handleCategoryPress = useCallback((categoryId: string) => {
    if (categoryId !== selectedCategory) {
      setIsChangingCategory(true);
    }
    setSelectedCategory(categoryId);
    // A busca será feita automaticamente pelo useEffect acima
  }, [selectedCategory]);

  // Handler para scroll infinito
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (hasMore && !loading && !refreshing) {
        loadMore();
      }
    }
  }, [hasMore, loading, refreshing, loadMore]);

  // Sincronizar valores temporários com os aplicados ao abrir o modal
  useEffect(() => {
    if (filterModalVisible) {
      setTempSortBy(appliedSortBy || 'Relevância');
      setTempPriceRange(appliedPriceRange || 'Todos');
    }
  }, [filterModalVisible, appliedSortBy, appliedPriceRange]);

  // Resetar isChangingCategory quando loading terminar
  useEffect(() => {
    if (!loading && isChangingCategory) {
      setIsChangingCategory(false);
    }
  }, [loading, isChangingCategory]);

  // Handler para adicionar ao carrinho
  const handleAddToCart = useCallback((product: Product) => {
    const hasDiscount = product.precoPromocional && product.precoPromocional < product.preco;
    addItem({
      id: product.id, // ID temporário (será substituído pelo ID do item do carrinho quando vier do backend)
      produtoId: product.id, // ID do produto original (usado para encontrar itens no carrinho)
      title: product.nome,
      showDriver: product.maisPopular || false,
      driverLabel: product.maisPopular ? 'Popular' : '',
      basePrice: hasDiscount ? product.preco : 0,
      finalPrice: product.precoPromocional || product.preco,
      discountValue: hasDiscount ? product.preco - (product.precoPromocional || product.preco) : 0,
      type: product.emOferta ? 'Offer' : 'Default',
    });
  }, [addItem]);

  // Calcular total do carrinho (memoizado)
  const totalPrice = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = appliedCoupon 
      ? calculateCouponDiscount(appliedCoupon, subtotal, deliveryFee)
      : 0;
    return subtotal + deliveryFee - discount;
  }, [cartItems, appliedCoupon]);

  // Mostrar barra do carrinho quando um item é adicionado
  useEffect(() => {
    if (totalItems > 0) {
      // Se há itens no carrinho, mostrar a barra
      setShowCartBar(true);
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
    } else {
      // Se não há itens, esconder a barra
      setShowCartBar(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems]);

  // Handler para navegar para o carrinho
  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor={colors.white}
      />
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        {/* Header with Search */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.black} strokeWidth={2} />
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <SearchIcon size={20} color={colors.mutedForeground} strokeWidth={2} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Buscar itens"
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                autoFocus={false}
                multiline={false}
              />
            </View>

            {/* Filter Button */}
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.7}
              onPress={() => setFilterModalVisible(true)}
            >
              <Settings2 size={24} color={colors.black} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <ScrollView
            ref={chipsScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
            style={styles.chipsScroll}
            decelerationRate="normal"
            scrollEventThrottle={16}
          >
            {categoryChips.map((category) => (
              <View
                key={category.id}
                onLayout={(event) => {
                  const { x } = event.nativeEvent.layout;
                  const paddingLeft = spacing.md; // 16px
                  // Calcular posição acumulada: padding + (posições anteriores) + x atual
                  const accumulatedPosition = paddingLeft + x;
                  setChipPositions(prev => ({
                    ...prev,
                    [category.id]: accumulatedPosition,
                  }));
                }}
                collapsable={false}
              >
                <Chip
                  label={category.label}
                  state={selectedCategory === category.id ? 'Selected' : 'Default'}
                  type={category.iconSource ? 'With Image' : 'Default'}
                  iconSource={category.iconSource}
                  showClose={false}
                  onPress={() => handleCategoryPress(category.id)}
                  style={styles.chip}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        {(loading && backendProducts.length === 0) || isChangingCategory ? (
          <View style={styles.skeletonContainer}>
            {/* Skeleton Header */}
            <View style={styles.skeletonHeader}>
              <Skeleton width={24} height={24} borderRadius={4} />
              <Skeleton width="100%" height={40} borderRadius={8} style={{ flex: 1, marginHorizontal: spacing.md }} />
              <Skeleton width={41} height={41} borderRadius={8} />
            </View>
            
            {/* Skeleton Chips */}
            <View style={styles.skeletonChips}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={80} height={34} borderRadius={999} />
              ))}
            </View>
            
            {/* Skeleton Section Title */}
            <View style={styles.skeletonSectionTitle}>
              <Skeleton width={150} height={18} borderRadius={4} />
            </View>
            
            {/* Skeleton Products Grid */}
            <View style={styles.skeletonProductsGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.skeletonProductCard}>
                  {/* Imagem quadrada (aspectRatio 1:1) */}
                  <Skeleton width={117} height={117} borderRadius={8} />
                  
                  {/* Container de informações do produto */}
                  <View style={styles.skeletonProductInfo}>
                    {/* Título (2 linhas) */}
                    <Skeleton width="100%" height={16.8} borderRadius={4} />
                    <Skeleton width="85%" height={16.8} borderRadius={4} style={{ marginTop: 6 }} />
                    
                    {/* Descrição (1 linha) */}
                    <Skeleton width="70%" height={14.4} borderRadius={4} style={{ marginTop: 6 }} />
                    
                    {/* Preço */}
                    <Skeleton width="50%" height={19.2} borderRadius={4} style={{ marginTop: 12 }} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : error && backendProducts.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error.message || 'Erro ao carregar produtos. Toque para tentar novamente.'}
            </Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* Results Count */}
            <SectionTitle
              title={`${totalResults} ${totalResults === 1 ? 'item encontrado' : 'itens encontrados'}`}
              showIcon={false}
              showTimer={false}
              showLink={false}
              showDescription={false}
              style={styles.sectionTitle}
            />

            {/* Applied Filters Section */}
            {(appliedSortBy !== null || appliedPriceRange !== null) && (
              <View style={styles.appliedFiltersContainer}>
                <Text style={styles.appliedFiltersLabel}>Filtros aplicados:</Text>
                {appliedSortBy !== null && appliedSortBy !== 'Relevância' && (
                  <Badge
                    label={appliedSortBy}
                    type="Default"
                    style={styles.appliedFilterBadge}
                  />
                )}
                {appliedPriceRange !== null && appliedPriceRange !== 'Todos' && (
                  <Badge
                    label={appliedPriceRange}
                    type="Default"
                    style={styles.appliedFilterBadge}
                  />
                )}
                <Badge
                  label="Limpar filtros"
                  type="Primary"
                  style={styles.clearFiltersBadge}
                  onPress={() => {
                    setAppliedSortBy(null);
                    setAppliedPriceRange(null);
                    setTempSortBy('Relevância');
                    setTempPriceRange('Todos');
                  }}
                />
              </View>
            )}

            {/* Products Grid or Empty State */}
            {!isChangingCategory ? (
              backendProducts.length === 0 ? (
                <EmptyState
                  type="search"
                  title="Nenhum produto encontrado"
                  description="Tente buscar com outras palavras-chave ou ajuste os filtros"
                />
              ) : (
                <>
                  <View style={styles.productsGrid}>
                    {backendProducts.map((product) => {
                      const cardData = convertProductToCard(product);
                      return (
                        <View key={product.id} style={styles.productCardWrapper}>
                          <ProductCard
                            {...cardData}
                            onAddToCart={() => handleAddToCart(product)}
                            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                            style={styles.productCard}
                          />
                        </View>
                      );
                    })}
                  </View>
                  {loading && backendProducts.length > 0 && (
                    <View style={styles.loadingMore}>
                      <Text style={styles.loadingMoreText}>Carregando mais produtos...</Text>
                    </View>
                  )}
                  {!hasMore && backendProducts.length > 0 && (
                    <View style={styles.loadingMore}>
                      <Text style={styles.loadingMoreText}>Todos os produtos foram carregados</Text>
                    </View>
                  )}
                </>
              )
            ) : null}
          </ScrollView>
        )}

        {/* Filter Modal */}
        <ModalBottomSheet
          visible={filterModalVisible}
          onClose={() => {
            // Resetar valores temporários ao fechar sem salvar
            setTempSortBy(appliedSortBy || 'Relevância');
            setTempPriceRange(appliedPriceRange || 'Todos');
            setFilterModalVisible(false);
          }}
          title="Filtros"
          primaryButtonLabel="Salvar filtros"
          primaryButtonOnPress={() => {
            // Aplicar filtros
            setAppliedSortBy(tempSortBy);
            setAppliedPriceRange(tempPriceRange);
            setFilterModalVisible(false);
            // A busca será feita automaticamente pelo useEffect que monitora appliedSortBy e appliedPriceRange
          }}
          showSecondaryButton={false}
        >
          {/* Sort By Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Ordenar por</Text>
            <View style={styles.filterChipsContainer}>
              <Chip
                label="Relevância"
                state={tempSortBy === 'Relevância' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempSortBy('Relevância')}
                style={styles.filterChip}
              />
              <Chip
                label="Menor preço"
                state={tempSortBy === 'Menor preço' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempSortBy('Menor preço')}
                style={styles.filterChip}
              />
              <Chip
                label="Maior preço"
                state={tempSortBy === 'Maior preço' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempSortBy('Maior preço')}
                style={styles.filterChip}
              />
              <Chip
                label="Avaliação"
                state={tempSortBy === 'Avaliação' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempSortBy('Avaliação')}
                style={styles.filterChip}
              />
            </View>
          </View>

          {/* Price Range Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Faixa de preço</Text>
            <View style={styles.filterChipsContainer}>
              <Chip
                label="Todos"
                state={tempPriceRange === 'Todos' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempPriceRange('Todos')}
                style={styles.filterChip}
              />
              <Chip
                label="Até R$ 10"
                state={tempPriceRange === 'Até R$ 10' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempPriceRange('Até R$ 10')}
                style={styles.filterChip}
              />
              <Chip
                label="R$ 10-25"
                state={tempPriceRange === 'R$ 10-25' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempPriceRange('R$ 10-25')}
                style={styles.filterChip}
              />
              <Chip
                label="R$ 25-50"
                state={tempPriceRange === 'R$ 25-50' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempPriceRange('R$ 25-50')}
                style={styles.filterChip}
              />
              <Chip
                label="Acima de R$ 50"
                state={tempPriceRange === 'Acima de R$ 50' ? 'Selected' : 'Default'}
                showClose={false}
                onPress={() => setTempPriceRange('Acima de R$ 50')}
                style={styles.filterChip}
              />
            </View>
          </View>
        </ModalBottomSheet>

        {/* Fixed Cart Bar */}
        {showCartBar && (
          <Animated.View
            style={[
              styles.cartBarContainer,
              {
                opacity: cartBarOpacity,
                transform: [{ translateY: cartBarTranslateY }],
              }
            ]}
          >
            <FixedCartBar
              totalItems={totalItems}
              totalPrice={totalPrice}
              onPress={handleCartPress}
            />
          </Animated.View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,

    paddingHorizontal: spacing.md, // 16px
    paddingTop: spacing.md, // 16px
    paddingBottom: spacing.md, // 16px
    gap: spacing.md, // 16px
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 16px
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // 10px
    backgroundColor: colors.gray[500], // muted
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base.fontSize,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.black,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: typography.base.lineHeight,
    height: '100%',
  },
  filterButton: {
    width: 41,
    height: 41,
    backgroundColor: colors.gray[500], // muted
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    gap: spacing.md - 4, // 12px
    paddingLeft: spacing.md, // 16px padding no início
    paddingRight: spacing.md,
  },
  chipsScroll: {
    marginHorizontal: -spacing.md, // Compensar padding do header
  },
  chip: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md, // 16px
    paddingTop: 0,
    paddingBottom: 120, // Espaço para o FixedCartBar (altura aproximada: 60px + margem: 40px)
  },
  sectionTitle: {
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: 0,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 12, // Gap vertical de 12px entre linhas
  },
  productCardWrapper: {
    width: '48%', // 2 colunas com gap
    alignSelf: 'flex-start', // Permite que cards de alturas diferentes se alinhem no topo
  },
  productCard: {
    width: '100%',
    maxWidth: '100%',
  },
  filterSection: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
  },
  filterSectionTitle: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2, // 10px
  },
  filterChip: {
    margin: 0,
  },
  appliedFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 6px conforme Figma
    paddingBottom: spacing.sm + 4, // 12px conforme Figma
    paddingTop: 0,
    paddingHorizontal: 0,
    flexWrap: 'wrap',
    width: '100%',
  },
  appliedFiltersLabel: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 14,
  },
  appliedFilterBadge: {
    margin: 0,
  },
  clearFiltersBadge: {
    margin: 0,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: spacing.md, // 16px - Mesmo padding do scrollContent
    paddingTop: 0,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skeletonChips: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  skeletonSectionTitle: {
    marginBottom: spacing.md,
    paddingHorizontal: 0, // Mesmo padding do sectionTitle real
  },
  skeletonProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 12, // Mesmo gap vertical do productsGrid real
    paddingHorizontal: 0, // O padding já vem do skeletonContainer
  },
  skeletonProductCard: {
    width: '48%', // Mesma largura do productCardWrapper
    flexDirection: 'column',
    gap: 12, // Mesmo gap do ProductCard container
    alignSelf: 'flex-start',
  },
  skeletonProductInfo: {
    width: '100%',
    flexDirection: 'column',
    gap: 6, // Mesmo gap do nameContainer
  },
  errorContainer: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    ...typography.base,
    color: colors.red?.[600] || '#DC2626',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.base,
    color: colors.white,
    fontWeight: fontWeights.semibold,
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
  cartBarContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 0,
  },
});

