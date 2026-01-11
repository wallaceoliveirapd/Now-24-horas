import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../config/database';
import { tokensAutenticacao, usuarios } from '../models/schema';
import { eq } from 'drizzle-orm';

export interface TokenPayload {
  userId: string;
  email: string;
  tipoUsuario: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Serviço para gerenciar tokens JWT
 */
export class JwtService {
  /**
   * Gerar par de tokens (access + refresh)
   */
  async generateTokenPair(payload: TokenPayload, dispositivo?: string, ipAddress?: string): Promise<TokenPair> {
    if (!env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_SECRET e JWT_REFRESH_SECRET devem estar configurados');
    }

    const accessToken = jwt.sign(
      payload,
      env.JWT_SECRET,
      { expiresIn: (env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await db.insert(tokensAutenticacao).values({
      usuarioId: payload.userId,
      token: refreshToken,
      expiraEm: expiresAt,
      dispositivo: dispositivo || 'unknown',
      ipAddress: ipAddress,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verificar access token
   */
  verifyAccessToken(token: string): TokenPayload {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está configurado');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Verificar refresh token
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string; tokenId: string }> {
    if (!env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET não está configurado');
    }

    try {
      // Verificar assinatura do token
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; type: string };
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token não é um refresh token');
      }

      // Verificar se token existe no banco e não expirou
      const tokenRecord = await db
        .select()
        .from(tokensAutenticacao)
        .where(eq(tokensAutenticacao.token, token))
        .limit(1);

      if (tokenRecord.length === 0) {
        throw new Error('Refresh token não encontrado');
      }

      const tokenData = tokenRecord[0];

      if (new Date() > tokenData.expiraEm) {
        // Remover token expirado
        await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.id, tokenData.id));
        throw new Error('Refresh token expirado');
      }

      return {
        userId: decoded.userId,
        tokenId: tokenData.id,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gerar novo access token a partir de refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verificar refresh token
    const { userId } = await this.verifyRefreshToken(refreshToken);

    // Buscar usuário
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    if (!usuario || !usuario.ativo) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    // Gerar novo par de tokens (rotação de refresh token)
    const payload: TokenPayload = {
      userId: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    };

    // Invalidar refresh token antigo
    await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.token, refreshToken));

    // Gerar novos tokens
    return this.generateTokenPair(payload);
  }

  /**
   * Invalidar refresh token (logout)
   */
  async invalidateRefreshToken(token: string): Promise<void> {
    await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.token, token));
  }

  /**
   * Invalidar todos os tokens de um usuário (logout de todos os dispositivos)
   */
  async invalidateAllUserTokens(userId: string): Promise<void> {
    await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.usuarioId, userId));
  }
}

export const jwtService = new JwtService();

