# 🗺️ Roadmap de Execução - Now 24 Horas

Roadmap detalhado e executável para implementar todas as integrações necessárias.

---

## 📊 Status Geral

- ✅ **FASE 1:** Autenticação e Usuários (100% completa)
- 🔄 **FASE 2-7:** Core do App (0% - PRÓXIMAS)
- ⏳ **FASE 8-11:** Experiência Completa (0%)
- ⏳ **FASE 12:** Analytics (0%)

---

## 🎯 Sprint 1: Core do App (20-25 dias)

### **Semana 1-2: Fundação**

#### **FASE 2: Endereços** (3 dias)
**Dependências:** FASE 1 ✅

**Endpoints:**
- `GET /api/addresses` - Listar endereços
- `POST /api/addresses` - Criar endereço
- `GET /api/addresses/:id` - Obter endereço
- `PUT /api/addresses/:id` - Atualizar endereço
- `DELETE /api/addresses/:id` - Deletar endereço
- `PATCH /api/addresses/:id/set-default` - Definir padrão

**Integração Frontend:**
- Atualizar `AddressContext`
- Atualizar `Addresses.tsx`
- Atualizar `Checkout.tsx` (seleção de endereço)

**Testes:** `npm run api:test:fase2`

---

#### **FASE 3: Produtos e Catálogo** (5 dias)
**Dependências:** FASE 1 ✅

**Endpoints:**
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Detalhes categoria
- `GET /api/products` - Listar produtos (com filtros)
- `GET /api/products/:id` - Detalhes produto
- `GET /api/products/popular` - Produtos populares
- `GET /api/products/offers` - Produtos em oferta
- `GET /api/products/new` - Produtos novos
- `GET /api/search` - Busca de produtos

**Integração Frontend:**
- Atualizar `Home.tsx` (produtos, categorias, banners)
- Atualizar `ProductDetails.tsx`
- Atualizar `ProductListScreen.tsx`
- Atualizar `Search.tsx`

**Testes:** `npm run api:test:fase3`

---

### **Semana 3: Compra**

#### **FASE 4: Carrinho** (3 dias)
**Dependências:** FASE 1 ✅, FASE 3

**Endpoints:**
- `GET /api/cart` - Obter carrinho
- `POST /api/cart/items` - Adicionar item
- `PUT /api/cart/items/:id` - Atualizar quantidade
- `DELETE /api/cart/items/:id` - Remover item
- `DELETE /api/cart` - Limpar carrinho
- `POST /api/cart/apply-coupon` - Aplicar cupom
- `DELETE /api/cart/coupon` - Remover cupom

**Integração Frontend:**
- Atualizar `CartContext`
- Atualizar `Cart.tsx`
- Atualizar `Home.tsx` (adicionar ao carrinho)
- Atualizar `ProductDetails.tsx` (adicionar ao carrinho)

**Testes:** `npm run api:test:fase4`

---

#### **FASE 5: Cupons** (2 dias)
**Dependências:** FASE 1 ✅

**Endpoints:**
- `GET /api/coupons` - Listar cupons disponíveis
- `GET /api/coupons/:code` - Validar cupom
- `POST /api/coupons/validate` - Validar para pedido

**Integração Frontend:**
- Atualizar `Cupons.tsx`
- Atualizar `CartContext` (aplicar cupom)
- Atualizar `Checkout.tsx` (aplicar cupom)

**Testes:** `npm run api:test:fase5`

---

### **Semana 4-5: Pedidos e Pagamento**

#### **FASE 6: Pedidos** (6 dias)
**Dependências:** FASE 1 ✅, FASE 2, FASE 4, FASE 5

**Endpoints:**
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar pedidos do usuário
- `GET /api/orders/:id` - Detalhes do pedido
- `PATCH /api/orders/:id/status` - Atualizar status (admin)
- `POST /api/orders/:id/cancel` - Cancelar pedido

**Integração Frontend:**
- Atualizar `Checkout.tsx` (criar pedido)
- Atualizar `MyOrders.tsx`
- Atualizar `OrderDetails.tsx`
- Atualizar `OrderProcessing.tsx`
- Atualizar `OrderConfirmation.tsx`

**Testes:** `npm run api:test:fase6`

---

#### **FASE 7: Pagamentos** (5 dias)
**Dependências:** FASE 1 ✅, FASE 6

**Endpoints:**
- `GET /api/payment-cards` - Listar cartões
- `POST /api/payment-cards` - Adicionar cartão
- `PUT /api/payment-cards/:id` - Atualizar cartão
- `DELETE /api/payment-cards/:id` - Remover cartão
- `PATCH /api/payment-cards/:id/set-default` - Definir padrão
- `POST /api/payments/process` - Processar pagamento
- `POST /api/webhooks/payment` - Webhook de pagamento

