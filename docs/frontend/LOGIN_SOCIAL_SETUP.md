# Configuração de Login Social

Este documento descreve como configurar o login social (Google, Apple e Facebook) no aplicativo.

## 📋 Pré-requisitos

- Conta no Google Cloud Console
- Conta no Facebook Developers
- Apple Developer Account (para Sign in with Apple)

## 🔧 Google OAuth

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" ou "Google Identity Services"

### 2. Configurar OAuth Consent Screen

1. Vá em **APIs & Services** > **OAuth consent screen**
2. Escolha **External** (para testes) ou **Internal** (para organização)
3. Preencha as informações:
   - App name: "Now 24 Horas"
   - User support email: seu email
   - Developer contact: seu email
4. Adicione os escopos:
   - `openid`
   - `profile`
   - `email`

### 3. Criar Credenciais OAuth

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Escolha **Web application** para desenvolvimento
4. Configure:
   - Name: "Now 24 Horas Web"
   - Authorized redirect URIs: 
     - `https://auth.expo.io/@your-username/your-app-slug`
     - `exp://localhost:8081` (para desenvolvimento)
5. Copie o **Client ID**

### 4. Configurar no App

Adicione no arquivo `.env.local`:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
```

## 📘 Facebook Login

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em **My Apps** > **Create App**
3. Escolha **Consumer** como tipo de app
4. Preencha:
   - App Name: "Now 24 Horas"
   - App Contact Email: seu email

### 2. Adicionar Facebook Login

1. No dashboard do app, clique em **Add Product**
2. Selecione **Facebook Login**
3. Configure:
   - Valid OAuth Redirect URIs:
     - `https://auth.expo.io/@your-username/your-app-slug`
     - `exp://localhost:8081` (para desenvolvimento)
4. Vá em **Settings** > **Basic**
5. Copie o **App ID**

### 3. Configurar no App

Adicione no arquivo `.env.local`:

```env
EXPO_PUBLIC_FACEBOOK_APP_ID=seu-app-id-aqui
```

## 🍎 Sign in with Apple

### 1. Configurar no Apple Developer

1. Acesse [Apple Developer](https://developer.apple.com/)
2. Vá em **Certificates, Identifiers & Profiles**
3. Selecione **Identifiers** > **App IDs**
4. Selecione seu App ID ou crie um novo
5. Marque **Sign in with Apple** como capability
6. Salve as alterações

### 2. Configurar no Expo

1. No arquivo `app.json`, adicione:

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

### 3. Configurar no Xcode (para build nativo)

1. Abra o projeto no Xcode
2. Vá em **Signing & Capabilities**
3. Adicione **Sign in with Apple**

## 🔐 Variáveis de Ambiente

Crie ou atualize o arquivo `.env.local` na raiz do projeto:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com

# Facebook Login
EXPO_PUBLIC_FACEBOOK_APP_ID=seu-facebook-app-id
```

## 🧪 Testando

### Google

1. Execute o app
2. Toque no botão do Google
3. Selecione uma conta Google
4. Autorize o acesso
5. O app deve fazer login automaticamente

### Facebook

1. Execute o app
2. Toque no botão do Facebook
3. Faça login no Facebook
4. Autorize o acesso
5. O app deve fazer login automaticamente

### Apple (apenas iOS)

1. Execute o app em um dispositivo iOS real ou simulador iOS 13+
2. Toque no botão da Apple
3. Use Face ID, Touch ID ou senha
4. O app deve fazer login automaticamente

## ⚠️ Notas Importantes

1. **Desenvolvimento**: Use `expo-auth-session` com proxy para desenvolvimento local
2. **Produção**: Configure URLs de redirecionamento corretas para produção
3. **Apple**: Requer dispositivo iOS real ou simulador iOS 13+ para testar
4. **Segurança**: Nunca commite credenciais no repositório. Use variáveis de ambiente.

## 🐛 Troubleshooting

### Google: "redirect_uri_mismatch"

- Verifique se o redirect URI está configurado corretamente no Google Cloud Console
- Use `expo-auth-session` com `useProxy: true` para desenvolvimento

### Facebook: "Invalid OAuth access token"

- Verifique se o App ID está correto
- Certifique-se de que o Facebook Login está ativado no dashboard

### Apple: "Sign in with Apple not available"

- Verifique se está executando em iOS 13+
- Confirme que a capability está habilitada no App ID
- Para desenvolvimento, use simulador iOS ou dispositivo real

## 📚 Referências

- [Expo AuthSession](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login/)
- [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)

