import { z } from 'zod';

/**
 * Schema de validação para criar pedido
 */
export const createOrderSchema = z.object({
  enderecoId: z.string().uuid('ID do endereço deve ser um UUID válido'),
  
  metodoPagamento: z.enum(['cartao_credito', 'cartao_debito', 'pix', 'boleto'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  
  cartaoId: z.string().uuid('ID do cartão deve ser um UUID válido').optional(),
  
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  
  instrucoesEntrega: z.string()
    .max(500, 'Instruções de entrega devem ter no máximo 500 caracteres')
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Schema de validação para cancelar pedido
 */
export const cancelOrderSchema = z.object({
  motivo: z.string()
    .max(500, 'Motivo do cancelamento deve ter no máximo 500 caracteres')
    .optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

