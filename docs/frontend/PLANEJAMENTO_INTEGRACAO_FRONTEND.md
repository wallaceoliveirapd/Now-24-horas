# 🚀 Planejamento Completo - Integração Frontend com Backend

**Data:** 2025-01-05  
**Objetivo:** Integrar todos os endpoints do backend no frontend React Native

---

## 📋 Visão Geral

Este documento detalha **TODAS** as integrações necessárias para conectar o frontend React Native com o backend, organizadas por fases e prioridades.

**Status Atual:**
- ✅ Backend completo (FASE 1-12)
- ✅ Frontend com telas mockadas
- ⏳ Integração: **0%** (precisa ser feita)

---

## 🎯 Estrutura de Integração

### **Camadas Necessárias:**

1. **API Client** (`src/services/api/`)
   - Cliente HTTP centralizado
   - Interceptors para autenticação
   - Tratamento de erros
   - Tipos TypeScript

2. **Services** (`src/services/`)
   - Serviços específicos por domínio
   - Lógica de negócio
   - Cache quando necessário

3. **Contexts** (`src/contexts/`)
   - Gerenciamento de estado global
   - Hooks customizados
   - Sincronização com backend

4. **Hooks** (`src/hooks/`)
   - Hooks reutilizáveis
   - Lógica compartilhada

---

## 📊 Mapeamento Completo de Endpoints

### **FASE 1: Autenticação** 🔐
**Prioridade:** ⭐⭐⭐ CRÍTICA

