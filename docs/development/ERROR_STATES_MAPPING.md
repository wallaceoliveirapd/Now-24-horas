# Mapeamento de Estados de Erro

Este documento mapeia todos os possíveis casos de erro no aplicativo e propõe componentes/telas para lidar com eles.

## 1. Erros de Rede e Conexão

### 1.1 Sem Conexão com Internet
- **Onde pode ocorrer**: Qualquer tela que faça requisições
- **Tipo**: `network_offline`
- **Componente**: `ErrorState` com tipo `network`
- **Mensagem**: "Sem conexão com a internet"
- **Descrição**: "Verifique sua conexão e tente novamente"
- **Ação**: Botão "Tentar novamente"

### 1.2 Timeout/Requisição Lenta
- **Onde pode ocorrer**: Qualquer requisição
- **Tipo**: `network_timeout`
- **Componente**: `ErrorState` com tipo `network`
- **Mensagem**: "Tempo de espera esgotado"
- **Descrição**: "A requisição demorou muito para responder"
- **Ação**: Botão "Tentar novamente"

### 1.3 Servidor Indisponível (500, 503)
- **Onde pode ocorrer**: Qualquer requisição ao servidor
- **Tipo**: `server_error`
- **Componente**: `ErrorState` com tipo `server`
- **Mensagem**: "Servidor temporariamente indisponível"
- **Descrição**: "Nossos servidores estão passando por manutenção. Tente novamente em alguns instantes"
- **Ação**: Botão "Tentar novamente"

## 2. Erros de Autenticação e Autorização

### 2.1 Sessão Expirada
- **Onde pode ocorrer**: Qualquer tela autenticada
- **Tipo**: `auth_expired`
- **Componente**: `ErrorState` com tipo `auth`
- **Mensagem**: "Sessão expirada"
- **Descrição**: "Por favor, faça login novamente para continuar"
- **Ação**: Botão "Fazer login"

### 2.2 Não Autorizado (401)
- **Onde pode ocorrer**: Ações que requerem permissão
- **Tipo**: `unauthorized`
- **Componente**: `ErrorState` com tipo `auth`
- **Mensagem**: "Acesso não autorizado"
- **Descrição**: "Você não tem permissão para realizar esta ação"
- **Ação**: Botão "Voltar"

### 2.3 Proibido (403)
- **Onde pode ocorrer**: Recursos protegidos
- **Tipo**: `forbidden`
- **Componente**: `ErrorState` com tipo `auth`
- **Mensagem**: "Acesso negado"
- **Descrição**: "Você não tem permissão para acessar este recurso"
- **Ação**: Botão "Voltar"

## 3. Erros de Validação

### 3.1 Dados Inválidos (400)
- **Onde pode ocorrer**: Formulários (checkout, cadastro, etc.)
- **Tipo**: `validation_error`
- **Componente**: Inline nos campos + `ErrorState` se necessário
- **Mensagem**: "Dados inválidos"
- **Descrição**: Mensagem específica do campo
- **Ação**: Corrigir campos com erro

### 3.2 Requisição Malformada (400)
- **Onde pode ocorrer**: Qualquer formulário
- **Tipo**: `bad_request`
- **Componente**: `ErrorState` com tipo `validation`
- **Mensagem**: "Dados incorretos"
- **Descrição**: "Verifique os dados informados e tente novamente"
- **Ação**: Botão "Voltar e corrigir"

## 4. Erros de Recursos Não Encontrados

### 4.1 Recurso Não Encontrado (404)
- **Onde pode ocorrer**: Detalhes de produto, pedido, etc.
- **Tipo**: `not_found`
- **Componente**: `ErrorState` com tipo `not_found`
- **Mensagem**: "Conteúdo não encontrado"
- **Descrição**: "O que você está procurando não existe ou foi removido"
- **Ação**: Botão "Voltar"

