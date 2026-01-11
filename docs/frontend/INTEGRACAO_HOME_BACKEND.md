# 🏠 Planejamento - Integração Backend na Home

**Data:** 2025-01-27  
**Objetivo:** Integrar os endpoints do backend na tela Home do aplicativo React Native

---

## 📋 Status Atual

### **Home Atual (Mock)**
A tela Home (`src/front/screens/Home.tsx`) atualmente utiliza:
- ✅ Categorias hardcoded (`categories` array)
- ✅ Produtos mockados (`mockProducts` de `src/data/mockProducts.ts`)
- ✅ Slider items hardcoded
- ✅ Loading states (skeleton) já implementados
- ✅ Refresh control já implementado
- ✅ Pull to refresh funcional

### **Backend Disponível**
Endpoints já implementados e prontos:
- ✅ `GET /api/categories` - Listar categorias ativas
- ✅ `GET /api/products/offers?limit=4` - Produtos em oferta
- ✅ `GET /api/products/popular?limit=8` - Produtos populares
- ✅ `GET /api/products/new?limit=10` - Produtos novos (opcional)
- ✅ `GET /api/users/me` - Dados do usuário logado (nome, email, etc)
- ✅ `GET /api/addresses` - Listar endereços do usuário
- ✅ `GET /api/cart` - Obter carrinho completo do usuário

### **Contexts Existentes**
- ✅ `AuthContext` - Já existe e carrega dados do usuário (`/api/users/me`)
- ✅ `AddressContext` - Existe mas usa dados mockados
- ✅ `CartContext` - Existe mas usa dados mockados

### **Infraestrutura Existente**
- ✅ API Client base (`src/services/api/client.ts`)
- ✅ Tipos TypeScript (`src/services/api/types.ts`)
- ✅ Tratamento de erros implementado
- ✅ Refresh token automático
- ⏳ Services específicos ainda não criados

---

## 🎯 Objetivo da Integração

Substituir todos os dados mockados da Home por dados reais do backend, mantendo:
- ✅ Performance e UX atuais
- ✅ Loading states e skeletons
- ✅ Pull to refresh
- ✅ Scroll infinito na seção "Mais populares"
- ✅ Tratamento de erros adequado
- ✅ Cache quando apropriado

---

## 📦 Dados Necessários na Home

### **1. Categorias** (Grid no topo)
- **Endpoint:** `GET /api/categories`
- **Onde usar:** `CategoryGrid` component
- **Atual:** Array hardcoded com 8 categorias
- **Dados necessários:** `id`, `nome`, `slug`, `icone` (URL da imagem)

### **2. Produtos em Oferta** (Carrossel horizontal)
- **Endpoint:** `GET /api/products/offers?limit=4`
- **Onde usar:** Primeira seção horizontal scroll
- **Atual:** Primeiros 4 produtos de `mockProducts`
- **Dados necessários:** `id`, `nome`, `descricao`, `preco`, `precoPromocional`, `desconto`, `imagemUrl`

### **3. Produtos Populares** (Grid com scroll infinito)
- **Endpoint:** `GET /api/products/popular?limit=8`
- **Onde usar:** Grid "Mais populares"
- **Atual:** Primeiros 8 produtos de `mockProducts` + paginação fake
- **Dados necessários:** Mesmos campos acima + paginação real

### **4. Slider de Banners** (Opcional - pode continuar mockado por enquanto)
- **Status:** Pode permanecer hardcoded por enquanto
- **Futuro:** Pode virar endpoint `/api/banners` ou `/api/promocoes`

### **5. Nome do Usuário** (HomeHeader)
- **Endpoint:** `GET /api/users/me` (já carregado no `AuthContext`)
- **Onde usar:** `HomeHeader` component - prop `firstName`
- **Atual:** Hardcoded como `"Wallace"`
- **Dados necessários:** Extrair primeiro nome de `user.nomeCompleto`
- **Nota:** `AuthContext` já carrega os dados, só precisa usar

