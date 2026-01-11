import { db } from '../config/database';
import { avaliacoesProdutos, avaliacoesPedidos, produtos, pedidos, itensPedido } from '../models/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar avaliações de produtos
 */
export class ReviewService {
  /**
   * Listar avaliações de um produto (apenas aprovadas)
   */
  async getProductReviews(productId: string, pagina: number = 1, limite: number = 10) {
    const offset = (pagina - 1) * limite;

    const reviews = await db
      .select({
        id: avaliacoesProdutos.id,
        produtoId: avaliacoesProdutos.produtoId,
        usuarioId: avaliacoesProdutos.usuarioId,
        pedidoId: avaliacoesProdutos.pedidoId,
        nota: avaliacoesProdutos.nota,
        comentario: avaliacoesProdutos.comentario,
        imagens: avaliacoesProdutos.imagens,
        criadoEm: avaliacoesProdutos.criadoEm,
        atualizadoEm: avaliacoesProdutos.atualizadoEm,
      })
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.produtoId, productId),
          eq(avaliacoesProdutos.aprovado, true)
        )
      )
      .orderBy(desc(avaliacoesProdutos.criadoEm))
      .limit(limite)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.produtoId, productId),
          eq(avaliacoesProdutos.aprovado, true)
        )
      );

    const total = totalResult?.count || 0;

    return {
      avaliacoes: reviews,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  /**
   * Criar avaliação de produto
   */
  async createProductReview(
    productId: string,
    userId: string,
    data: {
      nota: number;
      comentario?: string;
      imagens?: string[];
      pedidoId?: string;
    }
  ) {
    // Validar nota
    if (data.nota < 1 || data.nota > 5) {
      throw createError('Nota deve ser entre 1 e 5', 400, 'INVALID_RATING');
    }

    // Verificar se produto existe
    const [product] = await db
      .select()
      .from(produtos)
      .where(eq(produtos.id, productId))
      .limit(1);

    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    // Se pedidoId foi fornecido, validar que o usuário comprou o produto neste pedido
    if (data.pedidoId) {
      const [orderItem] = await db
        .select()
        .from(itensPedido)
        .where(
          and(
            eq(itensPedido.pedidoId, data.pedidoId),
            eq(itensPedido.produtoId, productId)
          )
        )
        .limit(1);

      if (!orderItem) {
        throw createError(
          'Produto não encontrado neste pedido',
          400,
          'PRODUCT_NOT_IN_ORDER'
        );
      }

      // Verificar se pedido pertence ao usuário
      const [order] = await db
        .select()
        .from(pedidos)
        .where(
          and(
            eq(pedidos.id, data.pedidoId),
            eq(pedidos.usuarioId, userId)
          )
        )
        .limit(1);

      if (!order) {
        throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
      }
    }

    // Verificar se usuário já avaliou este produto
    const [existingReview] = await db
      .select()
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.produtoId, productId),
          eq(avaliacoesProdutos.usuarioId, userId)
        )
      )
      .limit(1);

    if (existingReview) {
      throw createError(
        'Você já avaliou este produto',
        409,
        'REVIEW_ALREADY_EXISTS'
      );
    }

    // Criar avaliação (pendente de aprovação)
    const [review] = await db
      .insert(avaliacoesProdutos)
      .values({
        produtoId: productId,
        usuarioId: userId,
        pedidoId: data.pedidoId || null,
        nota: data.nota,
        comentario: data.comentario || null,
        imagens: data.imagens ? data.imagens : null,
        aprovado: false, // Requer aprovação
      })
      .returning();

    return review;
  }

  /**
   * Atualizar avaliação de produto
   */
  async updateProductReview(
    reviewId: string,
    userId: string,
    data: {
      nota?: number;
      comentario?: string;
      imagens?: string[];
    }
  ) {
    // Verificar se avaliação existe e pertence ao usuário
    const [review] = await db
      .select()
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.id, reviewId),
          eq(avaliacoesProdutos.usuarioId, userId)
        )
      )
      .limit(1);

    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    // Validar nota se fornecida
    if (data.nota !== undefined && (data.nota < 1 || data.nota > 5)) {
      throw createError('Nota deve ser entre 1 e 5', 400, 'INVALID_RATING');
    }

    // Atualizar avaliação
    const [updatedReview] = await db
      .update(avaliacoesProdutos)
      .set({
        nota: data.nota ?? review.nota,
        comentario: data.comentario !== undefined ? data.comentario : review.comentario,
        imagens: data.imagens !== undefined ? data.imagens : review.imagens,
        atualizadoEm: new Date(),
        aprovado: false, // Reverter aprovação ao editar
      })
      .where(eq(avaliacoesProdutos.id, reviewId))
      .returning();

    return updatedReview;
  }

  /**
   * Deletar avaliação de produto
   */
  async deleteProductReview(reviewId: string, userId: string) {
    // Verificar se avaliação existe e pertence ao usuário
    const [review] = await db
      .select()
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.id, reviewId),
          eq(avaliacoesProdutos.usuarioId, userId)
        )
      )
      .limit(1);

    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    // Deletar avaliação
    await db.delete(avaliacoesProdutos).where(eq(avaliacoesProdutos.id, reviewId));

    // Atualizar média do produto
    await this.updateProductRating(review.produtoId);

    return { success: true };
  }

  /**
   * Atualizar média de avaliações do produto
   */
  async updateProductRating(productId: string) {
    const [stats] = await db
      .select({
        media: sql<number>`COALESCE(AVG(${avaliacoesProdutos.nota}), 0)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(avaliacoesProdutos)
      .where(
        and(
          eq(avaliacoesProdutos.produtoId, productId),
          eq(avaliacoesProdutos.aprovado, true)
        )
      );

    const media = typeof stats.media === 'number' ? stats.media : parseFloat(String(stats.media)) || 0;
    const total = typeof stats.total === 'number' ? stats.total : parseInt(String(stats.total)) || 0;

    await db
      .update(produtos)
      .set({
        avaliacaoMedia: media.toFixed(2) as any, // Decimal type
        quantidadeAvaliacoes: total,
      })
      .where(eq(produtos.id, productId));
  }

  /**
   * Criar avaliação de pedido
   */
  async createOrderReview(
    orderId: string,
    userId: string,
    data: {
      notaProdutos?: number;
      notaEntrega?: number;
      notaAtendimento?: number;
      comentario?: string;
    }
  ) {
    // Verificar se pedido existe e pertence ao usuário
    const [order] = await db
      .select()
      .from(pedidos)
      .where(
        and(
          eq(pedidos.id, orderId),
          eq(pedidos.usuarioId, userId)
        )
      )
      .limit(1);

    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    // Verificar se pedido foi entregue
    if (order.status !== 'entregue') {
      throw createError(
        'Apenas pedidos entregues podem ser avaliados',
        400,
        'ORDER_NOT_DELIVERED'
      );
    }

    // Verificar se já existe avaliação
    const [existingReview] = await db
      .select()
      .from(avaliacoesPedidos)
      .where(
        and(
          eq(avaliacoesPedidos.pedidoId, orderId),
          eq(avaliacoesPedidos.usuarioId, userId)
        )
      )
      .limit(1);

    if (existingReview) {
      throw createError(
        'Pedido já foi avaliado',
        409,
        'ORDER_ALREADY_REVIEWED'
      );
    }

    // Validar notas
    if (data.notaProdutos !== undefined && (data.notaProdutos < 1 || data.notaProdutos > 5)) {
      throw createError('Nota de produtos deve ser entre 1 e 5', 400, 'INVALID_RATING');
    }
    if (data.notaEntrega !== undefined && (data.notaEntrega < 1 || data.notaEntrega > 5)) {
      throw createError('Nota de entrega deve ser entre 1 e 5', 400, 'INVALID_RATING');
    }
    if (data.notaAtendimento !== undefined && (data.notaAtendimento < 1 || data.notaAtendimento > 5)) {
      throw createError('Nota de atendimento deve ser entre 1 e 5', 400, 'INVALID_RATING');
    }

    // Criar avaliação
    const [review] = await db
      .insert(avaliacoesPedidos)
      .values({
        pedidoId: orderId,
        usuarioId: userId,
        notaProdutos: data.notaProdutos || null,
        notaEntrega: data.notaEntrega || null,
        notaAtendimento: data.notaAtendimento || null,
        comentario: data.comentario || null,
      })
      .returning();

    return review;
  }

  /**
   * Obter avaliação de pedido
   */
  async getOrderReview(orderId: string, userId: string) {
    const [review] = await db
      .select()
      .from(avaliacoesPedidos)
      .where(
        and(
          eq(avaliacoesPedidos.pedidoId, orderId),
          eq(avaliacoesPedidos.usuarioId, userId)
        )
      )
      .limit(1);

    if (!review) {
      throw createError('Avaliação não encontrada', 404, 'REVIEW_NOT_FOUND');
    }

    return review;
  }
}

export const reviewService = new ReviewService();

