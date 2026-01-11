import { db } from '../config/database';
import { codigosOtp, usuarios } from '../models/schema';
import { eq, and, gt } from 'drizzle-orm';
import { emailService } from './email';

/**
 * Serviço para gerenciar códigos OTP
 */
export class OtpService {
  /**
   * Gerar código OTP de 4 dígitos
   */
  private generateOtpCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Criar código OTP
   */
  async createOtp(
    telefone: string,
    tipo: 'verificacao' | 'recuperacao_senha',
    usuarioId?: string,
    email?: string,
    nomeCompleto?: string
  ): Promise<string> {
    console.log('🔐 createOtp chamado:', { telefone, tipo, usuarioId, email, nomeCompleto });
    
    const codigo = this.generateOtpCode();
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    console.log(`📝 Salvando código OTP no banco: ${codigo}`);

    await db.insert(codigosOtp).values({
      telefone,
      codigo,
      tipo,
      usuarioId: usuarioId || null,
      usado: false,
      expiraEm,
    });

    console.log('✅ Código OTP salvo no banco');

    // Enviar email se disponível
    console.log(`📧 Verificando envio de email. Email fornecido: ${email ? 'SIM' : 'NÃO'}`);
    if (email) {
      try {
        // Se não tiver nome completo mas tiver usuarioId, buscar do banco
        let nome = nomeCompleto;
        if (!nome && usuarioId) {
          const [usuario] = await db
            .select({ nomeCompleto: usuarios.nomeCompleto })
            .from(usuarios)
            .where(eq(usuarios.id, usuarioId))
            .limit(1);
          nome = usuario?.nomeCompleto;
        }

        console.log(`📧 Tentando enviar email OTP para: ${email}`);
        await emailService.sendOtpEmail(email, codigo, nome);
        console.log(`✅ Email OTP enviado com sucesso para: ${email}`);
      } catch (error: any) {
        console.error('❌ Erro ao enviar email OTP:', error);
        console.error('   Mensagem:', error.message);
        // Continuar mesmo se falhar o envio de email
      }
    }

    // Log do código (útil para desenvolvimento)
    console.log(`📱 OTP gerado para ${telefone}: ${codigo} (expira em 10 minutos)`);
    if (email) {
      console.log(`📧 Email: ${email}`);
    }

    return codigo;
  }

  /**
   * Validar código OTP
   */
  async validateOtp(
    telefone: string,
    codigo: string,
    tipo: 'verificacao' | 'recuperacao_senha'
  ): Promise<{ valid: boolean; codigoId?: string; usuarioId?: string }> {
    const telefoneLimpo = telefone.replace(/\D/g, '');

    // Buscar código OTP válido
    const otpCodes = await db
      .select()
      .from(codigosOtp)
      .where(
        and(
          eq(codigosOtp.telefone, telefoneLimpo),
          eq(codigosOtp.codigo, codigo),
          eq(codigosOtp.tipo, tipo),
          eq(codigosOtp.usado, false),
          gt(codigosOtp.expiraEm, new Date())
        )
      )
      .limit(1);

    if (otpCodes.length === 0) {
      return { valid: false };
    }

    const otp = otpCodes[0];

    // Marcar como usado
    await db
      .update(codigosOtp)
      .set({ usado: true })
      .where(eq(codigosOtp.id, otp.id));

    return {
      valid: true,
      codigoId: otp.id,
      usuarioId: otp.usuarioId || undefined,
    };
  }

  /**
   * Limpar códigos OTP expirados (manutenção)
   */
  async cleanExpiredOtps(): Promise<number> {
    const result = await db
      .delete(codigosOtp)
      .where(gt(codigosOtp.expiraEm, new Date()));

    return result.rowCount || 0;
  }
}

export const otpService = new OtpService();

