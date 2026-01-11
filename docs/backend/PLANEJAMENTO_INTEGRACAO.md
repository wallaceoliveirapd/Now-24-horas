# 🚀 Planejamento de Integração Backend - Now 24 Horas

Planejamento completo para integrar o backend Neon PostgreSQL com o app React Native, começando pela autenticação.

---

## 📋 Visão Geral

Este documento detalha todas as fases de integração do backend, desde a autenticação até funcionalidades avançadas.

**Tecnologias:**
- **Banco de Dados:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle ORM
- **Backend:** Node.js/TypeScript (API REST)
- **Frontend:** React Native/Expo
- **Autenticação:** JWT + Refresh Tokens

---

## 🎯 Fases de Desenvolvimento

### **FASE 1: Autenticação e Usuários** ⭐ (PRIORITÁRIA)
**Objetivo:** Sistema completo de autenticação e gerenciamento de usuários

**Duração estimada:** 3-5 dias

#### 1.1 Configuração Base da API
- [x] Criar estrutura de pastas para API (`src/back/api/`)
- [x] Configurar Express.js
- [x] Configurar middleware de CORS
- [x] Configurar middleware de parsing (JSON, URL encoded)
- [x] Configurar tratamento de erros global
- [x] Configurar variáveis de ambiente para API
- [x] Criar script de inicialização do servidor
- [x] **TESTAR FASE 1.1:** Executar `npm run api:test:fase1.1` ✅ (8/8 testes passaram)

#### 1.2 Autenticação - Registro
- [x] Criar endpoint `POST /api/auth/register`
- [x] Validar dados de entrada (email, telefone, senha, nome)
- [x] Verificar se email/telefone já existe
- [x] Hash de senha com bcrypt
- [x] Criar usuário no banco
- [x] Gerar código OTP para verificação
- [x] Enviar OTP por SMS (mock inicialmente - log no console)
- [x] Retornar resposta de sucesso
- [x] **TESTAR FASE 1.2:** Executar `npm run api:test:fase1.2` ✅ (8/8 testes passaram)

#### 1.3 Autenticação - Verificação OTP
- [x] Criar endpoint `POST /api/auth/verify-otp`
- [x] Validar código OTP
- [x] Verificar expiração do código
- [x] Marcar telefone como verificado
- [ ] Gerar tokens JWT (access + refresh) - será na FASE 1.5
- [x] Retornar resposta de sucesso

#### 1.4 Autenticação - Login
- [x] Criar endpoint `POST /api/auth/login`
- [x] Validar email/telefone e senha
- [x] Verificar credenciais no banco
- [x] Verificar se usuário está ativo
- [ ] Gerar tokens JWT - será na FASE 1.5
- [ ] Salvar refresh token no banco - será na FASE 1.5
- [x] Retornar dados do usuário (tokens serão adicionados depois)

#### 1.5 Autenticação - Refresh Token
- [x] Criar endpoint `POST /api/auth/refresh`
- [x] Validar refresh token
- [x] Verificar se token existe no banco
- [x] Verificar expiração
- [x] Gerar novo access token
- [x] Retornar novo token
- [x] **TESTAR FASE 1.5:** Executar `npm run api:test:fase1.5-1.7` ✅ (8/8 testes passaram)

#### 1.6 Autenticação - Logout
- [x] Criar endpoint `POST /api/auth/logout`
- [x] Invalidar refresh token no banco
- [x] Retornar sucesso

#### 1.7 Middleware de Autenticação
- [x] Criar middleware `authenticateToken`
- [x] Validar access token JWT
- [x] Verificar se usuário existe e está ativo
- [x] Adicionar dados do usuário ao `req.user`
- [x] Tratar erros de token inválido/expirado
- [x] Criar middleware opcional `optionalAuthenticate`

#### 1.8 Endpoints de Usuário
- [x] Criar endpoint `GET /api/users/me` (perfil do usuário logado)
- [x] Criar endpoint `PUT /api/users/me` (atualizar perfil)
- [x] Criar endpoint `POST /api/users/change-password` (alterar senha)
- [x] Validar permissões (usuário só pode editar próprio perfil)
- [x] Validar dados de entrada

