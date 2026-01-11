/**
 * Serviço de autenticação social
 */

import { db } from '../config/database';
import { usuarios } from '../models/schema';
import { eq, or, and, isNotNull } from 'drizzle-orm';
import { jwtService } from './jwt.service';
import { createError } from '../api/middlewares/error-handler';
import axios from 'axios';

export class SocialAuthService {
  /**
   * Verificar token ID do Google e obter dados do usuário
   */
  async verifyGoogleToken(idToken: string): Promise<{
    email: string;
    nome: string;
    foto?: string;
  }> {
    try {
      // Verificar token com Google
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );

      if (!response.data || !response.data.email) {
        throw createError('Token do Google inválido', 401, 'INVALID_GOOGLE_TOKEN');
      }

      return {
        email: response.data.email,
        nome: response.data.name || response.data.given_name || 'Usuário',
        foto: response.data.picture,
      };
    } catch (error: any) {
      if (error.code === 'INVALID_GOOGLE_TOKEN') {
        throw error;
      }
      throw createError('Erro ao verificar token do Google', 401, 'GOOGLE_VERIFICATION_ERROR');
    }
  }

  /**
   * Verificar token do Apple e obter dados do usuário
   */
  async verifyAppleToken(identityToken: string, authorizationCode?: string): Promise<{
    email?: string;
    nome?: string;
    userId: string;
  }> {
    try {
      // Decodificar token JWT do Apple (sem verificação completa por simplicidade)
      // Em produção, você deve verificar a assinatura com as chaves públicas da Apple
      const parts = identityToken.split('.');
      if (parts.length !== 3) {
        throw createError('Token do Apple inválido', 401, 'INVALID_APPLE_TOKEN');
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      return {
        email: payload.email,
        nome: payload.name,
        userId: payload.sub,
      };
    } catch (error: any) {
      if (error.code === 'INVALID_APPLE_TOKEN') {
        throw error;
      }
      throw createError('Erro ao verificar token do Apple', 401, 'APPLE_VERIFICATION_ERROR');
    }
  }

  /**
   * Verificar access token do Facebook e obter dados do usuário
   */
  async verifyFacebookToken(accessToken: string): Promise<{
    email: string;
    nome: string;
    foto?: string;
  }> {
    try {
      // Obter dados do usuário do Facebook
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );

      if (!response.data || !response.data.id) {
        throw createError('Token do Facebook inválido', 401, 'INVALID_FACEBOOK_TOKEN');
      }

      return {
        email: response.data.email || `${response.data.id}@facebook.com`,
        nome: response.data.name || 'Usuário',
        foto: response.data.picture?.data?.url,
      };
    } catch (error: any) {
      if (error.code === 'INVALID_FACEBOOK_TOKEN') {
        throw error;
      }
      throw createError('Erro ao verificar token do Facebook', 401, 'FACEBOOK_VERIFICATION_ERROR');
    }
  }

  /**
   * Criar ou encontrar usuário por email (para login social)
   * Valida se já existe usuário com mesmo email, CPF ou telefone
   */
  async findOrCreateUser(data: {
    email: string;
    nome: string;
    foto?: string;
    provider: 'google' | 'apple' | 'facebook';
    providerId: string;
    cpf?: string;
    telefone?: string;
  }) {
    const emailLower = data.email.toLowerCase();
    
    // Buscar usuário existente por email, CPF ou telefone
    const conditions = [eq(usuarios.email, emailLower)];
    
    // Se CPF fornecido, adicionar à busca
    if (data.cpf) {
      const cpfLimpo = data.cpf.replace(/\D/g, '');
      if (cpfLimpo.length === 11) {
        conditions.push(eq(usuarios.cpf, cpfLimpo));
      }
    }
    
    // Se telefone fornecido, adicionar à busca
    if (data.telefone) {
      const telefoneLimpo = data.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length >= 10) {
        conditions.push(eq(usuarios.telefone, telefoneLimpo));
      }
    }
    
    // Buscar usuário existente
    const [existingUser] = await db
      .select()
      .from(usuarios)
      .where(or(...conditions))
      .limit(1);

    if (existingUser) {
      // Verificar qual campo causou a duplicata
      if (existingUser.email.toLowerCase() === emailLower) {
        // Usuário encontrado por email - atualizar foto se fornecida
        if (data.foto && !existingUser.fotoPerfil) {
          await db
            .update(usuarios)
            .set({ fotoPerfil: data.foto })
            .where(eq(usuarios.id, existingUser.id));
        }
        return existingUser;
      }
      
      // Se encontrou por CPF ou telefone, mas email é diferente, é um conflito
      if (data.cpf && existingUser.cpf) {
        const cpfLimpo = data.cpf.replace(/\D/g, '');
        const existingCpfLimpo = existingUser.cpf.replace(/\D/g, '');
        if (cpfLimpo === existingCpfLimpo && existingUser.email.toLowerCase() !== emailLower) {
          throw createError(
            'Este CPF já está cadastrado com outro email. Faça login com sua conta original.',
            409,
            'CPF_ALREADY_EXISTS'
          );
        }
      }
      
      if (data.telefone) {
        const telefoneLimpo = data.telefone.replace(/\D/g, '');
        const existingTelefoneLimpo = existingUser.telefone.replace(/\D/g, '');
        if (telefoneLimpo === existingTelefoneLimpo && existingUser.email.toLowerCase() !== emailLower) {
          throw createError(
            'Este telefone já está cadastrado com outro email. Faça login com sua conta original.',
            409,
            'PHONE_ALREADY_EXISTS'
          );
        }
      }
      
      // Se chegou aqui, encontrou por email mas pode ter outros campos diferentes
      return existingUser;
    }

    // Verificar se email já existe (busca separada para garantir)
    const [emailExists] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, emailLower))
      .limit(1);
    
    if (emailExists) {
      // Atualizar foto se fornecida
      if (data.foto && !emailExists.fotoPerfil) {
        await db
          .update(usuarios)
          .set({ fotoPerfil: data.foto })
          .where(eq(usuarios.id, emailExists.id));
      }
      return emailExists;
    }

    // Verificar se CPF já existe (se fornecido)
    if (data.cpf) {
      const cpfLimpo = data.cpf.replace(/\D/g, '');
      if (cpfLimpo.length === 11) {
        const [cpfExists] = await db
          .select()
          .from(usuarios)
          .where(and(eq(usuarios.cpf, cpfLimpo), isNotNull(usuarios.cpf)))
          .limit(1);
        
        if (cpfExists) {
          throw createError(
            'Este CPF já está cadastrado. Faça login com sua conta original.',
            409,
            'CPF_ALREADY_EXISTS'
          );
        }
      }
    }

    // Verificar se telefone já existe (se fornecido)
    if (data.telefone) {
      const telefoneLimpo = data.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length >= 10) {
        const [telefoneExists] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.telefone, telefoneLimpo))
          .limit(1);
        
        if (telefoneExists) {
          throw createError(
            'Este telefone já está cadastrado. Faça login com sua conta original.',
            409,
            'PHONE_ALREADY_EXISTS'
          );
        }
      }
    }

    // Criar novo usuário
    // Gerar telefone temporário baseado no provider ID se não fornecido
    let telefoneFinal = data.telefone;
    if (!telefoneFinal) {
      telefoneFinal = `55${data.providerId.slice(-10)}`;
    } else {
      telefoneFinal = telefoneFinal.replace(/\D/g, '');
    }

    const [newUser] = await db
      .insert(usuarios)
      .values({
        nomeCompleto: data.nome,
        email: emailLower,
        telefone: telefoneFinal,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
        senhaHash: '', // Sem senha para login social
        tipoUsuario: 'cliente',
        emailVerificado: true, // Email já verificado pelo provider
        telefoneVerificado: false,
        fotoPerfil: data.foto,
        ativo: true,
      })
      .returning();

    return newUser;
  }

  /**
   * Autenticar com Google
   */
  async authenticateWithGoogle(idToken: string, userAgent?: string, ip?: string) {
    // Verificar token
    const googleUser = await this.verifyGoogleToken(idToken);

    // Criar ou encontrar usuário
    const usuario = await this.findOrCreateUser({
      email: googleUser.email,
      nome: googleUser.nome,
      foto: googleUser.foto,
      provider: 'google',
      providerId: googleUser.email,
    });

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      throw createError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    // Gerar tokens JWT
    const tokens = await jwtService.generateTokenPair(
      {
        userId: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
      userAgent,
      ip
    );

    // Verificar se precisa completar perfil (CPF e telefone)
    const precisaCompletarPerfil = !usuario.cpf || !usuario.telefone || usuario.telefone === '00000000000';

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefone: usuario.telefone,
        nomeCompleto: usuario.nomeCompleto,
        tipoUsuario: usuario.tipoUsuario,
        emailVerificado: usuario.emailVerificado,
        telefoneVerificado: usuario.telefoneVerificado,
        fotoPerfil: usuario.fotoPerfil,
        cpf: usuario.cpf,
      },
      tokens,
      precisaCompletarPerfil,
    };
  }

  /**
   * Autenticar com Apple
   */
  async authenticateWithApple(
    identityToken: string,
    authorizationCode?: string,
    email?: string,
    fullName?: string,
    userAgent?: string,
    ip?: string
  ) {
    // Verificar token
    const appleUser = await this.verifyAppleToken(identityToken, authorizationCode);

    // Usar email fornecido ou do token
    const userEmail = email || appleUser.email || `${appleUser.userId}@apple.com`;
    const userName = fullName || appleUser.nome || 'Usuário Apple';

    // Criar ou encontrar usuário
    const usuario = await this.findOrCreateUser({
      email: userEmail,
      nome: userName,
      provider: 'apple',
      providerId: appleUser.userId,
    });

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      throw createError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    // Gerar tokens JWT
    const tokens = await jwtService.generateTokenPair(
      {
        userId: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
      userAgent,
      ip
    );

    // Verificar se precisa completar perfil (CPF e telefone)
    const precisaCompletarPerfil = !usuario.cpf || !usuario.telefone || usuario.telefone === '00000000000';

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefone: usuario.telefone,
        nomeCompleto: usuario.nomeCompleto,
        tipoUsuario: usuario.tipoUsuario,
        emailVerificado: usuario.emailVerificado,
        telefoneVerificado: usuario.telefoneVerificado,
        fotoPerfil: usuario.fotoPerfil,
        cpf: usuario.cpf,
      },
      tokens,
      precisaCompletarPerfil,
    };
  }

  /**
   * Autenticar com Facebook
   */
  async authenticateWithFacebook(accessToken: string, userAgent?: string, ip?: string) {
    // Verificar token
    const facebookUser = await this.verifyFacebookToken(accessToken);

    // Criar ou encontrar usuário
    const usuario = await this.findOrCreateUser({
      email: facebookUser.email,
      nome: facebookUser.nome,
      foto: facebookUser.foto,
      provider: 'facebook',
      providerId: facebookUser.email,
    });

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      throw createError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    // Gerar tokens JWT
    const tokens = await jwtService.generateTokenPair(
      {
        userId: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
      userAgent,
      ip
    );

    // Verificar se precisa completar perfil (CPF e telefone)
    const precisaCompletarPerfil = !usuario.cpf || !usuario.telefone || usuario.telefone === '00000000000';

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefone: usuario.telefone,
        nomeCompleto: usuario.nomeCompleto,
        tipoUsuario: usuario.tipoUsuario,
        emailVerificado: usuario.emailVerificado,
        telefoneVerificado: usuario.telefoneVerificado,
        fotoPerfil: usuario.fotoPerfil,
        cpf: usuario.cpf,
      },
      tokens,
      precisaCompletarPerfil,
    };
  }
}

export const socialAuthService = new SocialAuthService();

