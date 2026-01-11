import { ImageSourcePropType } from 'react-native';
import { ProductDetailsData, SelectionSectionConfig } from '../front/screens/ProductDetails';

// URLs das imagens dos produtos
const productImages: Record<string, string> = {
  '1': 'https://www.piramidesdistribuidora.com.br/images/original/3328-heineken-long-neck-330ml-normal-24un.20251201102027.png',
  '2': 'https://www.bernardaoemcasa.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/b/e/be864b16a0399cd7745c7edc533100ea.png',
  '3': 'https://s3-sa-east-1.amazonaws.com/superimg/img.produtos/7891150065284/img_500_1.png',
  '4': 'https://phygital-files.mercafacil.com/catalogo/uploads/produto/biscoito_wafer_recheio_chocolate_vitarella_pacote_80g_b4fe9c6f-aa53-44df-b60e-6737d487b20f.png',
  '5': 'https://www.redesuperbom.com.br/uploads/produtos/54460_barcelos_biscoito-wafer_biscoito-wafer-piraque-100g-chocolate.png',
  '6': 'https://giassi.vtexassets.com/arquivos/ids/12782980/Bebida-Lactea-UHT-Nescafe-Cappuccino-Classico-Frasco-270ml.png?v=638937152564430000',
  '7': 'https://superrissul.vtexassets.com/arquivos/ids/965300-800-auto?v=639015793773530000&width=800&height=auto&aspect=true',
  '8': 'https://superrissul.vtexassets.com/arquivos/ids/961710-800-auto?v=639015751714800000&width=800&height=auto&aspect=true',
  '9': 'https://s3-sa-east-1.amazonaws.com/superimg/img.produtos/7891000307083/img_500_1.png',
  '10': 'https://png.pngtree.com/png-vector/20240413/ourmid/pngtree-a-piece-of-meat-that-is-cut-in-half-png-image_11955762.png',
  '11': 'https://png.pngtree.com/png-clipart/20240206/original/pngtree-raw-chicken-breast-fillets-cutting-board-photo-png-image_14240301.png',
  '12': 'https://emporio4estrelas.vtexassets.com/arquivos/ids/157934/Vinho-Verde-Tinto-Casal-Garcia-750ml.png?v=636919922994300000',
  '13': 'https://www.extramercado.com.br/img/uploads/1/330/33217330.png',
  '14': 'https://giassi.vtexassets.com/arquivos/ids/2032205/Vinho-Portugues-Branco-Doce-Sweet-Casal-Garcia-Arinto-Azal-Loureiro-Vinho-Verde-Garrafa-750ml.png?v=638588337943030000',
  '15': 'https://www.monpetitbresil.com/cdn/shop/products/Foto_8.png?v=1680057136',
  '16': 'https://www.extramercado.com.br/img/uploads/1/558/33232558.png',
  '17': 'https://png.pngtree.com/png-clipart/20250103/original/pngtree-cheese-image-png-image_19971287.png',
};

// Produtos mockados para listagem (versão simplificada)
export interface MockProduct {
  id: string;
  title: string;
  description: string;
  category?: string; // Categoria do produto (para Search)
  showDriver: boolean;
  driverLabel?: string;
  basePrice?: string;
  finalPrice: string;
  discountValue?: string;
  type: 'Offer' | 'Default';
  imageUrl?: string;
}

// Helper para converter URL string em ImageSourcePropType
export function getImageSource(imageUrl?: string): ImageSourcePropType | undefined {
  if (!imageUrl) return undefined;
  return { uri: imageUrl };
}

