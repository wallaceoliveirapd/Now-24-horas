CREATE TABLE IF NOT EXISTS "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text,
	"imagem_url" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"data_inicio" timestamp,
	"data_fim" timestamp,
	"visualizacoes" integer DEFAULT 0 NOT NULL,
	"criado_por" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stories" ADD CONSTRAINT "stories_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stories_ativo" ON "stories" USING btree ("ativo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stories_ordem" ON "stories" USING btree ("ordem");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stories_data_inicio" ON "stories" USING btree ("data_inicio");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stories_data_fim" ON "stories" USING btree ("data_fim");