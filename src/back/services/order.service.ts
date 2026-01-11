import { db } from '../config/database';
import { 
  pedidos, 
  itensPedido, 
  historicoStatusPedidos,
  carrinhos,
  itensCarrinho,
  produtos,
  enderecos,
  cupons,
  usoCupons,
  cartoesPagamento
} from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';
import { sql } from 'drizzle-orm';
import { cartService } from './cart.service';
import { notificationService } from './notification.service';
import { env } from '../config/env';

export interface CreateOrderInput {
  enderecoId: string;
  metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  cartaoId?: string;
  observacoes?: string;
  instrucoesEntrega?: string;
}

/**
 * Serviço para gerenciar pedidos
 */
export class OrderService {
  /**
   * Gerar número único do pedido
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `#${timestamp.toString().slice(-8)}${random.toString().padStart(2, '0')}`;
  }

  /**
   * Criar pedido a partir do carrinho
   */
  async createOrder(userId: string, input: CreateOrderInput) {
    // Obter carrinho completo
    const cart = await cartService.getCart(userId);

    // Validar carrinho não vazio
    if (!cart.itens || cart.itens.length === 0) {
      throw createError('Carrinho está vazio', 400, 'EMPTY_CART');
    }

    // Validar endereço
    const [address] = await db
      .select()
      .from(enderecos)
      .where(
        and(
          eq(enderecos.id, input.enderecoId),
          eq(enderecos.usuarioId, userId),
          eq(enderecos.ativo, true)
        )
      )
      .limit(1);

    if (!address) {
      throw createError('Endereço não encontrado ou inválido', 404, 'ADDRESS_NOT_FOUND');
    }

    // Validar método de pagamento
    const validPaymentMethods = ['cartao_credito', 'cartao_debito', 'pix', 'boleto'];
    if (!validPaymentMethods.includes(input.metodoPagamento)) {
      throw createError('Método de pagamento inválido', 400, 'INVALID_PAYMENT_METHOD');
    }

    // Validar cartão se método for cartão
    if ((input.metodoPagamento === 'cartao_credito' || input.metodoPagamento === 'cartao_debito') && !input.cartaoId) {
      throw createError('Cartão de pagamento é obrigatório para pagamento com cartão', 400, 'CARD_REQUIRED');
    }

    // Validar cartão se fornecido
    if (input.cartaoId) {
      const [card] = await db
        .select()
        .from(cartoesPagamento)
        .where(
          and(
            eq(cartoesPagamento.id, input.cartaoId),
            eq(cartoesPagamento.usuarioId, userId),
            eq(cartoesPagamento.ativo, true)
          )
        )
        .limit(1);

      if (!card) {
        throw createError('Cartão de pagamento não encontrado ou inválido', 404, 'CARD_NOT_FOUND');
      }

      // Verificar se o tipo do cartão corresponde ao método de pagamento
      if (input.metodoPagamento === 'cartao_credito' && card.tipo !== 'cartao_credito') {
        throw createError('Tipo de cartão não corresponde ao método de pagamento selecionado', 400, 'CARD_TYPE_MISMATCH');
      }
      if (input.metodoPagamento === 'cartao_debito' && card.tipo !== 'cartao_debito') {
        throw createError('Tipo de cartão não corresponde ao método de pagamento selecionado', 400, 'CARD_TYPE_MISMATCH');
      }
    }

    // Validar estoque de todos os produtos
    for (const item of cart.itens) {
      if (!item.produto.ativo) {
        throw createError(`Produto "${item.produto.nome}" não está mais disponível`, 400, 'PRODUCT_INACTIVE');
      }

      if (item.produto.statusEstoque === 'indisponivel' || item.produto.statusEstoque === 'descontinuado') {
        throw createError(`Produto "${item.produto.nome}" está indisponível`, 400, 'PRODUCT_UNAVAILABLE');
      }

      if (item.produto.estoque < item.quantidade) {
        throw createError(`Estoque insuficiente para "${item.produto.nome}"`, 400, 'INSUFFICIENT_STOCK');
      }
    }

    // Validar cupom se houver
    let cupom = cart.cupom || null;
    if (cupom) {
      // Validar cupom novamente antes de criar pedido
      // Verificar se ainda está válido
      const now = new Date();
      if (!cupom.ativo) {
        throw createError('Cupom aplicado não está mais ativo', 400, 'COUPON_INVALID');
      }
      if (cupom.validoDe && new Date(cupom.validoDe) > now) {
        throw createError('Cupom aplicado ainda não está válido', 400, 'COUPON_INVALID');
      }
      if (cupom.validoAte && new Date(cupom.validoAte) < now) {
        throw createError('Cupom aplicado expirou', 400, 'COUPON_INVALID');
      }
      if (cupom.limiteUso && cupom.quantidadeUsada >= cupom.limiteUso) {
        throw createError('Cupom aplicado esgotou', 400, 'COUPON_INVALID');
      }
    }

    // Gerar número do pedido único
    let orderNumber = this.generateOrderNumber();
    let exists = true;
    while (exists) {
      const [existing] = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.numeroPedido, orderNumber))
        .limit(1);
      
