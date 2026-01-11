# Planejamento Completo - Integração de Cupons com Backend

## 📋 Visão Geral

Este documento detalha o planejamento completo para integrar 100% a funcionalidade de cupons do app com o backend, garantindo que todos os lugares onde cupons são utilizados estejam totalmente integrados e funcionais.

## 🎯 Objetivos

1. ✅ Integrar tela de Cupons com endpoints do backend
2. ✅ Garantir que aplicação/remoção de cupons funcione corretamente
3. ✅ Validar cupons antes de aplicar
4. ✅ Exibir cupons disponíveis do backend
5. ✅ Sincronizar cupom aplicado entre todas as telas
6. ✅ Calcular descontos corretamente em todos os lugares
7. ✅ Tratar erros e estados de loading adequadamente

## 📊 Estado Atual

### Backend ✅
- ✅ Endpoints de cupons implementados:
  - `GET /api/coupons` - Listar cupons disponíveis
  - `GET /api/coupons/:codigo` - Obter cupom por código
  - `POST /api/coupons/validate` - Validar cupom
- ✅ Endpoints de carrinho com cupons:
  - `POST /api/cart/apply-coupon` - Aplicar cupom
  - `DELETE /api/cart/coupon` - Remover cupom
- ✅ Serviço de cupons (`coupon.service.ts`) completo
- ✅ Serviço de carrinho (`cart.service.ts`) com suporte a cupons
- ✅ Validações de cupom implementadas:
  - Validade (validoDe/validoAte)
  - Limite de uso geral
  - Limite de uso por usuário
  - Valor mínimo do pedido
  - Cupom ativo/inativo
  - Entrega obrigatória
  - Desconto não aplica à entrega

### Frontend ⚠️
- ⚠️ Tela `Cupons.tsx` usa dados mockados
- ✅ `CartContext` já tem integração parcial com backend
- ✅ `cart.service.ts` tem métodos de aplicar/remover cupom
- ✅ Cálculo de desconto implementado em `couponUtils.ts`
- ⚠️ Falta serviço dedicado para cupons no frontend
- ⚠️ Falta integração completa da tela de Cupons

## 🔍 Locais Onde Cupons São Usados

### 1. Tela de Cupons (`src/front/screens/Cupons.tsx`)
- **Status**: Usa dados mockados
- **Necessita**: Integração completa com `GET /api/coupons`

### 2. Tela de Carrinho (`src/front/screens/Cart.tsx`)
- **Status**: Parcialmente integrado
- **Necessita**: Verificar se aplicação/remoção está funcionando corretamente

### 3. Tela de Checkout (`src/front/screens/Checkout.tsx`)
- **Status**: Usa cupom do context
- **Necessita**: Verificar se cálculo está correto

### 4. Tela Home (`src/front/screens/Home.tsx`)
- **Status**: Exibe banner de cupom
- **Necessita**: Verificar se está sincronizado

### 5. Context de Carrinho (`src/contexts/CartContext.tsx`)
- **Status**: Parcialmente integrado
- **Necessita**: Melhorar tratamento de erros e validações

## 📝 Tarefas de Implementação

### Fase 1: Criar Serviço de Cupons no Frontend

#### 1.1 Criar `src/services/coupon.service.ts`
```typescript
- getAvailableCoupons() - GET /api/coupons
- getCouponByCode(codigo) - GET /api/coupons/:codigo
- validateCoupon(codigo, valorPedido?) - POST /api/coupons/validate
```

**Arquivos a criar/modificar:**
- ✅ `src/services/coupon.service.ts` (criar)

### Fase 2: Integrar Tela de Cupons

#### 2.1 Atualizar `src/front/screens/Cupons.tsx`
- Remover dados mockados
- Carregar cupons do backend usando `coupon.service`
- Implementar loading states
- Implementar error handling
- Validar cupom antes de aplicar
- Aplicar cupom usando `CartContext.applyCoupon()`
- Exibir mensagens de erro/sucesso adequadas

**Arquivos a modificar:**
- ✅ `src/front/screens/Cupons.tsx`

### Fase 3: Melhorar CartContext

#### 3.1 Atualizar `src/contexts/CartContext.tsx`
- Melhorar tratamento de erros ao aplicar cupom
- Adicionar validação de cupom antes de aplicar
- Melhorar conversão de cupom do backend
- Adicionar condições do cupom na conversão
- Sincronizar cupom aplicado corretamente

**Arquivos a modificar:**
- ✅ `src/contexts/CartContext.tsx`

### Fase 4: Verificar e Ajustar Conversão de Cupom

#### 4.1 Atualizar `convertBackendCoupon` em `CartContext.tsx`
- Mapear todas as propriedades do cupom do backend
- Incluir condições do cupom (valorMinimoPedido, descontoEntrega, entregaObrigatoria, etc.)
- Formatar validade corretamente
- Garantir que `couponConditions` seja populado corretamente

