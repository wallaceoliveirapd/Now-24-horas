/**
 * Service de Categorias
 */

import { apiClient } from './api/client';

export interface Category {
  id: string;
  nome: string;
  slug: string;
  icone?: string;
  descricao?: string;
  imagemUrl?: string;
  principal: boolean;
  mostraBadgeDesconto: boolean;
  ordem: number;
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
   * Listar apenas as 7 principais categorias (para Home)
   */
  async getPrincipalCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ categorias: Category[] }>('/api/categories?principais=true');
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

