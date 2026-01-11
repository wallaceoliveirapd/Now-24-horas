import { z } from 'zod';

/**
 * Schema de validação para adicionar cartão
 */
export const addCardSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Número do cartão inválido')
    .max(19, 'Número do cartão inválido')
    .regex(/^[\d\s]+$/, 'Número do cartão deve conter apenas dígitos'),
  
  cardholderName: z.string()
    .min(3, 'Nome do portador deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do portador deve ter no máximo 100 caracteres'),
  
  cardExpirationMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Mês inválido (01-12)'),
  
  cardExpirationYear: z.string()
    .regex(/^\d{4}$/, 'Ano deve ter 4 dígitos')
    .refine((year) => parseInt(year) >= new Date().getFullYear(), {
      message: 'Ano de validade não pode ser no passado',
    }),
  
  securityCode: z.string()
    .min(3, 'Código de segurança inválido')
    .max(4, 'Código de segurança inválido')
    .regex(/^\d+$/, 'Código de segurança deve conter apenas dígitos'),
  
  identificationType: z.enum(['CPF', 'CNPJ'], {
    errorMap: () => ({ message: 'Tipo de identificação deve ser CPF ou CNPJ' }),
  }),
  
  identificationNumber: z.string()
    .min(11, 'Número de identificação inválido')
    .max(14, 'Número de identificação inválido')
    .regex(/^\d+$/, 'Número de identificação deve conter apenas dígitos'),
});

export type AddCardInput = z.infer<typeof addCardSchema>;

/**
 * Schema de validação para atualizar cartão
 */
export const updateCardSchema = z.object({
  nomeCartao: z.string()
    .min(3, 'Nome do cartão deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do cartão deve ter no máximo 100 caracteres')
    .optional(),
  
  mesValidade: z.number()
    .int('Mês deve ser um número inteiro')
    .min(1, 'Mês inválido')
    .max(12, 'Mês inválido')
    .optional(),
  
  anoValidade: z.number()
    .int('Ano deve ser um número inteiro')
    .min(new Date().getFullYear(), 'Ano não pode ser no passado')
    .optional(),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

/**
 * Schema de validação para processar pagamento
 * pedidoId é opcional quando usado em /api/orders/:id/pay
 */
export const processPaymentSchema = z.object({
  pedidoId: z.string().uuid('ID do pedido deve ser um UUID válido').optional(),
  
  metodoPagamento: z.enum(['cartao_credito', 'cartao_debito', 'pix', 'boleto'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  
  cartaoId: z.string().uuid('ID do cartão deve ser um UUID válido').optional(),
  
  token: z.string().min(1, 'Token do cartão é obrigatório').optional(),
  
  installments: z.number()
    .int('Número de parcelas deve ser um número inteiro')
    .min(1, 'Número de parcelas deve ser pelo menos 1')
    .max(12, 'Número de parcelas não pode ser maior que 12')
    .optional(),
  
  payer: z.object({
    email: z.string().email('Email inválido'),
    firstName: z.string().min(1, 'Nome é obrigatório').optional(),
    lastName: z.string().min(1, 'Sobrenome é obrigatório').optional(),
    identification: z.object({
      type: z.enum(['CPF', 'CNPJ'], {
        errorMap: () => ({ message: 'Tipo de identificação deve ser CPF ou CNPJ' }),
      }),
      number: z.string()
        .min(11, 'Número de identificação inválido')
        .max(14, 'Número de identificação inválido')
        .regex(/^\d+$/, 'Número de identificação deve conter apenas dígitos'),
    }),
  }),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;

