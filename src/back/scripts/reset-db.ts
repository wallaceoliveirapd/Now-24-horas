#!/usr/bin/env ts-node

/**
 * Script para resetar completamente o banco de dados
 * 
 * ATENÇÃO: Este script apaga TODAS as tabelas e dados do banco!
 * 
 * Uso:
 *   npm run db:reset
 */

import { sql, closeConnection } from '../config/database';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function resetDatabase() {
  console.log('⚠️  ATENÇÃO: Este script vai apagar TODAS as tabelas e dados do banco!');
  console.log('🔄 Iniciando reset completo do banco de dados...');

  try {
    // Usar pg diretamente para queries dinâmicas
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 1. Remover todas as views
    console.log('\n📋 Removendo views...');
    const views = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `);
    for (const row of views.rows) {
      try {
        await pool.query(`DROP VIEW IF EXISTS "${row.table_name}" CASCADE`);
        console.log(`✅ View ${row.table_name} removida`);
      } catch (error: any) {
        // Ignorar erros
      }
    }

    // 2. Remover todas as tabelas (incluindo as do schema drizzle)
    console.log('\n📋 Removendo tabelas...');
    const existingTables = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname IN ('public', 'drizzle')
      ORDER BY schemaname, tablename
    `);

    console.log(`   Encontradas ${existingTables.rows.length} tabelas`);

    for (const row of existingTables.rows) {
      try {
        const schema = row.schemaname || 'public';
        const table = row.tablename;
        if (schema === 'public') {
          await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`✅ Tabela ${table} removida`);
        } else {
          await pool.query(`DROP TABLE IF EXISTS "${schema}"."${table}" CASCADE`);
          console.log(`✅ Tabela ${schema}.${table} removida`);
        }
      } catch (error: any) {
        console.log(`⚠️  Erro ao remover ${row.schemaname}.${row.tablename}:`, error.message);
      }
    }

    // 3. Remover todas as sequences
    console.log('\n📋 Removendo sequences...');
    const sequences = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    for (const row of sequences.rows) {
      try {
        await pool.query(`DROP SEQUENCE IF EXISTS "${row.sequence_name}" CASCADE`);
        console.log(`✅ Sequence ${row.sequence_name} removida`);
      } catch (error: any) {
        // Ignorar erros
      }
    }

    // 4. Remover todos os tipos ENUM
    console.log('\n📋 Removendo tipos ENUM...');
    const existingEnums = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `);

    console.log(`   Encontrados ${existingEnums.rows.length} enums`);

    for (const row of existingEnums.rows) {
      try {
        await pool.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
        console.log(`✅ Enum ${row.typname} removido`);
      } catch (error: any) {
        console.log(`⚠️  Erro ao remover enum ${row.typname}:`, error.message);
      }
    }

    // 5. Remover schemas extras (como drizzle)
    console.log('\n📋 Removendo schemas extras...');
    try {
      await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
      console.log('✅ Schema drizzle removido');
    } catch (error: any) {
      // Ignorar se não existir
    }

    // 6. Remover funções customizadas (se houver)
    console.log('\n📋 Removendo funções customizadas...');
    const functions = await pool.query(`
      SELECT proname, oidvectortypes(proargtypes) as args
      FROM pg_proc
      INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
      WHERE pg_namespace.nspname = 'public'
      AND proname NOT LIKE 'pg_%'
    `);
    for (const row of functions.rows) {
      try {
        await pool.query(`DROP FUNCTION IF EXISTS "${row.proname}"(${row.args}) CASCADE`);
        console.log(`✅ Função ${row.proname} removida`);
      } catch (error: any) {
        // Ignorar erros
      }
    }

    // Fechar conexão do pool
    await pool.end();

    console.log('✅ Banco de dados resetado com sucesso!');
    console.log('💡 Agora você pode executar: npm run db:migrate');
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  }
}

resetDatabase()
  .then(async () => {
    console.log('🎉 Reset concluído!');
    await closeConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Erro fatal no reset:', error);
    await closeConnection();
    process.exit(1);
  });

