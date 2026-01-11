import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  decimal, 
  jsonb, 
  uuid, 
  pgEnum,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const tipoEnderecoEnum = pgEnum('tipo_endereco', [
  'casa',
  'trabalho',
  'outro',
]);

export const metodoPagamentoEnum = pgEnum('metodo_pagamento', [
  'cartao_credito',
  'cartao_debito',
  'pix',
  'boleto',
]);

export const statusPedidoEnum = pgEnum('status_pedido', [
  'pendente',
  'aguardando_pagamento',
  'confirmado',
  'preparando',
  'saiu_para_entrega',
  'entregue',
  'cancelado',
  'reembolsado',
]);

export const tipoDescontoEnum = pgEnum('tipo_desconto', [
  'fixo',
  'percentual',
]);

export const tipoUsuarioEnum = pgEnum('tipo_usuario', [
  'cliente',
  'administrador',
  'entregador',
  'gerente',
]);

export const tipoNotificacaoEnum = pgEnum('tipo_notificacao', [
  'pedido',
  'promocao',
  'sistema',
  'pagamento',
  'entrega',
]);

export const tipoPersonalizacaoEnum = pgEnum('tipo_personalizacao', [
  'unica_escolha',
  'multipla_escolha',
]);

export const statusEstoqueEnum = pgEnum('status_estoque', [
  'disponivel',
  'baixo_estoque',
  'indisponivel',
  'descontinuado',
]);

// ============================================================================
// TABELAS DE USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

/**
 * Usuários do sistema (clientes e administradores)
 */
export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').notNull().unique(),
  nomeCompleto: text('nome_completo').notNull(),
  cpf: text('cpf').unique(),
  senhaHash: text('senha_hash').notNull(),
  tipoUsuario: tipoUsuarioEnum('tipo_usuario').default('cliente').notNull(),
  fotoPerfil: text('foto_perfil'),
  emailVerificado: boolean('email_verificado').default(false).notNull(),
  telefoneVerificado: boolean('telefone_verificado').default(false).notNull(),
  customerIdGateway: text('customer_id_gateway'), // ID do Customer no MercadoPago
  ativo: boolean('ativo').default(true).notNull(),
  expoPushToken: text('expo_push_token'), // Token para push notifications
  ultimoAcesso: timestamp('ultimo_acesso'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_usuarios_email').on(table.email),
  telefoneIdx: index('idx_usuarios_telefone').on(table.telefone),
  tipoUsuarioIdx: index('idx_usuarios_tipo').on(table.tipoUsuario),
}));

/**
 * Tokens de autenticação (JWT refresh tokens)
 */
export const tokensAutenticacao = pgTable('tokens_autenticacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiraEm: timestamp('expira_em').notNull(),
  dispositivo: text('dispositivo'),
  ipAddress: text('ip_address'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_tokens_usuario').on(table.usuarioId),
  tokenIdx: index('idx_tokens_token').on(table.token),
}));

/**
 * Códigos OTP para verificação
 */
export const codigosOtp = pgTable('codigos_otp', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }),
  telefone: text('telefone').notNull(),
  codigo: text('codigo').notNull(),
  tipo: text('tipo').notNull(), // 'verificacao', 'recuperacao_senha'
  usado: boolean('usado').default(false).notNull(),
  expiraEm: timestamp('expira_em').notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  telefoneCodigoIdx: index('idx_otp_telefone_codigo').on(table.telefone, table.codigo),
}));

// ============================================================================
// TABELAS DE ENDEREÇOS
// ============================================================================

/**
 * Endereços dos usuários
 */
export const enderecos = pgTable('enderecos', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  tipo: tipoEnderecoEnum('tipo').notNull(),
  rua: text('rua').notNull(),
  numero: text('numero').notNull(),
  complemento: text('complemento'),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').notNull(),
  cep: text('cep').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  enderecoPadrao: boolean('endereco_padrao').default(false).notNull(),
  ativo: boolean('ativo').default(true).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_enderecos_usuario').on(table.usuarioId),
  cepIdx: index('idx_enderecos_cep').on(table.cep),
}));

// ============================================================================
// TABELAS DE PAGAMENTO
// ============================================================================

/**
 * Cartões de pagamento salvos
 */
export const cartoesPagamento = pgTable('cartoes_pagamento', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  tipo: metodoPagamentoEnum('tipo').notNull(),
  ultimosDigitos: text('ultimos_digitos').notNull(),
  nomeCartao: text('nome_cartao'),
  bandeira: text('bandeira'), // visa, mastercard, elo, etc.
  mesValidade: integer('mes_validade'),
  anoValidade: integer('ano_validade'),
  cartaoPadrao: boolean('cartao_padrao').default(false).notNull(),
  tokenGateway: text('token_gateway'), // Token temporário (deprecated, usar customerCardIdGateway)
  customerCardIdGateway: text('customer_card_id_gateway'), // ID do Customer Card no MercadoPago (permanente)
  ativo: boolean('ativo').default(true).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_cartoes_usuario').on(table.usuarioId),
}));

/**
 * Transações de pagamento
 */
