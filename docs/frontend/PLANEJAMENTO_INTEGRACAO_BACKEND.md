# 🚀 Planejamento Completo - Integração Backend no Frontend

**Data:** 2025-01-05  
**Objetivo:** Integrar todos os endpoints do backend no frontend React Native/Expo

---

## 📋 Visão Geral

Este documento detalha **TODAS** as fases necessárias para integrar completamente o backend no frontend, garantindo que nenhuma funcionalidade seja deixada de fora.

**Tecnologias:**
- React Native / Expo
- React Navigation
- Axios (para requisições HTTP)
- Context API (para estado global)
- AsyncStorage (para persistência local)

---

## 🎯 Estrutura de Integração

### **Camadas:**
1. **API Client** - Cliente HTTP centralizado
2. **Services** - Camada de serviços (lógica de negócio)
3. **Contexts** - Estado global (Auth, Cart, etc.)
4. **Hooks** - Hooks customizados para facilitar uso
5. **Screens** - Telas que consomem os serviços

---

## 📦 FASE 0: Infraestrutura Base

**Objetivo:** Criar a base para todas as integrações

**Duração estimada:** 1 dia

### 0.1 Configuração de Ambiente
- [ ] Criar arquivo `.env` com `EXPO_PUBLIC_API_URL`
- [ ] Configurar variáveis de ambiente para dev/prod
- [ ] Criar arquivo de configuração `src/front/config/env.ts`

### 0.2 API Client Base
- [ ] Criar `src/front/services/api.client.ts`
  - [ ] Configurar Axios com baseURL
  - [ ] Interceptor para adicionar token JWT
  - [ ] Interceptor para refresh token automático
  - [ ] Tratamento de erros global
  - [ ] Timeout configurável
  - [ ] Retry automático para falhas de rede

### 0.3 Storage Service
- [ ] Criar `src/front/services/storage.service.ts`
  - [ ] Salvar/recuperar tokens
  - [ ] Salvar/recuperar dados do usuário
  - [ ] Limpar storage no logout
  - [ ] Métodos genéricos (get, set, remove, clear)

### 0.4 Error Handler
- [ ] Criar `src/front/utils/error-handler.ts`
  - [ ] Traduzir códigos de erro para mensagens amigáveis
  - [ ] Exibir erros de forma consistente
  - [ ] Log de erros para debug

### 0.5 Loading States
- [ ] Criar hook `useLoading.ts`
- [ ] Criar componente `Loading.tsx`
- [ ] Criar componente `ErrorBoundary.tsx`

---

## 🔐 FASE 1: Autenticação

**Objetivo:** Integrar todo o fluxo de autenticação

**Duração estimada:** 2 dias

### 1.1 Auth Service
- [ ] Criar `src/front/services/auth.service.ts`
  - [ ] `register(email, telefone, senha, nome)` → `POST /api/auth/register`
  - [ ] `verifyOtp(emailOuTelefone, codigo)` → `POST /api/auth/verify-otp`
  - [ ] `login(emailOuTelefone, senha)` → `POST /api/auth/login`
  - [ ] `refreshToken(refreshToken)` → `POST /api/auth/refresh`
  - [ ] `logout()` → `POST /api/auth/logout`
  - [ ] `changePassword(senhaAtual, novaSenha)` → `POST /api/users/change-password`

### 1.2 Auth Context
- [ ] Criar `src/front/contexts/AuthContext.tsx`
  - [ ] Estado: `user`, `tokens`, `isAuthenticated`, `isLoading`
  - [ ] Métodos: `login`, `logout`, `register`, `refreshToken`
  - [ ] Verificar token ao iniciar app
  - [ ] Persistir tokens no AsyncStorage

### 1.3 Auth Hook
- [ ] Criar `src/front/hooks/useAuth.ts`
  - [ ] Hook para acessar AuthContext facilmente

