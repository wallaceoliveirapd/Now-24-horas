import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../../services/jwt.service';
import { createError } from './error-handler';
import { db } from '../../config/database';
import { usuarios } from '../../models/schema';
import { eq } from 'drizzle-orm';

/**
 * Interface para adicionar dados do usuário ao Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipoUsuario: string;
        nomeCompleto: string;
      };
    }
  }
}

/**
 * Middleware de autenticação
 * Valida o access token JWT e adiciona dados do usuário ao req.user
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de autenticação não fornecido', 401, 'AUTH_TOKEN_REQUIRED');
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const payload = jwtService.verifyAccessToken(token);

    // Buscar usuário no banco para garantir que ainda existe e está ativo
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, payload.userId))
      .limit(1);

    if (!usuario) {
      throw createError('Usuário não encontrado', 401, 'USER_NOT_FOUND');
    }

    if (!usuario.ativo) {
      throw createError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    // Adicionar dados do usuário ao request
    req.user = {
      id: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      nomeCompleto: usuario.nomeCompleto,
    };

    next();
  } catch (error: any) {
    if (error.message?.includes('Token inválido') || error.message?.includes('expirado')) {
      return next(createError('Token inválido ou expirado', 401, 'INVALID_TOKEN'));
    }
    next(error);
  }
}

/**
 * Middleware opcional de autenticação
 * Não retorna erro se não houver token, apenas adiciona user se existir
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = jwtService.verifyAccessToken(token);

      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, payload.userId))
        .limit(1);

      if (usuario && usuario.ativo) {
        req.user = {
          id: usuario.id,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
          nomeCompleto: usuario.nomeCompleto,
        };
      }
    }

    next();
  } catch (error) {
    // Ignorar erros em autenticação opcional
    next();
  }
}

