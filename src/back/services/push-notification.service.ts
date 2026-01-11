import { Expo } from 'expo-server-sdk';
import { db } from '../config/database';
import { usuarios } from '../models/schema';
import { eq } from 'drizzle-orm';

/**
 * Serviço para enviar push notifications via Expo
 */
export class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Enviar push notification para um usuário
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Buscar token do usuário
      const [user] = await db
        .select({ expoPushToken: usuarios.expoPushToken })
        .from(usuarios)
        .where(eq(usuarios.id, userId))
        .limit(1);

      if (!user || !user.expoPushToken) {
        console.log(`⚠️ Usuário ${userId} não tem token de push registrado`);
        return false;
      }

      // Validar token
      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error(`❌ Token inválido para usuário ${userId}: ${user.expoPushToken}`);
        return false;
      }

      // Criar mensagem
      const messages = [
        {
          to: user.expoPushToken,
          sound: 'default' as const,
          title,
          body,
          data: data || {},
          badge: 1,
        },
      ];

      // Enviar em chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('❌ Erro ao enviar push notification:', error);
          return false;
        }
      }

      // Verificar erros nos tickets
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('❌ Erro no ticket:', ticket.message);
          
          // Se token é inválido, remover do banco
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await this.removePushToken(userId);
          }
          
          return false;
        }
      }

      console.log(`✅ Push notification enviada para usuário ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar push notification:', error);
      return false;
    }
  }

  /**
   * Enviar push notification para múltiplos usuários
   */
  async sendPushNotificationToMultiple(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.sendPushNotification(userId, title, body, data);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Remover token de push do usuário
   */
  async removePushToken(userId: string): Promise<void> {
    await db
      .update(usuarios)
      .set({
        expoPushToken: null,
        atualizadoEm: new Date(),
      })
      .where(eq(usuarios.id, userId));
  }

  /**
   * Salvar token de push do usuário
   */
  async savePushToken(userId: string, expoPushToken: string): Promise<void> {
    // Validar token
    if (!Expo.isExpoPushToken(expoPushToken)) {
      throw new Error('Token Expo inválido');
    }

    await db
      .update(usuarios)
      .set({
        expoPushToken,
        atualizadoEm: new Date(),
      })
      .where(eq(usuarios.id, userId));
  }
}

export const pushNotificationService = new PushNotificationService();