      if (!existing) {
        exists = false;
      } else {
        orderNumber = this.generateOrderNumber();
      }
    }

    // Calcular totais
    const subtotal = cart.totais.subtotal;
    const taxaEntrega = cart.totais.taxaEntrega;
    const desconto = cart.totais.desconto;
    const total = cart.totais.total;

    // Criar pedido
    const [order] = await db
      .insert(pedidos)
      .values({
        numeroPedido: orderNumber,
        usuarioId: userId,
        enderecoId: input.enderecoId,
        metodoPagamento: input.metodoPagamento,
        cartaoId: input.cartaoId || null,
        status: 'pendente',
        subtotal,
        taxaEntrega,
        desconto,
        total,
        cupomId: cupom?.id || null,
        tempoEntrega: await this.calculateDeliveryTime(input.enderecoId),
        observacoes: input.observacoes || null,
        instrucoesEntrega: input.instrucoesEntrega || null,
      })
      .returning();

    // Criar itens do pedido com snapshot de preços
    const orderItems = await Promise.all(
      cart.itens.map(async (item) => {
        // Calcular preço unitário incluindo personalizações
        let precoUnitario = Number(item.produto.precoFinal);
        
        // Adicionar preços das personalizações
        if (item.personalizacoes && Array.isArray(item.personalizacoes)) {
          item.personalizacoes.forEach((personalizacao: any) => {
            if (personalizacao.precoAdicional) {
              precoUnitario += Number(personalizacao.precoAdicional) || 0;
            }
          });
        }

        const precoTotal = precoUnitario * item.quantidade;

        const [orderItem] = await db
          .insert(itensPedido)
          .values({
            pedidoId: order.id,
            produtoId: item.produtoId,
            nomeProduto: item.produto.nome, // Snapshot do nome
            quantidade: item.quantidade,
            precoUnitario: Math.round(precoUnitario),
            precoTotal: Math.round(precoTotal),
            personalizacoes: item.personalizacoes,
            observacoes: item.observacoes || null,
          })
          .returning();

        // Atualizar estoque do produto
        await db
          .update(produtos)
          .set({
            estoque: sql`${produtos.estoque} - ${item.quantidade}`,
            vendas: sql`${produtos.vendas} + ${item.quantidade}`,
            atualizadoEm: new Date(),
          })
          .where(eq(produtos.id, item.produtoId));

        return orderItem;
      })
    );

    // Criar registro inicial no histórico de status
    await db
      .insert(historicoStatusPedidos)
      .values({
        pedidoId: order.id,
        statusNovo: 'pendente',
        alteradoPor: userId,
      });

    // Incrementar uso do cupom se houver
    if (cupom) {
      await db
        .update(cupons)
        .set({
          quantidadeUsada: sql`${cupons.quantidadeUsada} + 1`,
          atualizadoEm: new Date(),
        })
        .where(eq(cupons.id, cupom.id));

      // Criar registro de uso do cupom
      await db
        .insert(usoCupons)
        .values({
          cupomId: cupom.id,
          pedidoId: order.id,
          usuarioId: userId,
          valorDescontoAplicado: desconto,
          valorPedido: total,
        });
    }

    // Limpar carrinho após criar pedido
    await cartService.clearCart(userId);

    // Enviar notificação de pedido criado
    await notificationService.createNotification({
      usuarioId: userId,
      tipo: 'pedido',
      titulo: 'Pedido criado com sucesso!',
      mensagem: `Seu pedido ${order.numeroPedido} foi criado e está sendo processado.`,
      dados: {
        pedidoId: order.id,
        numeroPedido: order.numeroPedido,
      },
    });

    // Buscar pedido completo com relacionamentos
    const fullOrder = await this.getOrderById(order.id, userId);

    return fullOrder;
  }

  /**
   * Obter pedido por ID
   */
  async getOrderById(orderId: string, userId: string) {
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

    // Buscar itens do pedido
    const items = await db
      .select()
      .from(itensPedido)
      .where(eq(itensPedido.pedidoId, orderId))
      .orderBy(itensPedido.criadoEm);

    // Buscar histórico de status
    const statusHistory = await db
      .select()
      .from(historicoStatusPedidos)
      .where(eq(historicoStatusPedidos.pedidoId, orderId))
      .orderBy(historicoStatusPedidos.criadoEm);

    // Buscar endereço
    const [address] = await db
      .select()
      .from(enderecos)
      .where(eq(enderecos.id, order.enderecoId))
      .limit(1);

    // Buscar cupom se houver
    let cupom = null;
    if (order.cupomId) {
      [cupom] = await db
        .select()
        .from(cupons)
        .where(eq(cupons.id, order.cupomId))
        .limit(1);
    }

    return {
      ...order,
      itens: items,
      historicoStatus: statusHistory,
      endereco: address,
      cupom,
    };
  }

  /**
   * Listar pedidos do usuário
   */
  async getUserOrders(userId: string, filters?: {
    status?: 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'preparando' | 'saiu_para_entrega' | 'entregue' | 'cancelado' | 'reembolsado';
    pagina?: number;
    limite?: number;
  }) {
    const { status, pagina = 1, limite = 20 } = filters || {};
    const offset = (pagina - 1) * limite;

    const conditions = [eq(pedidos.usuarioId, userId)];

    if (status) {
      conditions.push(eq(pedidos.status, status as any));
    }

    const orders = await db
      .select()
      .from(pedidos)
      .where(and(...conditions))
      .orderBy(sql`${pedidos.criadoEm} DESC`)
      .limit(limite)
      .offset(offset);

    // Buscar resumo de itens para cada pedido
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        // Buscar primeiros 3 itens do pedido para resumo
        const items = await db
          .select({
            id: itensPedido.id,
            nomeProduto: itensPedido.nomeProduto,
            quantidade: itensPedido.quantidade,
          })
          .from(itensPedido)
          .where(eq(itensPedido.pedidoId, order.id))
          .limit(3);

        // Contar total de itens
        const [totalItemsResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(itensPedido)
          .where(eq(itensPedido.pedidoId, order.id));

        const totalItems = Number(totalItemsResult?.count || 0);

        return {
          ...order,
          resumoItens: {
            itens: items,
            totalItens: totalItems,
            temMaisItens: totalItems > 3,
          },
        };
      })
    );

    // Contar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pedidos)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);
    const totalPaginas = Math.ceil(total / limite);

    return {
      pedidos: ordersWithItems,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
        temProximaPagina: pagina < totalPaginas,
        temPaginaAnterior: pagina > 1,
      },
    };
  }

  /**
   * Cancelar pedido
   */
  async cancelOrder(orderId: string, userId: string, motivo?: string) {
    const order = await this.getOrderById(orderId, userId);

    // Verificar se pode cancelar
    if (order.status === 'cancelado') {
      throw createError('Pedido já está cancelado', 400, 'ORDER_ALREADY_CANCELLED');
    }

    if (order.status === 'entregue') {
      throw createError('Não é possível cancelar pedido já entregue', 400, 'ORDER_ALREADY_DELIVERED');
    }

    // Atualizar status
    await db
      .update(pedidos)
      .set({
        status: 'cancelado',
        canceladoEm: new Date(),
        canceladoPor: userId,
        motivoCancelamento: motivo || null,
        atualizadoEm: new Date(),
      })
      .where(eq(pedidos.id, orderId));

    // Registrar no histórico
    await db
      .insert(historicoStatusPedidos)
      .values({
        pedidoId: orderId,
        statusAnterior: order.status,
        statusNovo: 'cancelado',
        observacoes: motivo || 'Cancelado pelo cliente',
        alteradoPor: userId,
      });

    // Restaurar estoque dos produtos
    for (const item of order.itens) {
      await db
        .update(produtos)
        .set({
          estoque: sql`${produtos.estoque} + ${item.quantidade}`,
          vendas: sql`${produtos.vendas} - ${item.quantidade}`,
          atualizadoEm: new Date(),
        })
        .where(eq(produtos.id, item.produtoId));
    }

    // Enviar notificação de cancelamento
    await notificationService.createNotification({
      usuarioId: userId,
      tipo: 'pedido',
      titulo: 'Pedido cancelado',
      mensagem: `Seu pedido ${order.numeroPedido} foi cancelado.${motivo ? ` Motivo: ${motivo}` : ''}`,
      dados: {
        pedidoId: orderId,
        numeroPedido: order.numeroPedido,
        motivo: motivo || null,
      },
    });

    return { success: true };
  }

  /**
   * Atualizar status do pedido (para admin/sistema)
   * Envia notificação push automaticamente
   */
  async updateOrderStatus(
    orderId: string,
    novoStatus: 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'preparando' | 'saiu_para_entrega' | 'entregue' | 'cancelado' | 'reembolsado',
    alteradoPor: string,
    observacoes?: string
  ) {
    // Buscar pedido
    const [order] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, orderId))
      .limit(1);

    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    const statusAnterior = order.status;

    // Preparar atualização com campos específicos do status
    const updateData: any = {
      status: novoStatus,
      atualizadoEm: new Date(),
    };

    // Adicionar timestamps específicos
    if (novoStatus === 'confirmado' && !order.confirmadoEm) {
      updateData.confirmadoEm = new Date();
    }
    if (novoStatus === 'preparando' && !order.preparandoEm) {
      updateData.preparandoEm = new Date();
    }
    if (novoStatus === 'saiu_para_entrega' && !order.saiuParaEntregaEm) {
      updateData.saiuParaEntregaEm = new Date();
    }
    if (novoStatus === 'entregue' && !order.entregueEm) {
      updateData.entregueEm = new Date();
    }

    // Atualizar pedido
    await db
      .update(pedidos)
      .set(updateData)
      .where(eq(pedidos.id, orderId));

    // Registrar no histórico
    await db
      .insert(historicoStatusPedidos)
      .values({
        pedidoId: orderId,
        statusAnterior,
        statusNovo: novoStatus,
        observacoes: observacoes || null,
        alteradoPor,
      });

    // Enviar notificação push baseada no novo status
    const statusMessages: Record<string, { titulo: string; mensagem: string }> = {
      confirmado: {
        titulo: 'Pedido confirmado!',
        mensagem: `Seu pedido ${order.numeroPedido} foi confirmado e está sendo preparado.`,
      },
      preparando: {
        titulo: 'Pedido em preparação',
        mensagem: `Seu pedido ${order.numeroPedido} está sendo preparado.`,
      },
      saiu_para_entrega: {
        titulo: 'Pedido a caminho!',
        mensagem: `Seu pedido ${order.numeroPedido} saiu para entrega.`,
      },
      entregue: {
        titulo: 'Pedido entregue!',
        mensagem: `Seu pedido ${order.numeroPedido} foi entregue. Obrigado pela preferência!`,
      },
      aguardando_pagamento: {
        titulo: 'Aguardando pagamento',
        mensagem: `Seu pedido ${order.numeroPedido} está aguardando confirmação do pagamento.`,
      },
    };

    const message = statusMessages[novoStatus];
    if (message) {
      await notificationService.createNotification({
        usuarioId: order.usuarioId,
        tipo: 'pedido',
        titulo: message.titulo,
        mensagem: message.mensagem,
        dados: {
          pedidoId: orderId,
          numeroPedido: order.numeroPedido,
          status: novoStatus,
        },
      });
    }

    return { success: true };
  }

  /**
   * Calcular tempo de entrega baseado no endereço (método público para uso em endpoints)
   */
  async calculateDeliveryTime(addressId: string): Promise<string> {
    // Buscar endereço
    const [address] = await db
      .select()
      .from(enderecos)
      .where(eq(enderecos.id, addressId))
      .limit(1);

    if (!address) {
      return '20-40 minutos'; // Default
    }

    // Coordenadas do restaurante (configurar nas variáveis de ambiente)
    const RESTAURANT_LAT = parseFloat(env.RESTAURANT_LATITUDE || '0');
    const RESTAURANT_LNG = parseFloat(env.RESTAURANT_LONGITUDE || '0');

    // Se não houver coordenadas do restaurante configuradas, retornar tempo padrão
    if (!RESTAURANT_LAT || !RESTAURANT_LNG) {
      console.warn('⚠️  RESTAURANT_LATITUDE e RESTAURANT_LONGITUDE não configuradas. Usando tempo padrão.');
      return '20-40 minutos';
    }

    // Buscar coordenadas do endereço (se disponível)
    let addressLat = address.latitude ? parseFloat(address.latitude) : null;
    let addressLng = address.longitude ? parseFloat(address.longitude) : null;

    // Se não tiver coordenadas, buscar via API de geocodificação
    if (!addressLat || !addressLng) {
      const coordinates = await this.geocodeAddress(address);
      addressLat = coordinates.lat;
      addressLng = coordinates.lng;
      
      // Salvar coordenadas no banco para próximas consultas
      if (coordinates.lat && coordinates.lng) {
        await db
          .update(enderecos)
          .set({
            latitude: coordinates.lat.toString(),
            longitude: coordinates.lng.toString(),
            atualizadoEm: new Date(),
          })
          .where(eq(enderecos.id, addressId));
      }
    }

    // Se ainda não tiver coordenadas, retornar tempo padrão
    if (!addressLat || !addressLng) {
      return '20-40 minutos';
    }

    // Calcular distância (Haversine)
    const distance = this.calculateDistance(
      RESTAURANT_LAT,
      RESTAURANT_LNG,
      addressLat,
      addressLng
    );

    // Calcular tempo baseado na distância
    // Assumindo velocidade média de 30 km/h para entrega
    const averageSpeed = 30; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    // Adicionar tempo de preparo (15-20 minutos)
    const prepTime = 15;
    const totalTime = prepTime + timeInMinutes;

    // Garantir tempo mínimo de 20 minutos
    const minTime = Math.max(20, Math.floor(totalTime / 10) * 10);
    const maxTime = minTime + 20;

    // Garantir tempo máximo de 120 minutos
    const finalMinTime = Math.min(minTime, 100);
    const finalMaxTime = Math.min(maxTime, 120);

    return `${finalMinTime}-${finalMaxTime} minutos`;
  }

  /**
   * Calcular distância entre duas coordenadas (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converter graus para radianos
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Geocodificar endereço (buscar coordenadas)
   */
  private async geocodeAddress(address: any): Promise<{ lat: number | null; lng: number | null }> {
    try {
      // Montar string de endereço para busca
      const addressString = `${address.rua}, ${address.numero}, ${address.bairro}, ${address.cidade}, ${address.estado}, Brasil`;
      
      // Usar OpenStreetMap Nominatim (gratuito, sem chave)
      // Limite: 1 requisição/segundo
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Now24Horas/1.0', // Nominatim requer User-Agent
          },
        }
      );

      if (!response.ok) {
        console.warn('⚠️  Erro ao geocodificar endereço:', response.statusText);
        return { lat: null, lng: null };
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
    }
    
    return { lat: null, lng: null };
  }
}

export const orderService = new OrderService();

