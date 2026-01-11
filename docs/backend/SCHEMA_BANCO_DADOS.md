# 🗄️ Schema do Banco de Dados - Now 24 Horas

Documentação completa do schema do banco de dados em português, pensado para suportar um sistema de gestão separado.

---

## 📊 Visão Geral

O banco de dados foi projetado para suportar:
- ✅ App mobile (clientes)
- ✅ Sistema de gestão/admin (separado)
- ✅ Rastreamento de entregas
- ✅ Gestão completa de produtos e estoque
- ✅ Sistema de cupons avançado
- ✅ Avaliações e reviews
- ✅ Analytics e relatórios

---

## 📋 Índice de Tabelas

### 👥 Usuários e Autenticação
1. [usuarios](#usuarios)
2. [tokens_autenticacao](#tokens_autenticacao)
3. [codigos_otp](#codigos_otp)

### 📍 Endereços
4. [enderecos](#enderecos)

### 💳 Pagamentos
5. [cartoes_pagamento](#cartoes_pagamento)
6. [transacoes_pagamento](#transacoes_pagamento)

### 🛍️ Produtos e Catálogo
7. [categorias](#categorias)
8. [produtos](#produtos)
9. [imagens_produtos](#imagens_produtos)
10. [secoes_personalizacao](#secoes_personalizacao)
11. [opcoes_personalizacao](#opcoes_personalizacao)
12. [historico_precos](#historico_precos)
13. [movimentacoes_estoque](#movimentacoes_estoque)

### 🎟️ Cupons
14. [cupons](#cupons)
15. [uso_cupons](#uso_cupons)

### 📦 Pedidos
16. [pedidos](#pedidos)
17. [itens_pedido](#itens_pedido)
18. [historico_status_pedidos](#historico_status_pedidos)
19. [rastreamento_entrega](#rastreamento_entrega)

### 🛒 Carrinho
20. [carrinhos](#carrinhos)
21. [itens_carrinho](#itens_carrinho)

### ⭐ Avaliações
22. [avaliacoes_produtos](#avaliacoes_produtos)
23. [avaliacoes_pedidos](#avaliacoes_pedidos)

### ❤️ Favoritos
24. [favoritos](#favoritos)

### 🔔 Notificações
25. [notificacoes](#notificacoes)
26. [preferencias_notificacao](#preferencias_notificacao)

### ⚙️ Configurações
27. [preferencias_usuario](#preferencias_usuario)
28. [configuracoes_sistema](#configuracoes_sistema)

### 🔧 Gestão e Administração
29. [logs_auditoria](#logs_auditoria)
30. [banners](#banners)
31. [historico_visualizacoes](#historico_visualizacoes)
32. [historico_buscas](#historico_buscas)

---

## 📝 Detalhamento das Tabelas

### 👥 USUÁRIOS E AUTENTICAÇÃO

#### usuarios
Usuários do sistema (clientes, administradores, entregadores, gerentes).

**Campos principais:**
- `id` - UUID (PK)
- `email` - Email único
- `telefone` - Telefone único
- `nomeCompleto` - Nome completo
- `cpf` - CPF único (opcional)
- `senhaHash` - Hash da senha
- `tipoUsuario` - Enum: 'cliente', 'administrador', 'entregador', 'gerente'
- `fotoPerfil` - URL da foto
- `emailVerificado` - Boolean
- `telefoneVerificado` - Boolean
- `ativo` - Boolean (para desativar usuários)
- `ultimoAcesso` - Timestamp
- `criadoEm`, `atualizadoEm` - Timestamps

**Índices:**
- Email
- Telefone
- Tipo de usuário

**Uso no sistema de gestão:**
- Criar/editar/desativar usuários
- Ver histórico de acessos
- Gerenciar permissões por tipo

---

#### tokens_autenticacao
Tokens de refresh para autenticação JWT.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `token` - Token único
- `expiraEm` - Timestamp de expiração
- `dispositivo` - Nome do dispositivo
- `ipAddress` - IP do dispositivo
- `criadoEm` - Timestamp

**Uso:**
- Gerenciar sessões ativas
- Logout remoto
- Segurança de autenticação

---

#### codigos_otp
Códigos OTP para verificação de telefone e recuperação de senha.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (opcional)
- `telefone` - Telefone para envio
- `codigo` - Código OTP
- `tipo` - 'verificacao' ou 'recuperacao_senha'
- `usado` - Boolean
- `expiraEm` - Timestamp
- `criadoEm` - Timestamp

---

### 📍 ENDEREÇOS

#### enderecos
Endereços dos usuários para entrega.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `tipo` - Enum: 'casa', 'trabalho', 'outro'
- `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`
- `latitude`, `longitude` - Coordenadas GPS
- `enderecoPadrao` - Boolean
- `ativo` - Boolean
- `criadoEm`, `atualizadoEm` - Timestamps

**Índices:**
- Usuário
- CEP

---

### 💳 PAGAMENTOS

#### cartoes_pagamento
Cartões de crédito/débito salvos pelos usuários.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `tipo` - Enum: 'cartao_credito', 'cartao_debito', 'pix', 'boleto'
- `ultimosDigitos` - Últimos 4 dígitos
- `nomeCartao` - Nome no cartão
- `bandeira` - 'visa', 'mastercard', 'elo', etc.
- `mesValidade`, `anoValidade`
- `cartaoPadrao` - Boolean
- `tokenGateway` - Token do gateway de pagamento
- `ativo` - Boolean
- `criadoEm`, `atualizadoEm` - Timestamps

---

#### transacoes_pagamento
Transações de pagamento processadas.

**Campos principais:**
- `id` - UUID (PK)
- `pedidoId` - FK para pedidos
- `metodoPagamento` - Enum
- `cartaoId` - FK para cartoes_pagamento (opcional)
- `valor` - Integer (centavos)
- `status` - 'pendente', 'processando', 'aprovado', 'recusado', 'cancelado'
- `idGateway` - ID da transação no gateway
- `codigoAutorizacao` - Código de autorização
- `parcelas` - Número de parcelas
- `dadosTransacao` - JSONB (dados adicionais)
- `processadoEm` - Timestamp
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Relatórios financeiros
- Conciliação de pagamentos
- Análise de transações

---

### 🛍️ PRODUTOS E CATÁLOGO

#### categorias
Categorias de produtos.

**Campos principais:**
- `id` - UUID (PK)
- `nome` - Nome único
- `slug` - Slug único (URL-friendly)
- `descricao` - Descrição
- `imagemUrl` - URL da imagem
- `ordem` - Ordem de exibição
- `ativo` - Boolean
- `criadoPor` - FK para usuarios (admin)
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Criar/editar categorias
- Organizar produtos
- Gerenciar ordem de exibição

---

#### produtos
Produtos do catálogo.

**Campos principais:**
- `id` - UUID (PK)
- `categoriaId` - FK para categorias
- `nome` - Nome do produto
- `slug` - Slug único
- `descricao` - Descrição curta
- `descricaoCompleta` - Descrição detalhada
- `imagemPrincipal` - URL da imagem principal
- `precoBase` - Preço original (centavos)
- `precoFinal` - Preço final (centavos)
- `valorDesconto` - Valor do desconto (centavos)
- `estoque` - Quantidade em estoque
- `estoqueMinimo` - Estoque mínimo para alerta
- `statusEstoque` - Enum: 'disponivel', 'baixo_estoque', 'indisponivel', 'descontinuado'
- `unidadeMedida` - 'kg', 'g', 'un', 'litro', etc.
- `peso` - Peso em kg
- `dimensoes` - JSONB { largura, altura, profundidade } em cm
- `codigoBarras` - Código de barras único
- `sku` - Stock Keeping Unit único
- `ativo` - Boolean
- `emOferta` - Boolean
- `maisPopular` - Boolean
- `novidade` - Boolean
- `avaliacaoMedia` - Decimal (0.00 a 5.00)
- `quantidadeAvaliacoes` - Integer
- `visualizacoes` - Contador de visualizações
- `vendas` - Contador de vendas
- `criadoPor` - FK para usuarios (admin)
- `criadoEm`, `atualizadoEm` - Timestamps
- `publicadoEm` - Timestamp de publicação

**Índices:**
- Categoria
- Slug
- Ativo
- Em oferta
- Mais popular
- Código de barras
- SKU

**Uso no sistema de gestão:**
- CRUD completo de produtos
- Gestão de estoque
- Controle de preços
- Publicação/desativação
- Analytics de vendas

---

#### imagens_produtos
Galeria de imagens dos produtos.

**Campos principais:**
- `id` - UUID (PK)
- `produtoId` - FK para produtos
- `url` - URL da imagem
- `ordem` - Ordem de exibição
- `alt` - Texto alternativo
- `criadoEm` - Timestamp

---

#### secoes_personalizacao
Seções de personalização dos produtos (ex: "Escolha o tamanho", "Adicionais").

**Campos principais:**
- `id` - UUID (PK)
- `produtoId` - FK para produtos
- `titulo` - Título da seção
- `tipo` - Enum: 'unica_escolha', 'multipla_escolha'
- `obrigatorio` - Boolean
- `selecaoMinima` - Integer (mínimo de opções)
- `selecaoMaxima` - Integer (máximo de opções, null = sem limite)
- `permiteQuantidade` - Boolean (permite quantidade nas opções)
- `ordem` - Ordem de exibição
- `ativo` - Boolean
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Criar seções de personalização
- Definir regras de seleção
- Gerenciar opções

---

#### opcoes_personalizacao
Opções dentro das seções (ex: "Pequeno", "Médio", "Bacon", "Cream cheese").

**Campos principais:**
- `id` - UUID (PK)
- `secaoId` - FK para secoes_personalizacao
- `titulo` - Título da opção
- `descricao` - Descrição opcional
- `precoAdicional` - Integer (centavos, 0 = grátis)
- `estoque` - Integer (opcional, null = sem controle)
- `ativo` - Boolean
- `ordem` - Ordem de exibição
- `criadoEm`, `atualizadoEm` - Timestamps

---

#### historico_precos
Histórico de alterações de preço dos produtos.

**Campos principais:**
- `id` - UUID (PK)
- `produtoId` - FK para produtos
- `precoAnterior` - Integer (centavos)
- `precoNovo` - Integer (centavos)
- `motivo` - 'promocao', 'ajuste', 'custo', etc.
- `alteradoPor` - FK para usuarios (admin)
- `criadoEm` - Timestamp

**Uso no sistema de gestão:**
- Relatórios de alteração de preços
- Auditoria
- Análise de margem

---

#### movimentacoes_estoque
Movimentações de estoque (entrada, saída, ajuste, venda, devolução).

**Campos principais:**
- `id` - UUID (PK)
- `produtoId` - FK para produtos
- `tipo` - 'entrada', 'saida', 'ajuste', 'venda', 'devolucao'
- `quantidade` - Integer
- `quantidadeAnterior` - Integer
- `quantidadeNova` - Integer
- `motivo` - Texto do motivo
- `referencia` - ID do pedido, nota fiscal, etc.
- `responsavel` - FK para usuarios
- `criadoEm` - Timestamp

**Uso no sistema de gestão:**
- Controle de estoque
- Relatórios de movimentação
- Auditoria de estoque

---

### 🎟️ CUPONS

#### cupons
Cupons de desconto.

**Campos principais:**
- `id` - UUID (PK)
- `codigo` - Código único do cupom
- `descricao` - Descrição
- `tipoDesconto` - Enum: 'fixo', 'percentual'
- `valorDesconto` - Integer (centavos ou porcentagem)
- `valorMinimoPedido` - Integer (centavos)
- `valorMaximoDesconto` - Integer (centavos, para percentual)
- `descontoEntrega` - Boolean (se false, desconto não se aplica à entrega)
- `entregaObrigatoria` - Boolean (se true, só pode usar com entrega)
- `categoriaId` - FK para categorias (cupom específico para categoria)
- `produtoId` - FK para produtos (cupom específico para produto)
- `validoDe`, `validoAte` - Timestamps
- `limiteUso` - Integer (null = sem limite)
- `limiteUsoPorUsuario` - Integer
- `quantidadeUsada` - Integer
- `ativo` - Boolean
- `criadoPor` - FK para usuarios (admin)
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Criar/editar cupons
- Definir regras complexas
- Relatórios de uso
- Campanhas promocionais

---

#### uso_cupons
Histórico de uso de cupons.

**Campos principais:**
- `id` - UUID (PK)
- `cupomId` - FK para cupons
- `pedidoId` - FK para pedidos
- `usuarioId` - FK para usuarios
- `valorDescontoAplicado` - Integer (centavos)
- `valorPedido` - Integer (centavos)
- `criadoEm` - Timestamp

---

### 📦 PEDIDOS

#### pedidos
Pedidos dos clientes.

**Campos principais:**
- `id` - UUID (PK)
- `numeroPedido` - Texto único (ex: #99489500)
- `usuarioId` - FK para usuarios
- `enderecoId` - FK para enderecos
- `metodoPagamento` - Enum
- `cartaoId` - FK para cartoes_pagamento (opcional)
- `status` - Enum: 'pendente', 'aguardando_pagamento', 'confirmado', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado', 'reembolsado'
- `subtotal` - Integer (centavos)
- `taxaEntrega` - Integer (centavos)
- `desconto` - Integer (centavos)
- `total` - Integer (centavos)
- `cupomId` - FK para cupons
- `tempoEntrega` - Texto (ex: "20-40 minutos")
- `agendadoPara` - Timestamp (se agendado)
- `observacoes` - Observações do cliente
- `instrucoesEntrega` - Instruções para entregador
- `entregadorId` - FK para usuarios (entregador)
- `latitudeEntrega`, `longitudeEntrega` - Coordenadas
- `confirmadoEm`, `preparandoEm`, `saiuParaEntregaEm`, `entregueEm` - Timestamps
- `canceladoEm` - Timestamp
- `motivoCancelamento` - Texto
- `canceladoPor` - FK para usuarios
- `criadoEm`, `atualizadoEm` - Timestamps

**Índices:**
- Número do pedido
- Usuário
- Status
- Data

**Uso no sistema de gestão:**
- Visualizar todos os pedidos
- Atualizar status
- Designar entregador
- Cancelar pedidos
- Relatórios de vendas

---

#### itens_pedido
Itens de um pedido (snapshot no momento da compra).

**Campos principais:**
- `id` - UUID (PK)
- `pedidoId` - FK para pedidos
- `produtoId` - FK para produtos
- `nomeProduto` - Snapshot do nome
- `quantidade` - Integer
- `precoUnitario` - Integer (centavos, snapshot)
- `precoTotal` - Integer (centavos)
- `personalizacoes` - JSONB (array de personalizações)
- `observacoes` - Observações do item
- `criadoEm` - Timestamp

**Nota:** Os preços são salvos como snapshot para manter histórico mesmo se o preço do produto mudar.

---

#### historico_status_pedidos
Histórico de mudanças de status dos pedidos.

**Campos principais:**
- `id` - UUID (PK)
- `pedidoId` - FK para pedidos
- `statusAnterior` - Enum (opcional)
- `statusNovo` - Enum
- `observacoes` - Texto
- `alteradoPor` - FK para usuarios
- `criadoEm` - Timestamp

**Uso:**
- Timeline do pedido
- Auditoria
- Análise de tempos

---

#### rastreamento_entrega
Localização do entregador em tempo real.

**Campos principais:**
- `id` - UUID (PK)
- `pedidoId` - FK para pedidos
- `entregadorId` - FK para usuarios
- `latitude`, `longitude` - Coordenadas GPS
- `velocidade` - Decimal (km/h)
- `precisao` - Decimal (metros)
- `criadoEm` - Timestamp

**Uso:**
- Rastreamento em tempo real
- Mapa de entrega
- Análise de rotas

---

### 🛒 CARRINHO

#### carrinhos
Carrinhos de compra temporários.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `cupomId` - FK para cupons (cupom aplicado)
- `expiraEm` - Timestamp (expira após X horas)
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso:**
- Salvar carrinho entre sessões
- Recuperar carrinho abandonado

---

#### itens_carrinho
Itens no carrinho.

**Campos principais:**
- `id` - UUID (PK)
- `carrinhoId` - FK para carrinhos
- `produtoId` - FK para produtos
- `quantidade` - Integer
- `personalizacoes` - JSONB
- `observacoes` - Texto
- `criadoEm`, `atualizadoEm` - Timestamps

**Constraint único:** Um produto só pode aparecer uma vez por carrinho (com mesmas personalizações).

---

### ⭐ AVALIAÇÕES

#### avaliacoes_produtos
Avaliações e reviews de produtos.

**Campos principais:**
- `id` - UUID (PK)
- `produtoId` - FK para produtos
- `usuarioId` - FK para usuarios
- `pedidoId` - FK para pedidos (opcional)
- `nota` - Integer (1 a 5)
- `comentario` - Texto
- `imagens` - JSONB (array de URLs)
- `aprovado` - Boolean (moderação)
- `aprovadoPor` - FK para usuarios (admin)
- `aprovadoEm` - Timestamp
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Moderar avaliações
- Aprovar/rejeitar reviews
- Responder avaliações

---

#### avaliacoes_pedidos
Avaliações de pedidos/entrega.

**Campos principais:**
- `id` - UUID (PK)
- `pedidoId` - FK para pedidos
- `usuarioId` - FK para usuarios
- `notaProdutos` - Integer (1 a 5)
- `notaEntrega` - Integer (1 a 5)
- `notaAtendimento` - Integer (1 a 5)
- `comentario` - Texto
- `criadoEm`, `atualizadoEm` - Timestamps

---

### ❤️ FAVORITOS

#### favoritos
Produtos favoritos dos usuários.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `produtoId` - FK para produtos
- `criadoEm` - Timestamp

**Constraint único:** Um produto só pode ser favorito uma vez por usuário.

---

### 🔔 NOTIFICAÇÕES

#### notificacoes
Notificações enviadas aos usuários.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios
- `tipo` - Enum: 'pedido', 'promocao', 'sistema', 'pagamento', 'entrega'
- `titulo` - Texto
- `mensagem` - Texto
- `dados` - JSONB (dados adicionais, ex: ID do pedido)
- `lida` - Boolean
- `lidaEm` - Timestamp
- `enviadaPush` - Boolean
- `enviadaEmail` - Boolean
- `criadoEm` - Timestamp

**Índices:**
- Usuário
- Lida
- Tipo
- Data

---

#### preferencias_notificacao
Preferências de notificação dos usuários.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (unique)
- `atualizacoesPedido` - Boolean
- `promocoesOfertas` - Boolean
- `novidadesProdutos` - Boolean
- `notificacoesSistema` - Boolean
- `pushAtivado` - Boolean
- `emailAtivado` - Boolean
- `smsAtivado` - Boolean
- `criadoEm`, `atualizadoEm` - Timestamps

---

### ⚙️ CONFIGURAÇÕES

#### preferencias_usuario
Preferências gerais do usuário.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (unique)
- `idioma` - Texto (ex: 'pt-BR')
- `tema` - 'claro', 'escuro', 'sistema'
- `tamanhoFonte` - 'pequeno', 'medio', 'grande'
- `criadoEm`, `atualizadoEm` - Timestamps

---

#### configuracoes_sistema
Configurações gerais do sistema (para admin).

**Campos principais:**
- `id` - UUID (PK)
- `chave` - Texto único
- `valor` - Texto
- `tipo` - 'string', 'number', 'boolean', 'json'
- `descricao` - Texto
- `categoria` - 'geral', 'pagamento', 'entrega', 'notificacoes', etc.
- `editavel` - Boolean
- `criadoEm`, `atualizadoEm` - Timestamps

**Exemplos de configurações:**
- `taxa_entrega_padrao` - Taxa de entrega padrão
- `tempo_entrega_minimo` - Tempo mínimo de entrega
- `tempo_entrega_maximo` - Tempo máximo de entrega
- `valor_minimo_pedido` - Valor mínimo para pedido
- `email_contato` - Email de contato
- `telefone_contato` - Telefone de contato

---

### 🔧 GESTÃO E ADMINISTRAÇÃO

#### logs_auditoria
Logs de todas as ações do sistema (auditoria).

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (opcional)
- `acao` - 'criar', 'editar', 'deletar', 'visualizar', 'login', etc.
- `entidade` - 'produto', 'pedido', 'usuario', etc.
- `entidadeId` - UUID da entidade
- `dadosAntigos` - JSONB
- `dadosNovos` - JSONB
- `ipAddress` - Texto
- `userAgent` - Texto
- `criadoEm` - Timestamp

**Uso no sistema de gestão:**
- Auditoria completa
- Rastreamento de mudanças
- Segurança
- Compliance

---

#### banners
Banners e sliders da home.

**Campos principais:**
- `id` - UUID (PK)
- `titulo` - Texto
- `descricao` - Texto
- `imagemUrl` - URL da imagem
- `linkTipo` - 'produto', 'categoria', 'url', null
- `linkId` - UUID (ID do produto/categoria)
- `linkUrl` - Texto (URL externa)
- `ordem` - Integer
- `ativo` - Boolean
- `dataInicio`, `dataFim` - Timestamps
- `cliques` - Contador de cliques
- `criadoPor` - FK para usuarios (admin)
- `criadoEm`, `atualizadoEm` - Timestamps

**Uso no sistema de gestão:**
- Criar/editar banners
- Gerenciar campanhas
- Analytics de cliques

---

#### historico_visualizacoes
Histórico de visualizações de produtos.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (opcional, pode ser anônimo)
- `produtoId` - FK para produtos
- `ipAddress` - Texto
- `userAgent` - Texto
- `criadoEm` - Timestamp

**Uso:**
- Produtos visualizados recentemente
- Analytics
- Recomendações

---

#### historico_buscas
Histórico de buscas realizadas.

**Campos principais:**
- `id` - UUID (PK)
- `usuarioId` - FK para usuarios (opcional)
- `termo` - Texto pesquisado
- `resultados` - Número de resultados
- `categoriaId` - FK para categorias (opcional)
- `ipAddress` - Texto
- `criadoEm` - Timestamp

**Uso:**
- Buscas recentes
- Buscas populares
- Analytics
- Melhorar busca

---

## 🔗 Relacionamentos Principais

### Hierarquia de Produtos
```
categorias
  └── produtos
      ├── imagens_produtos
      ├── secoes_personalizacao
      │   └── opcoes_personalizacao
      ├── historico_precos
      ├── movimentacoes_estoque
      ├── favoritos
      ├── avaliacoes_produtos
      └── historico_visualizacoes
```

### Fluxo de Pedido
```
usuarios
  ├── enderecos
  ├── cartoes_pagamento
  └── pedidos
      ├── itens_pedido
      ├── historico_status_pedidos
      ├── rastreamento_entrega
      ├── transacoes_pagamento
      └── avaliacoes_pedidos
```

### Sistema de Cupons
```
cupons
  ├── uso_cupons
  ├── pedidos (aplicado em)
  └── carrinhos (aplicado em)
```

---

## 🎯 Considerações para Sistema de Gestão

### Funcionalidades que o schema suporta:

1. **Gestão de Produtos**
   - CRUD completo
   - Gestão de estoque
   - Controle de preços
   - Personalizações complexas
   - Múltiplas imagens
   - Publicação/desativação

2. **Gestão de Pedidos**
   - Visualizar todos os pedidos
   - Atualizar status
   - Designar entregador
   - Cancelar pedidos
   - Relatórios

3. **Gestão de Cupons**
   - Criar cupons com regras complexas
   - Cupons por categoria/produto
   - Relatórios de uso

4. **Gestão de Usuários**
   - CRUD de clientes
   - Gerenciar administradores
   - Gerenciar entregadores
   - Histórico de ações

5. **Analytics e Relatórios**
   - Vendas por período
   - Produtos mais vendidos
   - Clientes mais ativos
   - Uso de cupons
   - Movimentação de estoque
   - Histórico de preços

6. **Auditoria**
   - Logs de todas as ações
   - Histórico de mudanças
   - Rastreamento de alterações

---

## 📊 Estatísticas e Contadores

O schema inclui vários contadores para analytics:
- `visualizacoes` em produtos
- `vendas` em produtos
- `quantidadeAvaliacoes` em produtos
- `quantidadeUsada` em cupons
- `cliques` em banners

---

## 🔐 Segurança

- Senhas sempre em hash (nunca em texto plano)
- Tokens de autenticação com expiração
- Logs de auditoria para rastreamento
- Campos de `criadoPor` e `alteradoPor` para responsabilidade

---

## 📈 Performance

- Índices em campos frequentemente consultados
- Constraints únicos onde necessário
- Relacionamentos otimizados
- JSONB para dados flexíveis (personalizações, etc.)

---

**Última atualização:** 2025-01-XX