#### 1.9 Testes e Usuário de Teste
- [x] Criar script para criar usuário cliente de teste
- [x] Criar usuário: `cliente@teste.com` / senha: `cliente123`
- [ ] **TESTAR FASE 1:** Executar testes automatizados da FASE 1
- [ ] Testar fluxo completo: registro → OTP → login → refresh → logout
- [ ] Testar endpoints protegidos
- [ ] Documentar endpoints no Postman/Insomnia
- [ ] Validar que todos os testes passam antes de prosseguir

---

### **FASE 2: Endereços** 🏠 ✅ COMPLETA
**Objetivo:** CRUD completo de endereços do usuário

**Duração estimada:** 2-3 dias  
**Status:** ✅ COMPLETA (10/10 testes passaram)

#### 2.1 Endpoints de Endereços
- [x] Criar endpoint `GET /api/addresses` (listar endereços do usuário)
- [x] Criar endpoint `POST /api/addresses` (criar endereço)
- [x] Criar endpoint `GET /api/addresses/:id` (obter endereço específico)
- [x] Criar endpoint `PUT /api/addresses/:id` (atualizar endereço)
- [x] Criar endpoint `DELETE /api/addresses/:id` (deletar endereço)
- [x] Criar endpoint `PATCH /api/addresses/:id/set-default` (definir como padrão)

#### 2.2 Validações
- [x] Validar dados de entrada (CEP, rua, número, etc.)
- [x] Validar CEP (formato brasileiro)
- [x] Validar que usuário só pode gerenciar próprios endereços
- [x] Validar que ao menos um endereço deve existir (não permite deletar último)

#### 2.3 Testes
- [x] **TESTAR FASE 2:** Executar `npm run api:test:fase2` ✅ (10/10 testes passaram)

#### 2.4 Integração Frontend
- [ ] Atualizar `AddressContext` para usar API
- [ ] Atualizar tela `Addresses.tsx`
- [ ] Atualizar tela `Checkout.tsx` para buscar endereços da API
- [ ] Testar fluxo completo

---

### **FASE 3: Produtos e Catálogo** 🛍️ ✅ IMPLEMENTAÇÃO INICIAL COMPLETA
**Objetivo:** Sistema completo de produtos, categorias e busca

**Duração estimada:** 4-5 dias  
**Status:** ✅ Endpoints implementados (faltam testes)

#### 3.1 Endpoints de Categorias
- [x] Criar endpoint `GET /api/categories` (listar categorias ativas)
- [x] Criar endpoint `GET /api/categories/:id` (detalhes da categoria)
- [x] Criar endpoint `GET /api/categories/slug/:slug` (categoria por slug)
- [x] Ordenar por campo `ordem`
- [x] Filtrar apenas categorias ativas

#### 3.2 Endpoints de Produtos
- [x] Criar endpoint `GET /api/products` (listar produtos)
  - [x] Suportar paginação
  - [x] Suportar filtro por categoria
  - [x] Suportar filtro por busca (nome/descrição)
  - [x] Suportar ordenação (preço, popularidade, novidade)
  - [x] Filtrar apenas produtos ativos
- [x] Criar endpoint `GET /api/products/:id` (detalhes do produto)
  - [x] Incluir imagens
  - [x] Incluir seções de personalização
  - [x] Incluir opções de personalização
  - [x] Incrementar visualizações
- [x] Criar endpoint `GET /api/products/popular` (produtos populares)
- [x] Criar endpoint `GET /api/products/offers` (produtos em oferta)
- [x] Criar endpoint `GET /api/products/new` (produtos novos)

#### 3.3 Personalizações
- [x] Incluir seções de personalização no endpoint de detalhes
- [x] Incluir opções de personalização com preços
- [ ] Validar regras de personalização (obrigatório, min/max seleções) - será na FASE 4 (carrinho)

#### 3.4 Busca e Filtros
- [x] Implementar busca full-text (nome, descrição)
- [ ] Registrar buscas no `historico_buscas` (opcional - pode ser feito depois)
- [x] Implementar filtros avançados (preço, categoria, estoque)
- [x] Implementar ordenação múltipla

