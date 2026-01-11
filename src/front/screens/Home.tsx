import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Animated, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  HomeHeader, 
  CategoryList,
  CategoryItem, 
  SectionTitle, 
  ProductCard,
  BottomMenu,
  BottomMenuItemData,
  PromotionalBanner,
  FixedCartBar,
  Skeleton,
  ModalBottomSheet,
  Chip,
  Toast,
  Input,
  Filter,
  Story
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { Home as HomeIcon, Search, Receipt, User, MapPin, Home as HomeIconLucide, Building2, CircleCheck, Plus, Pencil, Trash2, Flame, ChevronRight } from 'lucide-react-native';
import { useCart } from '../../contexts/CartContext';
import { calculateCouponDiscount } from '../../lib/couponUtils';
import { useAddress } from '../../contexts/AddressContext';
import { addressService } from '../../services/address.service';
import { useAuth } from '../../contexts/AuthContext';
import { useHomeData } from '../hooks/useHomeData';
import { Category } from '../../services/category.service';
import { Product } from '../../services/product.service';
import { getImageSource } from '../../data/mockProducts';

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

// Mock stories data - TODO: substituir por dados do backend
const initialMockStories: StoryItem[] = [
  {
    id: '1',
    imageSource: require('../images/banners-home/default.png'),
    title: 'Nova promoção',
    hasStory: true,
  },
  {
    id: '2',
    imageSource: require('../images/banners-home/default.png'),
    title: 'Produtos frescos',
    hasStory: true,
  },
  {
    id: '3',
    imageSource: require('../images/banners-home/default.png'),
    title: 'Delivery rápido',
    hasStory: true,
  },
  {
    id: '4',
    imageSource: require('../images/banners-home/default.png'),
    title: 'Ofertas do dia',
    hasStory: false,
  },
  {
    id: '5',
    imageSource: require('../images/banners-home/default.png'),
    title: 'Novidades',
    hasStory: true,
  },
];

import type { RootStackParamList as AppRootStackParamList } from '../navigation/AppNavigator';
import type { StoryItem } from './StoriesViewer';

type NavigationProp = NativeStackNavigationProp<AppRootStackParamList>;