### 1.4 Telas de Autenticação
- [ ] **Login.tsx**
  - [ ] Integrar com `authService.login()`
  - [ ] Tratar erros de login
  - [ ] Redirecionar após login bem-sucedido
  - [ ] Mostrar loading durante login

- [ ] **SignUp.tsx**
  - [ ] Integrar com `authService.register()`
  - [ ] Validação de campos
  - [ ] Redirecionar para VerifyOtp após registro

- [ ] **VerifyOtp.tsx**
  - [ ] Integrar com `authService.verifyOtp()`
  - [ ] Contador regressivo para reenvio
  - [ ] Reenvio de OTP
  - [ ] Redirecionar após verificação

- [ ] **ChangePassword.tsx**
  - [ ] Integrar com `authService.changePassword()`
  - [ ] Validação de senhas
  - [ ] Feedback de sucesso/erro

### 1.5 Proteção de Rotas
- [ ] Criar `src/front/components/ProtectedRoute.tsx`
- [ ] Atualizar `AppNavigator.tsx` para usar rotas protegidas
- [ ] Redirecionar para Login se não autenticado

---

## 👤 FASE 2: Perfil e Usuário

**Objetivo:** Gerenciamento completo do perfil do usuário

**Duração estimada:** 1 dia

### 2.1 User Service
- [ ] Criar `src/front/services/user.service.ts`
  - [ ] `getProfile()` → `GET /api/users/me`
  - [ ] `updateProfile(dados)` → `PUT /api/users/me`
  - [ ] `savePushToken(token)` → `POST /api/users/push-token`

### 2.2 Telas de Perfil
- [ ] **Profile.tsx**
  - [ ] Buscar dados do usuário ao carregar
  - [ ] Exibir informações do perfil
  - [ ] Botão para editar perfil
  - [ ] Botão para alterar senha
  - [ ] Botão para logout

- [ ] **EditProfile.tsx**
  - [ ] Formulário de edição
  - [ ] Integrar com `userService.updateProfile()`
  - [ ] Upload de foto de perfil (futuro)
  - [ ] Validação de campos
  - [ ] Feedback de sucesso/erro

### 2.3 Integração Push Notifications
- [ ] Atualizar `usePushNotifications.ts`
  - [ ] Integrar com `userService.savePushToken()`
  - [ ] Chamar após login bem-sucedido

---

## 📍 FASE 3: Endereços

**Objetivo:** CRUD completo de endereços

**Duração estimada:** 2 dias

### 3.1 Address Service
- [ ] Criar `src/front/services/address.service.ts`
  - [ ] `getAddresses()` → `GET /api/addresses`
  - [ ] `getAddressById(id)` → `GET /api/addresses/:id`
  - [ ] `createAddress(dados)` → `POST /api/addresses`
  - [ ] `updateAddress(id, dados)` → `PUT /api/addresses/:id`
  - [ ] `deleteAddress(id)` → `DELETE /api/addresses/:id`
  - [ ] `setDefaultAddress(id)` → `PATCH /api/addresses/:id/set-default`
  - [ ] `searchCep(cep)` → `GET /api/addresses/cep/:cep`
  - [ ] `getStates()` → `GET /api/addresses/estados`
  - [ ] `getStateBySigla(sigla)` → `GET /api/addresses/estados/:sigla`
  - [ ] `getMunicipalitiesByState(sigla)` → `GET /api/addresses/estados/:sigla/municipios`

### 3.2 Address Context (Opcional)
- [ ] Criar `src/front/contexts/AddressContext.tsx`
  - [ ] Cache de endereços
  - [ ] Endereço padrão selecionado

### 3.3 Telas de Endereços
- [ ] **Addresses.tsx**
  - [ ] Listar endereços do usuário
  - [ ] Botão para adicionar novo endereço
  - [ ] Marcar endereço como padrão
  - [ ] Editar endereço
  - [ ] Deletar endereço (com confirmação)
  - [ ] Exibir endereço padrão destacado

