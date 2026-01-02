import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useMemo } from 'react';
import {
  PageTitle,
  Chip,
  SectionTitle,
  ProductCard,
  SkeletonLoader,
  ModalBottomSheet,
  Badge,
  Skeleton
} from '../../../components/ui';
import { colors, spacing, borderRadius, typography, fontWeights } from '../../lib/styles';
import { ChevronLeft, Search as SearchIcon, Settings2 } from 'lucide-react-native';
import { useCart } from '../../contexts/CartContext';

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
  Search: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Category {
  id: string;
  label: string;
  iconSource?: any;
}

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  showDriver: boolean;
  driverLabel?: string;
  basePrice?: string;
  finalPrice: string;
  discountValue?: string;
  type: 'Offer' | 'Default';
}

export function Search() {
  const navigation = useNavigation<NavigationProp>();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // Estados temporários no modal
  const [tempSortBy, setTempSortBy] = useState<string>('Relevância');
  const [tempPriceRange, setTempPriceRange] = useState<string>('Todos');
  // Estados aplicados (refletem na tela)
  const [appliedSortBy, setAppliedSortBy] = useState<string | null>(null);
  const [appliedPriceRange, setAppliedPriceRange] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'todos', label: 'Todos', iconSource: categoryImages.todos },
    { id: 'bebidas', label: 'Bebidas', iconSource: categoryImages.bebida },
    { id: 'vinhos', label: 'Vinhos', iconSource: categoryImages.vinho },
    { id: 'carnes', label: 'Carnes', iconSource: categoryImages.carne },
    { id: 'lanches', label: 'Lanches', iconSource: categoryImages.lanche },
    { id: 'mercearia', label: 'Mercearia', iconSource: categoryImages.mercearia },
    { id: 'limpeza', label: 'Limpeza', iconSource: categoryImages.limpeza },
    { id: 'frios', label: 'Frios', iconSource: categoryImages.frios },
  ];

  // Produtos de exemplo por categoria
  const allProducts = [
    // Bebidas
    {
      id: '1',
      title: 'Coca-Cola 2L',
      description: 'Refrigerante de cola',
      category: 'bebidas',
      showDriver: true,
      driverLabel: 'Promo',
      basePrice: 'R$10,00',
      finalPrice: 'R$8,99',
      discountValue: 'R$1,01',
      type: 'Offer' as const,
    },
    {
      id: '2',
      title: 'Água Mineral sem Gás',
      description: 'Garrafa 1.5L',
      category: 'bebidas',
      showDriver: false,
      finalPrice: 'R$3,00',
      type: 'Default' as const,
    },
    {
      id: '3',
      title: 'Cerveja Heineken Long Neck',
      description: 'Pack com 6 unidades',
      category: 'bebidas',
      showDriver: true,
      driverLabel: 'Oferta',
      basePrice: 'R$30,00',
      finalPrice: 'R$27,00',
      discountValue: 'R$3,00',
      type: 'Offer' as const,
    },
    // Vinhos
    {
      id: '4',
      title: 'Vinho Tinto Suave',
      description: 'Garrafa 750ml',
      category: 'vinhos',
      showDriver: false,
      finalPrice: 'R$25,00',
      type: 'Default' as const,
    },
    {
      id: '5',
      title: 'Vinho Branco Seco',
      description: 'Garrafa 750ml',
      category: 'vinhos',
      showDriver: true,
      driverLabel: 'Novo',
      basePrice: 'R$35,00',
      finalPrice: 'R$29,90',
      discountValue: 'R$5,10',
      type: 'Offer' as const,
    },
    {
      id: '6',
      title: 'Espumante Brut',
      description: 'Garrafa 750ml',
      category: 'vinhos',
      showDriver: false,
      finalPrice: 'R$45,00',
      type: 'Default' as const,
    },
    // Carnes
    {
      id: '7',
      title: 'Picanha Fatiada',
      description: '500g, fresca',
      category: 'carnes',
      showDriver: true,
      driverLabel: 'Novo',
      basePrice: 'R$45,00',
      finalPrice: 'R$39,90',
      discountValue: 'R$5,10',
      type: 'Offer' as const,
    },
    {
      id: '8',
      title: 'Alcatra Premium',
      description: '1kg, embalado a vácuo',
      category: 'carnes',
      showDriver: false,
      finalPrice: 'R$52,00',
      type: 'Default' as const,
    },
    {
      id: '9',
      title: 'Frango Inteiro',
      description: '1.5kg, congelado',
      category: 'carnes',
      showDriver: true,
      driverLabel: 'Promo',
      basePrice: 'R$18,00',
      finalPrice: 'R$15,99',
      discountValue: 'R$2,01',
      type: 'Offer' as const,
    },
    // Lanches
    {
      id: '10',
      title: 'Salgadinho Elma Chips',
      description: 'Pacote 100g',
      category: 'lanches',
      showDriver: false,
      finalPrice: 'R$5,50',
      type: 'Default' as const,
    },
    {
      id: '11',
      title: 'Biscoito Recheado',
      description: 'Pacote 200g',
      category: 'lanches',
      showDriver: true,
      driverLabel: 'Desconto',
      basePrice: 'R$7,00',
      finalPrice: 'R$5,99',
      discountValue: 'R$1,01',
      type: 'Offer' as const,
    },
    {
      id: '12',
      title: 'Amendoim Torrado',
      description: 'Pacote 300g',
      category: 'lanches',
      showDriver: false,
      finalPrice: 'R$8,50',
      type: 'Default' as const,
    },
    // Mercearia
    {
      id: '13',
      title: 'Chocolate Lacta Ao Leite',
      description: 'Barra 90g',
      category: 'mercearia',
      showDriver: true,
      driverLabel: 'Desconto',
      basePrice: 'R$7,00',
      finalPrice: 'R$5,99',
      discountValue: 'R$1,01',
      type: 'Offer' as const,
    },
    {
      id: '14',
      title: 'Açúcar Cristal',
      description: 'Pacote 1kg',
      category: 'mercearia',
      showDriver: false,
      finalPrice: 'R$4,50',
      type: 'Default' as const,
    },
    {
      id: '15',
      title: 'Óleo de Soja',
      description: 'Garrafa 900ml',
      category: 'mercearia',
      showDriver: false,
      finalPrice: 'R$6,99',
      type: 'Default' as const,
    },
    // Limpeza
    {
      id: '16',
      title: 'Detergente Líquido',
      description: 'Garrafa 500ml',
      category: 'limpeza',
      showDriver: false,
      finalPrice: 'R$3,99',
      type: 'Default' as const,
    },
    {
      id: '17',
      title: 'Sabão em Pó',
      description: 'Pacote 1kg',
      category: 'limpeza',
      showDriver: true,
      driverLabel: 'Oferta',
      basePrice: 'R$12,00',
      finalPrice: 'R$9,99',
      discountValue: 'R$2,01',
      type: 'Offer' as const,
    },
    {
      id: '18',
      title: 'Água Sanitária',
      description: 'Garrafa 1L',
      category: 'limpeza',
      showDriver: false,
      finalPrice: 'R$4,50',
      type: 'Default' as const,
    },
    // Frios
    {
      id: '19',
      title: 'Queijo Minas Frescal',
      description: 'Peça 500g',
      category: 'frios',
      showDriver: false,
      finalPrice: 'R$18,00',
      type: 'Default' as const,
    },
    {
      id: '20',
      title: 'Presunto Fatiado',
      description: 'Pacote 200g',
      category: 'frios',
      showDriver: true,
      driverLabel: 'Promo',
      basePrice: 'R$12,00',
      finalPrice: 'R$9,99',
      discountValue: 'R$2,01',
      type: 'Offer' as const,
    },
    {
      id: '21',
      title: 'Mussarela Fatiada',
      description: 'Pacote 200g',
      category: 'frios',
      showDriver: false,
      finalPrice: 'R$11,50',
      type: 'Default' as const,
    },
  ];

  // Filtrar e ordenar produtos
  const products = useMemo(() => {
    let filtered = selectedCategory === 'todos' 
      ? allProducts 
      : allProducts.filter(product => product.category === selectedCategory);

    // Filtrar por faixa de preço
    if (appliedPriceRange && appliedPriceRange !== 'Todos') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.finalPrice.replace('R$', '').replace(',', '.'));
        switch (appliedPriceRange) {
          case 'Até R$ 10':
            return price <= 10;
          case 'R$ 10-25':
            return price > 10 && price <= 25;
          case 'R$ 25-50':
            return price > 25 && price <= 50;
          case 'Acima de R$ 50':
            return price > 50;
          default:
            return true;
        }
      });
    }

    // Ordenar produtos
    if (appliedSortBy && appliedSortBy !== 'Relevância') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseFloat(a.finalPrice.replace('R$', '').replace(',', '.'));
        const priceB = parseFloat(b.finalPrice.replace('R$', '').replace(',', '.'));
        
        switch (appliedSortBy) {
          case 'Menor preço':
            return priceA - priceB;
          case 'Maior preço':
            return priceB - priceA;
          case 'Avaliação':
            // Por enquanto, manter ordem original (futuramente pode adicionar campo de avaliação)
            return 0;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [selectedCategory, appliedSortBy, appliedPriceRange, allProducts]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Sincronizar valores temporários com os aplicados ao abrir o modal
  useEffect(() => {
    if (filterModalVisible) {
      setTempSortBy(appliedSortBy || 'Relevância');
      setTempPriceRange(appliedPriceRange || 'Todos');
    }
  }, [filterModalVisible, appliedSortBy, appliedPriceRange]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      showDriver: product.showDriver,
      driverLabel: product.driverLabel || '',
      basePrice: parseFloat(product.basePrice?.replace('R$', '').replace(',', '.') || '0') * 100,
      finalPrice: parseFloat(product.finalPrice?.replace('R$', '').replace(',', '.') || '0') * 100,
      discountValue: parseFloat(product.discountValue?.replace('R$', '').replace(',', '.') || '0') * 100,
      type: product.type,
    });
  };

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
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                style={styles.searchInput}
                placeholder="Buscar itens"
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
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
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
            style={styles.chipsScroll}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.label}
                state={selectedCategory === category.id ? 'Selected' : 'Default'}
                type={category.iconSource ? 'With Image' : 'Default'}
                iconSource={category.iconSource}
                showClose={false}
                onPress={() => handleCategoryPress(category.id)}
                style={styles.chip}
              />
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        {loading ? (
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
                  <Skeleton width="100%" height={117} borderRadius={8} />
                  <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                  <Skeleton width="70%" height={12} borderRadius={4} style={{ marginTop: spacing.xs }} />
                  <Skeleton width="60%" height={16} borderRadius={4} style={{ marginTop: spacing.sm }} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Results Count */}
            <SectionTitle
              title={`${products.length} itens encontrados`}
              showIcon={false}
              showTimer={false}
              showLink={false}
              showDescription={false}
              style={styles.sectionTitle}
            />

            {/* Applied Filters Section */}
            {(appliedSortBy !== null || appliedPriceRange !== null) && (
              <View style={styles.appliedFiltersContainer}>
                <Text style={styles.appliedFiltersLabel}>Ordenando por</Text>
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

            {/* Products Grid */}
            <View style={styles.productsGrid}>
              {products.map((product) => (
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
                    onAddToCart={() => handleAddToCart(product)}
                    style={styles.productCard}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        </KeyboardAvoidingView>

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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: spacing.lg, // 20px
    paddingTop: spacing.lg, // 24px
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
    paddingVertical: 10,
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
    minHeight: 24,
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
    paddingLeft: spacing.lg, // 20px padding no início
    paddingRight: spacing.lg,
  },
  chipsScroll: {
    marginHorizontal: -spacing.lg, // Compensar padding do header
  },
  chip: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg, // 20px
    paddingTop: 0,
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
    padding: spacing.lg,
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
    paddingHorizontal: spacing.lg,
  },
  skeletonSectionTitle: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skeletonProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skeletonProductCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