**Arquivos a modificar:**
- ✅ `src/contexts/CartContext.tsx`

### Fase 5: Verificar Cálculo de Desconto

#### 5.1 Verificar `src/lib/couponUtils.ts`
- Garantir que cálculo está alinhado com backend
- Verificar se condições são aplicadas corretamente
- Testar todos os tipos de cupom (fixo, percentual)
- Verificar se descontoEntrega está sendo considerado

**Arquivos a verificar:**
- ✅ `src/lib/couponUtils.ts`

### Fase 6: Integrar Validação de Cupom

#### 6.1 Atualizar `src/front/screens/Cupons.tsx`
- Usar `coupon.service.validateCoupon()` antes de aplicar
- Exibir mensagens de erro específicas
- Validar valor mínimo do pedido
- Validar entrega obrigatória

**Arquivos a modificar:**
- ✅ `src/front/screens/Cupons.tsx`

### Fase 7: Verificar Todas as Telas que Usam Cupom

#### 7.1 Verificar `src/front/screens/Cart.tsx`
- Garantir que aplicação/remoção funciona
- Verificar se cupom aplicado é exibido corretamente
- Verificar cálculo de totais

#### 7.2 Verificar `src/front/screens/Checkout.tsx`
- Garantir que cupom é exibido corretamente
- Verificar cálculo de totais
- Garantir que cupom é enviado no pedido

#### 7.3 Verificar `src/front/screens/Home.tsx`
- Garantir que banner de cupom está sincronizado
- Verificar se contador de cupons está correto

**Arquivos a verificar:**
- ✅ `src/front/screens/Cart.tsx`
- ✅ `src/front/screens/Checkout.tsx`
- ✅ `src/front/screens/Home.tsx`

### Fase 8: Tratamento de Erros e Mensagens

#### 8.1 Adicionar mensagens de erro específicas
- Mapear códigos de erro do backend para mensagens amigáveis
- Exibir toasts com mensagens claras
- Tratar todos os casos de erro possíveis

**Arquivos a modificar:**
- ✅ `src/lib/errorMessages.ts` (verificar se já tem mensagens de cupom)
- ✅ `src/front/screens/Cupons.tsx`
- ✅ `src/contexts/CartContext.tsx`

### Fase 9: Testes e Validação

#### 9.1 Testar fluxo completo
- Listar cupons disponíveis
- Aplicar cupom válido
- Aplicar cupom inválido (expirado, esgotado, etc.)
- Remover cupom
- Verificar cálculo de desconto
- Verificar sincronização entre telas

## 🔄 Fluxo de Integração

### Fluxo de Listar Cupons
```
Cupons.tsx
  → coupon.service.getAvailableCoupons()
  → GET /api/coupons
  → Exibir cupons disponíveis
```

### Fluxo de Aplicar Cupom
```
Cupons.tsx (ou Cart.tsx)
  → Validar cupom (opcional, mas recomendado)
  → CartContext.applyCoupon(codigo)
  → cart.service.applyCoupon(codigo)
  → POST /api/cart/apply-coupon
  → Backend valida e aplica
  → CartContext.loadCart()
  → GET /api/cart
  → Atualizar UI
```

### Fluxo de Remover Cupom
```
Cart.tsx (ou qualquer tela)
  → CartContext.removeCoupon()
  → cart.service.removeCoupon()
  → DELETE /api/cart/coupon
  → CartContext.loadCart()
  → GET /api/cart
  → Atualizar UI
```

## 📐 Estrutura de Dados

### Cupom do Backend
```typescript
{
  id: string;
  codigo: string;
  descricao: string;
  tipoDesconto: 'fixo' | 'percentual';
  valorDesconto: number; // centavos ou porcentagem
  valorMinimoPedido?: number; // centavos
  valorMaximoDesconto?: number; // centavos
  descontoEntrega: boolean;
  entregaObrigatoria: boolean;
  categoriaId?: string;
  produtoId?: string;
  validoDe: Date;
  validoAte: Date;
  limiteUso?: number;
  limiteUsoPorUsuario: number;
  quantidadeUsada: number;
  ativo: boolean;
  podeUsar?: boolean; // adicionado pelo backend
}
```

### Cupom do Frontend (AppliedCoupon)
```typescript
{
  id: string;
  discountValue: string; // "R$ 20 OFF" ou "10% OFF"
  description: string;
  conditions: string; // texto formatado
  validUntil: string; // data formatada
  couponCode: string;
  discountType: 'fixed' | 'percentage';
  discountAmount: number;
  couponConditions?: {
    minOrderValue?: number;
    maxDiscountValue?: number;
    deliveryNotIncluded?: boolean;
    deliveryRequired?: boolean;
  };
}
```

## 🎨 Melhorias de UX

1. **Loading States**
   - Skeleton loaders na tela de Cupons
   - Loading ao aplicar/remover cupom

