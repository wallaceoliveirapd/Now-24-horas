# 🔧 Configuração do Mercado Pago

## 📋 Tipos de Checkout

O Mercado Pago oferece diferentes tipos de integração:

### **1. Checkout Pro** (Redirecionamento)
- Cliente é redirecionado para página do Mercado Pago
- Mais simples de implementar
- Menos controle sobre a experiência

### **2. Checkout API (Orders API)** ✅ **ESTAMOS USANDO ESTE**
- Cliente paga dentro do seu app
- Mais controle sobre a experiência
- Melhor UX
- Requer mais implementação

**Nossa implementação atual usa a Orders API (Checkout API), que é a mais adequada para apps mobile.**

---

## 🔐 Como Obter o Webhook Secret

### **Passo 1: Acessar o Painel do Mercado Pago**

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta do Mercado Pago

### **Passo 2: Criar uma Aplicação**

1. No painel, vá em **"Suas integrações"**
2. Clique em **"Criar aplicação"**
3. Preencha:
   - **Nome da aplicação:** Now 24 Horas
   - **Plataforma:** Web
   - **Descrição:** App de delivery 24 horas

### **Passo 3: Obter as Credenciais**

Após criar a aplicação, você verá:

- **Public Key** (chave pública)
- **Access Token** (token de acesso) ⚠️ **MANTENHA SEGURO**

### **Passo 4: Configurar Webhooks**

1. No painel da aplicação, vá em **"Webhooks"**
2. Clique em **"Configurar webhooks"**
3. Configure:
   - **URL do webhook:** `https://seu-dominio.com/api/webhooks/mercadopago`
   - **Eventos:** Selecione `payment` e `merchant_order`
   - **Versão da API:** v1

4. **Salve a configuração**

### **Passo 5: Obter o Webhook Secret**

O **Webhook Secret** é gerado automaticamente quando você configura o webhook. Você pode encontrá-lo em:

1. Painel → Sua aplicação → **Webhooks**
2. Clique no webhook configurado
3. Você verá o **"Secret"** ou **"X-Signature"**

**OU**

O Mercado Pago pode enviar o secret no header `x-signature` das requisições de webhook. Você pode usar isso para validação.

---

## 🔧 Configuração no Projeto

### **1. Adicionar Variáveis de Ambiente**

No arquivo `.env.local`:

```env
# Mercado Pago - Produção
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui

# Mercado Pago - Teste (Sandbox)
# Use estas credenciais para testes
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxx-xxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_teste_aqui
```

### **2. Credenciais de Teste**

Para testes, use as credenciais de **Sandbox**:

1. No painel, vá em **"Credenciais de teste"**
2. Copie o **Access Token** e **Public Key** de teste
3. Use cartões de teste fornecidos pelo Mercado Pago

**Cartões de teste:**
- **Aprovado:** 5031 4332 1540 6351
- **Recusado:** 5031 4332 1540 6351 (com CVV diferente)
- Veja mais em: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

## 🔒 Validação de Webhook

### **Método 1: Validar X-Signature (Recomendado)**

O Mercado Pago envia um header `x-signature` em cada webhook. Você pode validar usando:

```typescript
import crypto from 'crypto';

function validateWebhook(data: any, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');
  
  return hash === signature;
}
```

### **Método 2: Validar ID do Pagamento**

Sempre valide consultando o pagamento diretamente na API do Mercado Pago:

```typescript
// No webhook, sempre buscar o pagamento na API do Mercado Pago
const payment = await mercadoPagoService.getPayment(paymentId);
// Validar se os dados correspondem
```

---

## 📝 Configuração de Webhook Local (Desenvolvimento)

Para testar webhooks localmente, você pode usar:

### **Opção 1: ngrok (Recomendado)**

1. Instale o ngrok: https://ngrok.com/
2. Execute: `ngrok http 3000`
3. Use a URL gerada no webhook do Mercado Pago:
   ```
   https://xxxxx.ngrok.io/api/webhooks/mercadopago
   ```

### **Opção 2: Mercado Pago Webhook Simulator**

O Mercado Pago oferece um simulador de webhooks no painel para testes.

---

## 🧪 Testando Webhooks

### **1. Criar Pagamento de Teste**

```bash
curl -X POST https://api.mercadopago.com/v1/payments \
  -H "Authorization: Bearer TEST-xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_amount": 100,
    "description": "Teste",
    "payment_method_id": "pix",
    "payer": {
      "email": "test@test.com"
    }
  }'
```

### **2. Verificar Webhook Recebido**

Verifique os logs do servidor para ver se o webhook foi recebido e processado.

---

## 📚 Documentação Oficial

- **Orders API:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration
- **Webhooks:** https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- **Credenciais:** https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials
- **Testes:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

## ✅ Checklist de Configuração

- [ ] Criar conta no Mercado Pago
- [ ] Criar aplicação no painel
- [ ] Obter Access Token
- [ ] Obter Public Key
- [ ] Configurar webhook no painel
- [ ] Obter Webhook Secret
- [ ] Adicionar variáveis no `.env.local`
- [ ] Testar pagamento em sandbox
- [ ] Testar webhook localmente (ngrok)
- [ ] Configurar webhook em produção

---

## 🔄 Próximos Passos

1. **Configurar webhook no Mercado Pago**
2. **Adicionar validação de assinatura no código** (melhorar segurança)
3. **Testar em sandbox**
4. **Configurar para produção**

---

**Nota:** O Webhook Secret pode não ser obrigatório para validação básica, mas é recomendado para produção. Você pode validar webhooks consultando diretamente a API do Mercado Pago para garantir autenticidade.