### **6. Endereço Selecionado** (HomeHeader)
- **Endpoint:** `GET /api/addresses` - Listar endereços do usuário
- **Onde usar:** `HomeHeader` component - prop `address`
- **Atual:** Vem de `AddressContext` mas dados são mockados
- **Dados necessários:** Endereço padrão (`isDefault: true`) ou primeiro endereço
- **Formato de exibição:** `street, complement` ou apenas `street`

### **7. Carrinho** (Badge e FixedCartBar)
- **Endpoint:** `GET /api/cart` - Obter carrinho completo
- **Onde usar:** 
  - `HomeHeader` - badge de quantidade de itens
  - `FixedCartBar` - total de itens e preço
- **Atual:** Vem de `CartContext` mas dados são mockados
- **Dados necessários:** 
  - Total de itens: somar `quantidade` de todos os itens
  - Preço total: calcular subtotal + taxa de entrega - desconto do cupom

---

## 🏗️ Estrutura de Implementação

### **Fase 1: Criar Services**

#### **1.1 Service de Categorias**
**Arquivo:** `src/services/category.service.ts`

```typescript
import { apiClient } from './api/client';

export interface Category {
  id: string;
  nome: string;
  slug: string;
  icone?: string;
  descricao?: string;
  ativo: boolean;
}

export const categoryService = {
  /**
   * Listar todas as categorias ativas
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ categorias: Category[] }>('/api/categories');
    return response.data!.categorias;
  },

  /**
   * Obter categoria por ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<{ categoria: Category }>(`/api/categories/${id}`);
    return response.data!.categoria;
  },

  /**
   * Obter categoria por slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<{ categoria: Category }>(`/api/categories/slug/${slug}`);
    return response.data!.categoria;
  },
};
```

#### **1.2 Service de Produtos**
**Arquivo:** `src/services/product.service.ts`

```typescript
import { apiClient } from './api/client';

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number; // em centavos
  precoPromocional?: number; // em centavos
  desconto?: number; // percentual
  imagemUrl?: string;
  emOferta: boolean;
  maisPopular: boolean;
  novidade: boolean;
  categoriaId: string;
  categoria?: {
    id: string;
    nome: string;
    slug: string;
  };
  // ... outros campos conforme schema do backend
}

export interface ProductsResponse {
  produtos: Product[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface ProductFilters {
  categoriaId?: string;
  busca?: string;
  precoMin?: number;
  precoMax?: number;
  emOferta?: boolean;
  maisPopular?: boolean;
  novidade?: boolean;
  ordenarPor?: 'preco_asc' | 'preco_desc' | 'popularidade' | 'novidade' | 'nome_asc' | 'nome_desc';
  pagina?: number;
  limite?: number;
}

export const productService = {
  /**
   * Listar produtos com filtros
   */
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.categoriaId) params.append('categoriaId', filters.categoriaId);
    if (filters?.busca) params.append('busca', filters.busca);
    if (filters?.precoMin) params.append('precoMin', filters.precoMin.toString());
    if (filters?.precoMax) params.append('precoMax', filters.precoMax.toString());
    if (filters?.emOferta !== undefined) params.append('emOferta', filters.emOferta.toString());
    if (filters?.maisPopular !== undefined) params.append('maisPopular', filters.maisPopular.toString());
    if (filters?.novidade !== undefined) params.append('novidade', filters.novidade.toString());
    if (filters?.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
    if (filters?.pagina) params.append('pagina', filters.pagina.toString());
    if (filters?.limite) params.append('limite', filters.limite.toString());

    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ProductsResponse>(endpoint);
    return response.data!;
  },

  /**
   * Obter produtos populares
   */
  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/popular?limit=${limit}`
    );
    return response.data!.produtos;
  },

  /**
   * Obter produtos em oferta
   */
  async getOffersProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/offers?limit=${limit}`
    );
    return response.data!.produtos;
  },

  /**
   * Obter produtos novos
   */
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/new?limit=${limit}`
    );
    return response.data!.produtos;
  },

  /**
   * Obter produto por ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<{ produto: Product }>(`/api/products/${id}`);
    return response.data!.produto;
  },
};
```

#### **1.3 Service de Endereços**
**Arquivo:** `src/services/address.service.ts`

```typescript
import { apiClient } from './api/client';

export interface Address {
  id: string;
  tipo: 'Casa' | 'Trabalho' | 'Outro';
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
  referencia?: string;
}

export const addressService = {
  /**
   * Listar endereços do usuário
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<{ addresses: Address[] }>('/api/addresses');
    return response.data!.addresses;
  },

  /**
   * Obter endereço por ID
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<{ address: Address }>(`/api/addresses/${id}`);
    return response.data!.address;
  },

  /**
   * Criar novo endereço
   */
  async createAddress(data: {
    tipo: 'Casa' | 'Trabalho' | 'Outro';
    rua: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    referencia?: string;
    isDefault?: boolean;
  }): Promise<Address> {
    const response = await apiClient.post<{ address: Address }>('/api/addresses', data);
    return response.data!.address;
  },

  /**
   * Atualizar endereço
   */
  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const response = await apiClient.put<{ address: Address }>(`/api/addresses/${id}`, data);
    return response.data!.address;
  },

  /**
   * Deletar endereço
   */
  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/api/addresses/${id}`);
  },

  /**
   * Definir endereço como padrão
   */
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.patch<{ address: Address }>(`/api/addresses/${id}/set-default`);
    return response.data!.address;
  },
};
```

