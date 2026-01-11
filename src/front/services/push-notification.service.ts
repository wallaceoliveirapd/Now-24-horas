import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Serviço para gerenciar push notifications
 */
export class PushNotificationService {
  private apiUrl: string;

  constructor() {
    // Usar variável de ambiente ou URL padrão
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Registrar dispositivo para receber push notifications
   */
  async registerForPushNotifications(userId: string, authToken: string): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('⚠️ Push notifications só funcionam em dispositivos físicos');
      return null;
    }

    // Verificar permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permissão de notificações negada');
      return null;
    }

    try {
      // Obter token Expo
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // TODO: Configurar no app.json
      });

      // Enviar token para backend
      await this.sendTokenToBackend(userId, expoPushToken.data, authToken);

      // Configurar listeners
      this.setupNotificationListeners();

      console.log('✅ Push notification registrado:', expoPushToken.data);
      return expoPushToken.data;
    } catch (error) {
      console.error('❌ Erro ao registrar push notification:', error);
      return null;
    }
  }

  /**
   * Enviar token para backend
   */
  private async sendTokenToBackend(
    userId: string,
    expoPushToken: string,
    authToken: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/users/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          expoPushToken,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar token: ${response.status}`);
      }

      console.log('✅ Token salvo no backend');
    } catch (error) {
      console.error('❌ Erro ao enviar token para backend:', error);
      throw error;
    }
  }

  /**
   * Configurar listeners de notificações
   */
  private setupNotificationListeners(): void {
    // Listener quando notificação é recebida (app em foreground)
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notificação recebida:', notification);
      // Aqui você pode atualizar a UI se necessário
    });

    // Listener quando usuário toca na notificação
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Usuário tocou na notificação:', response);
      
      const data = response.notification.request.content.data;
      
      // Navegar para tela específica baseado nos dados
      if (data?.pedidoId) {
        // TODO: Navegar para detalhes do pedido
        console.log('Navegar para pedido:', data.pedidoId);
      }
    });
  }

  /**
   * Agendar notificação local (para testes)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 2 },
    });

    return notificationId;
  }

  /**
   * Cancelar todas as notificações agendadas
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obter badge count (número de notificações não lidas)
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Limpar badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

export const pushNotificationService = new PushNotificationService();