#### **Endpoints Disponíveis:**
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/verify-otp` - Verificar código OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### **O que precisa ser feito:**

**1.1 Criar API Client Base**
- [ ] Criar `src/services/api/client.ts`
  - Configurar axios/fetch com base URL
  - Interceptor para adicionar token
  - Interceptor para refresh token automático
  - Tratamento de erros global

**1.2 Criar Service de Autenticação**
- [ ] Criar `src/services/auth.service.ts`
  - `register()` - Registro
  - `verifyOtp()` - Verificar OTP
  - `login()` - Login
  - `refreshToken()` - Renovar token
  - `logout()` - Logout

**1.3 Atualizar AuthContext**
- [ ] Integrar com `auth.service.ts`
- [ ] Gerenciar tokens (access + refresh)
- [ ] Persistir tokens no AsyncStorage
- [ ] Auto-refresh de tokens
- [ ] Logout automático em 401

**1.4 Atualizar Telas**
- [ ] `Login.tsx` - Integrar login
- [ ] `SignUp.tsx` - Integrar registro
- [ ] `VerifyOtp.tsx` - Integrar verificação OTP

**1.5 Testes**
- [ ] Testar fluxo completo de autenticação
- [ ] Testar refresh automático
- [ ] Testar logout

---

### **FASE 2: Usuário e Perfil** 👤
**Prioridade:** ⭐⭐ ALTA

#### **Endpoints Disponíveis:**
- `GET /api/users/me` - Obter dados do usuário
- `PUT /api/users/me` - Atualizar perfil
- `POST /api/users/change-password` - Alterar senha
- `POST /api/users/push-token` - Salvar token push

#### **O que precisa ser feito:**

**2.1 Criar Service de Usuário**
- [ ] Criar `src/services/user.service.ts`
  - `getProfile()` - Obter perfil
  - `updateProfile()` - Atualizar perfil
  - `changePassword()` - Alterar senha
  - `savePushToken()` - Salvar token push

**2.2 Atualizar Telas**
- [ ] `Profile.tsx` - Carregar dados do usuário
- [ ] `EditProfile.tsx` - Atualizar perfil
- [ ] `ChangePassword.tsx` - Alterar senha

**2.3 Integrar Push Notifications**
- [ ] Usar `usePushNotifications` hook
- [ ] Salvar token após login
- [ ] Atualizar token quando necessário

---

### **FASE 3: Endereços** 📍
**Prioridade:** ⭐⭐ ALTA

#### **Endpoints Disponíveis:**
- `GET /api/addresses/cep/:cep` - Buscar CEP (ViaCEP)
- `GET /api/addresses/estados` - Listar estados (IBGE)
- `GET /api/addresses/estados/:sigla` - Obter estado (IBGE)
- `GET /api/addresses/estados/:sigla/municipios` - Listar municípios (IBGE)
- `GET /api/addresses` - Listar endereços do usuário
- `GET /api/addresses/:id` - Obter endereço específico
- `POST /api/addresses` - Criar endereço
- `PUT /api/addresses/:id` - Atualizar endereço
- `DELETE /api/addresses/:id` - Deletar endereço
- `PATCH /api/addresses/:id/set-default` - Definir endereço padrão

#### **O que precisa ser feito:**

**3.1 Criar Service de Endereços**
- [ ] Criar `src/services/address.service.ts`
  - `searchCep()` - Buscar CEP
  - `getStates()` - Listar estados
  - `getState()` - Obter estado
  - `getMunicipalities()` - Listar municípios
  - `getAddresses()` - Listar endereços
  - `getAddress()` - Obter endereço
  - `createAddress()` - Criar endereço
  - `updateAddress()` - Atualizar endereço
  - `deleteAddress()` - Deletar endereço
  - `setDefaultAddress()` - Definir padrão

**3.2 Atualizar AddressContext**
- [ ] Integrar com `address.service.ts`
- [ ] Cache de estados/municípios
- [ ] Sincronização automática

**3.3 Atualizar Telas**
- [ ] `Addresses.tsx` - Listar e gerenciar endereços
- [ ] `Checkout.tsx` - Selecionar endereço
- [ ] Formulários de criação/edição

---

### **FASE 4: Categorias e Produtos** 🛍️
**Prioridade:** ⭐⭐⭐ CRÍTICA

#### **Endpoints Disponíveis:**
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Obter categoria
- `GET /api/categories/slug/:slug` - Obter categoria por slug
- `GET /api/products` - Listar produtos (com filtros)
- `GET /api/products/popular` - Produtos populares
- `GET /api/products/offers` - Produtos em oferta
- `GET /api/products/new` - Produtos novos
- `GET /api/products/:id` - Obter produto específico

#### **O que precisa ser feito:**

**4.1 Criar Service de Categorias**
- [ ] Criar `src/services/category.service.ts`
  - `getCategories()` - Listar categorias
  - `getCategoryById()` - Obter categoria
  - `getCategoryBySlug()` - Obter por slug

**4.2 Criar Service de Produtos**
- [ ] Criar `src/services/product.service.ts`
  - `getProducts()` - Listar produtos (filtros, busca, paginação)
  - `getProductById()` - Obter produto
  - `getPopularProducts()` - Produtos populares
  - `getOffersProducts()` - Produtos em oferta
  - `getNewProducts()` - Produtos novos

**4.3 Atualizar Telas**
- [ ] `Home.tsx` - Carregar categorias, produtos populares, ofertas
- [ ] `Search.tsx` - Busca e filtros de produtos
- [ ] `ProductListScreen.tsx` - Lista de produtos
- [ ] `ProductDetails.tsx` - Detalhes do produto

**4.4 Remover Mocks**
- [ ] Substituir `mockProducts` por chamadas reais
- [ ] Implementar loading states
- [ ] Implementar error states

---

### **FASE 5: Carrinho** 🛒
**Prioridade:** ⭐⭐⭐ CRÍTICA

#### **Endpoints Disponíveis:**
- `GET /api/cart` - Obter carrinho
- `POST /api/cart/items` - Adicionar item
- `PUT /api/cart/items/:id` - Atualizar quantidade
- `DELETE /api/cart/items/:id` - Remover item
- `DELETE /api/cart` - Limpar carrinho
- `POST /api/cart/apply-coupon` - Aplicar cupom
- `DELETE /api/cart/coupon` - Remover cupom

#### **O que precisa ser feito:**

**5.1 Criar Service de Carrinho**
- [ ] Criar `src/services/cart.service.ts`
  - `getCart()` - Obter carrinho
  - `addItem()` - Adicionar item
  - `updateItemQuantity()` - Atualizar quantidade
  - `removeItem()` - Remover item
  - `clearCart()` - Limpar carrinho
  - `applyCoupon()` - Aplicar cupom
  - `removeCoupon()` - Remover cupom

**5.2 Atualizar CartContext**
- [ ] Integrar com `cart.service.ts`
- [ ] Sincronizar com backend
- [ ] Cache local para offline
- [ ] Sincronização ao voltar online

**5.3 Atualizar Telas**
- [ ] `Cart.tsx` - Exibir carrinho do backend
- [ ] `ProductDetails.tsx` - Adicionar ao carrinho
- [ ] `Home.tsx` - Badge de quantidade
- [ ] `Checkout.tsx` - Usar carrinho do backend

---

### **FASE 6: Cupons** 🎟️
**Prioridade:** ⭐⭐ ALTA

#### **Endpoints Disponíveis:**
- `GET /api/coupons` - Listar cupons disponíveis
- `GET /api/coupons/:codigo` - Obter cupom por código
- `POST /api/coupons/validate` - Validar cupom

#### **O que precisa ser feito:**

**6.1 Criar Service de Cupons**
- [ ] Criar `src/services/coupon.service.ts`
  - `getCoupons()` - Listar cupons
  - `getCouponByCode()` - Obter cupom
  - `validateCoupon()` - Validar cupom

**6.2 Atualizar Telas**
- [ ] `Cupons.tsx` - Listar cupons disponíveis
- [ ] `Cart.tsx` - Aplicar cupom
- [ ] `Checkout.tsx` - Aplicar cupom

---

### **FASE 7: Pedidos** 📦
**Prioridade:** ⭐⭐⭐ CRÍTICA

#### **Endpoints Disponíveis:**
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar pedidos do usuário
- `GET /api/orders/:id` - Obter detalhes do pedido
- `POST /api/orders/:id/cancel` - Cancelar pedido
- `POST /api/orders/:id/pay` - Pagar pedido

#### **O que precisa ser feito:**

**7.1 Criar Service de Pedidos**
- [ ] Criar `src/services/order.service.ts`
  - `createOrder()` - Criar pedido
  - `getOrders()` - Listar pedidos
  - `getOrderById()` - Obter pedido
  - `cancelOrder()` - Cancelar pedido
  - `payOrder()` - Pagar pedido

**7.2 Atualizar Telas**
- [ ] `Checkout.tsx` - Criar pedido
- [ ] `MyOrders.tsx` - Listar pedidos
- [ ] `OrderDetails.tsx` - Detalhes do pedido
- [ ] `OrderConfirmation.tsx` - Confirmação
- [ ] `OrderProcessing.tsx` - Processamento

**7.3 Integração com Carrinho**
- [ ] Limpar carrinho após criar pedido
- [ ] Redirecionar para confirmação

---

### **FASE 8: Pagamentos** 💳
**Prioridade:** ⭐⭐⭐ CRÍTICA

#### **Endpoints Disponíveis:**
- `GET /api/payment-cards` - Listar cartões salvos
- `GET /api/payment-cards/:id` - Obter cartão
- `POST /api/payment-cards` - Adicionar cartão
- `PUT /api/payment-cards/:id` - Atualizar cartão
- `DELETE /api/payment-cards/:id` - Deletar cartão
- `PATCH /api/payment-cards/:id/set-default` - Definir cartão padrão
- `POST /api/payments/process` - Processar pagamento
- `GET /api/payments/transaction/:id` - Obter transação

#### **O que precisa ser feito:**

**8.1 Criar Service de Cartões**
- [ ] Criar `src/services/payment-card.service.ts`
  - `getPaymentCards()` - Listar cartões
  - `getPaymentCard()` - Obter cartão
  - `addPaymentCard()` - Adicionar cartão
  - `updatePaymentCard()` - Atualizar cartão
  - `deletePaymentCard()` - Deletar cartão
  - `setDefaultCard()` - Definir padrão

**8.2 Criar Service de Pagamentos**
- [ ] Criar `src/services/payment.service.ts`
  - `processPayment()` - Processar pagamento
  - `getTransaction()` - Obter transação
  - `tokenizeCard()` - Tokenizar cartão (Mercado Pago)

**8.3 Integração Mercado Pago**
- [ ] Configurar SDK do Mercado Pago no frontend
- [ ] Tokenizar cartões
- [ ] Processar pagamentos (cartão e PIX)

**8.4 Atualizar Telas**
- [ ] `PaymentMethods.tsx` - Gerenciar cartões
- [ ] `Checkout.tsx` - Selecionar método de pagamento
- [ ] Processar pagamento após criar pedido

---

### **FASE 9: Favoritos** ❤️
**Prioridade:** ⭐ MÉDIA

#### **Endpoints Disponíveis:**
- `GET /api/favorites` - Listar favoritos
- `GET /api/favorites/check/:productId` - Verificar se é favorito
- `POST /api/favorites/:productId` - Adicionar favorito
- `DELETE /api/favorites/:productId` - Remover favorito
- `POST /api/favorites/:productId/toggle` - Alternar favorito
- `GET /api/favorites/count` - Contar favoritos

#### **O que precisa ser feito:**

**9.1 Criar Service de Favoritos**
- [ ] Criar `src/services/favorite.service.ts`
  - `getFavorites()` - Listar favoritos
  - `isFavorite()` - Verificar se é favorito
  - `addFavorite()` - Adicionar favorito
  - `removeFavorite()` - Remover favorito
  - `toggleFavorite()` - Alternar favorito
  - `countFavorites()` - Contar favoritos

**9.2 Criar FavoriteContext (opcional)**
- [ ] Gerenciar estado de favoritos
- [ ] Cache local

**9.3 Atualizar Telas**
- [ ] `Favorites.tsx` - Listar favoritos
- [ ] `ProductDetails.tsx` - Botão de favoritar
- [ ] `Home.tsx` - Indicador de favoritos

---

### **FASE 10: Avaliações** ⭐
**Prioridade:** ⭐ MÉDIA

#### **Endpoints Disponíveis:**
- `GET /api/reviews/products/:productId` - Listar avaliações de produto
- `POST /api/reviews/products/:productId` - Criar avaliação de produto
- `PUT /api/reviews/:id` - Atualizar avaliação
- `DELETE /api/reviews/:id` - Deletar avaliação
- `POST /api/reviews/orders/:orderId` - Criar avaliação de pedido
- `GET /api/reviews/orders/:orderId` - Obter avaliação de pedido

#### **O que precisa ser feito:**

**10.1 Criar Service de Avaliações**
- [ ] Criar `src/services/review.service.ts`
  - `getProductReviews()` - Listar avaliações
  - `createProductReview()` - Criar avaliação
  - `updateReview()` - Atualizar avaliação
  - `deleteReview()` - Deletar avaliação
  - `createOrderReview()` - Avaliar pedido
  - `getOrderReview()` - Obter avaliação de pedido

**10.2 Atualizar Telas**
- [ ] `ProductDetails.tsx` - Exibir avaliações
- [ ] `OrderDetails.tsx` - Avaliar pedido
- [ ] Formulários de avaliação

---

### **FASE 11: Notificações** 🔔
**Prioridade:** ⭐⭐ ALTA

#### **Endpoints Disponíveis:**
- `GET /api/notifications` - Listar notificações
- `GET /api/notifications/unread-count` - Contar não lidas
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `PATCH /api/notifications/read-all` - Marcar todas como lidas
- `GET /api/notifications/preferences` - Obter preferências
- `PUT /api/notifications/preferences` - Atualizar preferências

#### **O que precisa ser feito:**

**11.1 Criar Service de Notificações**
- [ ] Criar `src/services/notification.service.ts`
  - `getNotifications()` - Listar notificações
  - `getUnreadCount()` - Contar não lidas
  - `markAsRead()` - Marcar como lida
  - `markAllAsRead()` - Marcar todas como lidas
  - `getPreferences()` - Obter preferências
  - `updatePreferences()` - Atualizar preferências

**11.2 Criar NotificationContext**
- [ ] Gerenciar estado de notificações
- [ ] Polling para novas notificações
- [ ] Badge de não lidas

**11.3 Atualizar Telas**
- [ ] `Profile.tsx` - Badge de notificações
- [ ] Tela de notificações (criar se não existir)
- [ ] `Settings.tsx` - Preferências de notificação

**11.4 Integração Push**
- [ ] Receber notificações push
- [ ] Atualizar lista ao receber push
- [ ] Navegação ao tocar na notificação

---

### **FASE 12: Analytics (Admin)** 📊
**Prioridade:** ⭐ BAIXA (apenas para admin)

#### **Endpoints Disponíveis:**
- `GET /api/admin/analytics/dashboard` - Dashboard
- `GET /api/admin/analytics/products` - Analytics de produtos
- `GET /api/admin/analytics/users` - Analytics de usuários
- `GET /api/admin/analytics/orders` - Analytics de pedidos
- `GET /api/admin/reports/sales` - Relatório de vendas
- `GET /api/admin/reports/products` - Relatório de produtos

#### **O que precisa ser feito:**

**12.1 Criar Service de Analytics**
- [ ] Criar `src/services/analytics.service.ts`
  - Métodos para todos os endpoints de analytics

**12.2 Criar Telas Admin (futuro)**
- [ ] Dashboard administrativo
- [ ] Gráficos e visualizações
- [ ] Exportação de relatórios

---

## 🏗️ Estrutura de Arquivos a Criar

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts              # Cliente HTTP base
│   │   ├── interceptors.ts        # Interceptors
│   │   └── types.ts               # Tipos TypeScript
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── address.service.ts
│   ├── category.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   ├── coupon.service.ts
│   ├── order.service.ts
│   ├── payment-card.service.ts
│   ├── payment.service.ts
│   ├── favorite.service.ts
│   ├── review.service.ts
│   ├── notification.service.ts
│   └── analytics.service.ts
├── contexts/
│   ├── AuthContext.tsx            # ✅ Já existe (atualizar)
│   ├── CartContext.tsx            # ✅ Já existe (atualizar)
│   ├── AddressContext.tsx         # ✅ Já existe (atualizar)
│   ├── FavoriteContext.tsx        # Criar
│   └── NotificationContext.tsx    # Criar
└── hooks/
    ├── useAuth.ts                 # Criar (wrapper do AuthContext)
    ├── useCart.ts                 # Criar (wrapper do CartContext)
    ├── useAddress.ts              # Criar (wrapper do AddressContext)
    ├── useFavorite.ts             # Criar
    ├── useNotification.ts         # Criar
    └── usePushNotifications.ts    # ✅ Já existe
```