#### 3.5 Testes
- [ ] Criar testes automatizados para categorias
- [ ] Criar testes automatizados para produtos
- [ ] Testar filtros e paginação
- [ ] Testar busca full-text
- [ ] Testar ordenação

#### 3.6 Integração Frontend
- [ ] Atualizar `Home.tsx` para buscar produtos da API
- [ ] Atualizar `ProductDetails.tsx` para buscar detalhes da API
- [ ] Atualizar `Search.tsx` para usar busca da API
- [ ] Implementar paginação infinita
- [ ] Implementar cache de produtos

---

### **FASE 4: Carrinho** 🛒 ✅ IMPLEMENTAÇÃO INICIAL COMPLETA
**Objetivo:** Sistema de carrinho persistente no backend

**Duração estimada:** 2-3 dias  
**Status:** ✅ Endpoints implementados (faltam testes)

#### 4.1 Endpoints de Carrinho
- [x] Criar endpoint `GET /api/cart` (obter carrinho do usuário)
- [x] Criar endpoint `POST /api/cart/items` (adicionar item ao carrinho)
- [x] Criar endpoint `PUT /api/cart/items/:id` (atualizar quantidade)
- [x] Criar endpoint `DELETE /api/cart/items/:id` (remover item)
- [x] Criar endpoint `DELETE /api/cart` (limpar carrinho)
- [x] Criar endpoint `POST /api/cart/apply-coupon` (aplicar cupom)
- [x] Criar endpoint `DELETE /api/cart/coupon` (remover cupom)

#### 4.2 Validações
- [x] Validar que produto existe e está ativo
- [x] Validar estoque disponível
- [x] Validar personalizações selecionadas (estrutura)
- [ ] Validar preços (snapshot no momento da adição) - pode ser melhorado depois
- [x] Validar cupom antes de aplicar

#### 4.3 Cálculos
- [x] Calcular subtotal
- [x] Calcular taxa de entrega (fixa por enquanto)
- [x] Calcular desconto do cupom
- [x] Calcular total final

#### 4.4 Integração Frontend
- [ ] Atualizar `CartContext` para usar API
- [ ] Sincronizar carrinho ao fazer login
- [ ] Persistir carrinho entre sessões
- [ ] Atualizar `Cart.tsx` para usar API
- [ ] Atualizar `Home.tsx` para adicionar ao carrinho via API

---

### **FASE 5: Cupons** 🎟️ ✅ IMPLEMENTAÇÃO INICIAL COMPLETA
**Objetivo:** Sistema completo de cupons de desconto

**Duração estimada:** 2 dias  
**Status:** ✅ Endpoints implementados (faltam testes)

#### 5.1 Endpoints de Cupons
- [x] Criar endpoint `GET /api/coupons` (listar cupons disponíveis)
- [x] Criar endpoint `GET /api/coupons/:codigo` (obter cupom por código)
- [x] Criar endpoint `POST /api/coupons/validate` (validar cupom para pedido)
- [x] Filtrar cupons ativos e dentro da validade

#### 5.2 Validações de Cupom
- [x] Validar código do cupom
- [x] Validar data de validade
- [x] Validar limite de uso geral
- [x] Validar limite por usuário
- [x] Validar valor mínimo do pedido
- [ ] Validar regras específicas (categoria, produto) - pode ser melhorado depois
- [ ] Validar se entrega é obrigatória - será na criação do pedido
- [x] Calcular desconto (fixo ou percentual)
- [x] Aplicar limite máximo de desconto

#### 5.3 Integração Frontend
- [ ] Atualizar `Cupons.tsx` para buscar cupons da API
- [ ] Atualizar `CartContext` para validar cupons
- [ ] Atualizar `Checkout.tsx` para aplicar cupom via API

---

### **FASE 6: Pedidos** 📦 ✅ IMPLEMENTAÇÃO INICIAL COMPLETA
**Objetivo:** Sistema completo de criação e gerenciamento de pedidos

**Duração estimada:** 5-6 dias  
**Status:** ✅ Endpoints principais implementados (faltam testes e atualização de status)

