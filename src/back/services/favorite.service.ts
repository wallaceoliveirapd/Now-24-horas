import { db } from '../config/database';
import { favoritos, produtos } from '../models/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar favoritos
 */
export class FavoriteService {
  /**
   * Listar favoritos do usuário
   */
  async getUserFavorites(userId: string) {
    const favorites = await db
      .select({
        id: favoritos.id,
        produtoId: favoritos.produtoId,
        criadoEm: favoritos.criadoEm,
        produto: {
          id: produtos.id,
          nome: produtos.nome,
          descricao: produtos.descricao,
          imagemPrincipal: produtos.imagemPrincipal,
          precoBase: produtos.precoBase,
          precoFinal: produtos.precoFinal,
          valorDesconto: produtos.valorDesconto,
          estoque: produtos.estoque,
          statusEstoque: produtos.statusEstoque,
          ativo: produtos.ativo,
        },
      })
      .from(favoritos)
      .innerJoin(produtos, eq(favoritos.produtoId, produtos.id))
      .where(
        and(
          eq(favoritos.usuarioId, userId),
          eq(produtos.ativo, true)
        )
      )
      .orderBy(favoritos.criadoEm);

    return favorites;
  }

  /**
   * Verificar se produto está nos favoritos
   */
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favoritos)
      .where(
        and(
          eq(favoritos.usuarioId, userId),
          eq(favoritos.produtoId, productId)
        )
      )
      .limit(1);

    return !!favorite;
  }

  /**
   * Adicionar produto aos favoritos
   */
  async addFavorite(userId: string, productId: string) {
    // Verificar se produto existe e está ativo
    const [product] = await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.id, productId),
          eq(produtos.ativo, true)
        )
      )
      .limit(1);

    if (!product) {
      throw createError('Produto não encontrado ou inativo', 404, 'PRODUCT_NOT_FOUND');
    }

    // Verificar se já está nos favoritos
    const isAlreadyFavorite = await this.isFavorite(userId, productId);
    if (isAlreadyFavorite) {
      throw createError('Produto já está nos favoritos', 400, 'ALREADY_FAVORITE');
    }

    // Adicionar aos favoritos
    const [favorite] = await db
      .insert(favoritos)
      .values({
        usuarioId: userId,
        produtoId: productId,
      })
      .returning();

    return favorite;
  }

  /**
   * Remover produto dos favoritos
   */
  async removeFavorite(userId: string, productId: string) {
    // Verificar se está nos favoritos
    const [favorite] = await db
      .select()
      .from(favoritos)
      .where(
        and(
          eq(favoritos.usuarioId, userId),
          eq(favoritos.produtoId, productId)
        )
      )
      .limit(1);

    if (!favorite) {
      throw createError('Produto não está nos favoritos', 404, 'FAVORITE_NOT_FOUND');
    }

    // Remover dos favoritos
    await db
      .delete(favoritos)
      .where(eq(favoritos.id, favorite.id));

    return { success: true };
  }

  /**
   * Toggle favorito (adicionar se não existe, remover se existe)
   */
  async toggleFavorite(userId: string, productId: string) {
    const isFavorite = await this.isFavorite(userId, productId);

    if (isFavorite) {
      await this.removeFavorite(userId, productId);
      return { favoritado: false, message: 'Produto removido dos favoritos' };
    } else {
      await this.addFavorite(userId, productId);
      return { favoritado: true, message: 'Produto adicionado aos favoritos' };
    }
  }

  /**
   * Contar favoritos do usuário
   */
  async countUserFavorites(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(favoritos)
      .where(eq(favoritos.usuarioId, userId));

    return Number(result[0]?.count || 0);
  }
}

export const favoriteService = new FavoriteService();

