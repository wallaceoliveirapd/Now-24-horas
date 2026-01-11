# 🔔 Implementação de Push Notifications para Live Activities

**Data:** 2025-01-05

---

## 🎯 Estratégia Recomendada

Para implementar Live Activities no nosso projeto, vamos usar uma abordagem híbrida:

1. **Push Notifications** via Expo Notifications (funciona agora)
2. **Live Activities** via código nativo (futuro, quando necessário)

---

## 📋 Implementação Imediata: Push Notifications

### **Passo 1: Instalar Dependências**

```bash
npm install expo-notifications
npm install expo-device
```

### **Passo 2: Configurar app.json**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification.wav"],
          "mode": "production"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSUserNotificationsUsageDescription": "Este app precisa de permissão para enviar notificações sobre seus pedidos."
      }
    },
    "android": {
      "useNextNotificationsApi": true
    }
  }
}
```

### **Passo 3: Criar Serviço de Push no Frontend**

**`src/front/services/push-notification.service.ts`**

```typescript
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

export class PushNotificationService {
  /**
   * Registrar dispositivo para receber push notifications
   */
  async registerForPushNotifications(userId: string, token: string) {
    if (!Device.isDevice) {
      console.warn('Push notifications só funcionam em dispositivos físicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão de notificações negada');
      return null;
    }

    // Obter token Expo
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Configurar no app.json
    });

    // Enviar token para backend
    await this.sendTokenToBackend(userId, expoPushToken.data, token);

    // Configurar listeners
    this.setupNotificationListeners();

    return expoPushToken.data;
  }

  /**
   * Enviar token para backend
   */
  private async sendTokenToBackend(
    userId: string,
    expoPushToken: string,
    authToken: string
  ) {
    try {
      await fetch(`${API_URL}/api/users/push-token`, {
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
    } catch (error) {
      console.error('Erro ao enviar token:', error);
    }
  }

  /**
   * Configurar listeners de notificações
   */
  private setupNotificationListeners() {
    // Listener quando notificação é recebida
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificação recebida:', notification);
      // Atualizar UI se necessário
    });

    // Listener quando usuário toca na notificação
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Usuário tocou na notificação:', response);
      // Navegar para tela específica
      const data = response.notification.request.content.data;
      if (data?.pedidoId) {
        // Navegar para detalhes do pedido
      }
    });
  }

  /**
   * Agendar notificação local (para testes)
   */
  async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 2 },
    });
  }
}

export const pushNotificationService = new PushNotificationService();
```

### **Passo 4: Criar Endpoint no Backend para Salvar Tokens**

**`src/back/api/routes/user.routes.ts`** (adicionar rota)

```typescript
/**
 * POST /api/users/push-token
 * Salvar token de push notification do usuário
 */
router.post(
  '/push-token',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { expoPushToken, platform } = req.body;

      // Salvar token no banco (criar tabela tokensPush se necessário)
      // ou atualizar campo no usuário

      res.json({
        success: true,
        message: 'Token salvo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);
```

### **Passo 5: Atualizar Serviço de Notificações no Backend**

**`src/back/services/notification.service.ts`** (adicionar método)

```typescript
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Enviar push notification via Expo
 */
async sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Token inválido: ${expoPushToken}`);
    return;
  }

  const messages = [{
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  }];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Erro ao enviar push:', error);
    }
  }

  return tickets;
}
```

---

## 🚀 Próximos Passos para Live Activities

### **Quando Implementar Live Activities Nativas:**

1. **Criar Widget Extension** (requer código Swift)
2. **Configurar ActivityKit**
3. **Criar Config Plugin** para Expo
4. **Usar APNs diretamente** (não Expo Push)

### **Alternativa Mais Simples:**

Usar **push notifications atualizadas frequentemente** que funcionam em todas as versões do iOS e Android, sem necessidade de código nativo.

---

## 📝 Exemplo de Uso

```typescript
// No componente de pedido
import { pushNotificationService } from '../services/push-notification.service';

// Registrar quando usuário faz login
await pushNotificationService.registerForPushNotifications(userId, authToken);

// Backend envia push quando status muda
await notificationService.sendPushNotification(
  user.expoPushToken,
  'Pedido atualizado',
  'Seu pedido está sendo preparado',
  { pedidoId: '123', status: 'preparando' }
);
```

---

## ✅ Vantagens desta Abordagem

1. ✅ Funciona **agora** sem código nativo
2. ✅ Funciona em **iOS e Android**
3. ✅ Funciona em **todas as versões** do iOS
4. ✅ Fácil de implementar e manter
5. ✅ Pode evoluir para Live Activities depois

---

**Recomendação:** Começar com push notifications e evoluir para Live Activities quando necessário.

