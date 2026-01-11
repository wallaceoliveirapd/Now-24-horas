# Resumo Executivo - Integração Backend: Meus Pedidos

## 🎯 Objetivo
Integrar 100% o backend na área de "Meus pedidos", substituindo dados mockados por chamadas reais à API.

---

## ✅ Status Atual

### Backend (Pronto)
- ✅ Endpoints implementados e funcionando
- ✅ Service completo com todas as funcionalidades
- ✅ Schema do banco completo

### Frontend (Pendente)
- ❌ Dados mockados em `MyOrders.tsx`
- ❌ Dados mockados em `OrderDetails.tsx`
- ❌ Falta serviço `order.service.ts`

---

## 📋 Tarefas Principais

### 1. Criar Serviço de Pedidos
**Arquivo:** `src/services/order.service.ts`

**Funções necessárias:**
```typescript
- getOrders(filters?) → Lista pedidos
- getOrderById(orderId) → Detalhes do pedido
- cancelOrder(orderId, motivo?) → Cancela pedido
- payOrder(orderId, paymentData) → Processa pagamento
```

**Mapeamento de status:**
```typescript
Backend → Frontend
'pendente' → 'Pendente'
'aguardando_pagamento' → 'Aguardando pagamento'
'confirmado' → 'Pendente'
'preparando' → 'Pendente'
'saiu_para_entrega' → 'Pendente'
'entregue' → 'Concluído'
'cancelado' → 'Cancelado'
'reembolsado' → 'Cancelado'
```

### 2. Atualizar MyOrders.tsx
**Mudanças:**
- Remover dados mockados (linhas 44-99)
- Adicionar `useEffect` para buscar pedidos
- Separar em "em andamento" vs "todos"
- Implementar loading/error states
- Atualizar navegação para usar `orderId` real

**Lógica de separação:**
- **Em andamento:** `pendente`, `aguardando_pagamento`, `confirmado`, `preparando`, `saiu_para_entrega`
- **Todos:** todos os pedidos ordenados por data

### 3. Atualizar OrderDetails.tsx
**Mudanças:**
- Remover dados mockados (linhas 87-105)
- Buscar pedido por `orderId` na montagem
- Mapear `historicoStatus` para timeline
- Formatar endereço e método de pagamento
- Mostrar cupom (se houver)

**Timeline:**
- Analisar `historicoStatus` para determinar estados
- Calcular step "Current" baseado no status atual

---

## 🔄 Fluxo de Dados

```
MyOrders:
1. useEffect → orderService.getOrders()
2. Separar pedidos (em andamento / todos)
3. Renderizar OrderCards

OrderDetails:
1. useEffect → orderService.getOrderById(orderId)
2. Mapear histórico para timeline
3. Renderizar detalhes completos
```

---

## 📝 Endpoints Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orders` | Lista pedidos do usuário |
| GET | `/api/orders/:id` | Detalhes de um pedido |
| POST | `/api/orders/:id/cancel` | Cancela pedido |
| POST | `/api/orders/:id/pay` | Processa pagamento |

---

## 🎨 Formatação

### Data
```typescript
"2025-12-06T00:09:00.000Z" → "06/12/2025 às 00:09"
```

### Moeda
```typescript
900 (centavos) → "R$ 9,00"
```

---

## ✅ Checklist de Implementação

- [ ] Criar `order.service.ts`
- [ ] Atualizar `MyOrders.tsx`
- [ ] Atualizar `OrderDetails.tsx`
- [ ] Testar lista de pedidos
- [ ] Testar detalhes do pedido
- [ ] Testar cancelamento
- [ ] Testar estados de erro
- [ ] Verificar formatação de dados

---

## 🚨 Pontos de Atenção

1. **Autenticação:** Já gerenciada pelo `apiClient`
2. **Status:** Mapear corretamente backend → frontend
3. **Timeline:** Construir a partir do `historicoStatus`
4. **Erros:** Tratar 404, sem conexão, etc.
5. **Loading:** Manter skeleton loaders existentes

---

**Status:** 📋 Pronto para implementação  
**Prioridade:** Alta  
**Estimativa:** 4-6 horas

