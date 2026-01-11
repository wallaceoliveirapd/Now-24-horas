# 🧪 Como Testar o Login

**Data:** 2025-01-05

---

## 📋 Pré-requisitos

1. ✅ Backend rodando (`npm run api:start` ou `npm run api:dev`)
2. ✅ Banco de dados configurado e migrado
3. ✅ Usuário de teste criado (ou criar novo)
4. ✅ Frontend configurado com variável de ambiente

---

## 🔧 Configuração Inicial

### **1. Criar arquivo `.env` na raiz do projeto:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Para testar em dispositivo físico:**
- Use o IP da sua máquina na rede local
- Exemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

### **2. Iniciar o Backend:**

```bash
# Terminal 1 - Backend
npm run api:start

# Ou com auto-reload (desenvolvimento)
npm run api:dev
```

Você deve ver:
```
🚀 Servidor da API iniciado!
📍 Ambiente: development
🌐 Servidor rodando em: http://localhost:3000
```

### **3. Criar Usuário de Teste:**

```bash
# Terminal 2 - Criar usuário
npm run db:create-test-user
```

Isso criará um usuário com:
- **Email:** `teste@now24horas.com`
- **Telefone:** `11999999999`
- **Senha:** `Teste123!`
- **Nome:** `Usuário Teste`

---

## 🧪 Testando o Login

### **Opção 1: Login com Email**

1. Abrir o app (Expo Go ou build)
2. Na tela de Login, digitar:
   - **Email:** `teste@now24horas.com`
   - **Senha:** `Teste123!`
3. Clicar em "Entrar"
4. ✅ Deve navegar para a Home

### **Opção 2: Login com Telefone**

1. Abrir o app
2. Na tela de Login, digitar:
   - **Telefone:** `(11) 99999-9999` ou `11999999999`
   - **Senha:** `Teste123!`
3. Clicar em "Entrar"
4. ✅ Deve navegar para a Home

---

## 🆕 Testando o Registro Completo

### **Fluxo Completo:**

1. **Registro:**
   - Abrir app → "Criar uma conta"
   - Preencher formulário:
     - Nome completo: `João Silva`
     - CPF: `123.456.789-00` (opcional)
     - Email: `joao@teste.com`
     - Telefone: `(11) 98765-4321`
     - Senha: `Senha123!`
     - Confirmar senha: `Senha123!`
   - Clicar em "Criar conta"
   - ✅ Deve navegar para tela de OTP

2. **Verificação OTP:**
   - Na tela de OTP, digitar o código de 4 dígitos
   - ⚠️ **Nota:** O código é enviado via SMS (mock no backend)
   - Verificar no console do backend o código gerado
   - Digitar código
   - Clicar em "Validar código"
   - ✅ Deve navegar para Home

---

## 🔍 Verificando se Funcionou

### **1. Verificar no Console do Backend:**

Você deve ver logs como:
```
[2025-01-05T...] POST /api/auth/login
✅ Login bem-sucedido para usuário: teste@now24horas.com
```

### **2. Verificar Tokens Salvos:**

Os tokens são salvos automaticamente no AsyncStorage. Para verificar:

```javascript
// No console do React Native Debugger ou Expo
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getItem('accessToken').then(token => console.log('Access Token:', token));
AsyncStorage.getItem('refreshToken').then(token => console.log('Refresh Token:', token));
```

### **3. Verificar Estado no AuthContext:**

O `AuthContext` deve ter:
- `isAuthenticated: true`
- `user: { id, email, nomeCompleto, ... }`
- `loading: false`

---

## 🐛 Troubleshooting

### **Erro: "Network request failed"**

**Causa:** Backend não está rodando ou URL incorreta

**Solução:**
1. Verificar se backend está rodando: `curl http://localhost:3000/health`
2. Verificar `.env` com `EXPO_PUBLIC_API_URL` correto
3. Se testando em dispositivo físico, usar IP da máquina

### **Erro: "401 Unauthorized"**

**Causa:** Credenciais incorretas ou usuário não existe

**Solução:**
1. Verificar email/senha
2. Criar usuário de teste novamente: `npm run db:create-test-user`
3. Verificar se usuário existe no banco

### **Erro: "Código OTP inválido"**

**Causa:** Código expirado ou incorreto

**Solução:**
1. Verificar código no console do backend
2. Código expira em 10 minutos
3. Solicitar novo código

### **Erro: "Cannot read property 'tokens' of undefined"**

**Causa:** Resposta da API não está no formato esperado

**Solução:**
1. Verificar resposta no Network tab
2. Verificar se backend está retornando formato correto
3. Verificar logs do backend

---

## 📱 Testando em Dispositivo Físico

### **1. Descobrir IP da Máquina:**

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### **2. Atualizar `.env`:**

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:3000
```

Exemplo:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### **3. Garantir que Backend Aceita Conexões Externas:**

No `src/back/api/server.ts`, verificar CORS:
```typescript
cors({
  origin: '*', // Ou lista de IPs permitidos
  credentials: true,
})
```

---

## ✅ Checklist de Teste

- [ ] Backend rodando e acessível
- [ ] Arquivo `.env` criado com `EXPO_PUBLIC_API_URL`
- [ ] Usuário de teste criado
- [ ] Login com email funciona
- [ ] Login com telefone funciona
- [ ] Registro de novo usuário funciona
- [ ] Verificação OTP funciona
- [ ] Tokens são salvos no AsyncStorage
- [ ] Navegação para Home após login funciona
- [ ] Logout funciona

---

## 🎯 Próximos Passos Após Testar

1. ✅ Se login funcionou → Continuar com FASE 4 (Produtos)
2. ❌ Se houver erros → Verificar troubleshooting acima
3. 📝 Documentar qualquer problema encontrado

---

**Última atualização:** 2025-01-05