- [ ] **CreateAddress.tsx** (nova tela)
  - [ ] Formulário completo de endereço
  - [ ] Busca de CEP automática
  - [ ] Seleção de estado/município
  - [ ] Validação de campos
  - [ ] Integrar com `addressService.createAddress()`

- [ ] **EditAddress.tsx** (nova tela ou modal)
  - [ ] Formulário pré-preenchido
  - [ ] Integrar com `addressService.updateAddress()`

### 3.4 Componentes
- [ ] Criar `AddressCard.tsx` (componente reutilizável)
- [ ] Criar `CepInput.tsx` (input com busca automática)
- [ ] Criar `StateCityPicker.tsx` (seletor de estado/cidade)

---

## 🛍️ FASE 4: Produtos e Catálogo

**Objetivo:** Exibir produtos, categorias e busca

**Duração estimada:** 3 dias

### 4.1 Product Service
- [ ] Criar `src/front/services/product.service.ts`
  - [ ] `getProducts(filtros)` → `GET /api/products`
  - [ ] `getProductById(id)` → `GET /api/products/:id`
  - [ ] `getPopularProducts()` → `GET /api/products/popular`
  - [ ] `getOffersProducts()` → `GET /api/products/offers`
  - [ ] `getNewProducts()` → `GET /api/products/new`

### 4.2 Category Service
- [ ] Criar `src/front/services/category.service.ts`
  - [ ] `getCategories()` → `GET /api/categories`
  - [ ] `getCategoryById(id)` → `GET /api/categories/:id`
  - [ ] `getCategoryBySlug(slug)` → `GET /api/categories/slug/:slug`

### 4.3 Telas de Produtos
- [ ] **Home.tsx**
  - [ ] Exibir categorias principais
  - [ ] Exibir produtos populares
  - [ ] Exibir produtos em oferta
  - [ ] Exibir produtos novos
  - [ ] Pull to refresh
  - [ ] Loading states

- [ ] **ProductListScreen.tsx**
  - [ ] Lista de produtos com filtros
  - [ ] Filtros: categoria, preço, avaliação
  - [ ] Ordenação: preço, nome, avaliação
  - [ ] Paginação infinita
  - [ ] Busca por texto
  - [ ] Loading skeleton

- [ ] **ProductDetails.tsx**
  - [ ] Detalhes completos do produto
  - [ ] Galeria de imagens
  - [ ] Avaliações do produto
  - [ ] Botão adicionar ao carrinho
  - [ ] Botão favoritar
  - [ ] Produtos relacionados (futuro)

- [ ] **Search.tsx**
  - [ ] Barra de busca
  - [ ] Histórico de buscas (local)
  - [ ] Sugestões de busca (futuro)
  - [ ] Resultados em tempo real
  - [ ] Filtros avançados

### 4.4 Componentes
- [ ] Criar `ProductCard.tsx` (card de produto)
- [ ] Criar `CategoryCard.tsx` (card de categoria)
- [ ] Criar `ProductImage.tsx` (imagem com fallback)
- [ ] Criar `PriceTag.tsx` (exibição de preço)
- [ ] Criar `RatingStars.tsx` (estrelas de avaliação)

---

## 🛒 FASE 5: Carrinho

**Objetivo:** Carrinho de compras persistente

**Duração estimada:** 2 dias

### 5.1 Cart Service
- [ ] Criar `src/front/services/cart.service.ts`
  - [ ] `getCart()` → `GET /api/cart`
  - [ ] `addItem(produtoId, quantidade, personalizacoes)` → `POST /api/cart/items`
  - [ ] `updateItemQuantity(itemId, quantidade)` → `PUT /api/cart/items/:id`
  - [ ] `removeItem(itemId)` → `DELETE /api/cart/items/:id`
  - [ ] `clearCart()` → `DELETE /api/cart`
  - [ ] `applyCoupon(codigo)` → `POST /api/cart/apply-coupon`
  - [ ] `removeCoupon()` → `DELETE /api/cart/coupon`

