ALTER TABLE "categorias" ADD COLUMN "icone" text;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "principal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "categorias" ADD COLUMN "mostra_badge_desconto" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categorias_principal" ON "categorias" USING btree ("principal");