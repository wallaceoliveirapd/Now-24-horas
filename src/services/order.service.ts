/**
 * Service de Pedidos
 */

import { apiClient } from './api/client';

// Tipos de status do backend
export type BackendOrderStatus = 
  | 'pendente'
  | 'aguardando_pagamento'
  | 'confirmado'
  | 'preparando'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado'
  | 'reembolsado';

// Tipos de status do frontend (OrderCard)
export type FrontendOrderStatus = 
  | 'Pendente'
  | 'Aguardando pagamento'
  | 'Concluído'
  | 'Cancelado';

// Item do pedido
export interface OrderItem {
  id: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number; // em centavos
  precoTotal: number; // em centavos
  personalizacoes?: any;
  observacoes?: string;
}

// Histórico de status
export interface OrderStatusHistory {
  id: string;
  statusAnterior?: BackendOrderStatus;
  statusNovo: BackendOrderStatus;
  observacoes?: string;
  criadoEm: string;
}

// Endereço de entrega
export interface OrderAddress {
  id: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// Cupom aplicado (se houver)
export interface OrderCoupon {
  id: string;
  codigo: string;
  tipoDesconto: 'fixo' | 'percentual';
  valorDesconto: number;
  descricao?: string;
}

// Pedido completo (detalhes)
export interface Order {
  id: string;
  numeroPedido: string; // "#99489500"
  status: BackendOrderStatus;
  subtotal: number; // em centavos
  taxaEntrega: number; // em centavos
  desconto: number; // em centavos
  total: number; // em centavos
  metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
  cartaoId?: string;
  observacoes?: string;
  instrucoesEntrega?: string;
  tempoEntrega?: string;
  criadoEm: string;
  atualizadoEm: string;
  confirmadoEm?: string;
  preparandoEm?: string;
  saiuParaEntregaEm?: string;
  entregueEm?: string;
  canceladoEm?: string;
  motivoCancelamento?: string;
  
  // Relacionamentos
  itens: OrderItem[];
  historicoStatus: OrderStatusHistory[];
  endereco: OrderAddress;
  cupom?: OrderCoupon;
}

// Resumo de itens do pedido
export interface OrderItemsSummary {
  itens: Array<{
    id: string;
    nomeProduto: string;
    quantidade: number;
  }>;
  totalItens: number;
  temMaisItens: boolean;
}

// Pedido resumido (lista)
export interface OrderSummary {
  id: string;
  numeroPedido: string;
  status: BackendOrderStatus;
  subtotal: number;
  taxaEntrega: number;
  desconto: number;
  total: number;
  criadoEm: string;
  atualizadoEm: string;
  resumoItens?: OrderItemsSummary;
}

// Filtros para listar pedidos
export interface OrderFilters {
  status?: BackendOrderStatus;
  pagina?: number;
  limite?: number;
}

// Resposta da lista de pedidos
export interface OrdersListResponse {
  pedidos: OrderSummary[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

/**
 * Mapear status do backend para status do frontend
 */
export function mapOrderStatus(status: BackendOrderStatus): FrontendOrderStatus {
  switch (status) {
    case 'pendente':
    case 'confirmado':
    case 'preparando':
    case 'saiu_para_entrega':
      return 'Pendente';
    case 'aguardando_pagamento':
      return 'Aguardando pagamento';
    case 'entregue':
      return 'Concluído';
    case 'cancelado':
    case 'reembolsado':
      return 'Cancelado';
    default:
      return 'Pendente';
  }
}

/**
 * Verificar se pedido está em andamento
 */
export function isOrderInProgress(status: BackendOrderStatus): boolean {
  return [
    'pendente',
    'aguardando_pagamento',
    'confirmado',
    'preparando',
    'saiu_para_entrega',
  ].includes(status);
}

/**
 * Formatar data do pedido para exibição
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' às');
}

/**
 * Formatar moeda (centavos para R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export const orderService = {
  /**
   * Listar pedidos do usuário
   */
  async getOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.pagina) {
      params.append('pagina', filters.pagina.toString());
    }
    if (filters?.limite) {
      params.append('limite', filters.limite.toString());
    }

    const queryString = params.toString();
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<OrdersListResponse>(endpoint);
    return response.data!;
  },

  /**
   * Obter detalhes de um pedido específico
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<{ pedido: Order }>(`/api/orders/${orderId}`);
    return response.data!.pedido;
  },

  /**
   * Cancelar pedido
   */
  async cancelOrder(orderId: string, motivo?: string): Promise<void> {
    await apiClient.post(`/api/orders/${orderId}/cancel`, { motivo });
  },

  /**
   * Criar novo pedido a partir do carrinho
   */
  async createOrder(data: {
    enderecoId: string;
    metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
    cartaoId?: string;
    observacoes?: string;
    instrucoesEntrega?: string;
  }): Promise<{ pedido: Order }> {
    const response = await apiClient.post<{ pedido: Order }>('/api/orders', data);
    return response.data!;
  },

  /**
   * Processar pagamento de um pedido
   */
  async payOrder(
    orderId: string,
    paymentData: {
      metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
      cartaoId?: string;
      dadosCartao?: {
        numero: string;
        nome: string;
        validade: string;
        cvv: string;
      };
    }
  ): Promise<any> {
    const response = await apiClient.post(`/api/orders/${orderId}/pay`, paymentData);
    return response.data;
  },
};