export const transacoesPagamento = pgTable('transacoes_pagamento', {
  id: uuid('id').defaultRandom().primaryKey(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id).notNull(),
  metodoPagamento: metodoPagamentoEnum('metodo_pagamento').notNull(),
  cartaoId: uuid('cartao_id').references(() => cartoesPagamento.id),
  valor: integer('valor').notNull(), // em centavos
  status: text('status').notNull(), // 'pendente', 'processando', 'aprovado', 'recusado', 'cancelado'
  idGateway: text('id_gateway'), // ID da transação no gateway
  codigoAutorizacao: text('codigo_autorizacao'),
  parcelas: integer('parcelas').default(1).notNull(),
  dadosTransacao: jsonb('dados_transacao'), // Dados adicionais do gateway
  processadoEm: timestamp('processado_em'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  pedidoIdx: index('idx_transacoes_pedido').on(table.pedidoId),
  statusIdx: index('idx_transacoes_status').on(table.status),
}));

// ============================================================================
// TABELAS DE CATEGORIAS E PRODUTOS
// ============================================================================

/**
 * Categorias de produtos
 */
export const categorias = pgTable('categorias', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull().unique(),
  slug: text('slug').notNull().unique(),
  descricao: text('descricao'),
  imagemUrl: text('imagem_url'),
  icone: text('icone'), // URL ou nome do ícone
  ordem: integer('ordem').default(0).notNull(),
  principal: boolean('principal').default(false).notNull(), // Se é uma das 7 principais categorias
  mostraBadgeDesconto: boolean('mostra_badge_desconto').default(false).notNull(), // Se mostra badge de desconto
  ativo: boolean('ativo').default(true).notNull(),
  criadoPor: uuid('criado_por').references(() => usuarios.id), // Admin que criou
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_categorias_slug').on(table.slug),
  ordemIdx: index('idx_categorias_ordem').on(table.ordem),
  principalIdx: index('idx_categorias_principal').on(table.principal),
}));

/**
 * Produtos
 */
export const produtos = pgTable('produtos', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoriaId: uuid('categoria_id').references(() => categorias.id).notNull(),
  nome: text('nome').notNull(),
  slug: text('slug').notNull().unique(),
  descricao: text('descricao'),
  descricaoCompleta: text('descricao_completa'),
  imagemPrincipal: text('imagem_principal'),
  precoBase: integer('preco_base').notNull(), // em centavos
  precoFinal: integer('preco_final').notNull(), // em centavos
  valorDesconto: integer('valor_desconto').default(0).notNull(), // em centavos
  estoque: integer('estoque').default(0).notNull(),
  estoqueMinimo: integer('estoque_minimo').default(5).notNull(),
  statusEstoque: statusEstoqueEnum('status_estoque').default('disponivel').notNull(),
  unidadeMedida: text('unidade_medida'), // kg, g, un, litro, etc.
  peso: decimal('peso', { precision: 8, scale: 2 }), // em kg
  dimensoes: jsonb('dimensoes'), // { largura, altura, profundidade } em cm
  codigoBarras: text('codigo_barras').unique(),
  sku: text('sku').unique(), // Stock Keeping Unit
  ativo: boolean('ativo').default(true).notNull(),
  emOferta: boolean('em_oferta').default(false).notNull(),
  maisPopular: boolean('mais_popular').default(false).notNull(),
  novidade: boolean('novidade').default(false).notNull(),
  avaliacaoMedia: decimal('avaliacao_media', { precision: 3, scale: 2 }).default('0.00'),
  quantidadeAvaliacoes: integer('quantidade_avaliacoes').default(0).notNull(),
  visualizacoes: integer('visualizacoes').default(0).notNull(),
  vendas: integer('vendas').default(0).notNull(),
  criadoPor: uuid('criado_por').references(() => usuarios.id), // Admin que criou
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
  publicadoEm: timestamp('publicado_em'),
}, (table) => ({
  categoriaIdx: index('idx_produtos_categoria').on(table.categoriaId),
  slugIdx: index('idx_produtos_slug').on(table.slug),
  ativoIdx: index('idx_produtos_ativo').on(table.ativo),
  emOfertaIdx: index('idx_produtos_oferta').on(table.emOferta),
  maisPopularIdx: index('idx_produtos_popular').on(table.maisPopular),
  codigoBarrasIdx: index('idx_produtos_codigo_barras').on(table.codigoBarras),
  skuIdx: index('idx_produtos_sku').on(table.sku),
}));

/**
 * Imagens dos produtos (galeria)
 */
export const imagensProdutos = pgTable('imagens_produtos', {
  id: uuid('id').defaultRandom().primaryKey(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  ordem: integer('ordem').default(0).notNull(),
  alt: text('alt'), // Texto alternativo
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  produtoIdx: index('idx_imagens_produto').on(table.produtoId),
  ordemIdx: index('idx_imagens_ordem').on(table.ordem),
}));

/**
 * Seções de personalização dos produtos (ex: tamanho, ponto da carne, adicionais)
 */
