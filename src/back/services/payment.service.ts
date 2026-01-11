import { db } from '../config/database';
import { transacoesPagamento, pedidos, historicoStatusPedidos } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';
import { mercadoPagoService } from './mercadopago.service';
import { orderService } from './order.service';
import { paymentCardService } from './payment-card.service';

/**
 * Serviço para processar pagamentos
 */
export class PaymentService {
  /**
   * Processar pagamento de pedido
   */
  async processPayment(userId: string, paymentData: {
    pedidoId: string;
    metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
    cartaoId?: string;
    token?: string;
    installments?: number;
    payer: {
      email: string;
      firstName?: string;
      lastName?: string;
      identification: {
        type: string;
        number: string;
      };
    };
  }) {
    console.log('💳 [PaymentService] Iniciando processamento de pagamento...');
    console.log('💳 [PaymentService] Dados:', {
      pedidoId: paymentData.pedidoId,
      metodoPagamento: paymentData.metodoPagamento,
      cartaoId: paymentData.cartaoId,
      temToken: !!paymentData.token,
      email: paymentData.payer.email,
    });

    // Obter pedido
    const order = await orderService.getOrderById(paymentData.pedidoId, userId);
    console.log('💳 [PaymentService] Pedido encontrado:', {
      id: order.id,
      numeroPedido: order.numeroPedido,
      total: order.total,
      status: order.status,
    });

    // Validar que pedido pode ser pago
    if (order.status !== 'pendente' && order.status !== 'aguardando_pagamento') {
      throw createError('Pedido não pode ser pago neste status', 400, 'ORDER_CANNOT_BE_PAID');
    }

    // Validar método de pagamento
    if (order.metodoPagamento !== paymentData.metodoPagamento) {
      throw createError('Método de pagamento não corresponde ao pedido', 400, 'PAYMENT_METHOD_MISMATCH');
    }

    let transaction;
    let paymentResult;

    // Processar pagamento conforme método
    if (paymentData.metodoPagamento === 'pix') {
      console.log('💳 [PaymentService] Processando pagamento PIX...');
      // Processar PIX
      paymentResult = await mercadoPagoService.processPixPayment({
        transactionAmount: order.total / 100, // Converter centavos para reais
        description: `Pedido ${order.numeroPedido}`,
        payer: {
          email: paymentData.payer.email,
          firstName: paymentData.payer.firstName || '',
          lastName: paymentData.payer.lastName || '',
          identification: paymentData.payer.identification,
        },
        metadata: {
          orderId: order.id,
          userId: userId,
        },
      });
    } else {
      console.log('💳 [PaymentService] Processando pagamento com cartão...');
      
      // Para cartões, SEMPRE usar Customer Card ID (permanente), nunca tokens temporários
      if (!paymentData.cartaoId) {
        console.error('💳 [PaymentService] ❌ cartaoId é obrigatório para pagamento com cartão');
        throw createError('Cartão é obrigatório para pagamento com cartão', 400, 'CARD_ID_REQUIRED');
      }

      console.log('💳 [PaymentService] Buscando Customer Card ID do cartão salvo:', paymentData.cartaoId);
      const card = await paymentCardService.getCardById(paymentData.cartaoId, userId);
      console.log('💳 [PaymentService] Cartão encontrado:', {
        id: card.id,
        ultimosDigitos: card.ultimosDigitos,
        temCustomerCardId: !!card.customerCardIdGateway,
        customerCardIdPreview: card.customerCardIdGateway ? card.customerCardIdGateway.substring(0, 15) + '...' : 'N/A',
      });
      
      // SEMPRE usar Customer Card ID (permanente)
      if (!card.customerCardIdGateway) {
        console.error('💳 [PaymentService] ❌ Cartão não possui Customer Card ID');
        throw createError('Cartão salvo não possui dados válidos. Por favor, adicione o cartão novamente.', 400, 'CARD_DATA_MISSING');
      }

      console.log('💳 [PaymentService] Usando Customer Card ID:', card.customerCardIdGateway);
      paymentResult = await mercadoPagoService.processPayment({
        transactionAmount: order.total / 100,
        customerCardId: card.customerCardIdGateway, // Usar Customer Card ID permanente
        description: `Pedido ${order.numeroPedido}`,
        installments: paymentData.installments || 1,
        paymentMethodId: paymentData.metodoPagamento === 'cartao_credito' ? 'credit_card' : 'debit_card',
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification,
        },
        metadata: {
          orderId: order.id,
          userId: userId,
        },
      });
      console.log('💳 [PaymentService] Pagamento processado com Customer Card ID:', {
        id: paymentResult.id,
        status: paymentResult.status,
      });
    }

    // Mapear status do Mercado Pago
    const statusMap: Record<string, string> = {
      'approved': 'aprovado',
      'pending': 'pendente',
      'in_process': 'processando',
      'rejected': 'recusado',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      'charged_back': 'chargeback',
    };

    const paymentStatus = statusMap[paymentResult.status || 'pending'] || 'pendente';

