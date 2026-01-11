// Schema de validação das variáveis de ambiente
// Nota: zod será instalado como dependência

interface EnvConfig {
  DATABASE_URL: string;
  API_PORT?: number;
  NODE_ENV?: 'development' | 'production' | 'test';
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  CORS_ORIGIN?: string;
  NEON_PROJECT_ID?: string;
  NEON_API_KEY?: string;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_PUBLIC_KEY?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  RESTAURANT_LATITUDE?: string;
  RESTAURANT_LONGITUDE?: string;
}

// Validar variáveis de ambiente
function validateEnv(): EnvConfig {
  const env: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    API_PORT: process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3000,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production-min-32-chars',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    NEON_PROJECT_ID: process.env.NEON_PROJECT_ID,
    NEON_API_KEY: process.env.NEON_API_KEY,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY,
    MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    RESTAURANT_LATITUDE: process.env.RESTAURANT_LATITUDE,
    RESTAURANT_LONGITUDE: process.env.RESTAURANT_LONGITUDE,
  };

  // Validações básicas
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
  }

  if (env.NODE_ENV === 'production') {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
    }
    if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres em produção');
    }
  } else {
    if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
      console.warn('⚠️  JWT_SECRET deve ter pelo menos 32 caracteres para produção');
    }
  }

  return env;
}

export const env = validateEnv();

// Tipos TypeScript
export type Env = EnvConfig;

