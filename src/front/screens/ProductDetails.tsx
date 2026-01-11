import { View, Text, ScrollView, StyleSheet, ImageSourcePropType, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import {
  ProductDetailHeader,
  ProductDetailInfo,
  SelectionSection,
  type SelectionOptionData,
  QuantitySelector,
  ProductObservations,
  ProductDetailFooter,
} from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { useCart } from '../../contexts/CartContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProductDetails: {
    productId: string;
  };
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export interface SelectionSectionConfig {
  id: string;
  title: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  allowQuantity?: boolean;
  options: SelectionOptionData[];
}

export interface ProductDetailsData {
  id: string;
  title: string;
  description?: string;
  imageSource?: ImageSourcePropType;
  basePrice?: number; // em centavos
  finalPrice: number; // em centavos
  discountValue?: number; // em centavos
  selectionSections?: SelectionSectionConfig[];
}

import { getProductDetails } from '../../data/mockProducts';

// Buscar dados do produto - em produção viria de uma API
function getProductData(productId: string): ProductDetailsData {
  const product = getProductDetails(productId);
  if (product) return product;

  // Fallback caso não encontre o produto
  return {
    id: productId,
    title: 'Nome do produto com duas linhas no máximo',
    description: 'Descrição do produto',
    basePrice: 998, // R$9,98
    finalPrice: 998, // R$9,98
    discountValue: 1200, // R$12,00
    selectionSections: [
      {
        id: 'section-1',
        title: 'Exemplo de seleção obrigatória',
        selectionType: 'single',
        isRequired: true,
        minSelection: 1,
        maxSelection: 1,
        allowQuantity: false,
        options: [
          {
            id: 'option-1-1',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 0,
          },
          {
            id: 'option-1-2',
            title: 'Opção desmarcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
          },
        ],
      },
      {
        id: 'section-2',
        title: 'Exemplo de seleção opcional',
        selectionType: 'multiple',
        isRequired: false,
        minSelection: 1,
        maxSelection: 2,
        allowQuantity: false,
        options: [
          {
            id: 'option-2-1',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 0,
          },
          {
            id: 'option-2-2',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 0,
          },
          {
            id: 'option-2-3',
            title: 'Opção desmarcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
          },
        ],
      },
      {
        id: 'section-3',
        title: 'Exemplo de seleção múltipla opções',
        selectionType: 'multiple',
        isRequired: true,
        allowQuantity: true,
        options: [
          {
            id: 'option-3-1',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
            quantity: 2,
          },
          {
            id: 'option-3-2',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
            quantity: 2,
          },
          {
            id: 'option-3-3',
            title: 'Opção marcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
            quantity: 2,
          },
          {
            id: 'option-3-4',
            title: 'Opção desmarcada',
            description: 'Descrição opcional',
            price: 800, // R$8,00
          },
        ],
      },
    ],
  };
}