### 4.2 Página Não Encontrada (404)
- **Onde pode ocorrer**: Rotas inválidas
- **Tipo**: `page_not_found`
- **Componente**: Tela dedicada `NotFoundScreen`
- **Mensagem**: "Página não encontrada"
- **Descrição**: "A página que você está procurando não existe"
- **Ação**: Botão "Ir para o início"

## 5. Erros Específicos de Funcionalidades

### 5.1 Erro no Checkout
- **Onde pode ocorrer**: Tela de Checkout
- **Tipo**: `checkout_error`
- **Componente**: `ErrorState` com tipo `payment`
- **Mensagem**: "Erro ao processar pedido"
- **Descrição**: "Não foi possível finalizar seu pedido. Tente novamente"
- **Ação**: Botão "Tentar novamente"

### 5.2 Erro no Pagamento
- **Onde pode ocorrer**: Processamento de pagamento
- **Tipo**: `payment_error`
- **Componente**: `ErrorState` com tipo `payment`
- **Mensagem**: "Erro no pagamento"
- **Descrição**: "Não foi possível processar o pagamento. Verifique os dados do cartão"
- **Ação**: Botão "Tentar novamente" ou "Alterar método de pagamento"

### 5.3 Pagamento Recusado
- **Onde pode ocorrer**: Processamento de pagamento
- **Tipo**: `payment_declined`
- **Componente**: `ErrorState` com tipo `payment`
- **Mensagem**: "Pagamento recusado"
- **Descrição**: "Seu pagamento foi recusado. Verifique os dados ou tente outro método"
- **Ação**: Botão "Alterar método de pagamento"

### 5.4 Produto Indisponível
- **Onde pode ocorrer**: Adicionar ao carrinho, visualizar produto
- **Tipo**: `product_unavailable`
- **Componente**: `ErrorState` com tipo `product`
- **Mensagem**: "Produto indisponível"
- **Descrição**: "Este produto não está mais disponível no momento"
- **Ação**: Botão "Ver outros produtos"

### 5.5 Estoque Insuficiente
- **Onde pode ocorrer**: Adicionar ao carrinho, finalizar pedido
- **Tipo**: `out_of_stock`
- **Componente**: `ErrorState` com tipo `product`
- **Mensagem**: "Estoque insuficiente"
- **Descrição**: "Não há quantidade suficiente deste produto em estoque"
- **Ação**: Botão "Ver produtos similares"

### 5.6 Erro ao Adicionar ao Carrinho
- **Onde pode ocorrer**: ProductCard, ProductDetails
- **Tipo**: `add_to_cart_error`
- **Componente**: Toast/Modal + `ErrorState` se necessário
- **Mensagem**: "Erro ao adicionar ao carrinho"
- **Descrição**: "Não foi possível adicionar o produto ao carrinho"
- **Ação**: Botão "Tentar novamente"

### 5.7 Erro ao Buscar Produtos
- **Onde pode ocorrer**: Tela de Search, Home
- **Tipo**: `search_error`
- **Componente**: `ErrorState` com tipo `search`
- **Mensagem**: "Erro ao buscar produtos"
- **Descrição**: "Não foi possível realizar a busca. Tente novamente"
- **Ação**: Botão "Tentar novamente"

### 5.8 Erro ao Carregar Pedidos
- **Onde pode ocorrer**: MyOrders
- **Tipo**: `orders_load_error`
- **Componente**: `ErrorState` com tipo `orders`
- **Mensagem**: "Erro ao carregar pedidos"
- **Descrição**: "Não foi possível carregar seus pedidos"
- **Ação**: Botão "Tentar novamente"

### 5.9 Erro ao Aplicar Cupom
- **Onde pode ocorrer**: Cart, Checkout
- **Tipo**: `coupon_error`
- **Componente**: Toast/Inline error
- **Mensagem**: "Cupom inválido ou expirado"
- **Descrição**: "Verifique o código do cupom e tente novamente"
- **Ação**: (Inline, sem botão adicional)

