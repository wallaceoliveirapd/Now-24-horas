import { z } from 'zod';

/**
 * Schema de validação para criar avaliação de produto
 */
export const createProductReviewSchema = z.object({
  nota: z.number()
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5'),
  
  comentario: z.string()
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
  
  imagens: z.array(z.string().url('URL de imagem inválida'))
    .max(5, 'Máximo de 5 imagens')
    .optional(),
  
  pedidoId: z.string().uuid('ID do pedido inválido').optional(),
});

export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;

/**
 * Schema de validação para atualizar avaliação de produto
 */
export const updateProductReviewSchema = z.object({
  nota: z.number()
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5')
    .optional(),
  
  comentario: z.string()
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
  
  imagens: z.array(z.string().url('URL de imagem inválida'))
    .max(5, 'Máximo de 5 imagens')
    .optional(),
});

export type UpdateProductReviewInput = z.infer<typeof updateProductReviewSchema>;

/**
 * Schema de validação para criar avaliação de pedido
 */
export const createOrderReviewSchema = z.object({
  notaProdutos: z.number()
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5')
    .optional(),
  
  notaEntrega: z.number()
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5')
    .optional(),
  
  notaAtendimento: z.number()
    .int('Nota deve ser um número inteiro')
    .min(1, 'Nota mínima é 1')
    .max(5, 'Nota máxima é 5')
    .optional(),
  
  comentario: z.string()
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
}).refine(
  (data) => data.notaProdutos || data.notaEntrega || data.notaAtendimento,
  {
    message: 'Pelo menos uma nota deve ser fornecida',
  }
);

export type CreateOrderReviewInput = z.infer<typeof createOrderReviewSchema>;

