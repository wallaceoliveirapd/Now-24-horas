import { db } from '../config/database';
import { notificacoes, preferenciasNotificacao } from '../models/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';
import { pushNotificationService } from './push-notification.service';

/**
 * Serviço para gerenciar notificações
 */
export class NotificationService {
  /**
   * Listar notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    pagina: number = 1,
    limite: number = 20,
    apenasNaoLidas: boolean = false
  ) {
    const offset = (pagina - 1) * limite;

    const conditions = [eq(notificacoes.usuarioId, userId)];
    if (apenasNaoLidas) {
      conditions.push(eq(notificacoes.lida, false));
    }

    const notifications = await db
      .select()
      .from(notificacoes)
      .where(and(...conditions))
      .orderBy(desc(notificacoes.criadoEm))
      .limit(limite)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificacoes)
      .where(and(...conditions));

    const total = totalResult?.count || 0;

    return {
      notificacoes: notifications,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  /**
   * Obter contador de notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificacoes)
      .where(
        and(
          eq(notificacoes.usuarioId, userId),
          eq(notificacoes.lida, false)
        )
      );

    return typeof result.count === 'number' ? result.count : parseInt(String(result.count)) || 0;
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string, userId: string) {
    // Verificar se notificação existe e pertence ao usuário
    const [notification] = await db
      .select()
      .from(notificacoes)
      .where(
        and(
          eq(notificacoes.id, notificationId),
          eq(notificacoes.usuarioId, userId)
        )
      )
      .limit(1);

    if (!notification) {
      throw createError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
    }

    // Marcar como lida
    const [updated] = await db
      .update(notificacoes)
      .set({
        lida: true,
        lidaEm: new Date(),
      })
      .where(eq(notificacoes.id, notificationId))
      .returning();

    return updated;
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: string) {
    await db
      .update(notificacoes)
      .set({
        lida: true,
        lidaEm: new Date(),
      })
      .where(
        and(
          eq(notificacoes.usuarioId, userId),
          eq(notificacoes.lida, false)
        )
      );

    return { success: true };
  }

  /**
   * Obter preferências de notificação do usuário
   */
  async getNotificationPreferences(userId: string) {
    const [preferences] = await db
      .select()
      .from(preferenciasNotificacao)
      .where(eq(preferenciasNotificacao.usuarioId, userId))
      .limit(1);

    // Se não existir, criar com valores padrão
    if (!preferences) {
      const [newPreferences] = await db
        .insert(preferenciasNotificacao)
        .values({
          usuarioId: userId,
          atualizacoesPedido: true,
          promocoesOfertas: true,
          novidadesProdutos: false,
          notificacoesSistema: true,
          pushAtivado: true,
          emailAtivado: true,
          smsAtivado: false,
        })
        .returning();

      return newPreferences;
    }

    return preferences;
  }

  /**
   * Atualizar preferências de notificação
   */
  async updateNotificationPreferences(
    userId: string,
    data: {
      atualizacoesPedido?: boolean;
      promocoesOfertas?: boolean;
      novidadesProdutos?: boolean;
      notificacoesSistema?: boolean;
      pushAtivado?: boolean;
      emailAtivado?: boolean;
      smsAtivado?: boolean;
    }
  ) {
    // Verificar se preferências existem
    const [existing] = await db
      .select()
      .from(preferenciasNotificacao)
      .where(eq(preferenciasNotificacao.usuarioId, userId))
      .limit(1);

    if (!existing) {
      // Criar se não existir
      const [newPreferences] = await db
        .insert(preferenciasNotificacao)
        .values({
          usuarioId: userId,
          atualizacoesPedido: data.atualizacoesPedido ?? true,
          promocoesOfertas: data.promocoesOfertas ?? true,
          novidadesProdutos: data.novidadesProdutos ?? false,
          notificacoesSistema: data.notificacoesSistema ?? true,
          pushAtivado: data.pushAtivado ?? true,
          emailAtivado: data.emailAtivado ?? true,
          smsAtivado: data.smsAtivado ?? false,
        })
        .returning();

      return newPreferences;
    }

    // Atualizar preferências existentes
    const [updated] = await db
      .update(preferenciasNotificacao)
      .set({
        atualizacoesPedido: data.atualizacoesPedido ?? existing.atualizacoesPedido,
        promocoesOfertas: data.promocoesOfertas ?? existing.promocoesOfertas,
        novidadesProdutos: data.novidadesProdutos ?? existing.novidadesProdutos,
        notificacoesSistema: data.notificacoesSistema ?? existing.notificacoesSistema,
        pushAtivado: data.pushAtivado ?? existing.pushAtivado,
        emailAtivado: data.emailAtivado ?? existing.emailAtivado,
        smsAtivado: data.smsAtivado ?? existing.smsAtivado,
        atualizadoEm: new Date(),
      })
      .where(eq(preferenciasNotificacao.usuarioId, userId))
      .returning();

    return updated;
  }

  /**
   * Criar notificação (método interno)
   */
  async createNotification(data: {
    usuarioId: string;
    tipo: 'pedido' | 'pagamento' | 'entrega' | 'promocao' | 'sistema';
    titulo: string;
    mensagem: string;
    dados?: Record<string, any>;
  }) {
    // Verificar preferências do usuário antes de criar
    const preferences = await this.getNotificationPreferences(data.usuarioId);

    // Verificar se usuário quer receber este tipo de notificação
    let shouldCreate = false;

    switch (data.tipo) {
      case 'pedido':
      case 'pagamento':
      case 'entrega':
        shouldCreate = preferences.atualizacoesPedido;
        break;
      case 'promocao':
        shouldCreate = preferences.promocoesOfertas;
        break;
      case 'sistema':
        shouldCreate = preferences.notificacoesSistema;
        break;
    }

    if (!shouldCreate) {
      return null; // Não criar notificação se usuário desabilitou
    }

    const [notification] = await db
      .insert(notificacoes)
      .values({
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        dados: data.dados || null,
        lida: false,
        enviadaPush: false,
        enviadaEmail: false,
      })
      .returning();

    // Enviar push notification se pushAtivado === true
    if (preferences.pushAtivado) {
      await pushNotificationService.sendPushNotification(
        data.usuarioId,
        data.titulo,
        data.mensagem,
        {
          tipo: data.tipo,
          notificacaoId: notification.id,
          ...data.dados,
        }
      );

      // Marcar como enviada
      await db
        .update(notificacoes)
        .set({ enviadaPush: true })
        .where(eq(notificacoes.id, notification.id));
    }

    // TODO: Enviar email se emailAtivado === true

    return notification;
  }
}

export const notificationService = new NotificationService();

