import { db } from '../config/database';
import { carrinhos, itensCarrinho, produtos, cupons } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';
import { sql } from 'drizzle-orm';

export interface CartItemInput {
  produtoId: string;
  quantidade: number;
  personalizacoes?: any; // Array de personalizações selecionadas
  observacoes?: string;
}

/**
 * Serviço para gerenciar carrinho
 */
export class CartService {
  /**
   * Obter ou criar carrinho do usuário
   */
  async getOrCreateCart(userId: string) {
    // Buscar carrinho existente
    let [cart] = await db
      .select()
      .from(carrinhos)
      .where(eq(carrinhos.usuarioId, userId))
      .limit(1);

    // Se não existe, criar
    if (!cart) {
      [cart] = await db
        .insert(carrinhos)
        .values({
          usuarioId: userId,
          expiraEm: sql`NOW() + INTERVAL '7 days'`, // Expira em 7 dias
        })
        .returning();
    }

    return cart;
  }

  /**
   * Obter carrinho completo com itens e cálculos
   */
  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    // Buscar itens do carrinho com dados do produto
    const items = await db
      .select({
        id: itensCarrinho.id,
        produtoId: itensCarrinho.produtoId,
        quantidade: itensCarrinho.quantidade,
        personalizacoes: itensCarrinho.personalizacoes,
        observacoes: itensCarrinho.observacoes,
        produto: {
          id: produtos.id,
          nome: produtos.nome,
          imagemPrincipal: produtos.imagemPrincipal,
          precoBase: produtos.precoBase,
          precoFinal: produtos.precoFinal,
          valorDesconto: produtos.valorDesconto,
          estoque: produtos.estoque,
          statusEstoque: produtos.statusEstoque,
          ativo: produtos.ativo,
        },
      })
      .from(itensCarrinho)
      .innerJoin(produtos, eq(itensCarrinho.produtoId, produtos.id))
      .where(eq(itensCarrinho.carrinhoId, cart.id));

    // Buscar cupom se houver
    let cupom = null;
    if (cart.cupomId) {
      [cupom] = await db
        .select()
        .from(cupons)
        .where(
          and(
            eq(cupons.id, cart.cupomId),
            eq(cupons.ativo, true)
          )
        )
        .limit(1);
    }

    // Calcular totais
    const subtotal = items.reduce((sum, item) => {
      // Calcular preço do item incluindo personalizações
      let itemPrice = Number(item.produto.precoFinal);
      
      // Adicionar preços das personalizações se houver
      if (item.personalizacoes && Array.isArray(item.personalizacoes)) {
        item.personalizacoes.forEach((personalizacao: any) => {
          if (personalizacao.precoAdicional) {
            itemPrice += Number(personalizacao.precoAdicional) || 0;
          }
        });
      }

      return sum + (itemPrice * item.quantidade);
    }, 0);

    const taxaEntrega = 900; // R$9,00 em centavos (fixo por enquanto)
    
    // Calcular desconto do cupom
    let desconto = 0;
    if (cupom) {
      desconto = this.calculateCouponDiscount(cupom, subtotal, taxaEntrega);
    }

    const total = subtotal + taxaEntrega - desconto;

