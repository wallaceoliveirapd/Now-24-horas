import { db } from '../config/database';
import { usuarios } from '../models/schema';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { otpService } from './otp.service';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Verificar se email já existe
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.toLowerCase()))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Verificar se telefone já existe
   */
  async telefoneExists(telefone: string): Promise<boolean> {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    const result = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.telefone, telefoneLimpo))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Criar novo usuário
   */
  async createUser(data: {
    nomeCompleto: string;
    email: string;
    telefone: string;
    senha: string;
    cpf?: string;
  }) {
    // Verificar se email já existe
    if (await this.emailExists(data.email)) {
      throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Verificar se telefone já existe
    if (await this.telefoneExists(data.telefone)) {
      throw createError('Telefone já está em uso', 409, 'PHONE_ALREADY_EXISTS');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Limpar telefone (remover formatação)
    const telefoneLimpo = data.telefone.replace(/\D/g, '');

    // Criar usuário
    const [usuario] = await db
      .insert(usuarios)
      .values({
        nomeCompleto: data.nomeCompleto,
        email: data.email.toLowerCase(),
        telefone: telefoneLimpo,
        cpf: data.cpf?.replace(/\D/g, ''),
        senhaHash,
        tipoUsuario: 'cliente',
        emailVerificado: false,
        telefoneVerificado: false,
        ativo: true,
      })
      .returning();

    // Gerar código OTP para verificação
    console.log('📧 Chamando createOtp com email:', usuario.email);
    await otpService.createOtp(
      telefoneLimpo,
      'verificacao',
      usuario.id,
      usuario.email, // Enviar email com o código OTP
      usuario.nomeCompleto // Nome para personalizar o email
    );
    console.log('✅ createOtp concluído');

    return usuario;
  }

  /**
   * Buscar usuário por email ou telefone
   */
  async findByEmailOrTelefone(emailOuTelefone: string) {
    const isEmail = emailOuTelefone.includes('@');
    
    if (isEmail) {
      const result = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.email, emailOuTelefone.toLowerCase()))
        .limit(1);
      
      return result[0] || null;
    } else {
      const telefoneLimpo = emailOuTelefone.replace(/\D/g, '');
      const result = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.telefone, telefoneLimpo))
        .limit(1);
      
      return result[0] || null;
    }
  }

  /**
   * Verificar senha
   */
  async verifyPassword(senha: string, senhaHash: string): Promise<boolean> {
    return bcrypt.compare(senha, senhaHash);
  }
}

export const authService = new AuthService();