2. **Feedback Visual**
   - Toast de sucesso ao aplicar cupom
   - Toast de erro com mensagem clara
   - Indicador visual de cupom aplicado

3. **Validação em Tempo Real**
   - Validar cupom antes de aplicar
   - Mostrar mensagens de erro específicas
   - Desabilitar botão se cupom inválido

4. **Empty States**
   - Mensagem quando não há cupons disponíveis
   - Mensagem quando cupom não pode ser usado

## 🐛 Casos de Erro a Tratar

1. **Cupom não encontrado** (`COUPON_NOT_FOUND`)
2. **Cupom inativo** (`COUPON_INACTIVE`)
3. **Cupom expirado** (`COUPON_EXPIRED`)
4. **Cupom ainda não válido** (`COUPON_NOT_VALID_YET`)
5. **Cupom esgotado** (`COUPON_EXHAUSTED`)
6. **Limite de uso por usuário excedido** (`COUPON_USER_LIMIT_EXCEEDED`)
7. **Valor mínimo não atingido** (`MINIMUM_ORDER_VALUE_NOT_MET`)
8. **Erro de rede**
9. **Erro ao carregar cupons**

## ✅ Checklist de Implementação

### Fase 1: Serviço de Cupons
- [ ] Criar `src/services/coupon.service.ts`
- [ ] Implementar `getAvailableCoupons()`
- [ ] Implementar `getCouponByCode()`
- [ ] Implementar `validateCoupon()`

### Fase 2: Tela de Cupons
- [ ] Remover dados mockados
- [ ] Carregar cupons do backend
- [ ] Implementar loading states
- [ ] Implementar error handling
- [ ] Validar cupom antes de aplicar
- [ ] Aplicar cupom via CartContext
- [ ] Exibir mensagens de erro/sucesso

### Fase 3: CartContext
- [ ] Melhorar tratamento de erros
- [ ] Adicionar validação de cupom
- [ ] Melhorar conversão de cupom
- [ ] Adicionar condições do cupom na conversão

### Fase 4: Conversão de Cupom
- [ ] Mapear todas as propriedades
- [ ] Incluir condições do cupom
- [ ] Formatar validade corretamente
- [ ] Popular `couponConditions`

### Fase 5: Cálculo de Desconto
- [ ] Verificar alinhamento com backend
- [ ] Testar todos os tipos de cupom
- [ ] Verificar condições

### Fase 6: Validação
- [ ] Integrar validação antes de aplicar
- [ ] Exibir mensagens específicas
- [ ] Validar valor mínimo
- [ ] Validar entrega obrigatória

### Fase 7: Verificação de Telas
- [ ] Verificar Cart.tsx
- [ ] Verificar Checkout.tsx
- [ ] Verificar Home.tsx

### Fase 8: Tratamento de Erros
- [ ] Mapear códigos de erro
- [ ] Adicionar mensagens amigáveis
- [ ] Tratar todos os casos

### Fase 9: Testes
- [ ] Testar listar cupons
- [ ] Testar aplicar cupom válido
- [ ] Testar aplicar cupom inválido
- [ ] Testar remover cupom
- [ ] Testar cálculo de desconto
- [ ] Testar sincronização entre telas

## 🚀 Ordem de Implementação Recomendada

1. **Fase 1** - Criar serviço de cupons (base)
2. **Fase 4** - Melhorar conversão de cupom (necessário para outras fases)
3. **Fase 3** - Melhorar CartContext (necessário para aplicar cupons)
4. **Fase 2** - Integrar tela de Cupons (usa serviço e context)
5. **Fase 5** - Verificar cálculo de desconto (garantir correção)
6. **Fase 6** - Integrar validação (melhorar UX)
7. **Fase 7** - Verificar outras telas (garantir consistência)
8. **Fase 8** - Tratamento de erros (polimento)
9. **Fase 9** - Testes finais (validação completa)

## 📚 Referências

- Backend: `src/back/services/coupon.service.ts`
- Backend: `src/back/services/cart.service.ts`
- Backend: `src/back/api/routes/coupon.routes.ts`
- Backend: `src/back/api/routes/cart.routes.ts`
- Frontend: `src/services/cart.service.ts`
- Frontend: `src/contexts/CartContext.tsx`
- Frontend: `src/lib/couponUtils.ts`

## 🎯 Resultado Esperado

Após a implementação completa:

1. ✅ Tela de Cupons lista cupons reais do backend
2. ✅ Cupons podem ser aplicados e removidos corretamente
3. ✅ Validações funcionam antes de aplicar cupom
4. ✅ Cálculo de desconto está correto em todas as telas
5. ✅ Cupom aplicado é sincronizado entre todas as telas
6. ✅ Mensagens de erro são claras e específicas
7. ✅ Loading states funcionam corretamente
8. ✅ Todos os casos de erro são tratados adequadamente

