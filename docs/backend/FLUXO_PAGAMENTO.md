# 💳 Fluxo de Pagamento - Documentação

## 📋 Visão Geral

O sistema oferece **duas formas** de processar pagamentos, mantendo flexibilidade e facilidade de uso:

---

## 🔄 Opção 1: Fluxo Separado (Recomendado para maior controle)

### **Passo 1: Criar Pedido**
```http
POST /api/orders
Authorization: Bearer {token}

{
  "enderecoId": "uuid-do-endereco",
  "metodoPagamento": "cartao_credito",
  "cartaoId": "uuid-do-cartao", // opcional
  "observacoes": "Sem cebola",
  "instrucoesEntrega": "Deixar na portaria"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pedido criado com sucesso",
  "data": {
    "pedido": {
      "id": "uuid",
      "numeroPedido": "#12345678",
      "status": "pendente",
      "total": 5000,
      ...
    }
  }
}
```

### **Passo 2: Processar Pagamento**

**Opção A: Via endpoint de pedidos (mais intuitivo)**
```http
POST /api/orders/{pedidoId}/pay
Authorization: Bearer {token}

{
  "metodoPagamento": "cartao_credito",
  "token": "token-do-cartao",
  "installments": 1,
  "payer": {
    "email": "cliente@email.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

**Opção B: Via endpoint de pagamentos (mais genérico)**
```http
POST /api/payments/process
Authorization: Bearer {token}

{
  "pedidoId": "uuid-do-pedido",
  "metodoPagamento": "cartao_credito",
  "token": "token-do-cartao",
  "installments": 1,
  "payer": {
    "email": "cliente@email.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pagamento processado com sucesso",
  "data": {
    "transacao": { ... },
    "pagamento": { ... },
    "statusPedido": "confirmado"
  }
}
```

---

## 🚀 Opção 2: Fluxo Integrado (Criar e Pagar em uma única chamada)

**Nota:** Esta opção pode ser implementada no futuro se necessário. Por enquanto, recomendamos o fluxo separado para maior controle e tratamento de erros.

---

## 💡 Quando Usar Cada Endpoint

### **`POST /api/orders/:id/pay`** (Recomendado)
- ✅ Mais intuitivo e semântico
- ✅ URL clara: "pagar este pedido"
- ✅ Menos chance de erro (pedidoId vem da URL)
- ✅ Melhor para UX no frontend

**Use quando:** Você já tem o pedido criado e quer processar o pagamento.

### **`POST /api/payments/process`**
- ✅ Mais genérico
- ✅ Útil para processar pagamentos de diferentes origens
- ✅ Permite re-processar pagamento se necessário

**Use quando:** Você precisa de mais flexibilidade ou está processando pagamentos de múltiplas fontes.

---

## 📊 Fluxo Completo Recomendado

```
1. Usuário adiciona itens ao carrinho
   ↓
2. Usuário seleciona endereço e método de pagamento
   ↓
3. POST /api/orders → Criar pedido (status: pendente)
   ↓
4. Usuário confirma dados de pagamento
   ↓
5. POST /api/orders/{id}/pay → Processar pagamento
   ↓
6. Se aprovado → Pedido status: confirmado
   Se pendente → Pedido status: aguardando_pagamento
   Se recusado → Pedido status: pendente (pode tentar novamente)
```

---

## 🔄 Status do Pedido

| Status | Descrição |
|--------|-----------|
| `pendente` | Pedido criado, aguardando pagamento |
| `aguardando_pagamento` | Pagamento em processamento |
| `confirmado` | Pagamento aprovado, pedido confirmado |
| `preparando` | Pedido sendo preparado |
| `saiu_para_entrega` | Pedido em trânsito |
| `entregue` | Pedido entregue |
| `cancelado` | Pedido cancelado |
| `reembolsado` | Pagamento reembolsado |

---

## 💳 Métodos de Pagamento Suportados

### **Cartão de Crédito/Débito**
```json
{
  "metodoPagamento": "cartao_credito",
  "token": "token-do-cartao",
  "installments": 1,
  "payer": {
    "email": "cliente@email.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

### **PIX**
```json
{
  "metodoPagamento": "pix",
  "payer": {
    "email": "cliente@email.com",
    "firstName": "João",
    "lastName": "Silva",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

---

## 🔒 Validações

- ✅ Pedido deve existir e pertencer ao usuário
- ✅ Pedido deve estar em status `pendente` ou `aguardando_pagamento`
- ✅ Método de pagamento deve corresponder ao do pedido
- ✅ Token do cartão válido (para cartões)
- ✅ Dados do pagador válidos

---

## 📝 Notas Técnicas

- **Separação de Responsabilidades:** Criar pedido e processar pagamento são operações distintas
- **Idempotência:** Processar pagamento múltiplas vezes não causa problemas (validações impedem)
- **Webhooks:** Status é atualizado automaticamente via webhooks do Mercado Pago
- **Transações:** Cada pagamento cria uma transação no banco de dados

---

## ✅ Recomendação Final

**Use `POST /api/orders/:id/pay`** para o fluxo principal do checkout. É mais intuitivo e mantém a semântica REST clara.

Mantenha `POST /api/payments/process` para casos especiais ou quando precisar de mais flexibilidade.