### 5.2 Cart Context
- [ ] Criar `src/front/contexts/CartContext.tsx`
  - [ ] Estado: `items`, `subtotal`, `taxaEntrega`, `desconto`, `total`
  - [ ] Métodos: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
  - [ ] Sincronizar com backend
  - [ ] Cache local (AsyncStorage)
  - [ ] Atualizar automaticamente ao mudar de tela

### 5.3 Cart Hook
- [ ] Criar `src/front/hooks/useCart.ts`
  - [ ] Hook para acessar CartContext facilmente

### 5.4 Telas de Carrinho
- [ ] **Cart.tsx**
  - [ ] Listar itens do carrinho
  - [ ] Editar quantidade de itens
  - [ ] Remover itens
  - [ ] Aplicar cupom
  - [ ] Exibir totais (subtotal, taxa, desconto, total)
  - [ ] Botão para checkout
  - [ ] Carrinho vazio state

### 5.5 Componentes
- [ ] Criar `CartItem.tsx` (item do carrinho)
- [ ] Criar `CartSummary.tsx` (resumo de totais)
- [ ] Criar `CouponInput.tsx` (input de cupom)
- [ ] Criar `QuantitySelector.tsx` (seletor de quantidade)

---

## 🎟️ FASE 6: Cupons

**Objetivo:** Sistema de cupons de desconto

**Duração estimada:** 1 dia

### 6.1 Coupon Service
- [ ] Criar `src/front/services/coupon.service.ts`
  - [ ] `getCoupons()` → `GET /api/coupons`
  - [ ] `getCouponByCode(codigo)` → `GET /api/coupons/:codigo`
  - [ ] `validateCoupon(codigo)` → `POST /api/coupons/validate`

### 6.2 Telas de Cupons
- [ ] **Cupons.tsx**
  - [ ] Listar cupons disponíveis
  - [ ] Exibir condições de uso
  - [ ] Botão para aplicar cupom
  - [ ] Cupons expirados/indisponíveis

### 6.3 Integração com Carrinho
- [ ] Adicionar seção de cupom no Cart.tsx
- [ ] Validar cupom antes de aplicar
- [ ] Exibir desconto aplicado
- [ ] Permitir remover cupom

---

## 📦 FASE 7: Pedidos

**Objetivo:** Criação, listagem e detalhes de pedidos

**Duração estimada:** 3 dias

### 7.1 Order Service
- [ ] Criar `src/front/services/order.service.ts`
  - [ ] `createOrder(dados)` → `POST /api/orders`
  - [ ] `getOrders(filtros)` → `GET /api/orders`
  - [ ] `getOrderById(id)` → `GET /api/orders/:id`
  - [ ] `cancelOrder(id, motivo)` → `POST /api/orders/:id/cancel`
  - [ ] `payOrder(id, dadosPagamento)` → `POST /api/orders/:id/pay`

### 7.2 Order Context (Opcional)
- [ ] Criar `src/front/contexts/OrderContext.tsx`
  - [ ] Cache de pedidos recentes
  - [ ] Estado do pedido atual

### 7.3 Telas de Pedidos
- [ ] **Checkout.tsx**
  - [ ] Resumo do pedido
  - [ ] Seleção de endereço de entrega
  - [ ] Seleção de método de pagamento
  - [ ] Aplicar cupom
  - [ ] Observações do pedido
  - [ ] Criar pedido
  - [ ] Validações antes de criar

- [ ] **MyOrders.tsx**
  - [ ] Listar pedidos do usuário
  - [ ] Filtros por status
  - [ ] Ordenação por data
  - [ ] Pull to refresh
  - [ ] Loading states
  - [ ] Estado vazio

- [ ] **OrderDetails.tsx**
  - [ ] Detalhes completos do pedido
  - [ ] Itens do pedido
  - [ ] Endereço de entrega
  - [ ] Método de pagamento
  - [ ] Status do pedido (com timeline)
  - [ ] Botão para cancelar (se permitido)
  - [ ] Botão para rastrear (futuro)
  - [ ] Botão para avaliar (após entrega)

