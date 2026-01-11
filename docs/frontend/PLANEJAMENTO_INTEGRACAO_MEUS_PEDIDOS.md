# Planejamento Completo - Integração Backend: Meus Pedidos

## 📋 Objetivo
Integrar 100% o backend na área de "Meus pedidos", substituindo todos os dados mockados por chamadas reais à API, garantindo que todas as funcionalidades estejam funcionando com endpoints e backend.

---

## 🔍 Análise da Situação Atual

### Backend (Já Implementado)
✅ **Endpoints disponíveis:**
- `GET /api/orders` - Listar pedidos do usuário (com filtros opcionais)
- `GET /api/orders/:id` - Obter detalhes de um pedido específico
- `POST /api/orders/:id/cancel` - Cancelar pedido
- `POST /api/orders/:id/pay` - Processar pagamento de um pedido

✅ **Service implementado:**
- `orderService.getUserOrders()` - Lista pedidos com paginação e filtros
- `orderService.getOrderById()` - Busca pedido completo com relacionamentos
- `orderService.cancelOrder()` - Cancela pedido e restaura estoque

✅ **Schema do banco:**
- Tabela `pedidos` com todos os campos necessários
- Tabela `itensPedido` com snapshot de preços
- Tabela `historicoStatusPedidos` para timeline
- Relacionamentos com endereços, cupons, etc.

### Frontend (Atual - Mockado)
❌ **Tela MyOrders.tsx:**
- Dados completamente mockados
- Não faz chamadas à API
- Status hardcoded

❌ **Tela OrderDetails.tsx:**
- Dados completamente mockados
- Status timeline mockado
- Não busca dados reais do backend

❌ **Falta:**
- Serviço de pedidos no frontend (`order.service.ts`)
- Integração com API
- Mapeamento de status backend → frontend
- Tratamento de erros
- Loading states adequados

---

## 🎯 Mapeamento de Status

### Backend → Frontend

| Backend | Frontend (OrderCard) | Descrição |
|---------|---------------------|-----------|
| `pendente` | `Pendente` | Pedido criado, aguardando confirmação |
| `aguardando_pagamento` | `Aguardando pagamento` | Aguardando processamento do pagamento |
| `confirmado` | `Pendente` | Pedido confirmado, aguardando preparação |
| `preparando` | `Pendente` | Pedido em preparação |
| `saiu_para_entrega` | `Pendente` | Pedido saiu para entrega |
| `entregue` | `Concluído` | Pedido entregue |
| `cancelado` | `Cancelado` | Pedido cancelado |
| `reembolsado` | `Cancelado` | Pedido reembolsado |

### Status Timeline (OrderDetails)

O backend retorna `historicoStatusPedidos` que precisa ser mapeado para os 4 steps:

1. **Confirmação** - Quando status é `confirmado` ou superior
2. **Preparação** - Quando status é `preparando` ou superior
3. **Entrega** - Quando status é `saiu_para_entrega` ou superior
4. **Entregue** - Quando status é `entregue`

---

## 📦 Estrutura de Dados

### Resposta do Backend - Lista de Pedidos

```typescript
{
  success: true,
  data: {
    pedidos: [
      {
        id: string;
        numeroPedido: string; // "#99489500"
        status: 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'preparando' | 'saiu_para_entrega' | 'entregue' | 'cancelado' | 'reembolsado';
        subtotal: number; // centavos
        taxaEntrega: number; // centavos
        desconto: number; // centavos
        total: number; // centavos
        criadoEm: string; // ISO date
        // ... outros campos
      }
    ],
    paginacao: {
      pagina: number;
      limite: number;
      total: number;
      totalPaginas: number;
      temProximaPagina: boolean;
      temPaginaAnterior: boolean;
    }
  }
}
```

### Resposta do Backend - Detalhes do Pedido

```typescript
{
  success: true,
  data: {
    pedido: {
      id: string;
      numeroPedido: string;
      status: string;
      subtotal: number;
      taxaEntrega: number;
      desconto: number;
      total: number;
      criadoEm: string;
      metodoPagamento: 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
      observacoes?: string;
      instrucoesEntrega?: string;
      tempoEntrega?: string;
      
      // Relacionamentos
      itens: Array<{
        id: string;
        produtoId: string;
        nomeProduto: string;
        quantidade: number;
        precoUnitario: number;
        precoTotal: number;
        personalizacoes?: any;
        observacoes?: string;
      }>;
      
      historicoStatus: Array<{
        id: string;
        statusAnterior?: string;
        statusNovo: string;
        observacoes?: string;
        criadoEm: string;
      }>;
      
      endereco: {
        id: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
      };
      
      cupom?: {
        id: string;
        codigo: string;
        // ... outros campos
      };
      
      cartaoId?: string; // Para mostrar últimos dígitos
    }
  }
}
```