export const secoesPersonalizacao = pgTable('secoes_personalizacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  titulo: text('titulo').notNull(), // Ex: "Escolha o tamanho", "Adicionais"
  tipo: tipoPersonalizacaoEnum('tipo').notNull(), // 'unica_escolha' ou 'multipla_escolha'
  obrigatorio: boolean('obrigatorio').default(false).notNull(),
  selecaoMinima: integer('selecao_minima').default(0).notNull(),
  selecaoMaxima: integer('selecao_maxima'), // null = sem limite
  permiteQuantidade: boolean('permite_quantidade').default(false).notNull(),
  ordem: integer('ordem').default(0).notNull(),
  ativo: boolean('ativo').default(true).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  produtoIdx: index('idx_secoes_produto').on(table.produtoId),
  ordemIdx: index('idx_secoes_ordem').on(table.ordem),
}));

/**
 * Opções de personalização (ex: "Pequeno", "Médio", "Bacon", "Cream cheese")
 */
export const opcoesPersonalizacao = pgTable('opcoes_personalizacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  secaoId: uuid('secao_id').references(() => secoesPersonalizacao.id, { onDelete: 'cascade' }).notNull(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  precoAdicional: integer('preco_adicional').default(0).notNull(), // em centavos (0 = grátis)
  estoque: integer('estoque'), // null = sem controle de estoque
  ativo: boolean('ativo').default(true).notNull(),
  ordem: integer('ordem').default(0).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  secaoIdx: index('idx_opcoes_secao').on(table.secaoId),
  ordemIdx: index('idx_opcoes_ordem').on(table.ordem),
}));

/**
 * Histórico de preços dos produtos (para relatórios e gestão)
 */
export const historicoPrecos = pgTable('historico_precos', {
  id: uuid('id').defaultRandom().primaryKey(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  precoAnterior: integer('preco_anterior').notNull(),
  precoNovo: integer('preco_novo').notNull(),
  motivo: text('motivo'), // 'promocao', 'ajuste', 'custo', etc.
  alteradoPor: uuid('alterado_por').references(() => usuarios.id),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  produtoIdx: index('idx_historico_precos_produto').on(table.produtoId),
  dataIdx: index('idx_historico_precos_data').on(table.criadoEm),
}));

/**
 * Movimentações de estoque
 */
export const movimentacoesEstoque = pgTable('movimentacoes_estoque', {
  id: uuid('id').defaultRandom().primaryKey(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  tipo: text('tipo').notNull(), // 'entrada', 'saida', 'ajuste', 'venda', 'devolucao'
  quantidade: integer('quantidade').notNull(),
  quantidadeAnterior: integer('quantidade_anterior').notNull(),
  quantidadeNova: integer('quantidade_nova').notNull(),
  motivo: text('motivo'),
  referencia: text('referencia'), // ID do pedido, nota fiscal, etc.
  responsavel: uuid('responsavel').references(() => usuarios.id),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  produtoIdx: index('idx_movimentacoes_produto').on(table.produtoId),
  tipoIdx: index('idx_movimentacoes_tipo').on(table.tipo),
  dataIdx: index('idx_movimentacoes_data').on(table.criadoEm),
}));

// ============================================================================
// TABELAS DE CUPONS
// ============================================================================

/**
 * Cupons de desconto
 */
export const cupons = pgTable('cupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  codigo: text('codigo').notNull().unique(),
  descricao: text('descricao').notNull(),
  tipoDesconto: tipoDescontoEnum('tipo_desconto').notNull(),
  valorDesconto: integer('valor_desconto').notNull(), // em centavos (fixo) ou porcentagem (percentual)
  valorMinimoPedido: integer('valor_minimo_pedido'), // em centavos
  valorMaximoDesconto: integer('valor_maximo_desconto'), // em centavos (para percentual)
  descontoEntrega: boolean('desconto_entrega').default(false).notNull(), // se false, desconto não se aplica à entrega
  entregaObrigatoria: boolean('entrega_obrigatoria').default(false).notNull(), // se true, só pode usar com entrega
  categoriaId: uuid('categoria_id').references(() => categorias.id), // Cupom específico para categoria
  produtoId: uuid('produto_id').references(() => produtos.id), // Cupom específico para produto
  validoDe: timestamp('valido_de').notNull(),
  validoAte: timestamp('valido_ate').notNull(),
  limiteUso: integer('limite_uso'), // null = sem limite
  limiteUsoPorUsuario: integer('limite_uso_por_usuario').default(1).notNull(),
  quantidadeUsada: integer('quantidade_usada').default(0).notNull(),
  ativo: boolean('ativo').default(true).notNull(),
  criadoPor: uuid('criado_por').references(() => usuarios.id), // Admin que criou
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  codigoIdx: index('idx_cupons_codigo').on(table.codigo),
  ativoIdx: index('idx_cupons_ativo').on(table.ativo),
  validadeIdx: index('idx_cupons_validade').on(table.validoDe, table.validoAte),
}));

/**
 * Uso de cupons (histórico)
 */