#### **1.4 Service de Carrinho**
**Arquivo:** `src/services/cart.service.ts`

```typescript
import { apiClient } from './api/client';

export interface CartItem {
  id: string;
  produtoId: string;
  quantidade: number;
  personalizacoes?: Record<string, any>; // Personalizações do produto
  precoUnitario: number; // em centavos
  precoTotal: number; // em centavos
  produto: {
    id: string;
    nome: string;
    descricao: string;
    imagemUrl?: string;
    preco: number;
    precoPromocional?: number;
  };
}

export interface AppliedCoupon {
  id: string;
  codigo: string;
  tipoDesconto: 'fixo' | 'percentual';
  valorDesconto: number; // em centavos ou percentual
  descricao?: string;
  validade?: string;
}

export interface Cart {
  itens: CartItem[];
  cupom?: AppliedCoupon;
  subtotal: number; // em centavos
  desconto: number; // em centavos
  taxaEntrega: number; // em centavos
  total: number; // em centavos
  totalItens: number; // quantidade total de itens
}

export const cartService = {
  /**
   * Obter carrinho completo
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data!;
  },

  /**
   * Adicionar item ao carrinho
   */
  async addItem(data: {
    produtoId: string;
    quantidade: number;
    personalizacoes?: Record<string, any>;
  }): Promise<CartItem> {
    const response = await apiClient.post<{ item: CartItem }>('/api/cart/items', data);
    return response.data!.item;
  },

  /**
   * Atualizar quantidade de um item
   */
  async updateItemQuantity(itemId: string, quantidade: number): Promise<CartItem> {
    const response = await apiClient.put<{ item: CartItem }>(
      `/api/cart/items/${itemId}`,
      { quantidade }
    );
    return response.data!.item;
  },

  /**
   * Remover item do carrinho
   */
  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/api/cart/items/${itemId}`);
  },

  /**
   * Limpar carrinho
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/api/cart');
  },

  /**
   * Aplicar cupom
   */
  async applyCoupon(codigo: string): Promise<AppliedCoupon> {
    const response = await apiClient.post<{ cupom: AppliedCoupon }>(
      '/api/cart/apply-coupon',
      { codigo }
    );
    return response.data!.cupom;
  },

  /**
   * Remover cupom
   */
  async removeCoupon(): Promise<void> {
    await apiClient.delete('/api/cart/coupon');
  },
};
```

---

### **Fase 2: Atualizar Contexts (Endereços e Carrinho)**

#### **2.1 Atualizar AddressContext**
**Arquivo:** `src/contexts/AddressContext.tsx`

**Mudanças necessárias:**
1. Importar `addressService` de `src/services/address.service`
2. Carregar endereços do backend quando usuário estiver autenticado
3. Sincronizar operações (add, update, delete, setDefault) com backend
4. Manter endereço padrão como selecionado automaticamente

**Exemplo de atualização:**
```typescript
import { addressService, Address as BackendAddress } from '../services/address.service';
import { useAuth } from './AuthContext';