- [ ] **OrderConfirmation.tsx**
  - [ ] Confirmação de pedido criado
  - [ ] Número do pedido
  - [ ] Tempo estimado de entrega
  - [ ] Botão para ver detalhes
  - [ ] Botão para voltar ao início

- [ ] **OrderProcessing.tsx**
  - [ ] Tela de processamento do pedido
  - [ ] Status em tempo real (futuro com WebSocket)
  - [ ] Timeline de status
  - [ ] Informações do entregador (quando disponível)

### 7.4 Componentes
- [ ] Criar `OrderCard.tsx` (card de pedido)
- [ ] Criar `OrderStatusBadge.tsx` (badge de status)
- [ ] Criar `OrderTimeline.tsx` (timeline de status)
- [ ] Criar `OrderItem.tsx` (item do pedido)

---

## 💳 FASE 8: Pagamentos

**Objetivo:** Integração completa com Mercado Pago

**Duração estimada:** 3 dias

### 8.1 Payment Service
- [ ] Criar `src/front/services/payment.service.ts`
  - [ ] `getPaymentCards()` → `GET /api/payment-cards`
  - [ ] `addPaymentCard(dados)` → `POST /api/payment-cards`
  - [ ] `updatePaymentCard(id, dados)` → `PUT /api/payment-cards/:id`
  - [ ] `deletePaymentCard(id)` → `DELETE /api/payment-cards/:id`
  - [ ] `setDefaultPaymentCard(id)` → `PATCH /api/payment-cards/:id/set-default`
  - [ ] `processPayment(dados)` → `POST /api/payments/process`
  - [ ] `getTransaction(id)` → `GET /api/payments/transaction/:id`

### 8.2 Mercado Pago SDK
- [ ] Instalar `@mercadopago/react-native`
- [ ] Configurar public key
- [ ] Criar `src/front/services/mercadopago.service.ts`
  - [ ] Tokenizar cartão
  - [ ] Processar pagamento
  - [ ] Validar dados do cartão

### 8.3 Telas de Pagamento
- [ ] **PaymentMethods.tsx**
  - [ ] Listar cartões salvos
  - [ ] Adicionar novo cartão
  - [ ] Editar cartão
  - [ ] Deletar cartão
  - [ ] Marcar como padrão
  - [ ] Opção de PIX
  - [ ] Opção de boleto (futuro)

- [ ] **AddPaymentCard.tsx** (nova tela ou modal)
  - [ ] Formulário de cartão
  - [ ] Tokenização com Mercado Pago
  - [ ] Validação de campos
  - [ ] Salvar cartão no backend

- [ ] **PaymentProcessing.tsx** (nova tela)
  - [ ] Processar pagamento
  - [ ] Loading durante processamento
  - [ ] Tratamento de erros
  - [ ] Redirecionar após sucesso

### 8.4 Componentes
- [ ] Criar `PaymentCard.tsx` (card de método de pagamento)
- [ ] Criar `CardInput.tsx` (input de cartão com máscara)
- [ ] Criar `PixQRCode.tsx` (exibir QR Code PIX)

---

## ⭐ FASE 9: Favoritos

**Objetivo:** Sistema de produtos favoritos

**Duração estimada:** 1 dia

### 9.1 Favorite Service
- [ ] Criar `src/front/services/favorite.service.ts`
  - [ ] `getFavorites()` → `GET /api/favorites`
  - [ ] `addFavorite(produtoId)` → `POST /api/favorites/:productId`
  - [ ] `removeFavorite(produtoId)` → `DELETE /api/favorites/:productId`
  - [ ] `toggleFavorite(produtoId)` → `POST /api/favorites/:productId/toggle`
  - [ ] `isFavorite(produtoId)` → `GET /api/favorites/check/:productId`
  - [ ] `getFavoritesCount()` → `GET /api/favorites/count`