---

## 🔧 Configuração Necessária

### **Variáveis de Ambiente**

Criar arquivo `.env` ou `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui
```

### **Dependências Necessárias**

```bash
npm install axios
npm install @react-native-async-storage/async-storage
npm install @mercadopago/sdk-react-native  # Se disponível
```

---

## 📝 Ordem de Implementação Recomendada

### **SPRINT 1: Fundação (Crítico)**
1. ✅ FASE 1: Autenticação
2. ✅ FASE 4: Categorias e Produtos
3. ✅ FASE 5: Carrinho

### **SPRINT 2: Compras (Crítico)**
4. ✅ FASE 2: Usuário e Perfil
5. ✅ FASE 3: Endereços
6. ✅ FASE 6: Cupons
7. ✅ FASE 7: Pedidos
8. ✅ FASE 8: Pagamentos

### **SPRINT 3: Funcionalidades Extras**
9. ✅ FASE 9: Favoritos
10. ✅ FASE 10: Avaliações
11. ✅ FASE 11: Notificações

### **SPRINT 4: Admin (Opcional)**
12. ✅ FASE 12: Analytics

---

## ✅ Checklist de Qualidade

Para cada fase, garantir:

- [ ] Service criado e testado
- [ ] Context atualizado (se aplicável)
- [ ] Telas integradas
- [ ] Loading states implementados
- [ ] Error states implementados
- [ ] Validações de formulário
- [ ] Tratamento de erros da API
- [ ] Testes manuais realizados
- [ ] Documentação atualizada