// No AddressProvider:
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    loadAddresses();
  } else {
    // Limpar endereços se não estiver autenticado
    setAddresses([]);
    setSelectedAddressId(null);
  }
}, [isAuthenticated]);

const loadAddresses = useCallback(async () => {
  try {
    const backendAddresses = await addressService.getAddresses();
    // Converter formato do backend para formato do context
    const converted = backendAddresses.map(convertBackendToContext);
    setAddresses(converted);
    
    // Selecionar endereço padrão ou primeiro
    const defaultAddr = converted.find(a => a.isDefault) || converted[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    }
  } catch (error) {
    console.error('Erro ao carregar endereços:', error);
  }
}, []);
```

#### **2.2 Atualizar CartContext**
**Arquivo:** `src/contexts/CartContext.tsx`

**Mudanças necessárias:**
1. Importar `cartService` de `src/services/cart.service`
2. Carregar carrinho do backend quando usuário estiver autenticado
3. Converter dados do backend para o formato do context
4. Sincronizar todas as operações com backend

**Pontos importantes:**
- Manter compatibilidade com a interface atual
- Converter `Cart` do backend para `CartItem[]` do context
- Manter `totalItems` sincronizado
- Converter cupom do backend para `AppliedCoupon` do context

---

### **Fase 3: Atualizar Home Screen**

#### **3.1 Usar nome do usuário**
O `AuthContext` já carrega os dados do usuário via `GET /api/users/me`. 
Basta extrair o primeiro nome:

```typescript
import { useAuth } from '../../contexts/AuthContext';

const { user } = useAuth();

const firstName = useMemo(() => {
  if (!user?.nomeCompleto) return 'Olá';
  const parts = user.nomeCompleto.split(' ');
  return parts[0] || 'Olá';
}, [user?.nomeCompleto]);
```

#### **3.2 Usar endereço selecionado**
Após atualizar o `AddressContext` (Fase 2.1), o endereço já estará disponível:

```typescript
const { selectedAddress } = useAddress();

const addressDisplay = useMemo(() => {
  if (!selectedAddress) return 'Selecione um endereço';
  const parts = [selectedAddress.street || selectedAddress.rua];
  if (selectedAddress.complement || selectedAddress.numero) {
    parts.push(selectedAddress.complement || selectedAddress.numero);
  }
  return parts.join(', ');
}, [selectedAddress]);
```

#### **3.3 Usar dados do carrinho**
Após atualizar o `CartContext` (Fase 2.2), os dados do carrinho já estarão disponíveis:

```typescript
const { items: cartItems, totalItems, appliedCoupon } = useCart();

// O totalItems e totalPrice já são calculados no context
// A FixedCartBar já está usando corretamente
```

#### **3.4 Criar Hook Customizado (Opcional, mas recomendado)**
**Arquivo:** `src/front/hooks/useHomeData.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '../../../services/category.service';
import { productService, Product } from '../../../services/product.service';

export interface HomeData {
  categories: Category[];
  offersProducts: Product[];
  popularProducts: Product[];
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadMorePopular: () => Promise<void>;
  hasMorePopular: boolean;
}