---

## 🛠️ Implementação

### 1. Criar Serviço de Pedidos (`src/services/order.service.ts`)

**Funcionalidades:**
- `getOrders()` - Listar pedidos com filtros opcionais
- `getOrderById()` - Buscar detalhes de um pedido
- `cancelOrder()` - Cancelar pedido
- `payOrder()` - Processar pagamento (já existe endpoint)

**Tipos TypeScript:**
- Interfaces para Order, OrderItem, OrderStatus, etc.
- Mapeamento de status backend → frontend
- Formatação de datas

### 2. Atualizar Tela MyOrders.tsx

**Mudanças:**
- Remover dados mockados
- Adicionar chamada à API no `useEffect`
- Implementar loading state
- Implementar error state
- Separar pedidos em andamento vs. todos os pedidos
- Implementar pull-to-refresh
- Tratamento de paginação (se necessário)

**Lógica de separação:**
- **Pedidos em andamento:** status `pendente`, `aguardando_pagamento`, `confirmado`, `preparando`, `saiu_para_entrega`
- **Todos os pedidos:** todos os pedidos, ordenados por data (mais recente primeiro)

### 3. Atualizar Tela OrderDetails.tsx

**Mudanças:**
- Remover dados mockados
- Buscar pedido por ID na montagem do componente
- Mapear histórico de status para timeline
- Formatar endereço de entrega
- Formatar método de pagamento
- Mostrar cupom aplicado (se houver)
- Implementar loading state
- Implementar error state
- Botão de cancelar pedido (se aplicável)

**Mapeamento de Timeline:**
- Analisar `historicoStatus` para determinar estados
- Calcular qual step está "Current"
- Mostrar datas de cada transição

### 4. Atualizar OrderCard.tsx (se necessário)

**Verificações:**
- Verificar se o tipo `OrderStatus` do frontend está compatível
- Garantir que todos os status do backend são mapeados

### 5. Integração com Pagamento

**Fluxo:**
- Quando usuário clica em "Fazer pagamento" no OrderCard
- Navegar para tela de pagamento (já existe)
- Passar `orderId` como parâmetro
- Após pagamento bem-sucedido, atualizar lista de pedidos

---

## 📝 Checklist de Implementação

### Fase 1: Serviço de Pedidos
- [ ] Criar `src/services/order.service.ts`
- [ ] Definir tipos TypeScript
- [ ] Implementar `getOrders()`
- [ ] Implementar `getOrderById()`
- [ ] Implementar `cancelOrder()`
- [ ] Criar função de mapeamento de status
- [ ] Criar função de formatação de data
- [ ] Testar chamadas à API

### Fase 2: Tela MyOrders
- [ ] Remover dados mockados
- [ ] Adicionar estado de loading
- [ ] Adicionar estado de erro
- [ ] Implementar `useEffect` para buscar pedidos
- [ ] Implementar separação: em andamento vs. todos
- [ ] Implementar pull-to-refresh
- [ ] Atualizar `handleOrderPress` para usar `orderId` real
- [ ] Atualizar `handlePaymentPress` para navegar com `orderId`
- [ ] Testar com dados reais

### Fase 3: Tela OrderDetails
- [ ] Remover dados mockados
- [ ] Adicionar estado de loading
- [ ] Adicionar estado de erro
- [ ] Implementar `useEffect` para buscar pedido
- [ ] Mapear histórico de status para timeline
- [ ] Formatar endereço de entrega
- [ ] Formatar método de pagamento
- [ ] Mostrar cupom (se houver)
- [ ] Implementar botão de cancelar (se aplicável)
- [ ] Atualizar navegação "Ver todos os pedidos"
- [ ] Testar com dados reais

### Fase 4: Integração e Testes
- [ ] Testar fluxo completo: lista → detalhes
- [ ] Testar cancelamento de pedido
- [ ] Testar pagamento de pedido pendente
- [ ] Testar estados de erro (sem internet, 404, etc.)
- [ ] Testar loading states
- [ ] Testar pull-to-refresh
- [ ] Verificar formatação de moeda
- [ ] Verificar formatação de datas
- [ ] Testar com diferentes status de pedido

---

## 🔄 Fluxo de Dados

