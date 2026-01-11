import { z } from 'zod';

// Schemas para autenticação social
export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Token ID do Google é obrigatório'),
});

export const appleAuthSchema = z.object({
  identityToken: z.string().min(1, 'Token de identidade do Apple é obrigatório'),
  authorizationCode: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
});

export const facebookAuthSchema = z.object({
  accessToken: z.string().min(1, 'Access token do Facebook é obrigatório'),
});

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z.object({
  nomeCompleto: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .transform((val) => val.replace(/\D/g, '')), // Remove formatação, mantém apenas números
  
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX')
    .transform((val) => val.replace(/\D/g, '')) // Remove formatação
    .refine((val) => {
      // Validação básica de CPF (pode ser melhorada)
      if (val.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(val)) return false; // Todos os dígitos iguais
      return true;
    }, 'CPF inválido')
    .optional(),
  
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema de validação para verificação OTP
 */
export const verifyOtpSchema = z.object({
  emailOuTelefone: z.string()
    .min(1, 'Email ou telefone é obrigatório'),
  
  codigo: z.string()
    .length(4, 'Código OTP deve ter 4 dígitos')
    .regex(/^\d+$/, 'Código OTP deve conter apenas números'),
  
  tipo: z.enum(['verificacao', 'recuperacao_senha']).optional().default('verificacao'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Schema de validação para reenvio de OTP
 */
export const resendOtpSchema = z.object({
  emailOuTelefone: z.string()
    .min(1, 'Email ou telefone é obrigatório'),
  
  tipo: z.enum(['verificacao', 'recuperacao_senha'], {
    errorMap: () => ({ message: 'Tipo deve ser "verificacao" ou "recuperacao_senha"' }),
  }),
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  emailOuTelefone: z.string()
    .min(1, 'Email ou telefone é obrigatório'),
  
  senha: z.string()
    .min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema de validação para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