### 9.2 Favorite Context (Opcional)
- [ ] Criar `src/front/contexts/FavoriteContext.tsx`
  - [ ] Cache de favoritos
  - [ ] Sincronizar com backend

### 9.3 Telas de Favoritos
- [ ] **Favorites.tsx**
  - [ ] Listar produtos favoritos
  - [ ] Remover favorito
  - [ ] Adicionar ao carrinho
  - [ ] Estado vazio
  - [ ] Pull to refresh

### 9.4 Integração
- [ ] Adicionar botão de favoritar em ProductCard
- [ ] Adicionar botão de favoritar em ProductDetails
- [ ] Atualizar estado visual ao favoritar/desfavoritar

---

## ⭐ FASE 10: Avaliações

**Objetivo:** Sistema de avaliações de produtos e pedidos

**Duração estimada:** 2 dias

### 10.1 Review Service
- [ ] Criar `src/front/services/review.service.ts`
  - [ ] `getProductReviews(produtoId)` → `GET /api/reviews/products/:productId`
  - [ ] `createProductReview(produtoId, dados)` → `POST /api/reviews/products/:productId`
  - [ ] `updateReview(id, dados)` → `PUT /api/reviews/:id`
  - [ ] `deleteReview(id)` → `DELETE /api/reviews/:id`
  - [ ] `createOrderReview(pedidoId, dados)` → `POST /api/reviews/orders/:orderId`
  - [ ] `getOrderReview(pedidoId)` → `GET /api/reviews/orders/:orderId`

### 10.2 Telas de Avaliações
- [ ] **ProductReviews.tsx** (nova tela ou seção)
  - [ ] Listar avaliações do produto
  - [ ] Criar avaliação
  - [ ] Editar avaliação própria
  - [ ] Deletar avaliação própria
  - [ ] Filtrar por nota
  - [ ] Ordenar por data/relevância

- [ ] **CreateReview.tsx** (modal ou tela)
  - [ ] Formulário de avaliação
  - [ ] Seleção de nota (1-5 estrelas)
  - [ ] Upload de fotos (futuro)
  - [ ] Validação de campos

### 10.3 Integração
- [ ] Adicionar seção de avaliações em ProductDetails
- [ ] Botão para avaliar em OrderDetails (após entrega)
- [ ] Exibir avaliações em ProductCard

### 10.4 Componentes
- [ ] Criar `ReviewCard.tsx` (card de avaliação)
- [ ] Criar `ReviewForm.tsx` (formulário de avaliação)
- [ ] Criar `StarRating.tsx` (seletor de estrelas)

---

## 🔔 FASE 11: Notificações

**Objetivo:** Sistema de notificações in-app

**Duração estimada:** 2 dias

### 11.1 Notification Service
- [ ] Criar `src/front/services/notification.service.ts`
  - [ ] `getNotifications(filtros)` → `GET /api/notifications`
  - [ ] `getUnreadCount()` → `GET /api/notifications/unread-count`
  - [ ] `markAsRead(id)` → `PATCH /api/notifications/:id/read`
  - [ ] `markAllAsRead()` → `PATCH /api/notifications/read-all`
  - [ ] `getPreferences()` → `GET /api/notifications/preferences`
  - [ ] `updatePreferences(dados)` → `PUT /api/notifications/preferences`

### 11.2 Notification Context
- [ ] Criar `src/front/contexts/NotificationContext.tsx`
  - [ ] Estado: `notifications`, `unreadCount`
  - [ ] Métodos: `markAsRead`, `markAllAsRead`
  - [ ] Polling automático (a cada X segundos)
  - [ ] Atualizar badge no ícone

### 11.3 Telas de Notificações
- [ ] **Notifications.tsx** (nova tela)
  - [ ] Listar notificações
  - [ ] Marcar como lida
  - [ ] Marcar todas como lidas
  - [ ] Filtrar por tipo
  - [ ] Navegar para destino da notificação
  - [ ] Estado vazio

