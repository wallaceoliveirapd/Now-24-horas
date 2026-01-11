# 📱 Plano de Implementação - Live Activities

**Data:** 2025-01-05  
**Status:** 📋 Planejamento

---

## 🎯 Objetivo

Implementar Live Activities (notificações ao vivo) para acompanhamento de pedidos em tempo real, similar ao iFood.

---

## 📊 Análise de Requisitos

### **Funcionalidades Desejadas:**
- ✅ Mostrar status do pedido na tela de bloqueio
- ✅ Atualizar em tempo real (preparando → saiu para entrega → entregue)
- ✅ Mostrar tempo estimado de entrega
- ✅ Mostrar barra de progresso
- ✅ Mostrar informações do restaurante/entregador
- ✅ Funcionar mesmo com app fechado

### **Plataformas:**
- **iOS 16+:** Live Activities (nativo)
- **Android:** Notificações com progresso (Android 16+) ou notificações normais atualizadas

---

## 🏗️ Arquitetura Proposta

### **Backend:**
```
Order Status Updated
    ↓
Notification Service
    ↓
APNs (iOS) / FCM (Android)
    ↓
Device
    ↓
Live Activity Widget (iOS) / Notification (Android)
```

### **Fluxo de Dados:**
1. Pedido criado → Criar Live Activity
2. Status atualizado → Atualizar Live Activity via Push
3. Pedido entregue → Finalizar Live Activity

---

## 📋 Fases de Implementação

### **FASE 1: Preparação** ⏳
- [ ] Configurar Expo Notifications
- [ ] Obter certificados APNs (Apple Push Notification)
- [ ] Configurar FCM (Firebase Cloud Messaging) para Android
- [ ] Criar serviço de push notifications no backend

### **FASE 2: Push Notifications Básicas** ⏳
- [ ] Enviar notificação ao criar pedido
- [ ] Enviar notificação ao atualizar status
- [ ] Enviar notificação ao entregar pedido
- [ ] Testar em dispositivos iOS e Android

### **FASE 3: Live Activities (iOS)** ⏳
- [ ] Criar Widget Extension (Swift/SwiftUI)
- [ ] Configurar ActivityKit
- [ ] Criar config plugin para Expo
- [ ] Implementar atualizações via Push
- [ ] Testar em iPhone com iOS 16+

### **FASE 4: Notificações Avançadas (Android)** ⏳
- [ ] Implementar notificações com progresso
- [ ] Atualizar notificações em tempo real
- [ ] Adicionar ações rápidas (Quick Actions)

### **FASE 5: Integração Completa** ⏳
- [ ] Integrar com rastreamento de entrega (FASE 11)
- [ ] Adicionar localização do entregador
- [ ] Mostrar mapa na notificação (se possível)
- [ ] Otimizar frequência de atualizações

---

## 🔧 Implementação Técnica

### **1. Backend - Serviço de Push**

```typescript
// src/back/services/push-notification.service.ts
export class PushNotificationService {
  async sendOrderUpdate(orderId: string, status: string) {
    // Enviar push para iOS (Live Activity)
    await this.sendIOSLiveActivity(orderId, status);
    
    // Enviar push para Android
    await this.sendAndroidNotification(orderId, status);
  }
  
  async sendIOSLiveActivity(orderId: string, data: OrderTrackingData) {
    // Usar APNs com formato específico para Live Activities
  }
}
```

### **2. Frontend - Registrar Token**

```typescript
// src/front/services/push.service.ts
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    const token = await Notifications.getExpoPushTokenAsync();
    // Enviar token para backend
    return token;
  }
}
```

### **3. iOS Widget (Swift)**

```swift
// Widget que mostra status do pedido
struct OrderTrackingWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: OrderTrackingAttributes.self) { context in
      // UI do widget
    }
  }
}
```

---

## 📦 Dependências Necessárias

### **Backend:**
- `apn` ou `node-apn` - Para enviar push para iOS
- `firebase-admin` - Para enviar push para Android (FCM)

### **Frontend:**
- `expo-notifications` - Gerenciar notificações
- Config plugin customizado - Para Live Activities

---

## ⚠️ Considerações Importantes

### **Limitações:**
1. **Live Activities só funcionam no iOS 16+**
2. **Requer desenvolvimento nativo Swift**
3. **Precisa de certificado APNs válido**
4. **Widget Extension aumenta tamanho do app**

### **Alternativas:**
- Usar push notifications normais atualizadas frequentemente
- Usar WebSocket para atualizações em tempo real quando app está aberto
- Implementar polling quando app está em background

---

## 🎯 Próximos Passos

1. **Decidir:** Live Activities nativas ou push notifications atualizadas?
2. **Configurar:** Certificados APNs e FCM
3. **Implementar:** Serviço de push no backend
4. **Testar:** Em dispositivos reais

---

## 📚 Referências

- [Apple ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [Expo Notifications Guide](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [APNs Payload Format](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns)

---

**Status:** Aguardando decisão sobre abordagem (nativa vs. alternativa)

