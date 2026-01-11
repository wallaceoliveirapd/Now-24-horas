/**
 * Service de Produtos
 */

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

// Função auxiliar para normalizar produto - mapear campos do backend para frontend
function normalizeProduct(product: any): Product {
  // O backend retorna precoBase e precoFinal, mas o frontend espera preco e precoPromocional
  // precoBase -> preco (preço original)
  // precoFinal -> precoPromocional (se for menor que precoBase) ou preco (se for igual)
  
  let preco = 0;
  let precoPromocional: number | undefined = undefined;
  
  // Mapear precoBase para preco
  if (product.precoBase !== undefined && product.precoBase !== null) {
    const precoBaseNum = typeof product.precoBase === 'string' ? parseFloat(product.precoBase) : product.precoBase;
    if (!isNaN(precoBaseNum) && precoBaseNum > 0) {
      preco = precoBaseNum;
    }
  } else if (product.preco !== undefined && product.preco !== null) {
    // Fallback: se já vier como preco
    const precoNum = typeof product.preco === 'string' ? parseFloat(product.preco) : product.preco;
    if (!isNaN(precoNum) && precoNum > 0) {
      preco = precoNum;
    }
  }
  
  // Mapear precoFinal para precoPromocional (se for menor que precoBase)
  if (product.precoFinal !== undefined && product.precoFinal !== null) {
    const precoFinalNum = typeof product.precoFinal === 'string' ? parseFloat(product.precoFinal) : product.precoFinal;
    if (!isNaN(precoFinalNum) && precoFinalNum > 0) {
      // Se precoFinal é menor que precoBase, é um preço promocional
      if (precoFinalNum < preco && preco > 0) {
        precoPromocional = precoFinalNum;
      } else if (preco === 0) {
        // Se não há precoBase, usar precoFinal como preco
        preco = precoFinalNum;
      }
    }
  } else if (product.precoPromocional !== undefined && product.precoPromocional !== null) {
    // Fallback: se já vier como precoPromocional
    const precoPromoNum = typeof product.precoPromocional === 'string' ? parseFloat(product.precoPromocional) : product.precoPromocional;
    if (!isNaN(precoPromoNum) && precoPromoNum > 0) {
      precoPromocional = precoPromoNum;
    }
  }
  
  // Mapear imagemPrincipal para imagemUrl
  const imagemUrl = product.imagemPrincipal || product.imagemUrl;
  
  return {
    id: product.id,
    nome: product.nome || 'Produto sem nome',
    descricao: product.descricao || '',
    preco,
    precoPromocional,
    desconto: product.desconto || product.valorDesconto ? (product.desconto || (product.valorDesconto / preco * 100)) : undefined,
    imagemUrl,
    emOferta: product.emOferta || false,
    maisPopular: product.maisPopular || false,
    novidade: product.novidade || false,
    categoriaId: product.categoriaId,
    categoria: product.categoria,
  };
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
    
    // Normalizar produtos (garantir que preços sejam números)
    const normalizedProducts = response.data!.produtos.map(p => normalizeProduct(p));
    
    return {
      ...response.data!,
      produtos: normalizedProducts,
    };
  },

  /**
   * Obter produtos populares
   */
  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/popular?limit=${limit}`
    );
    // Normalizar produtos (garantir que preços sejam números)
    return response.data!.produtos.map(p => normalizeProduct(p));
  },

  /**
   * Obter produtos em oferta
   */
  async getOffersProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/offers?limit=${limit}`
    );
    // Normalizar produtos (garantir que preços sejam números)
    return response.data!.produtos.map(p => normalizeProduct(p));
  },

  /**
   * Obter produtos novos
   */
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get<{ produtos: Product[] }>(
      `/api/products/new?limit=${limit}`
    );
    // Normalizar produtos (garantir que preços sejam números)
    return response.data!.produtos.map(p => normalizeProduct(p));
  },

  /**
   * Obter produto por ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<{ produto: Product }>(`/api/products/${id}`);
    // Normalizar produto (garantir que preços sejam números)
    return normalizeProduct(response.data!.produto);
  },
};

