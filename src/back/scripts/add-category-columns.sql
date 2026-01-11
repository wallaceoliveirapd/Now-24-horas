-- Script para adicionar colunas na tabela categorias
-- Execute este script diretamente no banco de dados se a migration não funcionar

-- Adicionar coluna icone (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categorias' AND column_name = 'icone') THEN
        ALTER TABLE categorias ADD COLUMN icone text;
    END IF;
END $$;

-- Adicionar coluna principal (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categorias' AND column_name = 'principal') THEN
        ALTER TABLE categorias ADD COLUMN principal boolean DEFAULT false NOT NULL;
    END IF;
END $$;

-- Adicionar coluna mostra_badge_desconto (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categorias' AND column_name = 'mostra_badge_desconto') THEN
        ALTER TABLE categorias ADD COLUMN mostra_badge_desconto boolean DEFAULT false NOT NULL;
    END IF;
END $$;

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_categorias_principal ON categorias USING btree (principal);