export function Home() {
  const [stories, setStories] = useState<StoryItem[]>(initialMockStories);
  const navigation = useNavigation<NavigationProp>();
  const { user, resendOtp } = useAuth();
  const { items: cartItems, totalItems, appliedCoupon } = useCart();
  const { addresses, selectedAddressId, setSelectedAddressId, selectedAddress, addAddress, updateAddress, deleteAddress } = useAddress();
  const {
    categories,
    offersProducts,
    popularProducts: backendPopularProducts,
    loading: dataLoading,
    error: dataError,
    refreshing: dataRefreshing,
    refresh: refreshData,
    loadMorePopular,
    hasMorePopular,
  } = useHomeData();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showCartBar, setShowCartBar] = useState(false);
  const [addressesModalVisible, setAddressesModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressType, setAddressType] = useState<'Casa' | 'Trabalho' | 'Outro'>('Casa');
  const [addressForm, setAddressForm] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const cartBarOpacity = useRef(new Animated.Value(0)).current;
  const cartBarTranslateY = useRef(new Animated.Value(20)).current;
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerRef = useRef<View>(null);
  
  // Estados para filtros
  const [sortFilter, setSortFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [offerFilter, setOfferFilter] = useState<boolean>(false);
  const [newFilter, setNewFilter] = useState<boolean>(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [newModalVisible, setNewModalVisible] = useState(false);

  // Funções de navegação memoizadas
  const handleCategoryPress = useCallback((categoryId: string) => {
    navigation.navigate('Search', { categoryId, focusInput: false });
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search', { focusInput: true });
  }, [navigation]);

  const handleProductPress = useCallback((productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleAddressPress = useCallback(() => {
    setAddressesModalVisible(true);
  }, []);

  const handleAddAddress = useCallback(() => {
    // Fechar modal de endereços primeiro
    setAddressesModalVisible(false);
    // Pequeno delay para garantir que o modal anterior feche antes de abrir o novo
    setTimeout(() => {
      setAddAddressModalVisible(true);
    }, 300);
  }, []);

  const handleCloseAddAddressModal = useCallback(() => {
    setAddAddressModalVisible(false);
    setEditingAddressId(null);
    setAddressForm({
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    });
    setAddressType('Casa');
  }, []);

  const handleEditAddress = useCallback((addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return;

    // Separar rua e número
    const [street, ...numberParts] = address.street.split(', ');
    const number = numberParts.join(', ') || '';

    setEditingAddressId(addressId);
    setAddressType(address.type);
    setAddressForm({
      cep: address.zipCode,
      street: street,
      number: number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    });
    setAddressesModalVisible(false);
    setTimeout(() => {
      setEditAddressModalVisible(true);
    }, 300);
  }, [addresses]);

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    try {
      await deleteAddress(addressId);
      setToastMessage('Endereço deletado com sucesso!');
      setToastType('success');
      setToastVisible(true);
    } catch (error: any) {
      console.error('Erro ao deletar endereço:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar endereço. Tente novamente.';
      setToastMessage(errorMessage);
      setToastType('error');
      setToastVisible(true);
    }
  }, [deleteAddress]);

  const handleSaveAddress = useCallback(async () => {
    // Validar campos obrigatórios
    if (!addressForm.cep || !addressForm.street || !addressForm.number || !addressForm.neighborhood || !addressForm.city || !addressForm.state) {
      setToastMessage('Preencha todos os campos obrigatórios');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    // Validar CEP (deve ter 8 dígitos)
    const cepLimpo = addressForm.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setToastMessage('CEP deve ter 8 dígitos');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    // Validar estado (deve ter 2 caracteres)
    const stateUpper = addressForm.state.trim().toUpperCase();
    if (stateUpper.length !== 2) {
      setToastMessage('Estado deve ter 2 caracteres (ex: SP, RJ)');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setSavingAddress(true);

    try {
      // Preparar dados: juntar rua e número no formato esperado pelo contexto
      const streetComplete = addressForm.number 
        ? `${addressForm.street.trim()}, ${addressForm.number.trim()}`
        : addressForm.street.trim();

      // Verificar se está editando ou criando
      if (editingAddressId) {
        // Atualizar endereço existente
        await updateAddress(editingAddressId, {
          type: addressType,
          street: streetComplete,
          complement: addressForm.complement || '',
          neighborhood: addressForm.neighborhood.trim(),
          city: addressForm.city.trim(),
          state: stateUpper,
          zipCode: cepLimpo,
        });

        setToastMessage('Endereço atualizado com sucesso!');
        setEditAddressModalVisible(false);
        setEditingAddressId(null);
      } else {
        // Criar novo endereço
        await addAddress({
          type: addressType,
          street: streetComplete,
          complement: addressForm.complement || '',
          neighborhood: addressForm.neighborhood.trim(),
          city: addressForm.city.trim(),
          state: stateUpper,
          zipCode: cepLimpo,
        });

        setToastMessage('Endereço adicionado com sucesso!');
        setAddAddressModalVisible(false);
      }

      setToastType('success');
      setToastVisible(true);

      // Limpar formulário
      handleCloseAddAddressModal();
      
      // Reabrir modal de endereços para mostrar o endereço atualizado/adicionado
      setTimeout(() => {
        setAddressesModalVisible(true);
      }, 500);
    } catch (error: any) {
      console.error('Erro ao adicionar endereço:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao adicionar endereço. Tente novamente.';
      setToastMessage(errorMessage);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setSavingAddress(false);
    }
  }, [addressForm, addressType, addAddress, handleCloseAddAddressModal]);

  const handleViewAllOffers = useCallback(() => {
    navigation.navigate('ProductList', {
      title: 'Ofertas do dia',
      filterType: 'offer',
    });
  }, [navigation]);

  const handleViewAllProducts = useCallback(() => {
    navigation.navigate('ProductList', {
      title: 'Todos os produtos',
      filterType: 'popular',
    });
  }, [navigation]);

  const handleStoryPress = useCallback((story: StoryItem) => {
    const storyIndex = stories.findIndex((s) => s.id === story.id);
    
    // Mark story as viewed (hasStory: false)
    setStories((prevStories) =>
      prevStories.map((s) =>
        s.id === story.id ? { ...s, hasStory: false } : s
      )
    );

    navigation.navigate('StoriesViewer', {
      stories: stories,
      initialIndex: storyIndex >= 0 ? storyIndex : 0,
    });
  }, [navigation, stories]);

  // Extrair primeiro nome do usuário
  const firstName = useMemo(() => {
    if (!user || !user.nomeCompleto) {
      return '';
    }
    const parts = user.nomeCompleto.split(' ');
    return parts[0] || '';
  }, [user]);

  // Formatar endereço para exibição (apenas rua)
  const addressDisplay = useMemo(() => {
    if (!selectedAddress) return 'Selecione um endereço';
    return selectedAddress.street || 'Endereço não informado';
  }, [selectedAddress]);

  // Verificar se usuário precisa verificar telefone e mostrar modal
  useEffect(() => {
    if (user && !user.telefoneVerificado) {
      // Pequeno delay para garantir que a tela carregou completamente
      const timer = setTimeout(() => {
        setVerificationModalVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (user && user.telefoneVerificado) {
      // Se o usuário está verificado, garantir que o modal está fechado
      setVerificationModalVisible(false);
    }
  }, [user]);

  // Função para lidar com verificação de telefone
  const handleVerifyPhone = useCallback(async () => {
    if (!user) {
      console.error('❌ Home: Usuário não encontrado');
      return;
    }
    
    setSendingOtp(true);
    
    // Determinar emailOuTelefone (usar telefone ou email)
    const emailOuTelefone = user.telefone.replace(/\D/g, '') || user.email;
    
    // Tentar reenviar código OTP, mas não bloquear navegação se falhar
    try {
      await resendOtp(emailOuTelefone);
    } catch (error: any) {
      // Em ambiente de teste, ignorar erro de envio de email
      if (__DEV__) {
        console.warn('⚠️ Home: Erro ao reenviar código OTP (ignorando em ambiente de teste):', error);
      }
    }
    
    // SEMPRE navegar para OTP, mesmo se o reenvio falhar
    setVerificationModalVisible(false);
    
    // Pequeno delay para garantir que o modal fechou antes de navegar
    setTimeout(() => {
      try {
        navigation.push('VerifyOtp', {
          emailOuTelefone: emailOuTelefone,
        });
      } catch (navError) {
        console.error('❌ Home: Erro ao navegar para VerifyOtp:', navError);
        // Tentar com navigate se push falhar
        navigation.navigate('VerifyOtp', {
          emailOuTelefone: emailOuTelefone,
        });
      }
    }, 100);
    
    setSendingOtp(false);
  }, [user, resendOtp, navigation]);

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

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMorePopular) return;
    
    setLoadingMore(true);
    loadMorePopular().finally(() => {
      setLoadingMore(false);
    });
  }, [loadingMore, hasMorePopular, loadMorePopular]);

  // Calcular total do carrinho (memoizado)
  // Se o carrinho vier do backend com totais, usar eles
  // Por enquanto, calcular localmente
  const totalPrice = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const deliveryFee = 900; // R$9,00 em centavos
    const discount = appliedCoupon 
      ? calculateCouponDiscount(appliedCoupon, subtotal, deliveryFee)
      : 0;
    return subtotal + deliveryFee - discount;
  }, [cartItems, appliedCoupon]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Verificar se o header está visível
    const scrollY = contentOffset.y;
    const headerVisible = scrollY < headerHeight - 50; // 50px de margem
    const wasHeaderVisible = isHeaderVisible;
    setIsHeaderVisible(headerVisible);
    
    // A barra do carrinho já é controlada pelo useEffect que monitora totalItems
    // Aqui apenas mantemos a animação atual
    
    // Verificar se chegou ao final para carregar mais produtos
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreProducts();
    }
  }, [headerHeight, isHeaderVisible, loadMoreProducts]);

  const handleHeaderLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  const onRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  // Converter categorias do backend para formato do componente
  // Adicionar "Todas" como última categoria sempre
  const categoryItems: CategoryItem[] = useMemo(() => {
    // Garantir que as categorias estejam ordenadas por ordem
    const sortedCategories = [...categories].sort((a, b) => a.ordem - b.ordem);
    
    // Converter categorias do backend
    const convertedCategories = sortedCategories.map(category => {
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
          todos: categoryImages.todos,
        };
        return slugToImage[category.slug] || categoryImages.todos;
      };

      return {
        id: category.id,
        label: category.nome,
        type: (category.mostraBadgeDesconto ? 'Discount' : 'Default') as 'Default' | 'Discount',
        discountValue: category.mostraBadgeDesconto ? '20' : undefined, // Valor pode vir do backend ou ser fixo
        discountType: category.mostraBadgeDesconto ? 'percentage' as const : undefined,
        iconSource: getCategoryImage(),
      };
    });

    // Adicionar "Todas" como última categoria
    const todasCategory: CategoryItem = {
      id: 'todos',
      label: 'Todos',
      type: 'Default',
      iconSource: categoryImages.todos,
    };

    return [...convertedCategories, todasCategory];
  }, [categories]);

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


  // Menu items (memoizado)
  const menuItems: BottomMenuItemData[] = useMemo(() => [
    { 
      label: 'Início', 
      icon: HomeIcon, 
      active: true, 
      onPress: () => navigation.navigate('Home') 
    },
    { 
      label: 'Buscar', 
      icon: Search, 
      active: false, 
      onPress: () => navigation.navigate('Search', {}) 
    },
    { 
      label: 'Pedidos', 
      icon: Receipt, 
      active: false, 
      onPress: () => navigation.navigate('MyOrders') 
    },
    { 
      label: 'Ofertas', 
      icon: Flame, 
      active: false, 
      onPress: handleViewAllOffers 
    },
    { 
      label: 'Perfil', 
      icon: User, 
      active: false, 
      onPress: () => navigation.navigate('Profile') 
    },
  ], [navigation, handleViewAllOffers, handleViewAllProducts]);

  return (
    <>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: colors.white }]}
        edges={['top']}
      >
        <View style={styles.container}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            refreshControl={
              <RefreshControl
                refreshing={dataRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.white}
              />
            }
          >
            {dataLoading ? (
              <>
                {/* Skeleton Header */}
                <View style={styles.skeletonHeaderContainer}>
                  <Skeleton width="100%" height={120} borderRadius={0} style={{ backgroundColor: colors.white }} />
                </View>

                {/* Skeleton Banner */}
                <View style={styles.skeletonBanner}>
                  <Skeleton width="100%" height={144} borderRadius={8} />
                </View>

                {/* Skeleton Category Container */}
                <View style={styles.skeletonCategoryContainer}>
                  <View style={styles.skeletonProductsScroll}>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <Skeleton key={i} width={86} height={86} borderRadius={16} />
                    ))}
                  </View>
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
                  style={styles.header}
                >
                  <HomeHeader 
                    address={addressDisplay}
                    notificationCount={2}
                    onSearchPress={handleSearchPress}
                    onAddressPress={handleAddressPress}
                    onNotificationPress={() => {
                      // TODO: Implementar navegação para notificações
                      console.log('Navigate to notifications');
                    }}
                  />
                </View>

                {/* Tratamento de Erro */}
                {dataError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      {dataError.message || 'Erro ao carregar dados. Toque para tentar novamente.'}
                    </Text>
                    <TouchableOpacity onPress={refreshData} style={styles.retryButton}>
                      <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {/* Promotional Banner */}
                    <View style={styles.bannerContainer}>
                      <PromotionalBanner />
                    </View>

                    {/* Category List - Horizontal Scrollable */}
                    <View style={styles.categoryContainer}>
                      <CategoryList 
                        categories={categoryItems}
                        onCategoryPress={handleCategoryPress}
                      />
                    </View>

                    {/* Fique por dentro Section - Stories */}
                    <View style={styles.storiesSection}>
                      <View style={styles.storiesSectionHeader}>
                        <Text style={styles.sectionTitleText}>Fique por dentro</Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.storiesScroll}
                        style={styles.storiesScrollView}
                        decelerationRate="normal"
                        scrollEventThrottle={16}
                      >
                        {stories.map((story: StoryItem, index: number) => (
                          <View key={story.id} style={styles.storyWrapper}>
                            <Story
                              hasStory={story.hasStory}
                              imageSource={story.imageSource}
                              onPress={() => handleStoryPress(story)}
                            />
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Itens em oferta Section */}
                    <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitleText}>Itens em oferta</Text>
              <TouchableOpacity 
                style={styles.sectionLinkContainer}
                onPress={handleViewAllOffers}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionLinkText}>Ver tudo</Text>
                <ChevronRight size={14} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Products Horizontal Scroll */}
          {offersProducts.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Text style={styles.emptyProductsText}>Nenhuma oferta disponível no momento</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
              style={styles.productsScrollView}
              decelerationRate="normal"
              scrollEventThrottle={16}
            >
              {offersProducts.map((product) => {
                const cardData = convertProductToCard(product);
                return (
                  <ProductCard 
                    key={product.id}
                    {...cardData}
                    onPress={() => handleProductPress(product.id)}
                    style={styles.offerProductCard}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Todos os produtos Section - Grid com scroll infinito */}
        <View style={styles.popularSection}>
          <View style={styles.popularSectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitleText}>Todos os produtos</Text>
              <TouchableOpacity 
                style={styles.sectionLinkContainer}
                onPress={handleViewAllProducts}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionLinkText}>Ver tudo</Text>
                <ChevronRight size={14} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros horizontais */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
            style={styles.filtersScroll}
            decelerationRate="normal"
            scrollEventThrottle={16}
          >
            <Filter
              label="Ordenar"
              state={sortFilter ? 'Applied' : 'Default'}
              filterApplied={sortFilter || undefined}
              onPress={() => setSortModalVisible(true)}
              onClose={() => {
                setSortFilter(null);
              }}
            />
            <Filter
              label="Preço"
              state={priceFilter ? 'Applied' : 'Default'}
              filterApplied={priceFilter || undefined}
              onPress={() => setPriceModalVisible(true)}
              onClose={() => {
                setPriceFilter(null);
              }}
            />
            <Filter
              label="Em oferta"
              state={offerFilter ? 'Applied' : 'Default'}
              filterApplied={offerFilter ? 'Ativo' : undefined}
              onPress={() => setOfferModalVisible(true)}
              onClose={() => {
                setOfferFilter(false);
              }}
            />
            <Filter
              label="Novidade"
              state={newFilter ? 'Applied' : 'Default'}
              filterApplied={newFilter ? 'Ativo' : undefined}
              onPress={() => setNewModalVisible(true)}
              onClose={() => {
                setNewFilter(false);
              }}
            />
          </ScrollView>

          {/* Grid de produtos com scroll infinito */}
          {backendPopularProducts.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Text style={styles.emptyProductsText}>Nenhum produto popular disponível no momento</Text>
            </View>
          ) : (
            <View style={styles.popularGrid}>
              {backendPopularProducts.map((product) => {
                const cardData = convertProductToCard(product);
                return (
                  <View 
                    key={product.id} 
                    style={styles.popularCardWrapper}
                  >
                    <ProductCard 
                      {...cardData}
                      style={styles.popularCard}
                      onPress={() => handleProductPress(product.id)}
                    />
                  </View>
                );
              })}
              {loadingMore && (
                <View style={styles.loadingMore}>
                  <Text style={styles.loadingMoreText}>Carregando...</Text>
                </View>
              )}
            </View>
          )}
        </View>

                  </>
                )}
              </>
            )}
          </ScrollView>

          {/* Fixed Cart Bar - aparece quando há itens no carrinho */}
          {showCartBar && totalItems > 0 && (
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
                onPress={handleCartPress}
              />
            </Animated.View>
          )}

          {/* Bottom Menu */}
          <BottomMenu items={menuItems} />

          {/* Modal Lista de Endereços */}
          <ModalBottomSheet
            visible={addressesModalVisible}
            onClose={() => setAddressesModalVisible(false)}
            title="Meus endereços"
            showPrimaryButton={false}
          >
            {addresses.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MapPin size={64} color={colors.mutedForeground} strokeWidth={1.5} />
                <Text style={styles.emptyStateTitle}>Nenhum endereço cadastrado</Text>
                <Text style={styles.emptyStateDescription}>
                  Adicione um endereço para receber seus pedidos
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={handleAddAddress}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color={colors.white} strokeWidth={2} />
                  <Text style={styles.emptyStateButtonText}>Adicionar endereço</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addressesList}>
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  const getIcon = () => {
                    if (address.type === 'Casa') return <HomeIconLucide size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                    if (address.type === 'Trabalho') return <Building2 size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                    return <MapPin size={20} color={isSelected ? colors.primary : colors.black} strokeWidth={2} />;
                  };
                  
                  return (
                    <View
                      key={address.id}
                      style={[
                        styles.addressItem,
                        isSelected && styles.addressItemSelected
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.addressItemTouchable}
                        onPress={() => {
                          setSelectedAddressId(address.id);
                          setAddressesModalVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.addressItemContent}>
                          <View style={styles.addressItemHeader}>
                            {getIcon()}
                            <Text style={styles.addressItemType}>{address.type}</Text>
                          </View>
                          <Text style={styles.addressItemText}>
                            {address.street}{address.complement ? `, ${address.complement}` : ''}, {address.neighborhood}, {address.city} - {address.state}, CEP: {address.zipCode}
                          </Text>
                        </View>
                        {isSelected && (
                          <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                      <View style={styles.addressItemActions}>
                        <TouchableOpacity
                          onPress={() => handleEditAddress(address.id)}
                          style={styles.addressActionButton}
                          activeOpacity={0.7}
                        >
                          <Pencil size={20} color={colors.primary} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteAddress(address.id)}
                          style={styles.addressActionButton}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={20} color="#DC6E00" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={handleAddAddress}
                  activeOpacity={0.7}
                >
                  <View style={styles.addAddressButtonContent}>
                    <Plus size={20} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.addAddressButtonText}>Adicionar novo endereço</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </ModalBottomSheet>

          {/* Modal Adicionar Endereço */}
          <ModalBottomSheet
            visible={addAddressModalVisible}
            onClose={handleCloseAddAddressModal}
            title="Adicionar novo endereço"
            showPrimaryButton={true}
            primaryButtonLabel="Adicionar endereço"
            primaryButtonOnPress={handleSaveAddress}
            primaryButtonDisabled={savingAddress}
            primaryButtonLoading={savingAddress}
          >
            <View style={styles.addressForm}>
              {/* Chips de tipo de endereço */}
              <View style={styles.addressTypeChips}>
                <Chip
                  label="Casa"
                  state={addressType === 'Casa' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Casa')}
                  style={styles.addressTypeChip}
                />
                <Chip
                  label="Trabalho"
                  state={addressType === 'Trabalho' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Trabalho')}
                  style={styles.addressTypeChip}
                />
                <Chip
                  label="Outro"
                  state={addressType === 'Outro' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Outro')}
                  style={styles.addressTypeChip}
                />
              </View>

              {/* CEP */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>CEP *</Text>
                <Input
                  placeholder="00000-000"
                  value={addressForm.cep}
                  onChangeText={async (text) => {
                    const formatted = text.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                    setAddressForm({ ...addressForm, cep: formatted });
                    
                    // Buscar endereço quando CEP estiver completo (8 dígitos)
                    const cepDigits = formatted.replace(/\D/g, '');
                    if (cepDigits.length === 8) {
                      try {
                        // Usar o serviço do backend para buscar CEP
                        const cepData = await addressService.searchCep(cepDigits);
                        
                        setAddressForm(prev => ({
                          ...prev,
                          cep: formatted,
                          street: cepData.rua || '',
                          neighborhood: cepData.bairro || '',
                          city: cepData.cidade || '',
                          state: cepData.estado || '',
                          complement: cepData.complemento || prev.complement,
                        }));
                      } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                        // Não bloqueia o preenchimento manual se a busca falhar
                      }
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={9}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Rua e Número */}
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.formFieldHalf]}>
                  <Text style={styles.formLabel}>Rua *</Text>
                  <Input
                    placeholder="Nome da rua"
                    value={addressForm.street}
                    onChangeText={(text) => setAddressForm({ ...addressForm, street: text })}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
                <View style={[styles.formField, { width: 105 }]}>
                  <Text style={styles.formLabel}>Número *</Text>
                  <Input
                    placeholder="123"
                    value={addressForm.number}
                    onChangeText={(text) => setAddressForm({ ...addressForm, number: text })}
                    keyboardType="numeric"
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
              </View>

              {/* Complemento */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Complemento</Text>
                <Input
                  placeholder="Apto, Bloco, etc. (opcional)"
                  value={addressForm.complement}
                  onChangeText={(text) => setAddressForm({ ...addressForm, complement: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Bairro */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Bairro *</Text>
                <Input
                  placeholder="Nome do bairro"
                  value={addressForm.neighborhood}
                  onChangeText={(text) => setAddressForm({ ...addressForm, neighborhood: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Cidade e Estado */}
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.formFieldHalf]}>
                  <Text style={styles.formLabel}>Cidade *</Text>
                  <Input
                    placeholder="Nome da cidade"
                    value={addressForm.city}
                    onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
                <View style={[styles.formField, { width: 105 }]}>
                  <Text style={styles.formLabel}>Estado *</Text>
                  <Input
                    placeholder="UF"
                    value={addressForm.state}
                    onChangeText={(text) => setAddressForm({ ...addressForm, state: text.toUpperCase().slice(0, 2) })}
                    maxLength={2}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
              </View>
            </View>
          </ModalBottomSheet>

          {/* Modal Editar Endereço */}
          <ModalBottomSheet
            visible={editAddressModalVisible}
            onClose={() => {
              setEditAddressModalVisible(false);
              handleCloseAddAddressModal();
            }}
            title="Editar endereço"
            showPrimaryButton={true}
            primaryButtonLabel="Salvar alterações"
            primaryButtonOnPress={handleSaveAddress}
            primaryButtonDisabled={savingAddress}
            primaryButtonLoading={savingAddress}
          >
            <View style={styles.addressForm}>
              {/* Chips de tipo de endereço */}
              <View style={styles.addressTypeChips}>
                <Chip
                  label="Casa"
                  state={addressType === 'Casa' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Casa')}
                  style={styles.addressTypeChip}
                />
                <Chip
                  label="Trabalho"
                  state={addressType === 'Trabalho' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Trabalho')}
                  style={styles.addressTypeChip}
                />
                <Chip
                  label="Outro"
                  state={addressType === 'Outro' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setAddressType('Outro')}
                  style={styles.addressTypeChip}
                />
              </View>

              {/* CEP */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>CEP *</Text>
                <Input
                  placeholder="00000-000"
                  value={addressForm.cep}
                  onChangeText={async (text) => {
                    const formatted = text.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
                    setAddressForm({ ...addressForm, cep: formatted });
                    
                    // Buscar endereço quando CEP estiver completo (8 dígitos)
                    const cepDigits = formatted.replace(/\D/g, '');
                    if (cepDigits.length === 8) {
                      try {
                        // Usar o serviço do backend para buscar CEP
                        const cepData = await addressService.searchCep(cepDigits);
                        
                        setAddressForm(prev => ({
                          ...prev,
                          cep: formatted,
                          street: cepData.rua || prev.street,
                          neighborhood: cepData.bairro || prev.neighborhood,
                          city: cepData.cidade || prev.city,
                          state: cepData.estado || prev.state,
                          complement: cepData.complemento || prev.complement,
                        }));
                      } catch (error) {
                        console.error('Erro ao buscar CEP:', error);
                        // Não bloqueia o preenchimento manual se a busca falhar
                      }
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={9}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Rua e Número */}
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.formFieldHalf]}>
                  <Text style={styles.formLabel}>Rua *</Text>
                  <Input
                    placeholder="Nome da rua"
                    value={addressForm.street}
                    onChangeText={(text) => setAddressForm({ ...addressForm, street: text })}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
                <View style={[styles.formField, { width: 105 }]}>
                  <Text style={styles.formLabel}>Número *</Text>
                  <Input
                    placeholder="123"
                    value={addressForm.number}
                    onChangeText={(text) => setAddressForm({ ...addressForm, number: text })}
                    keyboardType="numeric"
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
              </View>

              {/* Complemento */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Complemento</Text>
                <Input
                  placeholder="Apto, Bloco, etc. (opcional)"
                  value={addressForm.complement}
                  onChangeText={(text) => setAddressForm({ ...addressForm, complement: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Bairro */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Bairro *</Text>
                <Input
                  placeholder="Nome do bairro"
                  value={addressForm.neighborhood}
                  onChangeText={(text) => setAddressForm({ ...addressForm, neighborhood: text })}
                  state="Default"
                  showSearchIcon={false}
                />
              </View>

              {/* Cidade e Estado */}
              <View style={styles.formRow}>
                <View style={[styles.formField, styles.formFieldHalf]}>
                  <Text style={styles.formLabel}>Cidade *</Text>
                  <Input
                    placeholder="Nome da cidade"
                    value={addressForm.city}
                    onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
                <View style={[styles.formField, { width: 105 }]}>
                  <Text style={styles.formLabel}>Estado *</Text>
                  <Input
                    placeholder="UF"
                    value={addressForm.state}
                    onChangeText={(text) => setAddressForm({ ...addressForm, state: text.toUpperCase().slice(0, 2) })}
                    maxLength={2}
                    state="Default"
                    showSearchIcon={false}
                  />
                </View>
              </View>
            </View>
          </ModalBottomSheet>

          {/* Modal de Verificação de Telefone */}
          <ModalBottomSheet
            visible={verificationModalVisible}
            onClose={() => setVerificationModalVisible(false)}
            title="Verifique seu telefone"
            showPrimaryButton={true}
            primaryButtonLabel={sendingOtp ? "Enviando..." : "Verificar agora"}
            primaryButtonOnPress={handleVerifyPhone}
            primaryButtonDisabled={sendingOtp}
            primaryButtonLoading={sendingOtp}
            showSecondaryButton={true}
            secondaryButtonLabel="Depois"
            secondaryButtonOnPress={() => setVerificationModalVisible(false)}
          >
            <View style={styles.verificationModalContent}>
              <Text style={styles.verificationModalText}>
                Para garantir a segurança da sua conta, precisamos verificar seu número de telefone.
              </Text>
              <Text style={styles.verificationModalText}>
                Enviaremos um código de verificação para o número cadastrado.
              </Text>
            </View>
          </ModalBottomSheet>

          {/* Modal Ordenar */}
          <ModalBottomSheet
            visible={sortModalVisible}
            onClose={() => setSortModalVisible(false)}
            title="Ordenar por"
            showPrimaryButton={true}
            primaryButtonLabel="Aplicar"
            primaryButtonOnPress={() => {
              setSortModalVisible(false);
            }}
            showSecondaryButton={false}
          >
            <View style={styles.filterSection}>
              <View style={styles.filterChipsContainer}>
                <Chip
                  label="Relevância"
                  state={sortFilter === 'Relevância' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setSortFilter('Relevância')}
                  style={styles.filterChip}
                />
                <Chip
                  label="Menor preço"
                  state={sortFilter === 'Menor preço' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setSortFilter('Menor preço')}
                  style={styles.filterChip}
                />
                <Chip
                  label="Maior preço"
                  state={sortFilter === 'Maior preço' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setSortFilter('Maior preço')}
                  style={styles.filterChip}
                />
                <Chip
                  label="Avaliação"
                  state={sortFilter === 'Avaliação' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setSortFilter('Avaliação')}
                  style={styles.filterChip}
                />
              </View>
            </View>
          </ModalBottomSheet>

          {/* Modal Preço */}
          <ModalBottomSheet
            visible={priceModalVisible}
            onClose={() => setPriceModalVisible(false)}
            title="Faixa de preço"
            showPrimaryButton={true}
            primaryButtonLabel="Aplicar"
            primaryButtonOnPress={() => {
              setPriceModalVisible(false);
            }}
            showSecondaryButton={false}
          >
            <View style={styles.filterSection}>
              <View style={styles.filterChipsContainer}>
                <Chip
                  label="Todos"
                  state={priceFilter === 'Todos' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setPriceFilter('Todos')}
                  style={styles.filterChip}
                />
                <Chip
                  label="Até R$ 10"
                  state={priceFilter === 'Até R$ 10' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setPriceFilter('Até R$ 10')}
                  style={styles.filterChip}
                />
                <Chip
                  label="R$ 10-25"
                  state={priceFilter === 'R$ 10-25' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setPriceFilter('R$ 10-25')}
                  style={styles.filterChip}
                />
                <Chip
                  label="R$ 25-50"
                  state={priceFilter === 'R$ 25-50' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setPriceFilter('R$ 25-50')}
                  style={styles.filterChip}
                />
                <Chip
                  label="Acima de R$ 50"
                  state={priceFilter === 'Acima de R$ 50' ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setPriceFilter('Acima de R$ 50')}
                  style={styles.filterChip}
                />
              </View>
            </View>
          </ModalBottomSheet>

          {/* Modal Em oferta */}
          <ModalBottomSheet
            visible={offerModalVisible}
            onClose={() => setOfferModalVisible(false)}
            title="Em oferta"
            showPrimaryButton={true}
            primaryButtonLabel="Aplicar"
            primaryButtonOnPress={() => {
              setOfferModalVisible(false);
            }}
            showSecondaryButton={false}
          >
            <View style={styles.filterSection}>
              <View style={styles.filterChipsContainer}>
                <Chip
                  label="Todos"
                  state={!offerFilter ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setOfferFilter(false)}
                  style={styles.filterChip}
                />
                <Chip
                  label="Apenas em oferta"
                  state={offerFilter ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setOfferFilter(true)}
                  style={styles.filterChip}
                />
              </View>
            </View>
          </ModalBottomSheet>

          {/* Modal Novidade */}
          <ModalBottomSheet
            visible={newModalVisible}
            onClose={() => setNewModalVisible(false)}
            title="Novidade"
            showPrimaryButton={true}
            primaryButtonLabel="Aplicar"
            primaryButtonOnPress={() => {
              setNewModalVisible(false);
            }}
            showSecondaryButton={false}
          >
            <View style={styles.filterSection}>
              <View style={styles.filterChipsContainer}>
                <Chip
                  label="Todos"
                  state={!newFilter ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setNewFilter(false)}
                  style={styles.filterChip}
                />
                <Chip
                  label="Apenas novidades"
                  state={newFilter ? 'Selected' : 'Default'}
                  showClose={false}
                  onPress={() => setNewFilter(true)}
                  style={styles.filterChip}
                />
              </View>
            </View>
          </ModalBottomSheet>

          {/* Toast para feedback */}
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
            duration={3000}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  container: {
    flex: 1,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2, // Espaço para o BottomMenu e FixedCartBar
    backgroundColor: colors.white,
    overflow: 'visible', // Permite que os cards saiam das bordas
  },
  bannerContainer: {
    paddingHorizontal: spacing.md, // 16px
    paddingTop: 8, // 24px
    paddingBottom: 0,
  },
  categoryContainer: {
    paddingTop: 16, // 24px
    paddingBottom: 0,
  },
  storiesSection: {
    width: '100%',
    paddingTop: 16, // 24px gap entre seções
    paddingBottom: 0,
    gap: 8,
  },
  storiesSectionHeader: {
    paddingBottom: spacing.md, // 16px
    paddingHorizontal: spacing.md, // 16px padding horizontal
  },
  storiesScrollView: {
    width: '100%',
  },
  storiesScroll: {
    paddingHorizontal: spacing.md, // 16px
  },
  storyWrapper: {
    marginRight: 12, // 12px gap entre stories (igual ao CategoryList)
  },
  productsSection: {
    width: '100%',
    paddingTop: spacing.lg, // 24px gap entre seções
  },
  productsSectionHeader: {
    paddingLeft: spacing.md, // 16px
    paddingRight: spacing.md, // 16px
    paddingBottom: spacing.md, // 16px
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitleText: {
    fontSize: 18,
    lineHeight: 20, // 18px * 1.2
    fontWeight: fontWeights.medium,
    color: colors.black,
    flex: 1,
  },
  sectionLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4px
  },
  sectionLinkText: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  productsScrollView: {
    width: '100%',
  },
  productsScroll: {
    gap: spacing.md, // 16px gap conforme design
    paddingLeft: spacing.md, // 16px padding
    paddingRight: spacing.md, // 16px padding
  },
  popularSection: {
    width: '100%',
    paddingTop: spacing.lg + 24, // 24px gap entre seções
  },
  popularSectionHeader: {
    paddingBottom: spacing.md, // 16px
    paddingHorizontal: spacing.md, // 16px padding horizontal
  },
  filtersScroll: {
    width: '100%',
  },
  filtersContainer: {
    paddingHorizontal: spacing.md, // 16px
    paddingBottom: spacing.md, // 16px
    gap: 6, // 6px gap entre filtros
    flexDirection: 'row',
  },
  filterSection: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.md, // 16px
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm, // 8px
  },
  filterChip: {
    marginBottom: spacing.xs, // 4px
  },
  offerProductCard: {
    width: 163, // 163px conforme design do Figma
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md, // 16px padding horizontal
    paddingBottom: spacing.lg,
    rowGap: 12, // Gap vertical de 12px entre linhas
    alignContent: 'flex-start',
  },
  popularCardWrapper: {
    width: '48%', // 2 colunas com gap
    alignSelf: 'stretch', // Cards da mesma linha terão a mesma altura
  },
  popularCard: {
    width: '100%',
    maxWidth: '100%',
    flex: 1, // Ocupa toda a altura disponível do wrapper
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
        bottom: 98, // Acima do BottomMenu (altura do menu + margem)
        left: 0, // Reduzir padding lateral para aumentar largura
        right: 0,
        zIndex: 10,
      },
      skeletonHeaderContainer: {
        width: '100%',
      },
      skeletonBanner: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: 0,
      },
      skeletonCategoryContainer: {
        paddingTop: spacing.lg,
        paddingBottom: 0,
      },
      skeletonProductsSection: {
        width: '100%',
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.md,
      },
      skeletonSectionTitle: {
        marginBottom: spacing.md,
      },
      skeletonProductsScroll: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
      },
      skeletonPopularSection: {
        width: '100%',
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.md,
      },
      skeletonPopularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
      },
      skeletonPopularCard: {
        width: 191,
      },
      addressesList: {
        gap: spacing.md,
      },
      addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 16, 16, 0.1)',
        backgroundColor: colors.white,
      },
      addressItemSelected: {
        backgroundColor: 'rgba(230, 28, 97, 0.06)',
        borderColor: colors.primary,
      },
      addressItemTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      },
      addressItemContent: {
        flex: 1,
        gap: spacing.sm + 2,
      },
      addressItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
      },
      addressActionButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
      },
      addressItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
      },
      addressItemType: {
        ...typography.sm,
        fontWeight: fontWeights.semibold,
        color: colors.black,
      },
      addressItemText: {
        ...typography.sm,
        fontWeight: fontWeights.normal,
        color: colors.mutedForeground,
        lineHeight: 18.2,
      },
      emptyStateContainer: {
        paddingVertical: spacing.xl * 2,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
      },
      emptyStateTitle: {
        ...typography.lg,
        fontWeight: fontWeights.semibold,
        color: colors.black,
        textAlign: 'center',
      },
      emptyStateDescription: {
        ...typography.base,
        fontWeight: fontWeights.normal,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.sm,
      },
      emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        marginTop: spacing.md,
      },
      emptyStateButtonText: {
        ...typography.base,
        fontWeight: fontWeights.semibold,
        color: colors.white,
      },
      addAddressButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
      },
      addAddressButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
      },
      addAddressButtonText: {
        ...typography.base,
        fontWeight: fontWeights.semibold,
        color: colors.primary,
      },
      addressForm: {
        gap: spacing.md,
      },
      addressTypeChips: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
      },
      addressTypeChip: {
        flex: 1,
      },
      formField: {
        gap: spacing.xs,
      },
      formRow: {
        flexDirection: 'row',
        gap: spacing.sm,
      },
      formFieldHalf: {
        flex: 1,
      },
      formLabel: {
        ...typography.sm,
        fontWeight: fontWeights.semibold,
        color: colors.black,
      },
      errorContainer: {
        padding: spacing.lg,
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
      emptyProductsContainer: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
      },
      emptyProductsText: {
        ...typography.base,
        color: colors.mutedForeground,
        textAlign: 'center',
      },
      verificationModalContent: {
        paddingVertical: spacing.md,
        gap: spacing.sm,
      },
      verificationModalText: {
        ...typography.base,
        color: colors.black,
        lineHeight: 24,
      },
    });