export const usoCupons = pgTable('uso_cupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  cupomId: uuid('cupom_id').references(() => cupons.id).notNull(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id).notNull(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  valorDescontoAplicado: integer('valor_desconto_aplicado').notNull(), // em centavos
  valorPedido: integer('valor_pedido').notNull(), // em centavos
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  cupomIdx: index('idx_uso_cupons_cupom').on(table.cupomId),
  pedidoIdx: index('idx_uso_cupons_pedido').on(table.pedidoId),
  usuarioIdx: index('idx_uso_cupons_usuario').on(table.usuarioId),
}));

// ============================================================================
// TABELAS DE PEDIDOS
// ============================================================================

/**
 * Pedidos
 */
export const pedidos = pgTable('pedidos', {
  id: uuid('id').defaultRandom().primaryKey(),
  numeroPedido: text('numero_pedido').notNull().unique(), // Ex: #99489500
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  enderecoId: uuid('endereco_id').references(() => enderecos.id).notNull(),
  metodoPagamento: metodoPagamentoEnum('metodo_pagamento').notNull(),
  cartaoId: uuid('cartao_id').references(() => cartoesPagamento.id),
  status: statusPedidoEnum('status').default('pendente').notNull(),
  subtotal: integer('subtotal').notNull(), // em centavos
  taxaEntrega: integer('taxa_entrega').notNull(), // em centavos
  desconto: integer('desconto').default(0).notNull(), // em centavos
  total: integer('total').notNull(), // em centavos
  cupomId: uuid('cupom_id').references(() => cupons.id),
  tempoEntrega: text('tempo_entrega'), // Ex: "20-40 minutos"
  agendadoPara: timestamp('agendado_para'), // Se o pedido foi agendado
  observacoes: text('observacoes'), // Observações do cliente
  instrucoesEntrega: text('instrucoes_entrega'), // Instruções para o entregador
  entregadorId: uuid('entregador_id').references(() => usuarios.id), // Entregador designado
  latitudeEntrega: decimal('latitude_entrega', { precision: 10, scale: 8 }),
  longitudeEntrega: decimal('longitude_entrega', { precision: 11, scale: 8 }),
  confirmadoEm: timestamp('confirmado_em'),
  preparandoEm: timestamp('preparando_em'),
  saiuParaEntregaEm: timestamp('saiu_para_entrega_em'),
  entregueEm: timestamp('entregue_em'),
  canceladoEm: timestamp('cancelado_em'),
  motivoCancelamento: text('motivo_cancelamento'),
  canceladoPor: uuid('cancelado_por').references(() => usuarios.id), // Quem cancelou (cliente ou admin)
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  numeroPedidoIdx: index('idx_pedidos_numero').on(table.numeroPedido),
  usuarioIdx: index('idx_pedidos_usuario').on(table.usuarioId),
  statusIdx: index('idx_pedidos_status').on(table.status),
  dataIdx: index('idx_pedidos_data').on(table.criadoEm),
}));

/**
 * Itens do pedido
 */
export const itensPedido = pgTable('itens_pedido', {
  id: uuid('id').defaultRandom().primaryKey(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'cascade' }).notNull(),
  produtoId: uuid('produto_id').references(() => produtos.id).notNull(),
  nomeProduto: text('nome_produto').notNull(), // Snapshot do nome no momento da compra
  quantidade: integer('quantidade').notNull(),
  precoUnitario: integer('preco_unitario').notNull(), // em centavos (snapshot)
  precoTotal: integer('preco_total').notNull(), // em centavos (quantidade * precoUnitario + personalizações)
  personalizacoes: jsonb('personalizacoes'), // Array de personalizações selecionadas
  observacoes: text('observacoes'), // Observações específicas do item
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  pedidoIdx: index('idx_itens_pedido_pedido').on(table.pedidoId),
  produtoIdx: index('idx_itens_pedido_produto').on(table.produtoId),
}));

/**
 * Histórico de status dos pedidos
 */
export const historicoStatusPedidos = pgTable('historico_status_pedidos', {
  id: uuid('id').defaultRandom().primaryKey(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'cascade' }).notNull(),
  statusAnterior: statusPedidoEnum('status_anterior'),
  statusNovo: statusPedidoEnum('status_novo').notNull(),
  observacoes: text('observacoes'),
  alteradoPor: uuid('alterado_por').references(() => usuarios.id), // Quem alterou
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  pedidoIdx: index('idx_historico_status_pedido').on(table.pedidoId),
  dataIdx: index('idx_historico_status_data').on(table.criadoEm),
}));

/**
 * Rastreamento de entrega (localização do entregador)
 */
export const rastreamentoEntrega = pgTable('rastreamento_entrega', {
  id: uuid('id').defaultRandom().primaryKey(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'cascade' }).notNull(),
  entregadorId: uuid('entregador_id').references(() => usuarios.id).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  velocidade: decimal('velocidade', { precision: 5, scale: 2 }), // km/h
  precisao: decimal('precisao', { precision: 5, scale: 2 }), // metros
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  pedidoIdx: index('idx_rastreamento_pedido').on(table.pedidoId),
  entregadorIdx: index('idx_rastreamento_entregador').on(table.entregadorId),
  dataIdx: index('idx_rastreamento_data').on(table.criadoEm),
}));

