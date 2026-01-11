# 📱 Live Activities - Notificações ao Vivo (iOS)

**Data:** 2025-01-05

---

## 🎯 O que são Live Activities?

**Live Activities** são notificações dinâmicas do iOS 16+ que aparecem:
- Na **tela de bloqueio** (Lock Screen)
- Na **Dynamic Island** (iPhone 14 Pro e superiores)
- No **topo da tela** quando o app está aberto

Elas permitem mostrar informações atualizáveis em tempo real, como:
- Status de pedidos de delivery
- Progresso de entrega
- Tempo estimado de chegada
- Localização do entregador

---

## 🔧 Como Funciona?

### **Arquitetura:**

```
Backend (Node.js)
    ↓
Push Notification (APNs)
    ↓
iOS Device
    ↓
ActivityKit (iOS nativo)
    ↓
Live Activity Widget (SwiftUI)
```

### **Componentes Necessários:**

1. **ActivityKit** (iOS nativo) - Framework da Apple
2. **Widget Extension** (SwiftUI) - Interface visual
3. **Push Notifications** (APNs) - Para atualizações remotas
4. **Backend** - Enviar atualizações via push

---

## 📋 Implementação no Projeto

### **Opção 1: Expo com Config Plugin (Recomendado)**

Para usar Live Activities com Expo, precisamos criar um **config plugin** que adiciona o código nativo necessário.

### **Opção 2: EAS Build com Native Code**

Usar EAS Build para compilar com código nativo Swift.

---

## 🛠️ Passos para Implementação

### **1. Instalar Dependências**

```bash
# Para push notifications
npm install expo-notifications

# Para desenvolvimento nativo (se necessário)
npm install @expo/config-plugins
```

### **2. Criar Widget Extension (Swift)**

Precisamos criar um arquivo Swift nativo para o widget:

**`ios/LiveActivityWidget.swift`** (será criado via config plugin)

### **3. Configurar app.json**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/notification.wav"],
          "mode": "production"
        }
      ],
      [
        "./plugins/withLiveActivities",
        {
          "widgetBundleIdentifier": "com.now24horas.LiveActivityWidget"
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.now24horas",
      "infoPlist": {
        "NSSupportsLiveActivities": true
      }
    }
  }
}
```

### **4. Criar Config Plugin**

**`plugins/withLiveActivities.js`** - Plugin para adicionar código nativo

### **5. Backend - Enviar Push Notifications**

Atualizar o serviço de notificações para enviar push com dados de Live Activity.

---

## 📝 Estrutura de Dados

### **Payload de Push Notification:**

```json
{
  "aps": {
    "alert": {
      "title": "Pedido em preparação",
      "body": "Seu pedido está sendo preparado"
    },
    "sound": "default",
    "content-state": {
      "pedidoId": "123",
      "status": "preparando",
      "tempoEstimado": "15-20 min",
      "progresso": 0.3
    }
  },
  "activity": {
    "type": "order-tracking",
    "pedidoId": "123",
    "status": "preparando",
    "tempoEstimado": "15-20 min",
    "progresso": 0.3
  }
}
```

---

## 🎨 Widget UI (SwiftUI)

O widget precisa mostrar:
- Status atual do pedido
- Barra de progresso
- Tempo estimado
- Informações do restaurante/entregador

---

## ⚠️ Limitações

1. **iOS 16+ apenas** - Não funciona em versões anteriores
2. **Requer código nativo** - Não é possível fazer apenas com JavaScript
3. **APNs obrigatório** - Precisa de certificado Apple Push Notification
4. **Widget Extension** - Requer desenvolvimento Swift/SwiftUI

---

## 🚀 Alternativa: Notificações Push Normais

Se Live Activities forem muito complexas, podemos usar:
- **Push Notifications** com atualizações frequentes
- **In-App Notifications** quando o app está aberto
- **Background Updates** via polling ou WebSocket

---

## 📚 Recursos

- [Apple - Live Activities Documentation](https://developer.apple.com/documentation/activitykit)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Push Notifications](https://github.com/react-native-push-notification/push-notification)

---

## 💡 Recomendação

Para começar rapidamente, recomendo:

1. **FASE 1:** Implementar push notifications normais com Expo
2. **FASE 2:** Adicionar atualizações frequentes de status
3. **FASE 3:** Implementar Live Activities quando necessário (requer desenvolvimento nativo)

---

**Última atualização:** 2025-01-05