#### 6.1 Criação de Pedido
- [x] Criar endpoint `POST /api/orders` (criar pedido)
  - [x] Validar carrinho não vazio
  - [x] Validar endereço de entrega
  - [x] Validar método de pagamento
  - [x] Validar estoque de todos os produtos
  - [x] Criar pedido no banco
  - [x] Criar itens do pedido (com snapshot de preços)
  - [x] Aplicar cupom se houver
  - [x] Calcular totais
  - [x] Gerar número do pedido único
  - [x] Limpar carrinho após criação
  - [x] Criar registro inicial no histórico de status
  - [x] Retornar dados do pedido criado
  - [x] Atualizar estoque dos produtos
  - [x] Incrementar uso do cupom

#### 6.2 Listagem de Pedidos
- [x] Criar endpoint `GET /api/orders` (listar pedidos do usuário)
  - [x] Suportar filtro por status
  - [x] Suportar paginação
  - [x] Ordenar por data (mais recente primeiro)
- [x] Criar endpoint `GET /api/orders/:id` (detalhes do pedido)
  - [x] Incluir itens do pedido
  - [x] Incluir histórico de status
  - [x] Incluir dados de entrega
  - [x] Incluir dados de cupom

#### 6.3 Atualização de Status
- [ ] Criar endpoint `PATCH /api/orders/:id/status` (atualizar status)
  - [ ] Validar transições de status válidas
  - [ ] Registrar no histórico
  - [ ] Enviar notificação ao usuário
  - [ ] Atualizar timestamps (confirmadoEm, preparandoEm, etc.)

#### 6.4 Cancelamento
- [x] Criar endpoint `POST /api/orders/:id/cancel` (cancelar pedido)
  - [x] Validar que pedido pode ser cancelado
  - [ ] Processar reembolso se necessário (será na FASE 7)
  - [x] Atualizar estoque
  - [x] Registrar motivo do cancelamento

#### 6.5 Integração Frontend
- [ ] Atualizar `Checkout.tsx` para criar pedido via API
- [ ] Atualizar `MyOrders.tsx` para buscar pedidos da API
- [ ] Atualizar `OrderDetails.tsx` para buscar detalhes da API
- [ ] Implementar atualização de status em tempo real (WebSocket ou polling)

---

### **FASE 7: Pagamentos** 💳 ✅ IMPLEMENTAÇÃO INICIAL COMPLETA
**Objetivo:** Integração com gateway de pagamento e gerenciamento de cartões

**Duração estimada:** 4-5 dias  
**Status:** ✅ Endpoints implementados (Mercado Pago integrado, faltam testes)

#### 7.1 Cartões de Pagamento
- [x] Criar endpoint `GET /api/payment-cards` (listar cartões do usuário)
- [x] Criar endpoint `POST /api/payment-cards` (adicionar cartão)
  - [x] Validar dados do cartão
  - [x] Tokenizar cartão no gateway (Mercado Pago)
  - [x] Salvar apenas últimos 4 dígitos
  - [x] Salvar token do gateway
- [x] Criar endpoint `PUT /api/payment-cards/:id` (atualizar cartão)
- [x] Criar endpoint `DELETE /api/payment-cards/:id` (remover cartão)
- [x] Criar endpoint `PATCH /api/payment-cards/:id/set-default` (definir como padrão)

#### 7.2 Processamento de Pagamento
- [x] Criar endpoint `POST /api/payments/process` (processar pagamento)
  - [x] Validar dados do pagamento
  - [x] Processar no gateway (Mercado Pago)
  - [x] Criar transação no banco
  - [x] Atualizar status do pedido
  - [x] Retornar resultado do pagamento
  - [x] Suporte para cartão de crédito/débito
  - [x] Suporte para PIX

#### 7.3 Webhooks
- [x] Criar endpoint `POST /api/webhooks/mercadopago` (receber webhook)
  - [ ] Validar assinatura do webhook (implementar em produção)
  - [x] Atualizar status da transação
  - [x] Atualizar status do pedido
  - [ ] Processar reembolsos (será implementado quando necessário)

#### 7.4 Integração Frontend
- [ ] Atualizar `PaymentMethods.tsx` para usar API
- [ ] Atualizar `Checkout.tsx` para processar pagamento via API
- [ ] Implementar tratamento de erros de pagamento