// ============================================================================
// TABELAS DE CARRINHO
// ============================================================================

/**
 * Carrinhos de compra (temporários)
 */
export const carrinhos = pgTable('carrinhos', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  cupomId: uuid('cupom_id').references(() => cupons.id),
  expiraEm: timestamp('expira_em'), // Carrinho expira após X horas
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_carrinhos_usuario').on(table.usuarioId),
}));

/**
 * Itens do carrinho
 */
export const itensCarrinho = pgTable('itens_carrinho', {
  id: uuid('id').defaultRandom().primaryKey(),
  carrinhoId: uuid('carrinho_id').references(() => carrinhos.id, { onDelete: 'cascade' }).notNull(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  quantidade: integer('quantidade').default(1).notNull(),
  personalizacoes: jsonb('personalizacoes'), // Array de personalizações selecionadas
  observacoes: text('observacoes'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  carrinhoIdx: index('idx_itens_carrinho_carrinho').on(table.carrinhoId),
  produtoIdx: index('idx_itens_carrinho_produto').on(table.produtoId),
  uniqueProdutoCarrinho: unique('unique_produto_carrinho').on(table.carrinhoId, table.produtoId),
}));

// ============================================================================
// TABELAS DE AVALIAÇÕES
// ============================================================================

/**
 * Avaliações de produtos
 */
export const avaliacoesProdutos = pgTable('avaliacoes_produtos', {
  id: uuid('id').defaultRandom().primaryKey(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id), // Opcional: relacionar com pedido
  nota: integer('nota').notNull(), // 1 a 5
  comentario: text('comentario'),
  imagens: jsonb('imagens'), // Array de URLs de imagens
  aprovado: boolean('aprovado').default(false).notNull(), // Moderação de avaliações
  aprovadoPor: uuid('aprovado_por').references(() => usuarios.id), // Admin que aprovou
  aprovadoEm: timestamp('aprovado_em'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  produtoIdx: index('idx_avaliacoes_produtos_produto').on(table.produtoId),
  usuarioIdx: index('idx_avaliacoes_produtos_usuario').on(table.usuarioId),
  aprovadoIdx: index('idx_avaliacoes_produtos_aprovado').on(table.aprovado),
}));

/**
 * Avaliações de pedidos/entrega
 */
export const avaliacoesPedidos = pgTable('avaliacoes_pedidos', {
  id: uuid('id').defaultRandom().primaryKey(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'cascade' }).notNull(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
  notaProdutos: integer('nota_produtos'), // 1 a 5
  notaEntrega: integer('nota_entrega'), // 1 a 5
  notaAtendimento: integer('nota_atendimento'), // 1 a 5
  comentario: text('comentario'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  pedidoIdx: index('idx_avaliacoes_pedidos_pedido').on(table.pedidoId),
  usuarioIdx: index('idx_avaliacoes_pedidos_usuario').on(table.usuarioId),
}));

// ============================================================================
// TABELAS DE FAVORITOS
// ============================================================================

/**
 * Produtos favoritos
 */
export const favoritos = pgTable('favoritos', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_favoritos_usuario').on(table.usuarioId),
  produtoIdx: index('idx_favoritos_produto').on(table.produtoId),
  uniqueUsuarioProduto: unique('unique_usuario_produto').on(table.usuarioId, table.produtoId),
}));

// ============================================================================
// TABELAS DE NOTIFICAÇÕES
// ============================================================================

/**
 * Notificações dos usuários
 */
export const notificacoes = pgTable('notificacoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  tipo: tipoNotificacaoEnum('tipo').notNull(),
  titulo: text('titulo').notNull(),
  mensagem: text('mensagem').notNull(),
  dados: jsonb('dados'), // Dados adicionais (ex: ID do pedido)
  lida: boolean('lida').default(false).notNull(),
  lidaEm: timestamp('lida_em'),
  enviadaPush: boolean('enviada_push').default(false).notNull(),
  enviadaEmail: boolean('enviada_email').default(false).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_notificacoes_usuario').on(table.usuarioId),
  lidaIdx: index('idx_notificacoes_lida').on(table.lida),
  tipoIdx: index('idx_notificacoes_tipo').on(table.tipo),
  dataIdx: index('idx_notificacoes_data').on(table.criadoEm),
}));

/**
 * Preferências de notificação dos usuários
 */
