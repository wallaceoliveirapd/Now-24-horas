import { z } from 'zod';

/**
 * Schema de validação para adicionar item ao carrinho
 */
export const addCartItemSchema = z.object({
  produtoId: z.string().uuid('ID do produto deve ser um UUID válido'),
  
  quantidade: z.number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser pelo menos 1')
    .max(999, 'Quantidade máxima é 999'),
  
  personalizacoes: z.array(z.object({
    secaoId: z.string().uuid(),
    opcoesIds: z.array(z.string().uuid()),
    quantidade: z.number().int().min(1).optional(),
  })).optional(),
  
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

/**
 * Schema de validação para atualizar quantidade
 */
export const updateCartItemQuantitySchema = z.object({
  quantidade: z.number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser pelo menos 1')
    .max(999, 'Quantidade máxima é 999'),
});

export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>;

/**
 * Schema de validação para aplicar cupom
 */
export const applyCouponSchema = z.object({
  codigo: z.string()
    .min(3, 'Código do cupom deve ter pelo menos 3 caracteres')
    .max(50, 'Código do cupom deve ter no máximo 50 caracteres')
    .transform((val) => val.toUpperCase().trim()),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