### 11.4 Componentes
- [ ] Criar `NotificationCard.tsx` (card de notificação)
- [ ] Criar `NotificationBadge.tsx` (badge de contador)
- [ ] Criar `NotificationBell.tsx` (ícone com badge)

### 11.5 Integração Push Notifications
- [ ] Atualizar `usePushNotifications.ts`
- [ ] Navegar para tela correta ao tocar na notificação
- [ ] Atualizar notificações in-app quando receber push

---

## 📊 FASE 12: Analytics (Admin)

**Objetivo:** Dashboard administrativo (se aplicável)

**Duração estimada:** 2 dias

### 12.1 Analytics Service
- [ ] Criar `src/front/services/analytics.service.ts`
  - [ ] `getDashboardData(filtros)` → `GET /api/admin/analytics/dashboard`
  - [ ] `getProductsAnalytics(filtros)` → `GET /api/admin/analytics/products`
  - [ ] `getUsersAnalytics(filtros)` → `GET /api/admin/analytics/users`
  - [ ] `getOrdersAnalytics(filtros)` → `GET /api/admin/analytics/orders`
  - [ ] `getSalesReport(datas, formato)` → `GET /api/admin/reports/sales`
  - [ ] `getProductsReport(datas, formato)` → `GET /api/admin/reports/products`

### 12.2 Telas Admin (se necessário)
- [ ] **AdminDashboard.tsx** (nova tela)
  - [ ] Métricas principais
  - [ ] Gráficos (usar biblioteca de gráficos)
  - [ ] Filtros de data
  - [ ] Exportar relatórios

---

## 🎨 FASE 13: Componentes Compartilhados

**Objetivo:** Criar componentes reutilizáveis

**Duração estimada:** 2 dias

### 13.1 Componentes de UI
- [ ] Criar `src/front/components/ui/Button.tsx` (se não existir)
- [ ] Criar `src/front/components/ui/Input.tsx` (se não existir)
- [ ] Criar `src/front/components/ui/Card.tsx`
- [ ] Criar `src/front/components/ui/Modal.tsx`
- [ ] Criar `src/front/components/ui/Toast.tsx`
- [ ] Criar `src/front/components/ui/Skeleton.tsx`
- [ ] Criar `src/front/components/ui/EmptyState.tsx`
- [ ] Criar `src/front/components/ui/ErrorState.tsx`

### 13.2 Componentes de Formulário
- [ ] Criar `src/front/components/forms/FormInput.tsx`
- [ ] Criar `src/front/components/forms/FormSelect.tsx`
- [ ] Criar `src/front/components/forms/FormCheckbox.tsx`
- [ ] Criar `src/front/components/forms/FormRadio.tsx`

### 13.3 Componentes de Navegação
- [ ] Criar `src/front/components/navigation/Header.tsx`
- [ ] Criar `src/front/components/navigation/TabBar.tsx`
- [ ] Criar `src/front/components/navigation/BackButton.tsx`

---

## 🔧 FASE 14: Otimizações e Melhorias

**Objetivo:** Melhorar performance e UX

**Duração estimada:** 2 dias

### 14.1 Performance
- [ ] Implementar cache de imagens
- [ ] Lazy loading de listas
- [ ] Memoização de componentes pesados
- [ ] Otimizar re-renders
- [ ] Debounce em buscas

### 14.2 Offline Support
- [ ] Cache de dados no AsyncStorage
- [ ] Queue de requisições quando offline
- [ ] Sincronizar quando voltar online
- [ ] Indicador de status offline

### 14.3 Error Handling
- [ ] Tratamento de erros de rede
- [ ] Retry automático
- [ ] Mensagens de erro amigáveis
- [ ] Logging de erros (Sentry ou similar)

### 14.4 Loading States
- [ ] Skeleton loaders
- [ ] Loading spinners consistentes
- [ ] Estados de loading em todas as telas

---

## 🧪 FASE 15: Testes

**Objetivo:** Garantir qualidade

