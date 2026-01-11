import { z } from 'zod';

/**
 * Schema de validação para criar endereço
 */
export const createAddressSchema = z.object({
  tipo: z.enum(['casa', 'trabalho', 'outro'], {
    errorMap: () => ({ message: 'Tipo deve ser "casa", "trabalho" ou "outro"' }),
  }),
  
  rua: z.string()
    .min(3, 'Rua deve ter pelo menos 3 caracteres')
    .max(200, 'Rua deve ter no máximo 200 caracteres'),
  
  numero: z.string()
    .min(1, 'Número é obrigatório')
    .max(20, 'Número deve ter no máximo 20 caracteres'),
  
  complemento: z.string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional(),
  
  bairro: z.string()
    .min(2, 'Bairro deve ter pelo menos 2 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  
  cidade: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  
  estado: z.string()
    .length(2, 'Estado deve ter 2 caracteres (sigla)')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma sigla válida (ex: SP, RJ)'),
  
  cep: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato XXXXX-XXX ou XXXXXXXX')
    .transform((val) => val.replace(/\D/g, '')), // Remove formatação
  
  latitude: z.string()
    .regex(/^-?\d+\.?\d*$/, 'Latitude inválida')
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  
  longitude: z.string()
    .regex(/^-?\d+\.?\d*$/, 'Longitude inválida')
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  
  enderecoPadrao: z.boolean().optional().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

/**
 * Schema de validação para atualizar endereço
 */
export const updateAddressSchema = createAddressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

