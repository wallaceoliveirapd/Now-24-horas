# Configuração de Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente necessárias para o projeto.

## 📁 Arquivo de Configuração

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# ============================================
# API Backend
# ============================================
EXPO_PUBLIC_API_URL=http://localhost:3000

# ============================================
# Autenticação Social - Google
# ============================================
EXPO_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com

# ============================================
# Autenticação Social - Facebook
# ============================================
EXPO_PUBLIC_FACEBOOK_APP_ID=seu-facebook-app-id

# ============================================
# Email (Resend) - Backend
# ============================================
RESEND_API_KEY=re_sua_chave_api_aqui
EMAIL_FROM=noreply@now24horas.com.br
EMAIL_FROM_NAME=Now 24 Horas

# ============================================
# Banco de Dados (Backend)
# ============================================
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# ============================================
# JWT (Backend)
# ============================================
JWT_SECRET=sua-chave-secreta-jwt-aqui
JWT_REFRESH_SECRET=sua-chave-secreta-refresh-jwt-aqui

# ============================================
# Mercado Pago (Backend - Opcional)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=seu-access-token-mercadopago
```

## 🔧 Como Obter Cada Variável

### EXPO_PUBLIC_GOOGLE_CLIENT_ID

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure como **Web application**
6. Adicione os redirect URIs:
   - `https://auth.expo.io/@your-username/your-app-slug`
   - `exp://localhost:8081` (para desenvolvimento)
7. Copie o **Client ID** gerado

### EXPO_PUBLIC_FACEBOOK_APP_ID

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo app ou selecione um existente
3. Vá em **Settings** > **Basic**
4. Copie o **App ID**

### RESEND_API_KEY

1. Acesse [Resend](https://resend.com)
2. Crie uma conta ou faça login
3. Vá em **API Keys**
4. Crie uma nova API key
5. Copie a chave gerada

### EMAIL_FROM

- **Desenvolvimento**: Use `onboarding@resend.dev` (não requer verificação)
- **Produção**: Configure um domínio verificado no Resend (ex: `noreply@now24horas.com.br`)

### DATABASE_URL

Formato: `postgresql://usuario:senha@host:porta/database`

Exemplo para Neon:
```
postgresql://usuario:senha@ep-xxx-xxx.us-east-2.aws.neon.tech/database?sslmode=require
```

### JWT_SECRET e JWT_REFRESH_SECRET

Gere chaves secretas seguras:

```bash
# No terminal
openssl rand -base64 32
```

## ⚠️ Importante

1. **Nunca commite** o arquivo `.env.local` no repositório
2. O arquivo `.env.local` já está no `.gitignore`
3. Para produção, use variáveis de ambiente do servidor/hosting
4. Variáveis `EXPO_PUBLIC_*` são expostas ao cliente (não coloque segredos nelas)
5. Variáveis sem `EXPO_PUBLIC_` são apenas para o backend

## 🧪 Verificando Configuração

Após configurar, reinicie o servidor de desenvolvimento:

```bash
# Frontend (Expo)
npm start

# Backend
npm run api:dev
```

Os logs devem mostrar:
- ✅ Resend configurado com sucesso
- 🌐 API Base URL: http://localhost:3000

## 🐛 Troubleshooting

### Erro: "Google Client ID não configurado"

1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se a variável está escrita exatamente: `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
3. Reinicie o servidor Expo após adicionar a variável
4. No Expo, variáveis `EXPO_PUBLIC_*` são injetadas em tempo de build

### Erro: "Resend não configurado"

1. Verifique se `RESEND_API_KEY` está configurada no `.env.local` do backend
2. O backend precisa ter acesso ao arquivo `.env.local` na raiz do projeto
3. Reinicie o servidor backend após adicionar a variável

### Variáveis não estão sendo lidas

1. Certifique-se de que o arquivo está na raiz do projeto (mesmo nível do `package.json`)
2. Reinicie completamente o servidor (pare e inicie novamente)
3. Para Expo, pode ser necessário limpar o cache: `npx expo start -c`

