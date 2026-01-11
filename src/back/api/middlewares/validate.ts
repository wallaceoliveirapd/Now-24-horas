import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from './error-handler';

/**
 * Middleware para validar dados de entrada usando Zod
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar apenas body (query e params são somente leitura)
      const validated = schema.parse(req.body);
      
      // Substituir body pelos dados validados
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const validationError = createError(
          'Dados de entrada inválidos',
          400,
          'VALIDATION_ERROR',
          { errors }
        );

        return next(validationError);
      }

      return next(error);
    }
  };
}

