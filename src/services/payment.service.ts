/**
 * Service de Pagamentos
 */

import { apiClient } from './api/client';

export interface ProcessPaymentInput {
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
      type: 'CPF' | 'CNPJ';
      number: string;
    };
  };
}

export interface ProcessPaymentResponse {
  transacao: {
    id: string;
    pedidoId: string;
    metodoPagamento: string;
    valor: number;
    status: string;
    idGateway: string | null;
    criadoEm: string;
  };
  pagamento: any;
  statusPedido: string;
}

export const paymentService = {
  /**
   * Processar pagamento de um pedido
   */
  async processPayment(data: ProcessPaymentInput): Promise<ProcessPaymentResponse> {
    const response = await apiClient.post<ProcessPaymentResponse>('/api/payments/process', data);
    return response.data!;
  },

  /**
   * Processar pagamento de um pedido (usando endpoint /api/orders/:id/pay)
   */
  async processOrderPayment(orderId: string, data: Omit<ProcessPaymentInput, 'pedidoId'>): Promise<ProcessPaymentResponse> {
    const response = await apiClient.post<ProcessPaymentResponse>(`/api/orders/${orderId}/pay`, data);
    return response.data!;
  },
};

