/**
 * Service de Carrinho
 */

import { apiClient } from './api/client';

export interface CartItem {
  id: string;
  produtoId: string;
  quantidade: number;
  personalizacoes?: Record<string, any> | any[]; // Personalizações do produto
  observacoes?: string;
  produto: {
    id: string;
    nome: string;
    descricao?: string;
    imagemPrincipal?: string; // Nome do campo do backend
    precoBase: number; // em centavos
    precoFinal: number; // em centavos
    valorDesconto?: number; // em centavos
    estoque?: number;
    statusEstoque?: string;
    ativo?: boolean;
  };
}

export interface AppliedCoupon {
  id: string;
  codigo: string;
  tipoDesconto: 'fixo' | 'percentual';
  valorDesconto: number; // em centavos ou percentual
  descricao?: string;
  validade?: string;
  // Propriedades completas do cupom (quando disponíveis)
  valorMinimoPedido?: number;
  valorMaximoDesconto?: number;
  descontoEntrega?: boolean;
  entregaObrigatoria?: boolean;
  validoDe?: string | Date;
  validoAte?: string | Date;
}

export interface Cart {
  itens: CartItem[];
  cupom?: AppliedCoupon;
  totais: {
    subtotal: number; // em centavos
    taxaEntrega: number; // em centavos
    desconto: number; // em centavos
    total: number; // em centavos
  };
  totalItens?: number; // quantidade total de itens (calculado)
}

export const cartService = {
  /**
   * Obter carrinho completo
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<{ itens: CartItem[]; cupom?: AppliedCoupon; totais: { subtotal: number; taxaEntrega: number; desconto: number; total: number } }>('/api/cart');
    const data = response.data!;
    
    // Calcular total de itens
    const totalItens = data.itens.reduce((sum, item) => sum + item.quantidade, 0);
    
    return {
      ...data,
      totalItens,
    };
  },

  /**
   * Adicionar item ao carrinho
   */
  async addItem(data: {
    produtoId: string;
    quantidade: number;
    personalizacoes?: Record<string, any>;
    observacoes?: string;
  }): Promise<CartItem> {
    const response = await apiClient.post<{ item: CartItem }>('/api/cart/items', data);
    return response.data!.item;
  },

  /**
   * Atualizar quantidade de um item
   */
  async updateItemQuantity(itemId: string, quantidade: number): Promise<CartItem> {
    const response = await apiClient.put<{ item: CartItem }>(
      `/api/cart/items/${itemId}`,
      { quantidade }
    );
    return response.data!.item;
  },

  /**
   * Remover item do carrinho
   */
  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/api/cart/items/${itemId}`);
  },

  /**
   * Limpar carrinho
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/api/cart');
  },

  /**
   * Aplicar cupom
   */
  async applyCoupon(codigo: string): Promise<AppliedCoupon> {
    const response = await apiClient.post<{ cupom: AppliedCoupon }>(
      '/api/cart/apply-coupon',
      { codigo }
    );
    return response.data!.cupom;
  },

  /**
   * Remover cupom
   */
  async removeCoupon(): Promise<void> {
    await apiClient.delete('/api/cart/coupon');
  },
};