export const preferenciasNotificacao = pgTable('preferencias_notificacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull().unique(),
  atualizacoesPedido: boolean('atualizacoes_pedido').default(true).notNull(),
  promocoesOfertas: boolean('promocoes_ofertas').default(true).notNull(),
  novidadesProdutos: boolean('novidades_produtos').default(false).notNull(),
  notificacoesSistema: boolean('notificacoes_sistema').default(true).notNull(),
  pushAtivado: boolean('push_ativado').default(true).notNull(),
  emailAtivado: boolean('email_ativado').default(true).notNull(),
  smsAtivado: boolean('sms_ativado').default(false).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// ============================================================================
// TABELAS DE CONFIGURAÇÕES E PREFERÊNCIAS
// ============================================================================

/**
 * Preferências do usuário
 */
export const preferenciasUsuario = pgTable('preferencias_usuario', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull().unique(),
  idioma: text('idioma').default('pt-BR').notNull(),
  tema: text('tema').default('claro').notNull(), // 'claro', 'escuro', 'sistema'
  tamanhoFonte: text('tamanho_fonte').default('medio').notNull(), // 'pequeno', 'medio', 'grande'
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

/**
 * Configurações gerais do sistema (para admin)
 */
export const configuracoesSistema = pgTable('configuracoes_sistema', {
  id: uuid('id').defaultRandom().primaryKey(),
  chave: text('chave').notNull().unique(),
  valor: text('valor').notNull(),
  tipo: text('tipo').notNull(), // 'string', 'number', 'boolean', 'json'
  descricao: text('descricao'),
  categoria: text('categoria'), // 'geral', 'pagamento', 'entrega', 'notificacoes', etc.
  editavel: boolean('editavel').default(true).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  chaveIdx: index('idx_configuracoes_chave').on(table.chave),
  categoriaIdx: index('idx_configuracoes_categoria').on(table.categoria),
}));

// ============================================================================
// TABELAS DE GESTÃO E ADMINISTRAÇÃO
// ============================================================================

/**
 * Logs de ações do sistema (auditoria)
 */
export const logsAuditoria = pgTable('logs_auditoria', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id),
  acao: text('acao').notNull(), // 'criar', 'editar', 'deletar', 'visualizar', 'login', etc.
  entidade: text('entidade').notNull(), // 'produto', 'pedido', 'usuario', etc.
  entidadeId: uuid('entidade_id'),
  dadosAntigos: jsonb('dados_antigos'),
  dadosNovos: jsonb('dados_novos'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_logs_usuario').on(table.usuarioId),
  acaoIdx: index('idx_logs_acao').on(table.acao),
  entidadeIdx: index('idx_logs_entidade').on(table.entidade),
  dataIdx: index('idx_logs_data').on(table.criadoEm),
}));

/**
 * Banners e promoções (sliders da home)
 */
export const banners = pgTable('banners', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: text('titulo'),
  descricao: text('descricao'),
  imagemUrl: text('imagem_url').notNull(),
  linkTipo: text('link_tipo'), // 'produto', 'categoria', 'url', null
  linkId: uuid('link_id'), // ID do produto, categoria ou URL externa
  linkUrl: text('link_url'), // URL externa se linkTipo = 'url'
  ordem: integer('ordem').default(0).notNull(),
  ativo: boolean('ativo').default(true).notNull(),
  dataInicio: timestamp('data_inicio'),
  dataFim: timestamp('data_fim'),
  cliques: integer('cliques').default(0).notNull(),
  criadoPor: uuid('criado_por').references(() => usuarios.id),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  ativoIdx: index('idx_banners_ativo').on(table.ativo),
  ordemIdx: index('idx_banners_ordem').on(table.ordem),
}));

/**
 * Histórico de visualizações de produtos
 */
export const historicoVisualizacoes = pgTable('historico_visualizacoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_visualizacoes_usuario').on(table.usuarioId),
  produtoIdx: index('idx_visualizacoes_produto').on(table.produtoId),
  dataIdx: index('idx_visualizacoes_data').on(table.criadoEm),
}));

/**
 * Buscas realizadas (para analytics e sugestões)
 */
export const historicoBuscas = pgTable('historico_buscas', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }),
  termo: text('termo').notNull(),
  resultados: integer('resultados').default(0).notNull(),
  categoriaId: uuid('categoria_id').references(() => categorias.id),
  ipAddress: text('ip_address'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index('idx_buscas_usuario').on(table.usuarioId),
  termoIdx: index('idx_buscas_termo').on(table.termo),
  dataIdx: index('idx_buscas_data').on(table.criadoEm),
}));

/**
 * Stories (histórias como Instagram)
 */
export const stories = pgTable('stories', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: text('titulo'), // Texto exibido na parte inferior
  imagemUrl: text('imagem_url').notNull(),
  ordem: integer('ordem').default(0).notNull(), // Ordem de exibição
  ativo: boolean('ativo').default(true).notNull(),
  dataInicio: timestamp('data_inicio'),
  dataFim: timestamp('data_fim'), // Data de expiração do story
  visualizacoes: integer('visualizacoes').default(0).notNull(), // Contador de visualizações
  criadoPor: uuid('criado_por').references(() => usuarios.id),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
}, (table) => ({
  ativoIdx: index('idx_stories_ativo').on(table.ativo),
  ordemIdx: index('idx_stories_ordem').on(table.ordem),
  dataInicioIdx: index('idx_stories_data_inicio').on(table.dataInicio),
  dataFimIdx: index('idx_stories_data_fim').on(table.dataFim),
}));

// ============================================================================
// RELAÇÕES (RELATIONS)
// ============================================================================

