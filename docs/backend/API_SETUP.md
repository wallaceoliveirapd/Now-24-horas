# 🚀 Setup da API - Now 24 Horas

Documentação da estrutura da API REST.

---

## 📁 Estrutura de Pastas

```
src/back/api/
├── app.ts                    # Configuração do Express
├── server.ts                 # Inicialização do servidor
├── middlewares/
│   ├── error-handler.ts      # Tratamento global de erros
│   └── not-found-handler.ts  # Handler 404
└── routes/
    ├── auth.routes.ts        # Rotas de autenticação
    └── user.routes.ts        # Rotas de usuário
```

---

## 🚀 Como Executar

### Desenvolvimento
```bash
npm run api:start    # Iniciar servidor
npm run api:dev      # Iniciar com watch mode (reload automático)
```

### Produção
```bash
# Compilar TypeScript primeiro
npm run build

# Executar servidor compilado
node dist/back/api/server.js
```

---

## 🌐 Endpoints Disponíveis

### Health Check
- `GET /health` - Verificar se API está funcionando

### Autenticação (em desenvolvimento)
- `GET /api/auth/test` - Teste de rotas de autenticação

### Usuário (em desenvolvimento)
- `GET /api/users/test` - Teste de rotas de usuário

---

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```env
# Banco de Dados
DATABASE_URL=postgresql://...

# API
API_PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua-chave-secreta-min-32-caracteres
JWT_REFRESH_SECRET=sua-chave-refresh-secreta-min-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*
```

---

## 🔒 Segurança

### Middlewares Implementados

1. **Helmet** - Headers de segurança HTTP
2. **CORS** - Controle de origem cruzada
3. **Rate Limiting** - Limite de 100 requisições por 15 minutos
4. **Body Parser** - Limite de 10MB para JSON/URL encoded

### Tratamento de Erros

Todos os erros são capturados e retornados em formato padronizado:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro"
  }
}
```

---

## 📝 Convenções

### Formato de Resposta

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro"
  }
}
```

### Códigos HTTP

- `200` - Sucesso
- `201` - Criado
- `400` - Bad Request
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito
- `500` - Erro interno

---

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:3000/health
```

### Rotas de Teste
```bash
# Autenticação
curl http://localhost:3000/api/auth/test

# Usuário
curl http://localhost:3000/api/users/test
```

---

## 📚 Próximos Passos

1. ✅ FASE 1.1: Configuração base (CONCLUÍDA)
2. ⏭️ FASE 1.2: Endpoint de registro
3. ⏭️ FASE 1.3: Endpoint de verificação OTP
4. ⏭️ FASE 1.4: Endpoint de login
5. ⏭️ FASE 1.5: Endpoint de refresh token
6. ⏭️ FASE 1.6: Endpoint de logout
7. ⏭️ FASE 1.7: Middleware de autenticação
8. ⏭️ FASE 1.8: Endpoints de usuário

---

**Última atualização:** 2025-01-XX