### MyOrders Screen
```
1. Componente monta
2. useEffect executa
3. orderService.getOrders() é chamado
4. API retorna lista de pedidos
5. Dados são separados em "em andamento" e "todos"
6. Componente renderiza OrderCards
7. Usuário clica em um pedido
8. Navega para OrderDetails com orderId
```

### OrderDetails Screen
```
1. Componente monta com orderId da rota
2. useEffect executa
3. orderService.getOrderById(orderId) é chamado
4. API retorna detalhes completos
5. Dados são formatados e mapeados
6. Timeline é construída a partir do histórico
7. Componente renderiza todas as informações
```

---

## 🎨 Formatação de Dados

### Datas
- **Backend:** ISO string (`2025-12-06T00:09:00.000Z`)
- **Frontend:** Formato brasileiro (`06/12/2025 às 00:09`)

```typescript
function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' às');
}
```

### Moeda
- **Backend:** Centavos (inteiro)
- **Frontend:** Formato brasileiro (R$ 9,00)

```typescript
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}
```

### Status
- Função de mapeamento backend → frontend
- Função para determinar se pedido está "em andamento"

---

## 🚨 Tratamento de Erros

### Cenários a Tratar

1. **Sem conexão:**
   - Mostrar mensagem amigável
   - Permitir tentar novamente

2. **Pedido não encontrado (404):**
   - Mostrar mensagem
   - Botão para voltar

3. **Erro ao cancelar:**
   - Mostrar mensagem de erro
   - Explicar motivo (se disponível)

4. **Erro genérico:**
   - Log do erro
   - Mensagem genérica ao usuário

### Componentes de Erro
- Usar `ErrorState` existente
- Usar `Toast` para mensagens temporárias

---

## 📱 Estados da UI

### MyOrders
- **Loading:** Skeleton loaders (já implementado)
- **Empty:** EmptyState (já implementado)
- **Error:** ErrorState
- **Success:** Lista de pedidos

### OrderDetails
- **Loading:** Skeleton loaders ou spinner
- **Error:** ErrorState com botão de voltar
- **Success:** Detalhes completos do pedido

---

## 🔗 Navegação

### Parâmetros de Rota

**MyOrders → OrderDetails:**
```typescript
navigation.navigate('OrderDetails', {
  orderId: string, // ID do pedido (UUID)
  orderNumber?: string, // Número do pedido (#99489500) - opcional
  orderDate?: string, // Data formatada - opcional
});
```

**OrderDetails → Payment:**
```typescript
// Se implementado, navegar para tela de pagamento
navigation.navigate('Payment', {
  orderId: string,
});
```

---

## ✅ Critérios de Sucesso

1. ✅ Todos os dados mockados foram removidos
2. ✅ Todas as telas fazem chamadas reais à API
3. ✅ Loading states funcionam corretamente
4. ✅ Error states são tratados adequadamente
5. ✅ Status são mapeados corretamente
6. ✅ Datas são formatadas corretamente
7. ✅ Moedas são formatadas corretamente
8. ✅ Timeline de status funciona corretamente
9. ✅ Cancelamento de pedido funciona
10. ✅ Navegação entre telas funciona
11. ✅ Pull-to-refresh funciona
12. ✅ Testes com diferentes status de pedido passam

---

## 📚 Arquivos a Criar/Modificar

### Criar
- `src/services/order.service.ts`

### Modificar
- `src/front/screens/MyOrders.tsx`
- `src/front/screens/OrderDetails.tsx`
- `components/ui/OrderCard.tsx` (se necessário para tipos)

### Verificar
- `src/front/navigation/AppNavigator.tsx` (parâmetros de rota)
- `src/services/api/client.ts` (já está OK)

---

## 🎯 Próximos Passos Após Implementação

1. Implementar paginação infinita (se necessário)
2. Adicionar filtros por status na tela MyOrders
3. Implementar busca de pedidos
4. Adicionar notificações push para mudanças de status
5. Implementar rastreamento de entrega em tempo real

---

## 📝 Notas Técnicas

### Autenticação
- Todas as rotas de pedidos requerem autenticação
- O `apiClient` já gerencia tokens automaticamente
- Não é necessário fazer nada adicional

### Performance
- Considerar cache de pedidos (opcional)
- Implementar paginação se houver muitos pedidos
- Lazy loading de imagens (se adicionar imagens aos itens)

### Acessibilidade
- Garantir que todos os textos são acessíveis
- Adicionar labels adequados
- Testar com leitores de tela

---

**Data de Criação:** 2025-01-XX  
**Última Atualização:** 2025-01-XX  
**Status:** 📋 Planejamento Completo - Pronto para Implementação

