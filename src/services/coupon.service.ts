/**
 * Service de Cupons
 */

import { apiClient } from './api/client';

/**
 * Cupom retornado pelo backend
 */
export interface BackendCoupon {
  id: string;
  codigo: string;
  descricao: string;
  tipoDesconto: 'fixo' | 'percentual';
  valorDesconto: number; // em centavos (fixo) ou porcentagem (percentual)
  valorMinimoPedido?: number; // em centavos
  valorMaximoDesconto?: number; // em centavos (para percentual)
  descontoEntrega: boolean; // se false, desconto não se aplica à entrega
  entregaObrigatoria: boolean; // se true, só pode usar com entrega
  categoriaId?: string;
  produtoId?: string;
  validoDe: string | Date;
  validoAte: string | Date;
  limiteUso?: number;
  limiteUsoPorUsuario: number;
  quantidadeUsada: number;
  ativo: boolean;
  podeUsar?: boolean; // adicionado pelo backend quando lista cupons
}

/**
 * Resultado da validação de cupom
 */
export interface CouponValidationResult {
  cupom: BackendCoupon;
  descontoCalculado: number; // em centavos
  valorComDesconto: number; // em centavos
}

export const couponService = {
  /**
   * Listar cupons disponíveis para o usuário
   */
  async getAvailableCoupons(): Promise<BackendCoupon[]> {
    const response = await apiClient.get<{ cupons: BackendCoupon[] }>('/api/coupons');
    return response.data!.cupons || [];
  },

  /**
   * Obter cupom por código
   */
  async getCouponByCode(codigo: string): Promise<BackendCoupon> {
    const response = await apiClient.get<{ cupom: BackendCoupon }>(`/api/coupons/${codigo}`);
    return response.data!.cupom;
  },

  /**
   * Validar cupom para uso
   * @param codigo Código do cupom
   * @param valorPedido Valor do pedido em centavos (opcional, para validar valor mínimo)
   */
  async validateCoupon(
    codigo: string,
    valorPedido?: number
  ): Promise<CouponValidationResult> {
    const response = await apiClient.post<CouponValidationResult>(
      '/api/coupons/validate',
      {
        codigo,
        valorPedido,
      }
    );
    return response.data!;
  },
};

