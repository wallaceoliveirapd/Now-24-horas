import { z } from 'zod';

/**
 * Schema de validação para validar cupom
 */
export const validateCouponSchema = z.object({
  codigo: z.string()
    .min(3, 'Código do cupom deve ter pelo menos 3 caracteres')
    .max(50, 'Código do cupom deve ter no máximo 50 caracteres')
    .transform((val) => val.toUpperCase().trim()),
  
  valorPedido: z.number()
    .int('Valor do pedido deve ser um número inteiro (em centavos)')
    .min(0, 'Valor do pedido deve ser positivo')
    .optional(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

