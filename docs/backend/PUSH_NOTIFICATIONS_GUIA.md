# 📱 Guia Completo - Push Notifications

**Data:** 2025-01-05

---

## 🎯 Visão Geral

Sistema de push notifications implementado usando **Expo Notifications**, que permite:
- ✅ Enviar notificações quando pedidos são criados/atualizados
- ✅ Notificações aparecem mesmo com app fechado
- ✅ Atualizações em tempo real
- ✅ Funciona em iOS e Android

---

## 📋 Checklist de Configuração

### **1. Expo Project ID** ⚠️ OBRIGATÓRIO

Edite `app.json` e adicione seu Project ID:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "seu-project-id-aqui"
      }
    }
  }
}
```

**Como obter:**
1. Acesse https://expo.dev
2. Crie conta/login
3. Crie novo projeto ou use existente
4. Copie o Project ID

### **2. Variável de Ambiente**

Crie `.env` na raiz do projeto:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Para produção, use a URL do seu servidor.

### **3. Permissões**

O app pedirá permissão automaticamente na primeira vez que tentar registrar.

---

## 🚀 Como Funciona

### **Fluxo Completo:**

```
1. Usuário faz login
   ↓
2. Frontend registra token Expo
   ↓
3. Token é enviado para backend
   ↓
4. Backend salva token no banco
   ↓
5. Quando pedido é criado/atualizado
   ↓
6. Backend envia push notification
   ↓
7. Usuário recebe notificação
```

---

## 💻 Exemplo de Integração

### **No Componente de Login:**

```typescript
import { usePushNotifications } from '../hooks/usePushNotifications';

function LoginScreen() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Registrar push notifications após login
  usePushNotifications(userId || undefined, authToken || undefined);
  
  // ... resto do código
}
```

### **No App.tsx (Global):**

```typescript
import { usePushNotifications } from './src/front/hooks/usePushNotifications';
import { useAuth } from './src/front/hooks/useAuth'; // Seu hook de auth

export default function App() {
  const { user, token } = useAuth();
  
  // Registrar push notifications globalmente
  usePushNotifications(user?.id, token);
  
  // ... resto do código
}
```

---

## 📬 Estrutura de Notificações

### **Payload Enviado:**

```json
{
  "title": "Pedido criado com sucesso!",
  "body": "Seu pedido #123456 foi criado e está sendo processado.",
  "data": {
    "pedidoId": "uuid-do-pedido",
    "numeroPedido": "#123456",
    "tipo": "pedido",
    "notificacaoId": "uuid-da-notificacao"
  },
  "sound": "default",
  "badge": 1
}
```

### **Como Usar os Dados:**

```typescript
// No listener de notificações
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  if (data?.pedidoId) {
    // Navegar para detalhes do pedido
    navigation.navigate('OrderDetails', { orderId: data.pedidoId });
  }
});
```

---

## 🧪 Testando

### **1. Teste Local (Expo Go):**

```bash
# Iniciar app
npm start

# Escanear QR code com Expo Go
# Fazer login
# Verificar console para token
```

### **2. Teste com Build:**

```bash
# Criar build de desenvolvimento
eas build --profile development --platform ios

# Ou Android
eas build --profile development --platform android
```

### **3. Enviar Notificação de Teste:**

Use o [Expo Push Notification Tool](https://expo.dev/notifications):
1. Cole o token Expo do dispositivo
2. Digite título e mensagem
3. Envie!

---

## 🔧 Troubleshooting

### **Problema: Token não é registrado**
- ✅ Verificar se está em dispositivo físico (não funciona em simulador)
- ✅ Verificar permissões de notificação
- ✅ Verificar se Project ID está configurado

### **Problema: Notificações não chegam**
- ✅ Verificar se token foi salvo no banco
- ✅ Verificar logs do backend
- ✅ Verificar se preferências de notificação estão ativadas

### **Problema: Erro "DeviceNotRegistered"**
- ✅ Token foi invalidado (app desinstalado/reinstalado)
- ✅ Token será removido automaticamente do banco
- ✅ Usuário precisa registrar novamente

---

## 📊 Status Atual

- ✅ Backend implementado
- ✅ Frontend implementado
- ✅ Migração aplicada
- ⚠️ **Falta:** Configurar Project ID no app.json
- ⚠️ **Falta:** Testar em dispositivo físico

---

**Próximo passo:** Configure o Project ID e teste em um dispositivo físico!