    return {
      carrinho: cart,
      itens: items.map(item => ({
        id: item.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        personalizacoes: item.personalizacoes,
        observacoes: item.observacoes,
        produto: item.produto,
      })),
      cupom,
      totais: {
        subtotal,
        taxaEntrega,
        desconto,
        total,
      },
    };
  }

  /**
   * Adicionar item ao carrinho
   */
  async addItem(userId: string, input: CartItemInput) {
    // Validar produto
    const [product] = await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.id, input.produtoId),
          eq(produtos.ativo, true)
        )
      )
      .limit(1);

    if (!product) {
      throw createError('Produto não encontrado ou inativo', 404, 'PRODUCT_NOT_FOUND');
    }

    // Validar estoque
    if (product.statusEstoque === 'indisponivel' || product.statusEstoque === 'descontinuado' || product.estoque < input.quantidade) {
      throw createError('Produto sem estoque suficiente', 400, 'INSUFFICIENT_STOCK');
    }

    const cart = await this.getOrCreateCart(userId);

    // Verificar se item já existe no carrinho
    const [existingItem] = await db
      .select()
      .from(itensCarrinho)
      .where(
        and(
          eq(itensCarrinho.carrinhoId, cart.id),
          eq(itensCarrinho.produtoId, input.produtoId)
        )
      )
      .limit(1);

    if (existingItem) {
      // Atualizar quantidade
      const newQuantity = existingItem.quantidade + input.quantidade;
      
      // Validar estoque novamente
      if (product.estoque < newQuantity) {
        throw createError('Quantidade excede estoque disponível', 400, 'INSUFFICIENT_STOCK');
      }

      const [updatedItem] = await db
        .update(itensCarrinho)
        .set({
          quantidade: newQuantity,
          personalizacoes: input.personalizacoes || existingItem.personalizacoes,
          observacoes: input.observacoes || existingItem.observacoes,
          atualizadoEm: new Date(),
        })
        .where(eq(itensCarrinho.id, existingItem.id))
        .returning();

      return updatedItem;
    } else {
      // Criar novo item
      const [newItem] = await db
        .insert(itensCarrinho)
        .values({
          carrinhoId: cart.id,
          produtoId: input.produtoId,
          quantidade: input.quantidade,
          personalizacoes: input.personalizacoes,
          observacoes: input.observacoes,
        })
        .returning();

      return newItem;
    }
  }

  /**
   * Atualizar quantidade de um item
   */
  async updateItemQuantity(userId: string, itemId: string, quantidade: number) {
    if (quantidade <= 0) {
      throw createError('Quantidade deve ser maior que zero', 400, 'INVALID_QUANTITY');
    }

    const cart = await this.getOrCreateCart(userId);

    // Buscar item com dados do produto
    const [item] = await db
      .select({
        id: itensCarrinho.id,
        produtoId: itensCarrinho.produtoId,
        quantidade: itensCarrinho.quantidade,
        estoque: produtos.estoque,
        ativo: produtos.ativo,
      })
      .from(itensCarrinho)
      .innerJoin(produtos, eq(itensCarrinho.produtoId, produtos.id))
      .where(
        and(
          eq(itensCarrinho.id, itemId),
          eq(itensCarrinho.carrinhoId, cart.id)
        )
      )
      .limit(1);

    if (!item) {
      throw createError('Item não encontrado no carrinho', 404, 'CART_ITEM_NOT_FOUND');
    }

    // Validar estoque
    if (item.estoque < quantidade) {
      throw createError('Quantidade excede estoque disponível', 400, 'INSUFFICIENT_STOCK');
    }

    // Validar que produto ainda está ativo
    if (!item.ativo) {
      throw createError('Produto não está mais disponível', 400, 'PRODUCT_INACTIVE');
    }

    const [updatedItem] = await db
      .update(itensCarrinho)
      .set({
        quantidade,
        atualizadoEm: new Date(),
      })
      .where(eq(itensCarrinho.id, itemId))
      .returning();

    return updatedItem;
  }

  /**
   * Remover item do carrinho
   */
  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const [item] = await db
      .select()
      .from(itensCarrinho)
      .where(
        and(
          eq(itensCarrinho.id, itemId),
          eq(itensCarrinho.carrinhoId, cart.id)
        )
      )
      .limit(1);

    if (!item) {
      throw createError('Item não encontrado no carrinho', 404, 'CART_ITEM_NOT_FOUND');
    }

    await db
      .delete(itensCarrinho)
      .where(eq(itensCarrinho.id, itemId));

    return { success: true };
  }

  /**
   * Limpar carrinho
   */
  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await db
      .delete(itensCarrinho)
      .where(eq(itensCarrinho.carrinhoId, cart.id));

    // Remover cupom também
    await db
      .update(carrinhos)
      .set({
        cupomId: null,
        atualizadoEm: new Date(),
      })
      .where(eq(carrinhos.id, cart.id));

    return { success: true };
  }

  /**
   * Calcular desconto do cupom
   */
  private calculateCouponDiscount(cupom: any, subtotal: number, taxaEntrega: number): number {
    if (!cupom || !cupom.ativo) {
      return 0;
    }

    // Verificar validade
    const now = new Date();
    if (cupom.validoDe && new Date(cupom.validoDe) > now) {
      return 0; // Cupom ainda não válido
    }
    if (cupom.validoAte && new Date(cupom.validoAte) < now) {
      return 0; // Cupom expirado
    }

    // Verificar valor mínimo (valor mínimo sempre se aplica ao pedido completo: subtotal + entrega)
    const valorTotalPedido = subtotal + taxaEntrega;
    if (cupom.valorMinimoPedido && valorTotalPedido < cupom.valorMinimoPedido) {
      return 0; // Não atinge valor mínimo
    }

    // Calcular desconto
    let desconto = 0;
    if (cupom.tipoDesconto === 'fixo') {
      desconto = cupom.valorDesconto || 0;
    } else if (cupom.tipoDesconto === 'percentual') {
      const percentual = cupom.valorDesconto || 0;
      // Se descontoEntrega é true, desconto se aplica também à entrega (subtotal + taxaEntrega)
      // Se false, desconto só se aplica ao subtotal (sem incluir taxa de entrega)
      const baseDesconto = cupom.descontoEntrega ? valorTotalPedido : subtotal;
      desconto = Math.floor((baseDesconto * percentual) / 100);
      
      // Aplicar valor máximo se houver
      if (cupom.valorMaximoDesconto && desconto > cupom.valorMaximoDesconto) {
        desconto = cupom.valorMaximoDesconto;
      }
    }

    return desconto;
  }

  /**
   * Aplicar cupom ao carrinho
   */
  async applyCoupon(userId: string, codigoCupom: string) {
    const cart = await this.getOrCreateCart(userId);

    // Buscar cupom
    const [cupom] = await db
      .select()
      .from(cupons)
      .where(
        and(
          eq(cupons.codigo, codigoCupom.toUpperCase()),
          eq(cupons.ativo, true)
        )
      )
      .limit(1);

    if (!cupom) {
      throw createError('Cupom não encontrado ou inativo', 404, 'COUPON_NOT_FOUND');
    }

    // Verificar validade
    const now = new Date();
    if (cupom.validoDe && new Date(cupom.validoDe) > now) {
      throw createError('Cupom ainda não está válido', 400, 'COUPON_NOT_VALID_YET');
    }
    if (cupom.validoAte && new Date(cupom.validoAte) < now) {
      throw createError('Cupom expirado', 400, 'COUPON_EXPIRED');
    }

    // Verificar limite de uso
    if (cupom.limiteUso && cupom.quantidadeUsada >= cupom.limiteUso) {
      throw createError('Cupom esgotado', 400, 'COUPON_EXHAUSTED');
    }

    // Buscar itens do carrinho para validar valor mínimo
    const items = await db
      .select({
        produtoId: itensCarrinho.produtoId,
        quantidade: itensCarrinho.quantidade,
        precoFinal: produtos.precoFinal,
      })
      .from(itensCarrinho)
      .innerJoin(produtos, eq(itensCarrinho.produtoId, produtos.id))
      .where(eq(itensCarrinho.carrinhoId, cart.id));

    const subtotal = items.reduce((sum, item) => sum + (Number(item.precoFinal) * item.quantidade), 0);
    const taxaEntrega = 900; // R$9,00

    // Verificar valor mínimo (valor mínimo sempre se aplica ao pedido completo: subtotal + entrega)
    const valorTotalPedido = subtotal + taxaEntrega;
    if (cupom.valorMinimoPedido && valorTotalPedido < cupom.valorMinimoPedido) {
      throw createError(
        `Valor mínimo do pedido não atingido. Mínimo: R$ ${(cupom.valorMinimoPedido / 100).toFixed(2)}`,
        400,
        'MINIMUM_ORDER_VALUE_NOT_MET'
      );
    }

    // Aplicar cupom
    await db
      .update(carrinhos)
      .set({
        cupomId: cupom.id,
        atualizadoEm: new Date(),
      })
      .where(eq(carrinhos.id, cart.id));

    return cupom;
  }

  /**
   * Remover cupom do carrinho
   */
  async removeCoupon(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await db
      .update(carrinhos)
      .set({
        cupomId: null,
        atualizadoEm: new Date(),
      })
      .where(eq(carrinhos.id, cart.id));

    return { success: true };
  }
}

export const cartService = new CartService();