---

## 🐛 Tratamento de Erros

### **Padrão de Erro da API:**

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Mensagem de erro",
    details: { ... }
  }
}
```

### **Códigos de Erro Comuns:**

- `401` - Não autenticado → Redirecionar para login
- `403` - Acesso negado → Mostrar mensagem
- `404` - Não encontrado → Mostrar mensagem
- `400` - Validação → Mostrar erros de validação
- `500` - Erro do servidor → Mostrar mensagem genérica

---

## 🔄 Sincronização e Cache

### **Estratégias:**

1. **Cache Local (AsyncStorage)**
   - Tokens de autenticação
   - Dados do usuário
   - Carrinho (para offline)

2. **Cache em Memória**
   - Categorias (raramente mudam)
   - Estados/Municípios (raramente mudam)

3. **Sincronização Automática**
   - Carrinho ao voltar online
   - Notificações (polling)

---

## 📱 Offline Support

### **Funcionalidades Offline:**

- ✅ Visualizar produtos (cache)
- ✅ Visualizar categorias (cache)
- ✅ Adicionar ao carrinho (local)
- ⏳ Sincronizar ao voltar online

---

## 🧪 Testes

### **Testes Manuais por Fase:**

1. Testar fluxo completo
2. Testar casos de erro
3. Testar loading states
4. Testar validações
5. Testar offline (quando aplicável)

---

## 📚 Documentação

Cada fase deve ter:

- [ ] Documentação do service
- [ ] Exemplos de uso
- [ ] Tratamento de erros
- [ ] Casos de uso

---

**Última atualização:** 2025-01-05  
**Status:** 📋 Planejamento completo criado - Pronto para implementação

