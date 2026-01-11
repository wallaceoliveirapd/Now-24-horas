import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware de tratamento de erros global
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log do erro
  console.error('❌ Erro:', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Status code padrão
  const statusCode = err.statusCode || 500;

  // Resposta de erro padronizada
  const response: any = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Erro interno do servidor',
    },
  };

  // Adicionar detalhes em desenvolvimento
  if (env.NODE_ENV === 'development' && err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
}

/**
 * Helper para criar erros da API
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