export function useHomeData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [offersProducts, setOffersProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [popularPage, setPopularPage] = useState(1);
  const [hasMorePopular, setHasMorePopular] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // Carregar dados em paralelo
      const [categoriesData, offersData, popularData] = await Promise.all([
        categoryService.getCategories(),
        productService.getOffersProducts(4),
        productService.getPopularProducts(8),
      ]);

      setCategories(categoriesData);
      setOffersProducts(offersData);
      setPopularProducts(popularData);
      setPopularPage(1);
      setHasMorePopular(popularData.length >= 8);
    } catch (err) {
      console.error('Erro ao carregar dados da Home:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const loadMorePopular = useCallback(async () => {
    if (!hasMorePopular || refreshing) return;

    try {
      const nextPage = popularPage + 1;
      const response = await productService.getProducts({
        maisPopular: true,
        pagina: nextPage,
        limite: 8,
      });

      if (response.produtos.length > 0) {
        setPopularProducts(prev => [...prev, ...response.produtos]);
        setPopularPage(nextPage);
        setHasMorePopular(response.paginacao.pagina < response.paginacao.totalPaginas);
      } else {
        setHasMorePopular(false);
      }
    } catch (err) {
      console.error('Erro ao carregar mais produtos populares:', err);
    }
  }, [popularPage, hasMorePopular, refreshing]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    categories,
    offersProducts,
    popularProducts,
    loading,
    error,
    refreshing,
    refresh,
    loadMorePopular,
    hasMorePopular,
  };
}
```

#### **3.5 Atualizar Home.tsx**

**Mudanças principais:**

1. **Importar services e hook:**
```typescript
import { useHomeData } from '../hooks/useHomeData';
import { Category } from '../../../services/category.service';
import { Product } from '../../../services/product.service';
```

2. **Substituir estados mockados:**
```typescript
// Remover:
// const [popularProducts, setPopularProducts] = useState(...)
// const categories: CategoryItem[] = useMemo(() => [...], []);

// Adicionar:
const {
  categories,
  offersProducts,
  popularProducts,
  loading,
  error,
  refreshing: dataRefreshing,
  refresh: refreshData,
  loadMorePopular,
  hasMorePopular,
} = useHomeData();
```

3. **Atualizar onRefresh:**
```typescript
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await refreshData();
  setRefreshing(false);
}, [refreshData]);
```

4. **Atualizar loadMoreProducts:**
```typescript
const loadMoreProducts = useCallback(() => {
  if (hasMorePopular && !loadingMore) {
    setLoadingMore(true);
    loadMorePopular().finally(() => setLoadingMore(false));
  }
}, [hasMorePopular, loadingMore, loadMorePopular]);
```

5. **Converter dados do backend para formato do componente:**

**Categorias:**
```typescript
const categoryItems: CategoryItem[] = useMemo(() => {
  return categories.map(category => {
    // Mapear ícone da categoria
    // Se a categoria tem ícone URL, usar ela
    // Se não, usar imagem local baseada no slug
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
      type: 'Default' as const,
      iconSource: getCategoryImage(),
    };
  });
}, [categories]);
```

**Produtos:**
```typescript
// Helper para converter Product do backend para formato do ProductCard
const convertProductToCard = (product: Product) => {
  const hasDiscount = product.precoPromocional && product.precoPromocional < product.preco;
  const discountPercent = hasDiscount && product.preco
    ? Math.round(((product.preco - product.precoPromocional!) / product.preco) * 100)
    : undefined;

  return {
    id: product.id,
    title: product.nome,
    description: product.descricao,
    showDriver: product.maisPopular || false,
    driverLabel: product.maisPopular ? 'Popular' : undefined,
    basePrice: hasDiscount ? `R$ ${(product.preco / 100).toFixed(2).replace('.', ',')}` : undefined,
    finalPrice: `R$ ${((product.precoPromocional || product.preco) / 100).toFixed(2).replace('.', ',')}`,
    discountValue: discountPercent ? `${discountPercent}%` : undefined,
    type: (product.emOferta ? 'Offer' : 'Default') as 'Offer' | 'Default',
    imageSource: product.imagemUrl ? { uri: product.imagemUrl } : undefined,
  };
};
```

6. **Atualizar renderização:**
```typescript
{/* Category Grid */}
<CategoryGrid 
  categories={categoryItems}
  columns={4}
  onCategoryPress={handleCategoryPress}
/>

{/* Ofertas do dia */}
{offersProducts.map((product) => (
  <ProductCard 
    key={product.id}
    {...convertProductToCard(product)}
    onPress={() => handleProductPress(product.id)}
  />
))}

