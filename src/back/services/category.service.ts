import { db } from '../config/database';
import { categorias } from '../models/schema';
import { eq, and, asc } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar categorias
 */
export class CategoryService {
  /**
   * Listar todas as categorias ativas, ordenadas por ordem
   */
  async getActiveCategories() {
    return await db
      .select()
      .from(categorias)
      .where(eq(categorias.ativo, true))
      .orderBy(asc(categorias.ordem), asc(categorias.nome));
  }

  /**
   * Listar apenas as 7 principais categorias (para exibição na Home)
   */
  async getPrincipalCategories() {
    return await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.ativo, true),
          eq(categorias.principal, true)
        )
      )
      .orderBy(asc(categorias.ordem), asc(categorias.nome))
      .limit(7);
  }

  /**
   * Obter categoria por ID
   */
  async getCategoryById(categoryId: string) {
    const [category] = await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.id, categoryId),
          eq(categorias.ativo, true)
        )
      )
      .limit(1);

    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  /**
   * Obter categoria por slug
   */
  async getCategoryBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categorias)
      .where(
        and(
          eq(categorias.slug, slug),
          eq(categorias.ativo, true)
        )
      )
      .limit(1);

    if (!category) {
      throw createError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }
}

export const categoryService = new CategoryService();