---

### **FASE 8: Favoritos** ❤️ ✅ IMPLEMENTAÇÃO COMPLETA
**Objetivo:** Sistema de produtos favoritos

**Duração estimada:** 1 dia  
**Status:** ✅ Endpoints implementados

#### 8.1 Endpoints de Favoritos
- [x] Criar endpoint `GET /api/favorites` (listar favoritos)
- [x] Criar endpoint `POST /api/favorites/:productId` (adicionar favorito)
- [x] Criar endpoint `DELETE /api/favorites/:productId` (remover favorito)
- [x] Criar endpoint `GET /api/favorites/check/:productId` (verificar se está favoritado)
- [x] Criar endpoint `POST /api/favorites/:productId/toggle` (toggle favorito)
- [x] Criar endpoint `GET /api/favorites/count` (contar favoritos)
- [x] Validar que produto existe

#### 8.2 Integração Frontend
- [ ] Atualizar `Favorites.tsx` para usar API
- [ ] Adicionar botão de favoritar em `ProductDetails.tsx`
- [ ] Sincronizar favoritos ao fazer login

---

### **FASE 9: Avaliações** ⭐
**Objetivo:** Sistema de avaliações de produtos e pedidos

**Duração estimada:** 2-3 dias

#### 9.1 Avaliações de Produtos
- [ ] Criar endpoint `GET /api/products/:id/reviews` (listar avaliações)
- [ ] Criar endpoint `POST /api/products/:id/reviews` (criar avaliação)
  - [ ] Validar que usuário comprou o produto
  - [ ] Validar nota (1-5)
  - [ ] Criar avaliação pendente de aprovação
- [ ] Criar endpoint `PUT /api/reviews/:id` (atualizar avaliação)
- [ ] Criar endpoint `DELETE /api/reviews/:id` (deletar avaliação)
- [ ] Atualizar média de avaliações do produto

#### 9.2 Avaliações de Pedidos
- [ ] Criar endpoint `POST /api/orders/:id/review` (avaliar pedido)
  - [ ] Validar que pedido foi entregue
  - [ ] Validar notas (produtos, entrega, atendimento)
- [ ] Criar endpoint `GET /api/orders/:id/review` (obter avaliação)

#### 9.3 Moderação (Admin)
- [ ] Criar endpoint `GET /api/admin/reviews/pending` (avaliações pendentes)
- [ ] Criar endpoint `POST /api/admin/reviews/:id/approve` (aprovar)
- [ ] Criar endpoint `POST /api/admin/reviews/:id/reject` (rejeitar)

#### 9.4 Integração Frontend
- [ ] Adicionar avaliações em `ProductDetails.tsx`
- [ ] Criar tela de avaliação de pedido
- [ ] Mostrar média de avaliações nos produtos

---

### **FASE 10: Notificações** 🔔
**Objetivo:** Sistema de notificações push e in-app

**Duração estimada:** 3-4 dias

#### 10.1 Endpoints de Notificações
- [ ] Criar endpoint `GET /api/notifications` (listar notificações)
- [ ] Criar endpoint `PATCH /api/notifications/:id/read` (marcar como lida)
- [ ] Criar endpoint `PATCH /api/notifications/read-all` (marcar todas como lidas)
- [ ] Criar endpoint `GET /api/notifications/unread-count` (contador de não lidas)

#### 10.2 Preferências de Notificação
- [ ] Criar endpoint `GET /api/notifications/preferences` (obter preferências)
- [ ] Criar endpoint `PUT /api/notifications/preferences` (atualizar preferências)

#### 10.3 Envio de Notificações
- [ ] Criar serviço para enviar notificações
- [ ] Enviar notificação ao criar pedido
- [ ] Enviar notificação ao atualizar status do pedido
- [ ] Enviar notificação de promoções (se usuário permitir)
- [ ] Integrar com serviço de push notifications (Expo Notifications)

#### 10.4 Integração Frontend
- [ ] Criar componente de lista de notificações
- [ ] Adicionar badge de notificações não lidas
- [ ] Implementar push notifications no app
- [ ] Atualizar `Settings.tsx` para gerenciar preferências

---