export const mockProducts: MockProduct[] = [
  {
    id: '1',
    title: 'Cerveja Heineken Long Neck',
    description: 'Pack com 24 unidades 330ml',
    category: 'bebidas',
    showDriver: true,
    driverLabel: 'Oferta',
    basePrice: 'R$45,00',
    finalPrice: 'R$39,90',
    discountValue: 'R$5,10',
    type: 'Offer',
    imageUrl: productImages['1'],
  },
  {
    id: '2',
    title: 'Cerveja Skol Lata',
    description: 'Pack com 12 unidades 350ml',
    category: 'bebidas',
    showDriver: false,
    finalPrice: 'R$18,90',
    type: 'Default',
    imageUrl: productImages['2'],
  },
  {
    id: '3',
    title: 'Refrigerante Coca-Cola',
    description: 'Garrafa 2L',
    category: 'bebidas',
    showDriver: true,
    driverLabel: 'Promo',
    basePrice: 'R$10,00',
    finalPrice: 'R$8,99',
    discountValue: 'R$1,01',
    type: 'Offer',
    imageUrl: productImages['3'],
  },
  {
    id: '4',
    title: 'Biscoito Wafer Vitarella',
    description: 'Chocolate, pacote 80g',
    category: 'lanches',
    showDriver: false,
    finalPrice: 'R$3,50',
    type: 'Default',
    imageUrl: productImages['4'],
  },
  {
    id: '5',
    title: 'Biscoito Wafer Piraquê',
    description: 'Chocolate, pacote 100g',
    category: 'lanches',
    showDriver: true,
    driverLabel: 'Novo',
    basePrice: 'R$4,50',
    finalPrice: 'R$3,99',
    discountValue: 'R$0,51',
    type: 'Offer',
    imageUrl: productImages['5'],
  },
  {
    id: '6',
    title: 'Nescafé Cappuccino',
    description: 'Bebida láctea UHT, frasco 270ml',
    category: 'bebidas',
    showDriver: false,
    finalPrice: 'R$5,99',
    type: 'Default',
    imageUrl: productImages['6'],
  },
  {
    id: '7',
    title: 'Água Mineral Crystal',
    description: 'Sem gás, garrafa 1.5L',
    category: 'bebidas',
    showDriver: false,
    finalPrice: 'R$3,00',
    type: 'Default',
    imageUrl: productImages['7'],
  },
  {
    id: '8',
    title: 'Água Mineral com Gás',
    description: 'Garrafa 1.5L',
    category: 'bebidas',
    showDriver: false,
    finalPrice: 'R$3,50',
    type: 'Default',
    imageUrl: productImages['8'],
  },
  {
    id: '9',
    title: 'Refrigerante Guaraná Antarctica',
    description: 'Garrafa 2L',
    category: 'bebidas',
    showDriver: true,
    driverLabel: 'Promo',
    basePrice: 'R$9,50',
    finalPrice: 'R$8,49',
    discountValue: 'R$1,01',
    type: 'Offer',
    imageUrl: productImages['9'],
  },
  {
    id: '10',
    title: 'Carne Bovina',
    description: 'Picanha fatiada, 500g',
    category: 'carnes',
    showDriver: true,
    driverLabel: 'Fresco',
    basePrice: 'R$45,00',
    finalPrice: 'R$39,90',
    discountValue: 'R$5,10',
    type: 'Offer',
    imageUrl: productImages['10'],
  },
  {
    id: '11',
    title: 'Peito de Frango',
    description: 'Fresco, bandeja 1kg',
    category: 'carnes',
    showDriver: false,
    finalPrice: 'R$18,90',
    type: 'Default',
    imageUrl: productImages['11'],
  },
  {
    id: '12',
    title: 'Vinho Tinto Casal Garcia',
    description: 'Vinho Verde, garrafa 750ml',
    category: 'vinhos',
    showDriver: false,
    finalPrice: 'R$25,00',
    type: 'Default',
    imageUrl: productImages['12'],
  },
  {
    id: '13',
    title: 'Vinho Tinto Seco',
    description: 'Garrafa 750ml',
    category: 'vinhos',
    showDriver: true,
    driverLabel: 'Importado',
    basePrice: 'R$35,00',
    finalPrice: 'R$29,90',
    discountValue: 'R$5,10',
    type: 'Offer',
    imageUrl: productImages['13'],
  },
  {
    id: '14',
    title: 'Vinho Branco Casal Garcia',
    description: 'Vinho Verde Doce, garrafa 750ml',
    category: 'vinhos',
    showDriver: false,
    finalPrice: 'R$27,00',
    type: 'Default',
    imageUrl: productImages['14'],
  },
  {
    id: '15',
    title: 'Cerveja Artesanal',
    description: 'Pack com 6 unidades',
    category: 'bebidas',
    showDriver: true,
    driverLabel: 'Premium',
    basePrice: 'R$50,00',
    finalPrice: 'R$45,90',
    discountValue: 'R$4,10',
    type: 'Offer',
    imageUrl: productImages['15'],
  },
  {
    id: '16',
    title: 'Bebida Energética',
    description: 'Lata 473ml',
    category: 'bebidas',
    showDriver: false,
    finalPrice: 'R$8,50',
    type: 'Default',
    imageUrl: productImages['16'],
  },
  {
    id: '17',
    title: 'Queijo Mussarela',
    description: 'Fatias, 200g',
    category: 'frios',
    showDriver: false,
    finalPrice: 'R$12,90',
    type: 'Default',
    imageUrl: productImages['17'],
  },
];

