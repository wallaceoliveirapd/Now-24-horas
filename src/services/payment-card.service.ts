/**
 * Service de Cartões de Pagamento
 */

import { apiClient } from './api/client';

export interface PaymentCard {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito';
  ultimosDigitos: string;
  nomeCartao: string;
  bandeira?: string;
  mesValidade: number;
  anoValidade: number;
  cartaoPadrao: boolean;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AddCardInput {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

export interface UpdateCardInput {
  nomeCartao?: string;
  mesValidade?: number;
  anoValidade?: number;
}

export const paymentCardService = {
  /**
   * Listar cartões do usuário
   */
  async getCards(): Promise<PaymentCard[]> {
    const response = await apiClient.get<{ cartoes: PaymentCard[] }>('/api/payment-cards');
    return response.data!.cartoes;
  },

  /**
   * Obter cartão por ID
   */
  async getCardById(id: string): Promise<PaymentCard> {
    const response = await apiClient.get<{ cartao: PaymentCard }>(`/api/payment-cards/${id}`);
    return response.data!.cartao;
  },

  /**
   * Adicionar cartão
   */
  async addCard(data: AddCardInput): Promise<PaymentCard> {
    const response = await apiClient.post<{ cartao: PaymentCard }>('/api/payment-cards', data);
    return response.data!.cartao;
  },

  /**
   * Atualizar cartão
   */
  async updateCard(id: string, data: UpdateCardInput): Promise<PaymentCard> {
    const response = await apiClient.put<{ cartao: PaymentCard }>(`/api/payment-cards/${id}`, data);
    return response.data!.cartao;
  },

  /**
   * Definir cartão como padrão
   */
  async setDefaultCard(id: string): Promise<PaymentCard> {
    const response = await apiClient.patch<{ cartao: PaymentCard }>(`/api/payment-cards/${id}/set-default`);
    return response.data!.cartao;
  },

  /**
   * Remover cartão
   */
  async deleteCard(id: string): Promise<void> {
    await apiClient.delete(`/api/payment-cards/${id}`);
  },
};