**Duração estimada:** 3 dias

### 15.1 Testes de Serviços
- [ ] Testes unitários dos services
- [ ] Mock de API responses
- [ ] Testes de erro handling

### 15.2 Testes de Componentes
- [ ] Testes de componentes críticos
- [ ] Testes de interação do usuário

### 15.3 Testes E2E
- [ ] Fluxo completo de compra
- [ ] Fluxo de autenticação
- [ ] Fluxo de criação de pedido

---

## 📱 FASE 16: Ajustes Finais

**Objetivo:** Polimento final

**Duração estimada:** 2 dias

### 16.1 Validações
- [ ] Validar todos os formulários
- [ ] Mensagens de erro consistentes
- [ ] Validação em tempo real

### 16.2 Acessibilidade
- [ ] Labels para screen readers
- [ ] Contraste de cores adequado
- [ ] Tamanhos de fonte adequados

### 16.3 Internacionalização (i18n)
- [ ] Traduzir todas as strings
- [ ] Suporte a múltiplos idiomas
- [ ] Formatação de datas/números

### 16.4 Documentação
- [ ] Documentar componentes
- [ ] Documentar services
- [ ] Guia de uso para desenvolvedores

---

## 📊 Resumo das Fases

| Fase | Descrição | Duração | Prioridade |
|------|-----------|---------|------------|
| 0 | Infraestrutura Base | 1 dia | 🔴 Crítica |
| 1 | Autenticação | 2 dias | 🔴 Crítica |
| 2 | Perfil e Usuário | 1 dia | 🔴 Crítica |
| 3 | Endereços | 2 dias | 🔴 Crítica |
| 4 | Produtos e Catálogo | 3 dias | 🔴 Crítica |
| 5 | Carrinho | 2 dias | 🔴 Crítica |
| 6 | Cupons | 1 dia | 🟡 Alta |
| 7 | Pedidos | 3 dias | 🔴 Crítica |
| 8 | Pagamentos | 3 dias | 🔴 Crítica |
| 9 | Favoritos | 1 dia | 🟡 Alta |
| 10 | Avaliações | 2 dias | 🟡 Alta |
| 11 | Notificações | 2 dias | 🟡 Alta |
| 12 | Analytics (Admin) | 2 dias | 🟢 Média |
| 13 | Componentes Compartilhados | 2 dias | 🟡 Alta |
| 14 | Otimizações | 2 dias | 🟡 Alta |
| 15 | Testes | 3 dias | 🟡 Alta |
| 16 | Ajustes Finais | 2 dias | 🟢 Média |

**Total estimado:** ~32 dias úteis (~6-7 semanas)

---

## 🎯 Ordem de Execução Recomendada

### **Sprint 1 - Core (Semana 1-2):**
- FASE 0: Infraestrutura
- FASE 1: Autenticação
- FASE 2: Perfil
- FASE 3: Endereços

### **Sprint 2 - Produtos e Compra (Semana 3-4):**
- FASE 4: Produtos
- FASE 5: Carrinho
- FASE 6: Cupons
- FASE 7: Pedidos

### **Sprint 3 - Pagamentos e Extras (Semana 5-6):**
- FASE 8: Pagamentos
- FASE 9: Favoritos
- FASE 10: Avaliações
- FASE 11: Notificações

### **Sprint 4 - Polimento (Semana 7):**
- FASE 13: Componentes
- FASE 14: Otimizações
- FASE 15: Testes
- FASE 16: Ajustes Finais

---

## ✅ Checklist de Validação

Após cada fase, validar:
- [ ] Todos os endpoints estão sendo chamados corretamente
- [ ] Tratamento de erros está funcionando
- [ ] Loading states estão presentes
- [ ] Estados vazios estão implementados
- [ ] Validações estão funcionando
- [ ] Navegação está correta
- [ ] Dados estão sendo persistidos corretamente
- [ ] Testes estão passando

---

**Última atualização:** 2025-01-05