### **FASE 11: Rastreamento de Entrega** 📍
**Objetivo:** Sistema de rastreamento em tempo real

**Duração estimada:** 3-4 dias

#### 11.1 Endpoints de Rastreamento
- [ ] Criar endpoint `GET /api/orders/:id/tracking` (obter rastreamento)
  - [ ] Retornar última localização do entregador
  - [ ] Retornar histórico de localizações
- [ ] Criar endpoint `POST /api/tracking/update` (atualizar localização - entregador)
  - [ ] Validar que usuário é entregador
  - [ ] Salvar localização no banco
  - [ ] Emitir evento WebSocket para clientes

#### 11.2 WebSocket
- [ ] Configurar servidor WebSocket
- [ ] Criar canal por pedido
- [ ] Emitir atualizações de localização em tempo real
- [ ] Gerenciar conexões e desconexões

#### 11.3 Integração Frontend
- [ ] Criar componente de mapa de rastreamento
- [ ] Atualizar `OrderDetails.tsx` para mostrar mapa
- [ ] Conectar ao WebSocket para atualizações em tempo real
- [ ] Mostrar marcador do entregador no mapa

---

### **FASE 12: Analytics e Relatórios** 📊
**Objetivo:** Sistema de analytics e relatórios para admin

**Duração estimada:** 3-4 dias

#### 12.1 Endpoints de Analytics
- [ ] Criar endpoint `GET /api/admin/analytics/dashboard` (dados do dashboard)
  - [ ] Total de vendas
  - [ ] Pedidos do dia/mês
  - [ ] Produtos mais vendidos
  - [ ] Receita
- [ ] Criar endpoint `GET /api/admin/analytics/products` (analytics de produtos)
- [ ] Criar endpoint `GET /api/admin/analytics/users` (analytics de usuários)
- [ ] Criar endpoint `GET /api/admin/analytics/orders` (analytics de pedidos)

#### 12.2 Relatórios
- [ ] Criar endpoint `GET /api/admin/reports/sales` (relatório de vendas)
- [ ] Criar endpoint `GET /api/admin/reports/products` (relatório de produtos)
- [ ] Suportar filtros por data
- [ ] Exportar em CSV/PDF

---

## 🔐 Segurança

### Checklist de Segurança (aplicar em todas as fases)

- [ ] Validar todos os inputs
- [ ] Sanitizar dados de entrada
- [ ] Usar HTTPS em produção
- [ ] Implementar rate limiting
- [ ] Validar permissões em todos os endpoints
- [ ] Logs de auditoria para ações sensíveis
- [ ] Hash de senhas com bcrypt (salt rounds >= 10)
- [ ] Tokens JWT com expiração curta
- [ ] Refresh tokens com rotação
- [ ] CORS configurado corretamente
- [ ] Headers de segurança (helmet.js)

---

## 📝 Convenções

### Estrutura de Resposta da API

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem de erro",
    "details": { ... }
  }
}
```

### Códigos HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Bad Request (validação)
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `500` - Erro interno do servidor

### Nomenclatura

- Endpoints: `kebab-case` (`/api/users/me`)
- Variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Arquivos: `kebab-case.ts`

---

## 🧪 Testes

### Estratégia de Testes

- **Unitários:** Testar funções isoladas
- **Integração:** Testar endpoints completos
- **E2E:** Testar fluxos completos do usuário

### Ferramentas

- Jest (testes unitários)
- Supertest (testes de API)
- Postman/Insomnia (testes manuais)

---

## 📚 Documentação

- [ ] Documentar todos os endpoints (Swagger/OpenAPI)
- [ ] Criar coleção Postman
- [ ] Documentar fluxos principais
- [ ] Documentar erros comuns

---

## 🚀 Deploy

### Checklist de Deploy

- [ ] Configurar variáveis de ambiente em produção
- [ ] Configurar banco de dados em produção
- [ ] Configurar CORS para domínios corretos
- [ ] Configurar logs em produção
- [ ] Configurar monitoramento (Sentry, etc.)
- [ ] Configurar backup automático do banco
- [ ] Testar em ambiente de staging antes de produção

---

**Última atualização:** 2025-01-XX