## 6. Erros de Upload/Mídia

### 6.1 Erro ao Fazer Upload de Imagem
- **Onde pode ocorrer**: Perfil, produtos favoritos
- **Tipo**: `upload_error`
- **Componente**: Toast/Modal
- **Mensagem**: "Erro ao fazer upload"
- **Descrição**: "Não foi possível fazer upload da imagem"
- **Ação**: Botão "Tentar novamente"

### 6.2 Arquivo Muito Grande
- **Onde pode ocorrer**: Upload de imagens
- **Tipo**: `file_too_large`
- **Componente**: Toast/Modal
- **Mensagem**: "Arquivo muito grande"
- **Descrição**: "O arquivo excede o tamanho máximo permitido"
- **Ação**: (Apenas mensagem)

## 7. Erros Genéricos

### 7.1 Erro Genérico/Inesperado (500+)
- **Onde pode ocorrer**: Qualquer lugar
- **Tipo**: `generic_error`
- **Componente**: `ErrorState` com tipo `generic`
- **Mensagem**: "Ops! Algo deu errado"
- **Descrição**: "Ocorreu um erro inesperado. Nossa equipe foi notificada"
- **Ação**: Botão "Tentar novamente" e "Reportar problema"

### 7.2 Erro Não Mapeado
- **Onde pode ocorrer**: Qualquer lugar
- **Tipo**: `unknown_error`
- **Componente**: `ErrorState` com tipo `generic`
- **Mensagem**: "Erro inesperado"
- **Descrição**: "Algo deu errado. Por favor, tente novamente"
- **Ação**: Botão "Tentar novamente"

## 8. Erros de Rate Limiting

### 8.1 Muitas Requisições (429)
- **Onde pode ocorrer**: Qualquer requisição
- **Tipo**: `rate_limit`
- **Componente**: `ErrorState` com tipo `rate_limit`
- **Mensagem**: "Muitas tentativas"
- **Descrição**: "Você fez muitas requisições. Aguarde alguns instantes e tente novamente"
- **Ação**: Botão "Tentar novamente" (desabilitado por X segundos)

## Estrutura de Componentes Propostos

### 1. Componente `ErrorState` (similar ao EmptyState)
- Reutilizável para erros em telas
- Props: `type`, `title`, `description`, `onRetry`, `onAction`, `actionLabel`
- Tipos: `network`, `server`, `auth`, `validation`, `not_found`, `payment`, `product`, `search`, `orders`, `generic`, `rate_limit`

### 2. Componente `ErrorModal`
- Modal para erros que requerem atenção
- Para erros críticos (pagamento, checkout)
- Props: `visible`, `type`, `title`, `description`, `onClose`, `onRetry`

### 3. Tela `ErrorScreen` (genérica)
- Tela dedicada para erros 404 e outros erros de navegação
- Pode ser usado como fallback

### 4. Toast/Notification para Erros Leves
- Para erros que não requerem tela dedicada (cupom inválido, etc.)
- Já pode usar sistema existente se houver

## Priorização de Implementação

### Fase 1 - Críticos (Alta Prioridade)
1. Erro genérico/inesperado
2. Sem conexão com internet
3. Servidor indisponível
4. Erro no checkout
5. Erro no pagamento
6. Recurso não encontrado (404)

### Fase 2 - Importantes (Média Prioridade)
7. Sessão expirada
8. Timeout
9. Erro ao buscar produtos
10. Produto indisponível/estoque insuficiente
11. Erro ao carregar pedidos
12. Validação de dados

### Fase 3 - Complementares (Baixa Prioridade)
13. Rate limiting
14. Upload de imagem
15. Outros erros específicos

## Observações

- Todos os erros devem ser logados para análise
- Erros críticos (pagamento, checkout) devem ter tracking especial
- Considerar retry automático para erros de rede
- Mensagens devem ser amigáveis ao usuário (não técnicas)
- Botões de ação devem ser contextuais e úteis

