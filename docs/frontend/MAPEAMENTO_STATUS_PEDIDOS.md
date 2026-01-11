# Mapeamento de Status e Substatus de Pedidos

Este documento descreve o mapeamento completo de status e substatus de pedidos no sistema.

## Status Principais

O sistema possui os seguintes status principais:

1. **Confirmado** (`confirmado`)
2. **Preparando** (`preparando`)
3. **Em entrega** (`saiu_para_entrega`)
4. **Entregue** (`entregue`)

## Status Auxiliares

- **Pendente** (`pendente`)
- **Aguardando pagamento** (`aguardando_pagamento`)
- **Cancelado** (`cancelado`)
- **Reembolsado** (`reembolsado`)

## Mapeamento de Substatus

### 1. Status: Confirmado

**Substatus possíveis:**
- **"Aguardando confirmação"**: Quando o pedido está com status `pendente`
- **"Aguardando pagamento"**: Quando o pedido está com status `aguardando_pagamento`
- Sem substatus: Quando o pedido já foi confirmado e está em preparação ou além

**Lógica:**
```typescript
if (status === 'pendente') {
  substatus = 'Aguardando confirmação';
} else if (status === 'aguardando_pagamento') {
  substatus = 'Aguardando pagamento';
}
```

### 2. Status: Preparando

**Substatus possíveis:**
- **"Preparando seu pedido"**: Quando o pedido está com status `preparando`
- Sem substatus: Quando o pedido já foi preparado e saiu para entrega ou foi entregue

**Lógica:**
```typescript
if (status === 'preparando') {
  substatus = 'Preparando seu pedido';
}
```

### 3. Status: Em entrega

**Substatus possíveis:**
- **"Aguardando entregador"**: Quando o pedido está com status `preparando` (ainda não saiu para entrega)
- **"A caminho"**: Quando o pedido está com status `saiu_para_entrega`
- Sem substatus: Quando o pedido já foi entregue

**Lógica:**
```typescript
if (status === 'preparando') {
  substatus = 'Aguardando entregador';
} else if (status === 'saiu_para_entrega') {
  substatus = 'A caminho';
}
```

### 4. Status: Entregue

**Substatus:**
- Sem substatus: O pedido foi entregue com sucesso

## Estados Visuais

Cada status pode ter três estados visuais:

1. **Default**: Status ainda não alcançado (cinza)
2. **Current**: Status atual do pedido (cor primária, com animação)
3. **Complete**: Status já completado (verde)

## Exibição no Frontend

Os substatus são exibidos abaixo do label do status na timeline de pedidos:

```
[Ícone] Confirmado
        Aguardando confirmação  ← Substatus
        15/01/2024 14:30        ← Data
```

### Estilos de Substatus

- **Cor padrão**: `colors.mutedForeground` (cinza)
- **Cor quando Current**: `colors.primary` (rosa) com `fontWeight: medium`
- **Tamanho**: `typography.xs` (10px)
- **Espaçamento**: `marginTop: 2px`

## Fluxo Completo de Status

```
pendente → aguardando_pagamento → confirmado → preparando → saiu_para_entrega → entregue
```

### Exemplo de Timeline com Substatus

1. **Confirmado** (Current)
   - Substatus: "Aguardando confirmação"
   - Estado: Current (rosa, com animação)

2. **Preparando** (Default)
   - Substatus: "Aguardando entregador"
   - Estado: Default (cinza)

3. **Em entrega** (Default)
   - Sem substatus
   - Estado: Default (cinza)

4. **Entregue** (Default)
   - Sem substatus
   - Estado: Default (cinza)

## Implementação

O mapeamento está implementado na função `getOrderStatus()` em `src/front/screens/OrderDetails.tsx`.

A função determina:
- O estado visual de cada status (Default, Current, Complete)
- O substatus apropriado baseado no status atual do pedido
- As datas de transição de cada status

