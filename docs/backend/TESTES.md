# 🧪 Guia de Testes - Now 24 Horas

Documentação sobre como testar cada fase da integração do backend.

---

## 📋 Estrutura de Testes

Cada fase deve ter seus próprios testes em `src/back/api/tests/`:

```
src/back/api/tests/
├── test-runner.ts          # Runner principal (FASE 1.1)
├── fase1.1-api-base.test.ts
├── fase1.2-register.test.ts
├── fase1.3-verify-otp.test.ts
├── fase1.4-login.test.ts
└── ...
```

---

## 🎯 Padrão de Testes

### Para cada fase, testar:

1. **Funcionalidade Principal**
   - Endpoints criados funcionam corretamente
   - Validações funcionam
   - Respostas estão no formato correto

2. **Casos de Sucesso**
   - Fluxo feliz funciona
   - Dados são salvos corretamente
   - Respostas têm status 200/201

3. **Casos de Erro**
   - Validações retornam 400
   - Erros são tratados corretamente
   - Mensagens de erro são claras

4. **Segurança**
   - Autenticação funciona (quando aplicável)
   - Autorização funciona (quando aplicável)
   - Dados sensíveis não são expostos

5. **Integração**
   - Integração com banco de dados funciona
   - Transações são commitadas/rollback corretamente

---

## 🚀 Como Executar Testes

### Teste de uma fase específica:
```bash
npm run api:test:fase1.1    # Testar FASE 1.1
npm run api:test:fase1.2    # Testar FASE 1.2
# etc...
```

### Teste manual com curl:
```bash
# Health check
curl http://localhost:3000/health

# Teste de endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Teste com Postman/Insomnia:
- Importar coleção de testes (quando disponível)
- Executar requisições manualmente
- Verificar respostas

---

## ✅ Checklist de Testes por Fase

### FASE 1.1 - Configuração Base ✅
- [x] Health check funciona
- [x] Rotas de teste funcionam
- [x] 404 handler funciona
- [x] CORS configurado
- [x] Security headers presentes
- [x] JSON parser funciona
- [x] Error handler funciona
- [x] Rate limiting funciona

### FASE 1.2 - Registro (próxima)
- [ ] Endpoint POST /api/auth/register funciona
- [ ] Validação de email funciona
- [ ] Validação de telefone funciona
- [ ] Validação de senha funciona
- [ ] Hash de senha funciona
- [ ] Usuário é criado no banco
- [ ] OTP é gerado
- [ ] Erro ao email duplicado funciona
- [ ] Erro ao telefone duplicado funciona

### FASE 1.3 - Verificação OTP
- [ ] Endpoint POST /api/auth/verify-otp funciona
- [ ] Validação de código OTP funciona
- [ ] Expiração de OTP funciona
- [ ] Usuário é marcado como verificado
- [ ] Tokens JWT são gerados
- [ ] Erro ao código inválido funciona
- [ ] Erro ao código expirado funciona

### FASE 1.4 - Login
- [ ] Endpoint POST /api/auth/login funciona
- [ ] Login com email funciona
- [ ] Login com telefone funciona
- [ ] Validação de credenciais funciona
- [ ] Tokens JWT são gerados
- [ ] Refresh token é salvo no banco
- [ ] Erro ao credenciais inválidas funciona
- [ ] Erro ao usuário inativo funciona

### FASE 1.5 - Refresh Token
- [ ] Endpoint POST /api/auth/refresh funciona
- [ ] Novo access token é gerado
- [ ] Refresh token é validado
- [ ] Erro ao token inválido funciona
- [ ] Erro ao token expirado funciona

### FASE 1.6 - Logout
- [ ] Endpoint POST /api/auth/logout funciona
- [ ] Refresh token é invalidado
- [ ] Erro ao token inválido funciona

### FASE 1.7 - Middleware de Autenticação
- [ ] Middleware valida token
- [ ] Middleware adiciona user ao req
- [ ] Erro ao token ausente funciona
- [ ] Erro ao token inválido funciona
- [ ] Erro ao token expirado funciona

### FASE 1.8 - Endpoints de Usuário
- [ ] GET /api/users/me funciona
- [ ] PUT /api/users/me funciona
- [ ] POST /api/users/change-password funciona
- [ ] Validação de permissões funciona
- [ ] Validação de dados funciona

---

## 📝 Template de Teste

```typescript
async function testFaseX_X() {
  console.log('🧪 Testando FASE X.X - Nome da Fase\n');
  console.log('='.repeat(60));
  
  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  try {
    // Teste 1: Funcionalidade principal
    console.log('\n1️⃣  Testando Funcionalidade Principal...');
    const response = await request(app).get('/api/endpoint');
    const passed = response.status === 200;
    results.push({ test: 'Funcionalidade Principal', passed });
    console.log(passed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // ... mais testes ...

    // Resumo
    console.log('\n' + '='.repeat(60));
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`\n📈 Resultado: ${passed}/${total} testes passaram\n`);
    
    if (passed === total) {
      console.log('🎉 Todos os testes passaram!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}
```

---

## 🔍 Testes Manuais Recomendados

### Após cada fase, testar manualmente:

1. **Com curl/Postman:**
   - Fazer requisições reais
   - Verificar respostas
   - Testar casos de erro

2. **Com o app:**
   - Integrar com frontend
   - Testar fluxo completo
   - Verificar UX

3. **Com banco de dados:**
   - Verificar dados salvos
   - Verificar relacionamentos
   - Verificar constraints

---

## 📊 Relatório de Testes

Ao final de cada fase, documentar:

- ✅ Testes que passaram
- ❌ Testes que falharam
- ⚠️ Problemas encontrados
- 📝 Observações importantes

---

**Última atualização:** 2025-01-XX