**Integrações Externas:**
- Configurar gateway (Stripe/Mercado Pago)
- Implementar tokenização de cartões
- Implementar webhooks

**Integração Frontend:**
- Atualizar `PaymentMethods.tsx`
- Atualizar `Checkout.tsx` (processar pagamento)

**Testes:** `npm run api:test:fase7`

---

## 🎯 Sprint 2: Experiência Completa (10-15 dias)

### **Semana 6-7**

#### **FASE 8: Favoritos** (1 dia)
- `GET /api/favorites`
- `POST /api/favorites/:productId`
- `DELETE /api/favorites/:productId`

#### **FASE 9: Avaliações** (3 dias)
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`
- `POST /api/orders/:id/review`

#### **FASE 10: Notificações** (4 dias)
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- Push notifications

#### **FASE 11: Rastreamento** (4 dias)
- `GET /api/orders/:id/tracking`
- WebSocket para atualizações
- Mapa de localização

---

## 📋 Checklist de Integração Frontend

### Por Tela:

#### **Home.tsx**
- [ ] Buscar categorias da API
- [ ] Buscar produtos da API
- [ ] Buscar banners da API
- [ ] Buscar produtos populares
- [ ] Buscar produtos em oferta
- [ ] Adicionar ao carrinho via API

#### **Cart.tsx**
- [ ] Buscar carrinho da API
- [ ] Atualizar quantidade via API
- [ ] Remover item via API
- [ ] Aplicar cupom via API
- [ ] Calcular totais

#### **Checkout.tsx**
- [ ] Buscar endereços da API
- [ ] Buscar cartões da API
- [ ] Validar cupom via API
- [ ] Criar pedido via API
- [ ] Processar pagamento via API

#### **MyOrders.tsx**
- [ ] Buscar pedidos da API
- [ ] Filtrar por status
- [ ] Paginação

#### **OrderDetails.tsx**
- [ ] Buscar detalhes do pedido
- [ ] Buscar histórico de status
- [ ] Buscar rastreamento (se disponível)

#### **ProductDetails.tsx**
- [ ] Buscar detalhes do produto
- [ ] Buscar personalizações
- [ ] Adicionar ao carrinho via API
- [ ] Adicionar/remover favorito via API

#### **Search.tsx**
- [ ] Buscar produtos via API
- [ ] Filtrar por categoria
- [ ] Ordenação

#### **Addresses.tsx**
- [ ] Listar endereços da API
- [ ] Criar endereço via API
- [ ] Editar endereço via API
- [ ] Deletar endereço via API
- [ ] Definir padrão via API

#### **PaymentMethods.tsx**
- [ ] Listar cartões da API
- [ ] Adicionar cartão via API
- [ ] Editar cartão via API
- [ ] Deletar cartão via API
- [ ] Definir padrão via API

#### **Cupons.tsx**
- [ ] Listar cupons disponíveis da API
- [ ] Validar cupom via API

#### **Favorites.tsx**
- [ ] Listar favoritos da API
- [ ] Remover favorito via API

---

## 🔧 Configurações Necessárias

### **Variáveis de Ambiente (.env.local)**

```env
# Banco de Dados
DATABASE_URL=postgresql://...

# API
API_PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=sua-chave-secreta-min-32-caracteres
JWT_REFRESH_SECRET=sua-chave-refresh-min-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Gateway de Pagamento (escolher um)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# OU
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...

# SMS/OTP
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+...
# OU
AWS_SNS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Push Notifications
EXPO_PUSH_TOKEN=...
```

---

## 📚 Documentação por Fase

Cada fase terá:
- ✅ Documentação de endpoints
- ✅ Exemplos de uso
- ✅ Testes automatizados
- ✅ Guia de integração frontend

---

## ✅ Critérios de Aceitação

### **Sprint 1 Completo quando:**
1. ✅ Usuário faz login
2. ✅ Usuário vê produtos na Home
3. ✅ Usuário busca produtos
4. ✅ Usuário vê detalhes do produto
5. ✅ Usuário adiciona produtos ao carrinho
6. ✅ Usuário aplica cupom
7. ✅ Usuário escolhe endereço
8. ✅ Usuário escolhe método de pagamento
9. ✅ Usuário cria pedido
10. ✅ Usuário vê seus pedidos
11. ✅ Usuário vê detalhes do pedido

---

**Última atualização:** 2025-01-05  
**Próxima Fase:** FASE 2 - Endereços