{/* Mais populares */}
{popularProducts.map((product) => (
  <ProductCard 
    key={product.id}
    {...convertProductToCard(product)}
    style={styles.popularCard}
    onPress={() => handleProductPress(product.id)}
  />
))}
```

7. **Adicionar tratamento de erro:**
```typescript
{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      {error.message || 'Erro ao carregar dados. Toque para tentar novamente.'}
    </Text>
    <TouchableOpacity onPress={refreshData} style={styles.retryButton}>
      <Text style={styles.retryButtonText}>Tentar novamente</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 📝 Checklist de Implementação

### **Fase 1: Criar Services**
- [ ] Criar `src/services/category.service.ts`
- [ ] Criar `src/services/product.service.ts`
- [ ] Criar `src/services/address.service.ts`
- [ ] Criar `src/services/cart.service.ts`
- [ ] Adicionar tipos TypeScript adequados
- [ ] Testar services isoladamente (console.log)

### **Fase 2: Atualizar Contexts**
- [ ] Atualizar `AddressContext` para usar `addressService`
- [ ] Carregar endereços do backend quando autenticado
- [ ] Sincronizar operações CRUD de endereços
- [ ] Atualizar `CartContext` para usar `cartService`
- [ ] Carregar carrinho do backend quando autenticado
- [ ] Converter dados do backend para formato do context
- [ ] Sincronizar operações do carrinho (add, update, remove)
- [ ] Sincronizar aplicação/remoção de cupom

### **Fase 3: Atualizar Home Screen**
- [ ] Extrair primeiro nome do usuário (`useAuth`)
- [ ] Usar endereço selecionado do `AddressContext`
- [ ] Usar dados do carrinho do `CartContext`
- [ ] Criar `src/front/hooks/useHomeData.ts` (opcional)
- [ ] Importar services/hook
- [ ] Remover imports de mockProducts
- [ ] Substituir estados mockados
- [ ] Criar função de conversão de dados
- [ ] Atualizar renderização de categorias
- [ ] Atualizar renderização de ofertas
- [ ] Atualizar renderização de populares
- [ ] Atualizar `HomeHeader` com nome do usuário
- [ ] Atualizar `HomeHeader` com endereço selecionado
- [ ] Verificar badge do carrinho no header
- [ ] Verificar `FixedCartBar` com dados do backend
- [ ] Atualizar onRefresh
- [ ] Atualizar loadMoreProducts
- [ ] Adicionar tratamento de erros na UI
- [ ] Manter skeletons durante loading

### **Fase 4: Testes e Ajustes**
- [ ] Testar com backend rodando
- [ ] Testar sem backend (erro de conexão)
- [ ] Testar com usuário autenticado (nome, endereço, carrinho)
- [ ] Testar com usuário não autenticado (fallbacks apropriados)
- [ ] Testar pull to refresh
- [ ] Testar scroll infinito
- [ ] Testar navegação para detalhes do produto
- [ ] Testar navegação por categoria
- [ ] Verificar performance
- [ ] Verificar imagens (fallbacks se necessário)

### **Fase 5: Otimizações (Opcional)**
- [ ] Implementar cache de categorias (AsyncStorage)
- [ ] Implementar cache de produtos populares
- [ ] Otimizar carregamento de imagens
- [ ] Adicionar prefetch de dados

---

## 🐛 Tratamento de Erros

### **Cenários a Tratar:**

1. **Erro de Conexão (Network Error)**
   - Mostrar mensagem: "Sem conexão com a internet"
   - Botão "Tentar novamente"
   - Opcional: Mostrar dados em cache se disponível

2. **Erro 401 (Não Autenticado)**
   - Home não requer autenticação
   - Se backend retornar 401, tratar como erro genérico

3. **Erro 500 (Erro do Servidor)**
   - Mostrar mensagem: "Erro ao carregar dados. Tente novamente mais tarde."
   - Botão "Tentar novamente"

4. **Dados Vazios**
   - Se não houver categorias: mostrar skeleton vazio ou mensagem
   - Se não houver produtos: mostrar estado vazio apropriado

5. **Timeout**
   - Após X segundos, mostrar erro de timeout
   - Permitir tentar novamente

---

## 🔄 Fluxo de Dados

```
Home Screen
    ↓
useHomeData Hook (ou diretamente nos services)
    ↓
Category Service / Product Service
    ↓
API Client (com token, interceptors, etc)
    ↓
Backend API
    ↓
Resposta → Hook → Home Screen (estado atualizado)
```

---

## 📱 Estados da UI

1. **Loading Inicial:** Mostrar skeletons (já implementado)
2. **Dados Carregados:** Mostrar conteúdo normal
3. **Erro:** Mostrar mensagem de erro + botão retry
4. **Refreshing:** Manter conteúdo visível + indicador de refresh
5. **Loading More:** Mostrar indicador no final da lista

---

## 🎨 Ajustes de UI Necessários

1. **Imagens de Categorias:**
   - Se backend retornar URL, usar ela
   - Se não, manter fallback para imagens locais
   - Considerar placeholder genérico

2. **Imagens de Produtos:**
   - Se backend retornar URL, usar ela
   - Adicionar placeholder se imagem não carregar
   - Considerar cache de imagens

3. **Preços:**
   - Converter centavos para formato brasileiro (R$ X,XX)
   - Garantir formatação consistente

4. **Nome do Usuário:**
   - Se não autenticado: mostrar "Olá" ou "Bem-vindo"
   - Se autenticado: mostrar primeiro nome de `user.nomeCompleto`

5. **Endereço:**
   - Se não autenticado: mostrar "Selecione um endereço" ou ocultar
   - Se autenticado mas sem endereços: mostrar mensagem para adicionar
   - Se autenticado com endereços: mostrar endereço padrão ou primeiro

6. **Carrinho:**
   - Se não autenticado: não mostrar badge ou mostrar 0
   - Se autenticado: mostrar quantidade real do carrinho do backend
   - FixedCartBar só aparece quando há itens e usuário autenticado

---

## ⚠️ Considerações Importantes

### **Autenticação**
Alguns dados da Home requerem autenticação:
- ✅ **Nome do usuário:** Requer autenticação (`/api/users/me`)
- ✅ **Endereço selecionado:** Requer autenticação (`/api/addresses`)
- ✅ **Carrinho:** Requer autenticação (`/api/cart`)
- ❌ **Categorias:** Não requer autenticação (público)
- ❌ **Produtos:** Não requerem autenticação (público)

**Tratamento:**
- Verificar `isAuthenticated` do `AuthContext` antes de carregar dados sensíveis
- Mostrar fallbacks apropriados quando não autenticado
- Não bloquear visualização da Home para usuários não autenticados
- Permitir navegação e visualização de produtos sem login

---

## ⚙️ Configuração Necessária

### **Variável de Ambiente**
Garantir que `.env.local` tenha:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
# ou o IP da máquina se testar em dispositivo físico
```

### **Backend Rodando**
Garantir que o backend está rodando e acessível:
```bash
npm run api:dev
```

---

## 📚 Próximos Passos

Após completar esta integração:

1. ✅ Integrar outras telas (Search, ProductDetails, etc)
2. ✅ Integrar carrinho com backend
3. ✅ Integrar autenticação
4. ✅ Implementar cache mais robusto
5. ✅ Otimizar performance

---

## 🔍 Referências

- **Arquivo Home atual:** `src/front/screens/Home.tsx`
- **API Client:** `src/services/api/client.ts`
- **Tipos API:** `src/services/api/types.ts`
- **Backend Routes:** 
  - `src/back/api/routes/category.routes.ts`
  - `src/back/api/routes/product.routes.ts`
- **Planejamento Geral:** `docs/frontend/PLANEJAMENTO_INTEGRACAO_FRONTEND.md`

---

**Última atualização:** 2025-01-27  
**Status:** 📋 Planejamento criado - Pronto para implementação

