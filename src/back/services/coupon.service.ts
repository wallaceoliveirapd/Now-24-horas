import { db } from '../config/database';
import { cupons, usoCupons, carrinhos } from '../models/schema';
import { eq, and, gte, lte, or, sql, isNull } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar cupons
 */
export class CouponService {
  /**
   * Listar cupons disponíveis para o usuário
   */
  async getAvailableCoupons(userId?: string) {
    const now = new Date();

    // Buscar cupons ativos e válidos
    const availableCoupons = await db
      .select()
      .from(cupons)
      .where(
        and(
          eq(cupons.ativo, true),
          lte(cupons.validoDe, now),
          gte(cupons.validoAte, now),
          or(
            isNull(cupons.limiteUso),
            sql`${cupons.quantidadeUsada} < ${cupons.limiteUso}`
          )!
        )
      )
      .orderBy(cupons.validoAte);

    // Filtrar cupons que o usuário ainda pode usar
    const couponsWithUsage = await Promise.all(
      availableCoupons.map(async (cupom) => {
        // Verificar se usuário já usou este cupom
        let podeUsar = true;
        if (userId) {
          const [uso] = await db
            .select()
            .from(usoCupons)
            .where(
              and(
                eq(usoCupons.cupomId, cupom.id),
                eq(usoCupons.usuarioId, userId)
              )
            )
            .limit(1);

          // Contar quantas vezes o usuário já usou este cupom
          const usoCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(usoCupons)
            .where(
              and(
                eq(usoCupons.cupomId, cupom.id),
                eq(usoCupons.usuarioId, userId)
              )
            );

          const vezesUsado = Number(usoCount[0]?.count || 0);
          podeUsar = vezesUsado < cupom.limiteUsoPorUsuario;
        }

        return {
          ...cupom,
          podeUsar,
        };
      })
    );

    return couponsWithUsage.filter((c) => c.podeUsar);
  }

  /**
   * Obter cupom por código
   */
  async getCouponByCode(codigo: string) {
    const [cupom] = await db
      .select()
      .from(cupons)
      .where(eq(cupons.codigo, codigo.toUpperCase()))
      .limit(1);

    if (!cupom) {
      throw createError('Cupom não encontrado', 404, 'COUPON_NOT_FOUND');
    }

    return cupom;
  }

  /**
   * Validar cupom para uso
   */
  async validateCoupon(codigo: string, userId?: string, valorPedido?: number) {
    const cupom = await this.getCouponByCode(codigo);

    // Verificar se está ativo
    if (!cupom.ativo) {
      throw createError('Cupom não está ativo', 400, 'COUPON_INACTIVE');
    }

    // Verificar validade
    const now = new Date();
    if (cupom.validoDe && new Date(cupom.validoDe) > now) {
      throw createError('Cupom ainda não está válido', 400, 'COUPON_NOT_VALID_YET');
    }
    if (cupom.validoAte && new Date(cupom.validoAte) < now) {
      throw createError('Cupom expirado', 400, 'COUPON_EXPIRED');
    }

    // Verificar limite de uso geral
    if (cupom.limiteUso && cupom.quantidadeUsada >= cupom.limiteUso) {
      throw createError('Cupom esgotado', 400, 'COUPON_EXHAUSTED');
    }

    // Verificar limite de uso por usuário
    if (userId) {
      const usoCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(usoCupons)
        .where(
          and(
            eq(usoCupons.cupomId, cupom.id),
            eq(usoCupons.usuarioId, userId)
          )
        );

      const vezesUsado = Number(usoCount[0]?.count || 0);
      if (vezesUsado >= cupom.limiteUsoPorUsuario) {
        throw createError('Você já utilizou este cupom o máximo de vezes permitido', 400, 'COUPON_USER_LIMIT_EXCEEDED');
      }
    }

    // Verificar valor mínimo do pedido
    if (valorPedido && cupom.valorMinimoPedido && valorPedido < cupom.valorMinimoPedido) {
      throw createError(
        `Valor mínimo do pedido não atingido. Mínimo: R$ ${(cupom.valorMinimoPedido / 100).toFixed(2)}`,
        400,
        'MINIMUM_ORDER_VALUE_NOT_MET'
      );
    }

    return cupom;
  }

  /**
   * Calcular desconto do cupom
   */
  calculateDiscount(cupom: any, subtotal: number, taxaEntrega: number): number {
    if (!cupom || !cupom.ativo) {
      return 0;
    }

    // Verificar validade
    const now = new Date();
    if (cupom.validoDe && new Date(cupom.validoDe) > now) {
      return 0;
    }
    if (cupom.validoAte && new Date(cupom.validoAte) < now) {
      return 0;
    }

    // Verificar valor mínimo
    const valorTotalPedido = subtotal + taxaEntrega;
    if (cupom.valorMinimoPedido && valorTotalPedido < cupom.valorMinimoPedido) {
      return 0;
    }

    // Calcular desconto
    let desconto = 0;
    if (cupom.tipoDesconto === 'fixo') {
      desconto = cupom.valorDesconto || 0;
    } else if (cupom.tipoDesconto === 'percentual') {
      const percentual = cupom.valorDesconto || 0;
      // Se descontoEntrega é true, desconto se aplica também à entrega
      // Se false, desconto só se aplica ao subtotal
      const baseDesconto = cupom.descontoEntrega ? valorTotalPedido : subtotal;
      desconto = Math.floor((baseDesconto * percentual) / 100);
      
      // Aplicar valor máximo se houver
      if (cupom.valorMaximoDesconto && desconto > cupom.valorMaximoDesconto) {
        desconto = cupom.valorMaximoDesconto;
      }
    }

    return desconto;
  }
}

export const couponService = new CouponService();

