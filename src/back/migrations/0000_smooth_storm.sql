DO $$ BEGIN
 CREATE TYPE "public"."metodo_pagamento" AS ENUM('cartao_credito', 'cartao_debito', 'pix', 'boleto');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status_estoque" AS ENUM('disponivel', 'baixo_estoque', 'indisponivel', 'descontinuado');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status_pedido" AS ENUM('pendente', 'aguardando_pagamento', 'confirmado', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado', 'reembolsado');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_desconto" AS ENUM('fixo', 'percentual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_endereco" AS ENUM('casa', 'trabalho', 'outro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_notificacao" AS ENUM('pedido', 'promocao', 'sistema', 'pagamento', 'entrega');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_personalizacao" AS ENUM('unica_escolha', 'multipla_escolha');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tipo_usuario" AS ENUM('cliente', 'administrador', 'entregador', 'gerente');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "avaliacoes_pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"nota_produtos" integer,
	"nota_entrega" integer,
	"nota_atendimento" integer,
	"comentario" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "avaliacoes_produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"pedido_id" uuid,
	"nota" integer NOT NULL,
	"comentario" text,
	"imagens" jsonb,
	"aprovado" boolean DEFAULT false NOT NULL,
	"aprovado_por" uuid,
	"aprovado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text,
	"descricao" text,
	"imagem_url" text NOT NULL,
	"link_tipo" text,
	"link_id" uuid,
	"link_url" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"data_inicio" timestamp,
	"data_fim" timestamp,
	"cliques" integer DEFAULT 0 NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carrinhos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"cupom_id" uuid,
	"expira_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cartoes_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tipo" "metodo_pagamento" NOT NULL,
	"ultimos_digitos" text NOT NULL,
	"nome_cartao" text,
	"bandeira" text,
	"mes_validade" integer,
	"ano_validade" integer,
	"cartao_padrao" boolean DEFAULT false NOT NULL,
	"token_gateway" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"imagem_url" text,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categorias_nome_unique" UNIQUE("nome"),
	CONSTRAINT "categorias_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "codigos_otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"telefone" text NOT NULL,
	"codigo" text NOT NULL,
	"tipo" text NOT NULL,
	"usado" boolean DEFAULT false NOT NULL,
	"expira_em" timestamp NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "configuracoes_sistema" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chave" text NOT NULL,
	"valor" text NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text,
	"categoria" text,
	"editavel" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configuracoes_sistema_chave_unique" UNIQUE("chave")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"descricao" text NOT NULL,
	"tipo_desconto" "tipo_desconto" NOT NULL,
	"valor_desconto" integer NOT NULL,
	"valor_minimo_pedido" integer,
	"valor_maximo_desconto" integer,
	"desconto_entrega" boolean DEFAULT false NOT NULL,
	"entrega_obrigatoria" boolean DEFAULT false NOT NULL,
	"categoria_id" uuid,
	"produto_id" uuid,
	"valido_de" timestamp NOT NULL,
	"valido_ate" timestamp NOT NULL,
	"limite_uso" integer,
	"limite_uso_por_usuario" integer DEFAULT 1 NOT NULL,
	"quantidade_usada" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cupons_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enderecos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tipo" "tipo_endereco" NOT NULL,
	"rua" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"cep" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"endereco_padrao" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favoritos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_usuario_produto" UNIQUE("usuario_id","produto_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historico_buscas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"termo" text NOT NULL,
	"resultados" integer DEFAULT 0 NOT NULL,
	"categoria_id" uuid,
	"ip_address" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historico_precos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"preco_anterior" integer NOT NULL,
	"preco_novo" integer NOT NULL,
	"motivo" text,
	"alterado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historico_status_pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"status_anterior" "status_pedido",
	"status_novo" "status_pedido" NOT NULL,
	"observacoes" text,
	"alterado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "historico_visualizacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"produto_id" uuid NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "imagens_produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"url" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"alt" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "itens_carrinho" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrinho_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"personalizacoes" jsonb,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_produto_carrinho" UNIQUE("carrinho_id","produto_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "itens_pedido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"produto_id" uuid NOT NULL,
	"nome_produto" text NOT NULL,
	"quantidade" integer NOT NULL,
	"preco_unitario" integer NOT NULL,
	"preco_total" integer NOT NULL,
	"personalizacoes" jsonb,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs_auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"acao" text NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" uuid,
	"dados_antigos" jsonb,
	"dados_novos" jsonb,
	"ip_address" text,
	"user_agent" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movimentacoes_estoque" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"quantidade" integer NOT NULL,
	"quantidade_anterior" integer NOT NULL,
	"quantidade_nova" integer NOT NULL,
	"motivo" text,
	"referencia" text,
	"responsavel" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notificacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tipo" "tipo_notificacao" NOT NULL,
	"titulo" text NOT NULL,
	"mensagem" text NOT NULL,
	"dados" jsonb,
	"lida" boolean DEFAULT false NOT NULL,
	"lida_em" timestamp,
	"enviada_push" boolean DEFAULT false NOT NULL,
	"enviada_email" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opcoes_personalizacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"secao_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"preco_adicional" integer DEFAULT 0 NOT NULL,
	"estoque" integer,
	"ativo" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_pedido" text NOT NULL,
	"usuario_id" uuid NOT NULL,
	"endereco_id" uuid NOT NULL,
	"metodo_pagamento" "metodo_pagamento" NOT NULL,
	"cartao_id" uuid,
	"status" "status_pedido" DEFAULT 'pendente' NOT NULL,
	"subtotal" integer NOT NULL,
	"taxa_entrega" integer NOT NULL,
	"desconto" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"cupom_id" uuid,
	"tempo_entrega" text,
	"agendado_para" timestamp,
	"observacoes" text,
	"instrucoes_entrega" text,
	"entregador_id" uuid,
	"latitude_entrega" numeric(10, 8),
	"longitude_entrega" numeric(11, 8),
	"confirmado_em" timestamp,
	"preparando_em" timestamp,
	"saiu_para_entrega_em" timestamp,
	"entregue_em" timestamp,
	"cancelado_em" timestamp,
	"motivo_cancelamento" text,
	"cancelado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_numero_pedido_unique" UNIQUE("numero_pedido")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferencias_notificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"atualizacoes_pedido" boolean DEFAULT true NOT NULL,
	"promocoes_ofertas" boolean DEFAULT true NOT NULL,
	"novidades_produtos" boolean DEFAULT false NOT NULL,
	"notificacoes_sistema" boolean DEFAULT true NOT NULL,
	"push_ativado" boolean DEFAULT true NOT NULL,
	"email_ativado" boolean DEFAULT true NOT NULL,
	"sms_ativado" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "preferencias_notificacao_usuario_id_unique" UNIQUE("usuario_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferencias_usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"idioma" text DEFAULT 'pt-BR' NOT NULL,
	"tema" text DEFAULT 'claro' NOT NULL,
	"tamanho_fonte" text DEFAULT 'medio' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "preferencias_usuario_usuario_id_unique" UNIQUE("usuario_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "produtos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoria_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"descricao_completa" text,
	"imagem_principal" text,
	"preco_base" integer NOT NULL,
	"preco_final" integer NOT NULL,
	"valor_desconto" integer DEFAULT 0 NOT NULL,
	"estoque" integer DEFAULT 0 NOT NULL,
	"estoque_minimo" integer DEFAULT 5 NOT NULL,
	"status_estoque" "status_estoque" DEFAULT 'disponivel' NOT NULL,
	"unidade_medida" text,
	"peso" numeric(8, 2),
	"dimensoes" jsonb,
	"codigo_barras" text,
	"sku" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"em_oferta" boolean DEFAULT false NOT NULL,
	"mais_popular" boolean DEFAULT false NOT NULL,
	"novidade" boolean DEFAULT false NOT NULL,
	"avaliacao_media" numeric(3, 2) DEFAULT '0.00',
	"quantidade_avaliacoes" integer DEFAULT 0 NOT NULL,
	"visualizacoes" integer DEFAULT 0 NOT NULL,
	"vendas" integer DEFAULT 0 NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	"publicado_em" timestamp,
	CONSTRAINT "produtos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "produtos_codigo_barras_unique" UNIQUE("codigo_barras"),
	CONSTRAINT "produtos_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rastreamento_entrega" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"entregador_id" uuid NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"velocidade" numeric(5, 2),
	"precisao" numeric(5, 2),
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "secoes_personalizacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"tipo" "tipo_personalizacao" NOT NULL,
	"obrigatorio" boolean DEFAULT false NOT NULL,
	"selecao_minima" integer DEFAULT 0 NOT NULL,
	"selecao_maxima" integer,
	"permite_quantidade" boolean DEFAULT false NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens_autenticacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expira_em" timestamp NOT NULL,
	"dispositivo" text,
	"ip_address" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_autenticacao_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transacoes_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"metodo_pagamento" "metodo_pagamento" NOT NULL,
	"cartao_id" uuid,
	"valor" integer NOT NULL,
	"status" text NOT NULL,
	"id_gateway" text,
	"codigo_autorizacao" text,
	"parcelas" integer DEFAULT 1 NOT NULL,
	"dados_transacao" jsonb,
	"processado_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "uso_cupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cupom_id" uuid NOT NULL,
	"pedido_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"valor_desconto_aplicado" integer NOT NULL,
	"valor_pedido" integer NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"telefone" text NOT NULL,
	"nome_completo" text NOT NULL,
	"cpf" text,
	"senha_hash" text NOT NULL,
	"tipo_usuario" "tipo_usuario" DEFAULT 'cliente' NOT NULL,
	"foto_perfil" text,
	"email_verificado" boolean DEFAULT false NOT NULL,
	"telefone_verificado" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"ultimo_acesso" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "usuarios_telefone_unique" UNIQUE("telefone"),
	CONSTRAINT "usuarios_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_pedidos" ADD CONSTRAINT "avaliacoes_pedidos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_pedidos" ADD CONSTRAINT "avaliacoes_pedidos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_produtos" ADD CONSTRAINT "avaliacoes_produtos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_produtos" ADD CONSTRAINT "avaliacoes_produtos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_produtos" ADD CONSTRAINT "avaliacoes_produtos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "avaliacoes_produtos" ADD CONSTRAINT "avaliacoes_produtos_aprovado_por_usuarios_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "banners" ADD CONSTRAINT "banners_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carrinhos" ADD CONSTRAINT "carrinhos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carrinhos" ADD CONSTRAINT "carrinhos_cupom_id_cupons_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cartoes_pagamento" ADD CONSTRAINT "cartoes_pagamento_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categorias" ADD CONSTRAINT "categorias_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "codigos_otp" ADD CONSTRAINT "codigos_otp_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cupons" ADD CONSTRAINT "cupons_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cupons" ADD CONSTRAINT "cupons_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cupons" ADD CONSTRAINT "cupons_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_buscas" ADD CONSTRAINT "historico_buscas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_buscas" ADD CONSTRAINT "historico_buscas_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_precos" ADD CONSTRAINT "historico_precos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_precos" ADD CONSTRAINT "historico_precos_alterado_por_usuarios_id_fk" FOREIGN KEY ("alterado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_status_pedidos" ADD CONSTRAINT "historico_status_pedidos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_status_pedidos" ADD CONSTRAINT "historico_status_pedidos_alterado_por_usuarios_id_fk" FOREIGN KEY ("alterado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_visualizacoes" ADD CONSTRAINT "historico_visualizacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "historico_visualizacoes" ADD CONSTRAINT "historico_visualizacoes_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "imagens_produtos" ADD CONSTRAINT "imagens_produtos_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itens_carrinho" ADD CONSTRAINT "itens_carrinho_carrinho_id_carrinhos_id_fk" FOREIGN KEY ("carrinho_id") REFERENCES "public"."carrinhos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itens_carrinho" ADD CONSTRAINT "itens_carrinho_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_responsavel_usuarios_id_fk" FOREIGN KEY ("responsavel") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opcoes_personalizacao" ADD CONSTRAINT "opcoes_personalizacao_secao_id_secoes_personalizacao_id_fk" FOREIGN KEY ("secao_id") REFERENCES "public"."secoes_personalizacao"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_endereco_id_enderecos_id_fk" FOREIGN KEY ("endereco_id") REFERENCES "public"."enderecos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cartao_id_cartoes_pagamento_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes_pagamento"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cupom_id_cupons_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_entregador_id_usuarios_id_fk" FOREIGN KEY ("entregador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cancelado_por_usuarios_id_fk" FOREIGN KEY ("cancelado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preferencias_notificacao" ADD CONSTRAINT "preferencias_notificacao_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preferencias_usuario" ADD CONSTRAINT "preferencias_usuario_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "produtos" ADD CONSTRAINT "produtos_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rastreamento_entrega" ADD CONSTRAINT "rastreamento_entrega_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rastreamento_entrega" ADD CONSTRAINT "rastreamento_entrega_entregador_id_usuarios_id_fk" FOREIGN KEY ("entregador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secoes_personalizacao" ADD CONSTRAINT "secoes_personalizacao_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens_autenticacao" ADD CONSTRAINT "tokens_autenticacao_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transacoes_pagamento" ADD CONSTRAINT "transacoes_pagamento_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transacoes_pagamento" ADD CONSTRAINT "transacoes_pagamento_cartao_id_cartoes_pagamento_id_fk" FOREIGN KEY ("cartao_id") REFERENCES "public"."cartoes_pagamento"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "uso_cupons" ADD CONSTRAINT "uso_cupons_cupom_id_cupons_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "uso_cupons" ADD CONSTRAINT "uso_cupons_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "uso_cupons" ADD CONSTRAINT "uso_cupons_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_pedidos_pedido" ON "avaliacoes_pedidos" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_pedidos_usuario" ON "avaliacoes_pedidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_produtos_produto" ON "avaliacoes_produtos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_produtos_usuario" ON "avaliacoes_produtos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_avaliacoes_produtos_aprovado" ON "avaliacoes_produtos" USING btree ("aprovado");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_banners_ativo" ON "banners" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_banners_ordem" ON "banners" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carrinhos_usuario" ON "carrinhos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cartoes_usuario" ON "cartoes_pagamento" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categorias_slug" ON "categorias" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categorias_ordem" ON "categorias" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_otp_telefone_codigo" ON "codigos_otp" USING btree ("telefone","codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_configuracoes_chave" ON "configuracoes_sistema" USING btree ("chave");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_configuracoes_categoria" ON "configuracoes_sistema" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cupons_codigo" ON "cupons" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cupons_ativo" ON "cupons" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cupons_validade" ON "cupons" USING btree ("valido_de","valido_ate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enderecos_usuario" ON "enderecos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_enderecos_cep" ON "enderecos" USING btree ("cep");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favoritos_usuario" ON "favoritos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_favoritos_produto" ON "favoritos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_buscas_usuario" ON "historico_buscas" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_buscas_termo" ON "historico_buscas" USING btree ("termo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_buscas_data" ON "historico_buscas" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_historico_precos_produto" ON "historico_precos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_historico_precos_data" ON "historico_precos" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_historico_status_pedido" ON "historico_status_pedidos" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_historico_status_data" ON "historico_status_pedidos" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visualizacoes_usuario" ON "historico_visualizacoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visualizacoes_produto" ON "historico_visualizacoes" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visualizacoes_data" ON "historico_visualizacoes" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_imagens_produto" ON "imagens_produtos" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_imagens_ordem" ON "imagens_produtos" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_itens_carrinho_carrinho" ON "itens_carrinho" USING btree ("carrinho_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_itens_carrinho_produto" ON "itens_carrinho" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_itens_pedido_pedido" ON "itens_pedido" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_itens_pedido_produto" ON "itens_pedido" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_usuario" ON "logs_auditoria" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_acao" ON "logs_auditoria" USING btree ("acao");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_entidade" ON "logs_auditoria" USING btree ("entidade");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_data" ON "logs_auditoria" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_movimentacoes_produto" ON "movimentacoes_estoque" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_movimentacoes_tipo" ON "movimentacoes_estoque" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_movimentacoes_data" ON "movimentacoes_estoque" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notificacoes_usuario" ON "notificacoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notificacoes_lida" ON "notificacoes" USING btree ("lida");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notificacoes_tipo" ON "notificacoes" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notificacoes_data" ON "notificacoes" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opcoes_secao" ON "opcoes_personalizacao" USING btree ("secao_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opcoes_ordem" ON "opcoes_personalizacao" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pedidos_numero" ON "pedidos" USING btree ("numero_pedido");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pedidos_usuario" ON "pedidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pedidos_status" ON "pedidos" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pedidos_data" ON "pedidos" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_categoria" ON "produtos" USING btree ("categoria_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_slug" ON "produtos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_ativo" ON "produtos" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_oferta" ON "produtos" USING btree ("em_oferta");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_popular" ON "produtos" USING btree ("mais_popular");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_codigo_barras" ON "produtos" USING btree ("codigo_barras");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_produtos_sku" ON "produtos" USING btree ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rastreamento_pedido" ON "rastreamento_entrega" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rastreamento_entregador" ON "rastreamento_entrega" USING btree ("entregador_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rastreamento_data" ON "rastreamento_entrega" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_secoes_produto" ON "secoes_personalizacao" USING btree ("produto_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_secoes_ordem" ON "secoes_personalizacao" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tokens_usuario" ON "tokens_autenticacao" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tokens_token" ON "tokens_autenticacao" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transacoes_pedido" ON "transacoes_pagamento" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transacoes_status" ON "transacoes_pagamento" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uso_cupons_cupom" ON "uso_cupons" USING btree ("cupom_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uso_cupons_pedido" ON "uso_cupons" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uso_cupons_usuario" ON "uso_cupons" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usuarios_email" ON "usuarios" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usuarios_telefone" ON "usuarios" USING btree ("telefone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usuarios_tipo" ON "usuarios" USING btree ("tipo_usuario");