    // Criar transação no banco
    const [transactionRecord] = await db
      .insert(transacoesPagamento)
      .values({
        pedidoId: order.id,
        metodoPagamento: paymentData.metodoPagamento,
        cartaoId: paymentData.cartaoId || null,
        valor: order.total,
        status: paymentStatus,
        idGateway: paymentResult.id?.toString() || null,
        codigoAutorizacao: (paymentResult as any).authorization_code || null,
        parcelas: paymentData.installments || 1,
        dadosTransacao: paymentResult as any,
        processadoEm: new Date(),
      })
      .returning();

    // Atualizar status do pedido
    let newOrderStatus: 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'preparando' | 'saiu_para_entrega' | 'entregue' | 'cancelado' | 'reembolsado' = 'aguardando_pagamento';

    if (paymentStatus === 'aprovado') {
      newOrderStatus = 'confirmado';
      
      // Atualizar timestamp de confirmação
      await db
        .update(pedidos)
        .set({
          status: newOrderStatus,
          confirmadoEm: new Date(),
          atualizadoEm: new Date(),
        })
        .where(eq(pedidos.id, order.id));

      // Registrar no histórico
      await db
        .insert(historicoStatusPedidos)
        .values({
          pedidoId: order.id,
          statusAnterior: order.status,
          statusNovo: newOrderStatus,
          observacoes: 'Pagamento aprovado',
          alteradoPor: userId,
        });
    } else if (paymentStatus === 'pendente' || paymentStatus === 'processando') {
      newOrderStatus = 'aguardando_pagamento';
      
      await db
        .update(pedidos)
        .set({
          status: newOrderStatus,
          atualizadoEm: new Date(),
        })
        .where(eq(pedidos.id, order.id));

      await db
        .insert(historicoStatusPedidos)
        .values({
          pedidoId: order.id,
          statusAnterior: order.status,
          statusNovo: newOrderStatus,
          observacoes: 'Pagamento em processamento',
          alteradoPor: userId,
        });
    } else if (paymentStatus === 'recusado') {
      await db
        .update(pedidos)
        .set({
          status: 'pendente',
          atualizadoEm: new Date(),
        })
        .where(eq(pedidos.id, order.id));
    }

    return {
      transacao: transactionRecord,
      pagamento: paymentResult,
      statusPedido: newOrderStatus,
    };
  }

  /**
   * Obter transação por ID
   */
  async getTransaction(transactionId: string, userId: string) {
    const [transaction] = await db
      .select()
      .from(transacoesPagamento)
      .innerJoin(pedidos, eq(transacoesPagamento.pedidoId, pedidos.id))
      .where(
        and(
          eq(transacoesPagamento.id, transactionId),
          eq(pedidos.usuarioId, userId)
        )
      )
      .limit(1);

    if (!transaction) {
      throw createError('Transação não encontrada', 404, 'TRANSACTION_NOT_FOUND');
    }

    return transaction.transacoes_pagamento;
  }

  /**
   * Atualizar status da transação (via webhook)
   */
  async updateTransactionStatus(gatewayId: string, status: string, paymentData: any) {
    // Buscar transação pelo ID do gateway
    const [transaction] = await db
      .select()
      .from(transacoesPagamento)
      .where(eq(transacoesPagamento.idGateway, gatewayId))
      .limit(1);

    if (!transaction) {
      throw createError('Transação não encontrada', 404, 'TRANSACTION_NOT_FOUND');
    }

    // Mapear status
    const statusMap: Record<string, string> = {
      'approved': 'aprovado',
      'pending': 'pendente',
      'in_process': 'processando',
      'rejected': 'recusado',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      'charged_back': 'chargeback',
    };

    const newStatus = statusMap[status] || 'pendente';

    // Atualizar transação
    await db
      .update(transacoesPagamento)
      .set({
        status: newStatus,
        dadosTransacao: paymentData,
        atualizadoEm: new Date(),
      })
      .where(eq(transacoesPagamento.idGateway, gatewayId));

    // Buscar pedido diretamente
    const [order] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, transaction.pedidoId))
      .limit(1);

    if (!order) {
      throw createError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    if (newStatus === 'aprovado' && order.status === 'aguardando_pagamento') {
      await db
        .update(pedidos)
        .set({
          status: 'confirmado',
          confirmadoEm: new Date(),
          atualizadoEm: new Date(),
        })
        .where(eq(pedidos.id, transaction.pedidoId));

      await db
        .insert(historicoStatusPedidos)
        .values({
          pedidoId: transaction.pedidoId,
          statusAnterior: order.status,
          statusNovo: 'confirmado',
          observacoes: 'Pagamento aprovado via webhook',
          alteradoPor: order.usuarioId,
        });
    } else if (newStatus === 'recusado' || newStatus === 'cancelado') {
      await db
        .update(pedidos)
        .set({
          status: 'pendente',
          atualizadoEm: new Date(),
        })
        .where(eq(pedidos.id, transaction.pedidoId));
    }

    return { success: true };
  }
}

export const paymentService = new PaymentService();

