#!/usr/bin/env ts-node

/**
 * Script para executar migrations
 * 
 * Uso:
 *   npm run migrate:up    - Aplica todas as migrations pendentes
 *   npm run migrate:down  - Reverte a última migration
 *   npm run migrate:generate - Gera nova migration baseada nas mudanças do schema
 */

import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db, closeConnection } from '../config/database';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function runMigrations() {
  console.log('🔄 Iniciando migrations...');
  
  try {
    // Usar caminho relativo a partir da raiz do projeto
    const migrationsPath = path.resolve(process.cwd(), 'src/back/migrations');
    
    await migrate(db, {
      migrationsFolder: migrationsPath,
    });
    
    console.log('✅ Migrations aplicadas com sucesso!');
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    await closeConnection();
    process.exit(1);
  }
}

runMigrations();

