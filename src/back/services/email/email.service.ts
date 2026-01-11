import { Resend } from 'resend';
import { renderEmailTemplate, TemplateVariables } from './template-engine';
import { TEMPLATE_PATHS } from './templates';

/**
 * Serviço para envio de emails usando Resend
 */
class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    // Usar domínio de teste do Resend por padrão (não requer verificação)
    // Para produção, configure EMAIL_FROM com um domínio verificado
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const fromName = process.env.EMAIL_FROM_NAME || 'Now 24 Horas';

    this.fromEmail = fromEmail;
    this.fromName = fromName;

    if (apiKey) {
      this.resend = new Resend(apiKey);
      console.log('✅ Resend configurado com sucesso');
      console.log(`   From: ${this.fromName} <${this.fromEmail}>`);
      if (fromEmail.includes('resend.dev')) {
        console.log('   ℹ️  Usando domínio de teste do Resend (onboarding@resend.dev)');
        console.log('   Para produção, configure EMAIL_FROM com um domínio verificado');
      }
    } else {
      console.warn('⚠️  RESEND_API_KEY não configurada. Emails não serão enviados.');
      console.warn('   Configure RESEND_API_KEY no arquivo .env.local');
    }
  }

  /**
   * Método genérico para enviar email usando templates
   */
  private async sendEmail(
    to: string,
    subject: string,
    htmlTemplatePath: string,
    textTemplatePath: string,
    variables: TemplateVariables
  ): Promise<void> {
    console.log('📧 sendEmail chamado:', { to, subject, resendConfigurado: !!this.resend });
    
    if (!this.resend) {
      console.warn('⚠️  Resend não configurado. Email não enviado para:', to);
      console.warn('   Verifique se RESEND_API_KEY está configurada no .env.local');
      console.log('   Variáveis:', variables);
      return;
    }

    try {
      // Renderizar templates
      const { html, text } = await renderEmailTemplate(
        htmlTemplatePath,
        textTemplatePath,
        {
          ...variables,
          subject,
        }
      );

      // Enviar email
      console.log(`📤 Enviando email via Resend...`);
      console.log(`   To: ${to}`);
      console.log(`   From: ${this.fromName} <${this.fromEmail}>`);
      console.log(`   Subject: ${subject}`);
      
      const result = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      if (result.error) {
        console.error('❌ Erro ao enviar email:', result.error);
        console.error('   Tipo:', result.error.name);
        console.error('   Mensagem:', result.error.message);
        throw new Error(result.error.message || 'Erro ao enviar email');
      }

      console.log(`✅ Email enviado com sucesso!`);
      console.log(`📧 Resend ID: ${result.data?.id || 'N/A'}`);
      console.log(`📧 Para: ${to}`);
    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error);
      console.error('   Tipo:', error.name);
      console.error('   Mensagem:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
        console.error('   Status:', error.response.status);
      }
      throw error;
    }
  }

  /**
   * Enviar código OTP por email
   */
  async sendOtpEmail(
    email: string,
    codigo: string,
    nomeCompleto?: string
  ): Promise<void> {
    const nome = nomeCompleto || 'Usuário';

    try {
      await this.sendEmail(
        email,
        'Seu código de verificação - Now 24 Horas',
        TEMPLATE_PATHS.OTP_VERIFICATION_HTML,
        TEMPLATE_PATHS.OTP_VERIFICATION_TEXT,
        {
          nome,
          codigo,
        }
      );
    } catch (error) {
      // Não lançar erro para não quebrar o fluxo de registro
      // O código ainda será salvo no banco e pode ser visualizado nos logs
      console.error('Erro ao enviar email OTP (continuando fluxo):', error);
    }
  }

  /**
   * Verificar se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.resend !== null;
  }
}

export const emailService = new EmailService();