// Função para buscar dados completos do produto (para página de detalhes)
export function getProductDetails(productId: string): ProductDetailsData | null {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return null;

  // Converter preços de string para centavos
  function parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(cleaned) * 100);
  }

  const baseProduct: ProductDetailsData = {
    id: product.id,
    title: product.title,
    description: product.description,
    imageSource: getImageSource(product.imageUrl),
    basePrice: product.basePrice ? parsePrice(product.basePrice) : undefined,
    finalPrice: parsePrice(product.finalPrice),
    discountValue: product.discountValue ? parsePrice(product.discountValue) : undefined,
  };

  // Adicionar seções de seleção para alguns produtos específicos
  if (product.id === '10' || product.id === '11') {
    // Carnes têm opções de personalização
    baseProduct.selectionSections = [
      {
        id: 'section-tamanho',
        title: 'Escolha o tamanho',
        selectionType: 'single',
        isRequired: true,
        minSelection: 1,
        maxSelection: 1,
        allowQuantity: false,
        options: [
          { id: 'tamanho-150', title: 'Pequeno (150g)', price: 0 },
          { id: 'tamanho-300', title: 'Médio (300g)', price: 500 }, // +R$5,00
          { id: 'tamanho-500', title: 'Grande (500g)', price: 1000 }, // +R$10,00
        ],
      },
      {
        id: 'section-ponto',
        title: 'Ponto da carne',
        selectionType: 'single',
        isRequired: true,
        minSelection: 1,
        maxSelection: 1,
        allowQuantity: false,
        options: [
          { id: 'ponto-mal', title: 'Mal passada', price: 0 },
          { id: 'ponto-ao-ponto', title: 'Ao ponto', price: 0 },
          { id: 'ponto-bem', title: 'Bem passada', price: 0 },
        ],
      },
      {
        id: 'section-adicionais',
        title: 'Adicionais',
        selectionType: 'multiple',
        isRequired: false,
        allowQuantity: true, // Permite quantidade para adicionais
        options: [
          { id: 'adicional-bacon', title: 'Bacon', price: 500, quantity: 1 }, // R$5,00
          { id: 'adicional-cheddar', title: 'Cheddar', price: 700, quantity: 1 }, // R$7,00
          { id: 'adicional-cream-cheese', title: 'Cream cheese', price: 700, quantity: 1 }, // R$7,00
        ],
      },
    ];
  } else if (product.id === '12' || product.id === '13' || product.id === '14') {
    // Vinhos têm opções
    baseProduct.selectionSections = [
      {
        id: 'section-temperatura',
        title: 'Temperatura de serviço',
        selectionType: 'single',
        isRequired: false,
        allowQuantity: false,
        options: [
          { id: 'temp-ambiente', title: 'Temperatura ambiente', price: 0 },
          { id: 'temp-gelado', title: 'Gelado', price: 0 },
        ],
      },
    ];
  }

  return baseProduct;
}