// Usuários
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  enderecos: many(enderecos),
  cartoesPagamento: many(cartoesPagamento),
  pedidos: many(pedidos),
  favoritos: many(favoritos),
  avaliacoesProdutos: many(avaliacoesProdutos),
  avaliacoesPedidos: many(avaliacoesPedidos),
  notificacoes: many(notificacoes),
  tokensAutenticacao: many(tokensAutenticacao),
  codigosOtp: many(codigosOtp),
}));

// Endereços
export const enderecosRelations = relations(enderecos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [enderecos.usuarioId],
    references: [usuarios.id],
  }),
  pedidos: many(pedidos),
}));

// Cartões
export const cartoesPagamentoRelations = relations(cartoesPagamento, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [cartoesPagamento.usuarioId],
    references: [usuarios.id],
  }),
  pedidos: many(pedidos),
  transacoes: many(transacoesPagamento),
}));

// Categorias
export const categoriasRelations = relations(categorias, ({ many, one }) => ({
  produtos: many(produtos),
  cupons: many(cupons),
  criadoPorUsuario: one(usuarios, {
    fields: [categorias.criadoPor],
    references: [usuarios.id],
  }),
}));

// Produtos
export const produtosRelations = relations(produtos, ({ one, many }) => ({
  categoria: one(categorias, {
    fields: [produtos.categoriaId],
    references: [categorias.id],
  }),
  imagens: many(imagensProdutos),
  secoesPersonalizacao: many(secoesPersonalizacao),
  favoritos: many(favoritos),
  avaliacoes: many(avaliacoesProdutos),
  itensPedido: many(itensPedido),
  itensCarrinho: many(itensCarrinho),
  historicoPrecos: many(historicoPrecos),
  movimentacoesEstoque: many(movimentacoesEstoque),
  historicoVisualizacoes: many(historicoVisualizacoes),
  criadoPorUsuario: one(usuarios, {
    fields: [produtos.criadoPor],
    references: [usuarios.id],
  }),
}));

// Imagens de produtos
export const imagensProdutosRelations = relations(imagensProdutos, ({ one }) => ({
  produto: one(produtos, {
    fields: [imagensProdutos.produtoId],
    references: [produtos.id],
  }),
}));

// Seções de personalização
export const secoesPersonalizacaoRelations = relations(secoesPersonalizacao, ({ one, many }) => ({
  produto: one(produtos, {
    fields: [secoesPersonalizacao.produtoId],
    references: [produtos.id],
  }),
  opcoes: many(opcoesPersonalizacao),
}));

// Opções de personalização
export const opcoesPersonalizacaoRelations = relations(opcoesPersonalizacao, ({ one }) => ({
  secao: one(secoesPersonalizacao, {
    fields: [opcoesPersonalizacao.secaoId],
    references: [secoesPersonalizacao.id],
  }),
}));

// Cupons
export const cuponsRelations = relations(cupons, ({ one, many }) => ({
  categoria: one(categorias, {
    fields: [cupons.categoriaId],
    references: [categorias.id],
  }),
  produto: one(produtos, {
    fields: [cupons.produtoId],
    references: [produtos.id],
  }),
  pedidos: many(pedidos),
  usoCupons: many(usoCupons),
  carrinhos: many(carrinhos),
  criadoPorUsuario: one(usuarios, {
    fields: [cupons.criadoPor],
    references: [usuarios.id],
  }),
}));

// Uso de cupons
export const usoCuponsRelations = relations(usoCupons, ({ one }) => ({
  cupom: one(cupons, {
    fields: [usoCupons.cupomId],
    references: [cupons.id],
  }),
  pedido: one(pedidos, {
    fields: [usoCupons.pedidoId],
    references: [pedidos.id],
  }),
  usuario: one(usuarios, {
    fields: [usoCupons.usuarioId],
    references: [usuarios.id],
  }),
}));

// Pedidos
export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [pedidos.usuarioId],
    references: [usuarios.id],
  }),
  endereco: one(enderecos, {
    fields: [pedidos.enderecoId],
    references: [enderecos.id],
  }),
  cartao: one(cartoesPagamento, {
    fields: [pedidos.cartaoId],
    references: [cartoesPagamento.id],
  }),
  cupom: one(cupons, {
    fields: [pedidos.cupomId],
    references: [cupons.id],
  }),
  entregador: one(usuarios, {
    fields: [pedidos.entregadorId],
    references: [usuarios.id],
  }),
  itens: many(itensPedido),
  historicoStatus: many(historicoStatusPedidos),
  rastreamento: many(rastreamentoEntrega),
  transacoes: many(transacoesPagamento),
  avaliacoes: many(avaliacoesPedidos),
  usoCupons: many(usoCupons),
}));

// Itens do pedido
export const itensPedidoRelations = relations(itensPedido, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [itensPedido.pedidoId],
    references: [pedidos.id],
  }),
  produto: one(produtos, {
    fields: [itensPedido.produtoId],
    references: [produtos.id],
  }),
}));

// Histórico de status
export const historicoStatusPedidosRelations = relations(historicoStatusPedidos, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [historicoStatusPedidos.pedidoId],
    references: [pedidos.id],
  }),
  alteradoPorUsuario: one(usuarios, {
    fields: [historicoStatusPedidos.alteradoPor],
    references: [usuarios.id],
  }),
}));

