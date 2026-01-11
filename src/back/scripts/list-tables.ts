#!/usr/bin/env ts-node

/**
 * Script para listar todas as tabelas e enums do banco
 */

import { sql, closeConnection } from '../config/database';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listTables() {
  try {
    console.log('📋 Listando todas as tabelas do banco...\n');
    
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log(`Total: ${tables.length} tabelas\n`);
    (tables as Array<{ tablename: string }>).forEach((row, index) => {
      console.log(`${index + 1}. ${row.tablename}`);
    });

    console.log('\n📋 Listando todos os tipos ENUM do banco...\n');
    
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `;

    console.log(`Total: ${enums.length} enums\n`);
    (enums as Array<{ typname: string }>).forEach((row, index) => {
      console.log(`${index + 1}. ${row.typname}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

listTables()
  .then(async () => {
    await closeConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Erro fatal:', error);
    await closeConnection();
    process.exit(1);
  });

