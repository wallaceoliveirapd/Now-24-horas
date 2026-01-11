import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '../../services/category.service';
import { productService, Product } from '../../services/product.service';

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

/**
 * Função para embaralhar array aleatoriamente (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
      setLoading(true);
      
      // Carregar dados em paralelo
      // Primeiro tenta pegar as principais, se não houver, pega todas
      const [principalCategoriesData, offersData, initialProductsResponse] = await Promise.all([
        categoryService.getPrincipalCategories(),
        productService.getOffersProducts(4),
        // Buscar TODOS os produtos (sem filtro de maisPopular) para a seção "Mais populares"
        // Carregar primeira página com limite de 8 produtos
        productService.getProducts({
          limite: 8, // Limite inicial para scroll infinito
          pagina: 1,
        }),
      ]);

      // Se não há categorias principais, pegar todas as categorias como fallback
      let categoriesData = principalCategoriesData;
      if (categoriesData.length === 0) {
        if (__DEV__) {
          console.warn('⚠️ useHomeData: Nenhuma categoria principal encontrada, usando todas as categorias');
        }
        try {
          const allCategories = await categoryService.getCategories();
          // Ordenar por ordem (crescente) e limitar a 7
          categoriesData = allCategories
            .sort((a, b) => {
              // Primeiro ordena por ordem, depois por nome se ordem for igual
              if (a.ordem !== b.ordem) {
                return a.ordem - b.ordem;
              }
              return a.nome.localeCompare(b.nome);
            })
            .slice(0, 7);
        } catch (fallbackError) {
          console.error('❌ useHomeData: Erro ao carregar categorias de fallback:', fallbackError);
          // Deixar array vazio, mas não quebrar o carregamento
          categoriesData = [];
        }
      } else {
        // Garantir que as principais também estejam ordenadas
        categoriesData = [...principalCategoriesData].sort((a, b) => {
          if (a.ordem !== b.ordem) {
            return a.ordem - b.ordem;
          }
          return a.nome.localeCompare(b.nome);
        });
      }

      // Embaralhar os produtos iniciais aleatoriamente para a seção "Mais populares"
      const shuffledProducts = shuffleArray(initialProductsResponse.produtos);

      setCategories(categoriesData);
      setOffersProducts(offersData);
      setPopularProducts(shuffledProducts);
      setPopularPage(1);
      // Verificar se há mais páginas para carregar
      setHasMorePopular(initialProductsResponse.paginacao.pagina < initialProductsResponse.paginacao.totalPaginas);
    } catch (err) {
      console.error('Erro ao carregar dados da Home:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar dados'));
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
      // Buscar próxima página de TODOS os produtos (sem filtro maisPopular)
      const response = await productService.getProducts({
        pagina: nextPage,
        limite: 8,
      });

      if (response.produtos.length > 0) {
        // Embaralhar os novos produtos antes de adicionar
        const shuffledNewProducts = shuffleArray(response.produtos);
        setPopularProducts(prev => [...prev, ...shuffledNewProducts]);
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