// Rastreamento
export const rastreamentoEntregaRelations = relations(rastreamentoEntrega, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [rastreamentoEntrega.pedidoId],
    references: [pedidos.id],
  }),
  entregador: one(usuarios, {
    fields: [rastreamentoEntrega.entregadorId],
    references: [usuarios.id],
  }),
}));

// Carrinhos
export const carrinhosRelations = relations(carrinhos, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [carrinhos.usuarioId],
    references: [usuarios.id],
  }),
  cupom: one(cupons, {
    fields: [carrinhos.cupomId],
    references: [cupons.id],
  }),
  itens: many(itensCarrinho),
}));

// Itens do carrinho
export const itensCarrinhoRelations = relations(itensCarrinho, ({ one }) => ({
  carrinho: one(carrinhos, {
    fields: [itensCarrinho.carrinhoId],
    references: [carrinhos.id],
  }),
  produto: one(produtos, {
    fields: [itensCarrinho.produtoId],
    references: [produtos.id],
  }),
}));

// Avaliações de produtos
export const avaliacoesProdutosRelations = relations(avaliacoesProdutos, ({ one }) => ({
  produto: one(produtos, {
    fields: [avaliacoesProdutos.produtoId],
    references: [produtos.id],
  }),
  usuario: one(usuarios, {
    fields: [avaliacoesProdutos.usuarioId],
    references: [usuarios.id],
  }),
  pedido: one(pedidos, {
    fields: [avaliacoesProdutos.pedidoId],
    references: [pedidos.id],
  }),
  aprovadoPorUsuario: one(usuarios, {
    fields: [avaliacoesProdutos.aprovadoPor],
    references: [usuarios.id],
  }),
}));

// Avaliações de pedidos
export const avaliacoesPedidosRelations = relations(avaliacoesPedidos, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [avaliacoesPedidos.pedidoId],
    references: [pedidos.id],
  }),
  usuario: one(usuarios, {
    fields: [avaliacoesPedidos.usuarioId],
    references: [usuarios.id],
  }),
}));

// Favoritos
export const favoritosRelations = relations(favoritos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [favoritos.usuarioId],
    references: [usuarios.id],
  }),
  produto: one(produtos, {
    fields: [favoritos.produtoId],
    references: [produtos.id],
  }),
}));

// Notificações
export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [notificacoes.usuarioId],
    references: [usuarios.id],
  }),
}));

// Preferências de notificação
export const preferenciasNotificacaoRelations = relations(preferenciasNotificacao, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [preferenciasNotificacao.usuarioId],
    references: [usuarios.id],
  }),
}));

// Preferências do usuário
export const preferenciasUsuarioRelations = relations(preferenciasUsuario, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [preferenciasUsuario.usuarioId],
    references: [usuarios.id],
  }),
}));

// Transações
export const transacoesPagamentoRelations = relations(transacoesPagamento, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [transacoesPagamento.pedidoId],
    references: [pedidos.id],
  }),
  cartao: one(cartoesPagamento, {
    fields: [transacoesPagamento.cartaoId],
    references: [cartoesPagamento.id],
  }),
}));

// Histórico de preços
export const historicoPrecosRelations = relations(historicoPrecos, ({ one }) => ({
  produto: one(produtos, {
    fields: [historicoPrecos.produtoId],
    references: [produtos.id],
  }),
  alteradoPorUsuario: one(usuarios, {
    fields: [historicoPrecos.alteradoPor],
    references: [usuarios.id],
  }),
}));

// Movimentações de estoque
export const movimentacoesEstoqueRelations = relations(movimentacoesEstoque, ({ one }) => ({
  produto: one(produtos, {
    fields: [movimentacoesEstoque.produtoId],
    references: [produtos.id],
  }),
  responsavelUsuario: one(usuarios, {
    fields: [movimentacoesEstoque.responsavel],
    references: [usuarios.id],
  }),
}));

// Logs de auditoria
export const logsAuditoriaRelations = relations(logsAuditoria, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [logsAuditoria.usuarioId],
    references: [usuarios.id],
  }),
}));

// Banners
export const bannersRelations = relations(banners, ({ one }) => ({
  criadoPorUsuario: one(usuarios, {
    fields: [banners.criadoPor],
    references: [usuarios.id],
  }),
}));

// Histórico de visualizações
export const historicoVisualizacoesRelations = relations(historicoVisualizacoes, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [historicoVisualizacoes.usuarioId],
    references: [usuarios.id],
  }),
  produto: one(produtos, {
    fields: [historicoVisualizacoes.produtoId],
    references: [produtos.id],
  }),
}));

// Histórico de buscas
export const historicoBuscasRelations = relations(historicoBuscas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [historicoBuscas.usuarioId],
    references: [usuarios.id],
  }),
  categoria: one(categorias, {
    fields: [historicoBuscas.categoriaId],
    references: [categorias.id],
  }),
}));

// Stories
export const storiesRelations = relations(stories, ({ one }) => ({
  criadoPorUsuario: one(usuarios, {
    fields: [stories.criadoPor],
    references: [usuarios.id],
  }),
}));
