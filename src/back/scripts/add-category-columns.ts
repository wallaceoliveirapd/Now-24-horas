#!/usr/bin/env ts-node

/**
 * Script para adicionar colunas na tabela categorias
 * Executa SQL diretamente no banco de dados
 */

import { sql, closeConnection } from '../config/database';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function addCategoryColumns() {
  console.log('🔄 Adicionando colunas na tabela categorias...');
  
  try {
    // Verificar se as colunas já existem
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      AND column_name IN ('icone', 'principal', 'mostra_badge_desconto')
    `;
    
    const existingColumns = checkColumns.map((row: any) => row.column_name);
    console.log('📋 Colunas existentes:', existingColumns.length > 0 ? existingColumns.join(', ') : 'nenhuma');

    // Adicionar coluna icone (se não existir)
    if (!existingColumns.includes('icone')) {
      await sql`ALTER TABLE categorias ADD COLUMN icone text`;
      console.log('✅ Coluna icone adicionada');
    } else {
      console.log('ℹ️  Coluna icone já existe');
    }

    // Adicionar coluna principal (se não existir)
    if (!existingColumns.includes('principal')) {
      await sql`ALTER TABLE categorias ADD COLUMN principal boolean DEFAULT false NOT NULL`;
      console.log('✅ Coluna principal adicionada');
    } else {
      console.log('ℹ️  Coluna principal já existe');
    }

    // Adicionar coluna mostra_badge_desconto (se não existir)
    if (!existingColumns.includes('mostra_badge_desconto')) {
      await sql`ALTER TABLE categorias ADD COLUMN mostra_badge_desconto boolean DEFAULT false NOT NULL`;
      console.log('✅ Coluna mostra_badge_desconto adicionada');
    } else {
      console.log('ℹ️  Coluna mostra_badge_desconto já existe');
    }

    // Criar índice se não existir
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_categorias_principal ON categorias USING btree (principal)`;
      console.log('✅ Índice idx_categorias_principal criado/verificado');
    } catch (indexError: any) {
      if (indexError.message.includes('already exists')) {
        console.log('ℹ️  Índice idx_categorias_principal já existe');
      } else {
        throw indexError;
      }
    }
    
    console.log('\n✅ Todas as colunas foram verificadas/adicionadas com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

// Executar script
addCategoryColumns()
  .then(() => {
    console.log('✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

