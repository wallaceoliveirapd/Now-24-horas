import { useState, useEffect, useCallback, useRef } from 'react';
import { categoryService, Category } from '../../services/category.service';
import { productService, Product, ProductFilters } from '../../services/product.service';

export interface SearchFilters {
  categoriaId?: string;
  busca?: string;
  precoMin?: number; // em centavos
  precoMax?: number; // em centavos
  ordenarPor?: 'preco_asc' | 'preco_desc' | 'popularidade' | 'novidade' | 'nome_asc' | 'nome_desc';
}

export interface UseSearchData {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  hasMore: boolean;
  totalResults: number;
  currentPage: number;
  search: (query: string, filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

export function useSearchData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para busca e filtros
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  
  // Ref para debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar categorias principais e outras categorias
  const loadCategories = useCallback(async () => {
    try {
      // Carregar todas as categorias
      const allCategories = await categoryService.getCategories();
      
      // Separar em principais e outras
      const principalCategories = allCategories
        .filter(cat => cat.principal === true)
        .sort((a, b) => {
          // Ordenar por ordem (crescente), depois por nome
          if (a.ordem !== b.ordem) {
            return a.ordem - b.ordem;
          }
          return a.nome.localeCompare(b.nome);
        });
      
      const otherCategories = allCategories
        .filter(cat => cat.principal !== true)
        .sort((a, b) => {
          // Ordenar por ordem (crescente), depois por nome
          if (a.ordem !== b.ordem) {
            return a.ordem - b.ordem;
          }
          return a.nome.localeCompare(b.nome);
        });
      
      // Combinar: principais primeiro, depois outras
      const categoriesData = [...principalCategories, ...otherCategories];
      
      if (__DEV__ && principalCategories.length === 0) {
        console.warn('⚠️ useSearchData: Nenhuma categoria principal encontrada');
      }
      
      setCategories(categoriesData);
    } catch (err) {
      console.error('❌ Erro ao carregar categorias na Search:', err);
      // Não quebrar o carregamento se categorias falharem
      setCategories([]);
    }
  }, []);

  // Função para buscar produtos
  const performSearch = useCallback(async (
    query: string,
    filters: SearchFilters,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      // Preparar filtros para a API
      const apiFilters: ProductFilters = {
        pagina: page,
        limite: ITEMS_PER_PAGE,
      };

      // Adicionar busca se houver
      if (query.trim()) {
        apiFilters.busca = query.trim();
      }

      // Adicionar categoria se não for "todos"
      if (filters.categoriaId && filters.categoriaId !== 'todos') {
        apiFilters.categoriaId = filters.categoriaId;
      }

      // Adicionar filtros de preço
      if (filters.precoMin !== undefined) {
        apiFilters.precoMin = filters.precoMin;
      }
      if (filters.precoMax !== undefined) {
        apiFilters.precoMax = filters.precoMax;
      }

      // Adicionar ordenação
      if (filters.ordenarPor) {
        apiFilters.ordenarPor = filters.ordenarPor;
      }

      // Fazer requisição
      const response = await productService.getProducts(apiFilters);
      // Logs removidos para reduzir poluição do console

      if (append) {
        // Adicionar aos produtos existentes (paginação)
        setProducts(prev => [...prev, ...response.produtos]);
      } else {
        // Substituir produtos (nova busca)
        setProducts(response.produtos);
      }

      setTotalResults(response.paginacao.total);
      setCurrentPage(page);
      setHasMore(page < response.paginacao.totalPaginas);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      
      // Tratamento especial para rate limit
      if (err.code === 'RATE_LIMIT_EXCEEDED' || err.status === 429) {
        const rateLimitError = new Error('Muitas requisições. Aguarde alguns segundos antes de tentar novamente.');
        rateLimitError.name = 'RateLimitError';
        setError(rateLimitError);
      } else {
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar produtos'));
      }
      
      if (!append) {
        setProducts([]);
        setTotalResults(0);
      }
    }
  }, []);

  // Função de busca com debounce
  const search = useCallback(async (query: string, filters: SearchFilters) => {
    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Atualizar estados
    setCurrentQuery(query);
    setCurrentFilters(filters);
    setLoading(true);
    setError(null);

    // Se query está vazia e não há filtros, não buscar
    if (!query.trim() && !filters.categoriaId && filters.categoriaId !== 'todos') {
      // Se não há busca nem categoria, buscar todos os produtos
      await performSearch('', filters, 1, false);
      setLoading(false);
      return;
    }

    // Debounce: aguardar 800ms antes de buscar (aumentado para evitar rate limit)
    debounceTimerRef.current = setTimeout(async () => {
      await performSearch(query, filters, 1, false);
      setLoading(false);
    }, 800);
  }, [performSearch]);

  // Carregar mais produtos (paginação)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return;

    setLoading(true);
    const nextPage = currentPage + 1;
    await performSearch(currentQuery, currentFilters, nextPage, true);
    setLoading(false);
  }, [hasMore, loading, refreshing, currentPage, currentQuery, currentFilters, performSearch]);

  // Refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await performSearch(currentQuery, currentFilters, 1, false);
    setRefreshing(false);
  }, [currentQuery, currentFilters, performSearch]);

  // Carregar categorias e produtos iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Carregar categorias primeiro
        await loadCategories();
        
        // Carregar produtos iniciais (todos) - usar performSearch diretamente sem debounce
        await performSearch('', {}, 1, false);
      } catch (err) {
        console.error('❌ Erro ao carregar dados iniciais da Search:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar dados'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    refreshing,
    hasMore,
    totalResults,
    currentPage,
    search,
    loadMore,
    refresh,
  };
}