// Helper para formatar moeda
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export function ProductDetails() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductDetailsRouteProp>();
  const { productId } = route.params;
  const { addItem } = useCart();

  const [product] = useState<ProductDetailsData>(() => getProductData(productId));
  const [mainQuantity, setMainQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [optionQuantities, setOptionQuantities] = useState<Record<string, Record<string, number>>>({});
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(380);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerRef = useRef<View>(null);

  // Inicializar seleções obrigatórias
  useEffect(() => {
    const initial: Record<string, string[]> = {};
    const initialQuantities: Record<string, Record<string, number>> = {};

    product.selectionSections?.forEach((section) => {
      if (section.isRequired && section.selectionType === 'single' && section.options.length > 0) {
        initial[section.id] = [section.options[0].id];
      }
      if (section.allowQuantity) {
        initialQuantities[section.id] = {};
        section.options.forEach((option) => {
          if (option.quantity) {
            if (!initialQuantities[section.id]) {
              initialQuantities[section.id] = {};
            }
            initialQuantities[section.id][option.id] = option.quantity;
            // Se a opção tem quantidade, considera como selecionada
            if (!initial[section.id]) {
              initial[section.id] = [];
            }
            initial[section.id].push(option.id);
          }
        });
      }
    });

    setSelectedOptions(initial);
    setOptionQuantities(initialQuantities);
  }, [product]);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    // Quando rolar mais que a altura da imagem, o header deve mudar
    const headerVisible = scrollY < headerHeight - 50; // 50px de margem
    setIsHeaderVisible(headerVisible);
  };

  const handleHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const handleOptionSelect = (sectionId: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const section = product.selectionSections?.find((s) => s.id === sectionId);
      if (!section) return prev;

      const current = prev[sectionId] || [];

      if (section.selectionType === 'single') {
        // Single choice: apenas uma opção selecionada
        // Se já está selecionada, não faz nada (obrigatório sempre selecionado)
        if (current.includes(optionId) && !section.isRequired) {
          // Permite desmarcar apenas se não for obrigatório
          return {
            ...prev,
            [sectionId]: [],
          };
        }
        return {
          ...prev,
          [sectionId]: [optionId],
        };
      } else {
        // Multiple choice: toggle da opção
        if (current.includes(optionId)) {
          // Remover
          const newSelected = current.filter((id) => id !== optionId);
          // Remover quantidade também
          setOptionQuantities((qtyPrev) => {
            const sectionQty = qtyPrev[sectionId] || {};
            const newSectionQty = { ...sectionQty };
            delete newSectionQty[optionId];
            return {
              ...qtyPrev,
              [sectionId]: newSectionQty,
            };
          });
          return {
            ...prev,
            [sectionId]: newSelected,
          };
        } else {
          // Verificar maxSelection
          if (section.maxSelection && current.length >= section.maxSelection) {
            return prev; // Não permite adicionar mais
          }
          // Adicionar
          return {
            ...prev,
            [sectionId]: [...current, optionId],
          };
        }
      }
    });
  };

  const handleQuantityChange = (sectionId: string, optionId: string, quantity: number) => {
    setOptionQuantities((prev) => {
      const sectionQty = prev[sectionId] || {};
      return {
        ...prev,
        [sectionId]: {
          ...sectionQty,
          [optionId]: quantity,
        },
      };
    });
  };

  // Calcular total
  const total = useMemo(() => {
    let baseTotal = product.finalPrice;

    // Adicionar preços das opções selecionadas
    product.selectionSections?.forEach((section) => {
      const selected = selectedOptions[section.id] || [];
      selected.forEach((optionId) => {
        const option = section.options.find((o) => o.id === optionId);
        if (option && option.price) {
          if (section.allowQuantity) {
            const quantity = optionQuantities[section.id]?.[optionId] || option.quantity || 1;
            baseTotal += option.price * quantity;
          } else {
            baseTotal += option.price;
          }
        }
      });
    });

    // Multiplicar pela quantidade principal
    return baseTotal * mainQuantity;
  }, [product, selectedOptions, optionQuantities, mainQuantity]);

  const handleAddToCart = () => {
    // Validar seleções obrigatórias
    const missingRequired = product.selectionSections?.some((section) => {
      if (section.isRequired) {
        const selected = selectedOptions[section.id] || [];
        if (selected.length === 0) return true;
        if (section.minSelection && selected.length < section.minSelection) return true;
      }
      return false;
    });

    if (missingRequired) {
      // Aqui você pode mostrar um alerta ou toast
      console.warn('Selecione todas as opções obrigatórias');
      return;
    }

    // Construir customizações para o carrinho
    const customizations: any[] = [];
    
    product.selectionSections?.forEach((section) => {
      const selected = selectedOptions[section.id] || [];
      if (selected.length > 0) {
        if (section.selectionType === 'single' && selected.length === 1) {
          // Single choice: usar value simples
          const option = section.options.find((o) => o.id === selected[0]);
          if (option) {
            customizations.push({
              label: section.title,
              value: option.title,
              additionalPrice: option.price || 0,
            });
          }
        } else {
          // Multiple choice: usar items array
          const items: any[] = [];
          selected.forEach((optionId) => {
            const option = section.options.find((o) => o.id === optionId);
            if (option) {
              if (section.allowQuantity) {
                const quantity = optionQuantities[section.id]?.[optionId] || option.quantity || 1;
                items.push({
                  name: option.title,
                  additionalPrice: (option.price || 0) * quantity,
                });
              } else {
                items.push({
                  name: option.title,
                  additionalPrice: option.price || 0,
                });
              }
            }
          });
          if (items.length > 0) {
            customizations.push({
              label: section.title,
              items,
            });
          }
        }
      }
    });

    // Adicionar ao carrinho
    // Criar um ID único baseado nas seleções para agrupar itens idênticos
    const selectionsKey = Object.keys(selectedOptions)
      .sort()
      .map((sectionId) => {
        const selected = (selectedOptions[sectionId] || []).sort().join(',');
        const quantities = optionQuantities[sectionId] 
          ? Object.keys(optionQuantities[sectionId])
              .sort()
              .map((optId) => `${optId}:${optionQuantities[sectionId][optId]}`)
              .join(';')
          : '';
        return `${sectionId}:${selected}${quantities ? `|q:${quantities}` : ''}`;
      })
      .join('||');
    
    const uniqueId = `${product.id}-${selectionsKey || 'default'}`;

    // Adicionar item - o CartContext gerencia a quantidade automaticamente
    // Vamos adicionar mainQuantity vezes
    for (let i = 0; i < mainQuantity; i++) {
      addItem({
        id: uniqueId,
        title: product.title,
        showDriver: !!product.discountValue,
        driverLabel: '',
        basePrice: product.basePrice || 0,
        finalPrice: total / mainQuantity, // Preço unitário
        discountValue: product.discountValue || 0,
        type: product.discountValue ? 'Offer' : 'Default',
        customizations: customizations.length > 0 ? customizations : undefined,
        imageSource: product.imageSource,
      });
    }

    // Navegar de volta
    navigation.goBack();
  };

  return (
    <>
      <StatusBar 
        style={isHeaderVisible ? "light" : "dark"}
        backgroundColor={isHeaderVisible ? "transparent" : colors.white}
        translucent={true}
      />
      <View style={styles.container}>
        {/* Header fixo com botão voltar */}
        <SafeAreaView 
          edges={['top']} 
          style={[
            styles.headerSafeArea,
            { backgroundColor: isHeaderVisible ? 'transparent' : colors.white }
          ]}
        >
          <View style={[
            styles.headerContainer,
            { 
              borderBottomWidth: isHeaderVisible ? 0 : 1,
              borderBottomColor: 'rgba(0, 0, 0, 0.1)'
            }
          ]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeft 
                size={24} 
                color={isHeaderVisible ? colors.white : colors.black} 
                strokeWidth={2.5} 
              />
              <Text style={[
                styles.backButtonText,
                { color: isHeaderVisible ? colors.white : colors.black }
              ]}>
                Voltar
              </Text>
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Product Image - faz parte do scroll */}
          <View ref={headerRef} onLayout={handleHeaderLayout}>
            <ProductDetailHeader
              imageSource={product.imageSource}
              onBackPress={() => navigation.goBack()}
            />
          </View>

          {/* Product Info */}
          <ProductDetailInfo
            title={product.title}
            description={product.description}
            basePrice={product.basePrice ? formatCurrency(product.basePrice) : undefined}
            finalPrice={formatCurrency(product.finalPrice)}
            discountValue={product.discountValue ? formatCurrency(product.discountValue) : undefined}
            showDiscount={!!product.discountValue}
          />

          {/* Selection Sections */}
          {product.selectionSections && product.selectionSections.length > 0 && (
            <View style={styles.selectionsContainer}>
              {product.selectionSections.map((section, index) => (
                <View key={section.id}>
                  <SelectionSection
                    id={section.id}
                    title={section.title}
                    options={section.options}
                    selectionType={section.selectionType}
                    isRequired={section.isRequired}
                    minSelection={section.minSelection}
                    maxSelection={section.maxSelection}
                    selectedIds={selectedOptions[section.id] || []}
                    optionQuantities={optionQuantities[section.id] || {}}
                    onOptionSelect={handleOptionSelect}
                    onQuantityChange={section.allowQuantity ? handleQuantityChange : undefined}
                    allowQuantity={section.allowQuantity}
                  />
                  {index < product.selectionSections!.length - 1 && (
                    <View style={styles.sectionGap} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Quantity Section */}
          <View style={styles.quantitySection}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleContent}>
                <View style={styles.sectionTitleText}>
                  <Text style={styles.sectionTitle}>Quantidade</Text>
                </View>
              </View>
            </View>
            <QuantitySelector
              quantity={mainQuantity}
              onQuantityChange={setMainQuantity}
              min={1}
            />
          </View>

          {/* Observations Section */}
          <View style={styles.observationsSection}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleContent}>
                <View style={styles.sectionTitleText}>
                  <Text style={styles.sectionTitle}>Observações</Text>
                </View>
              </View>
            </View>
            <ProductObservations
              value={observations}
              onChangeText={setObservations}
            />
          </View>
        </ScrollView>

        {/* Footer Fixo */}
        <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
          <ProductDetailFooter
            total={total}
            onAddToCart={handleAddToCart}
          />
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg + 4, // 20px
    paddingBottom: spacing.lg + 4, // 24px
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: 'Geist',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2, // Espaço para o footer
    gap: spacing.sm,
  },
  footerSafeArea: {
    backgroundColor: colors.white,
  },
  selectionsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  sectionGap: {
    height: spacing.sm,
  },
  quantitySection: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg + 4, // 20px
    paddingTop: 8,
    paddingBottom: spacing.lg + 4, // 20px
    flexDirection: 'column',
    gap: 0,
  },
  observationsSection: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg + 4, // 20px
    paddingTop: 8,
    paddingBottom: spacing.lg + 4, // 20px
    flexDirection: 'column',
    gap: 0,
  },
  sectionTitleContainer: {
    width: '100%',
    paddingVertical: spacing.md, // 16px
  },
  sectionTitleContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionTitleText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Geist',
    fontWeight: '600',
    color: colors.black,
  },
});
