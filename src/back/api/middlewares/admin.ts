import { Request, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { usuarios } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { createError } from './error-handler';

/**
 * Middleware para verificar se o usuário é administrador
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    // Buscar usuário no banco para verificar tipo
    const [user] = await db
      .select({
        id: usuarios.id,
        tipoUsuario: usuarios.tipoUsuario,
      })
      .from(usuarios)
      .where(eq(usuarios.id, req.user.id))
      .limit(1);

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar se é administrador ou gerente
    if (user.tipoUsuario !== 'administrador' && user.tipoUsuario !== 'gerente') {
      throw createError(
        'Acesso negado. Apenas administradores podem acessar este recurso.',
        403,
        'FORBIDDEN'
      );
    }

    // Adicionar tipo de usuário ao request para uso posterior
    req.user.tipoUsuario = user.tipoUsuario;

    next();
  } catch (error) {
    next(error);
  }
}

