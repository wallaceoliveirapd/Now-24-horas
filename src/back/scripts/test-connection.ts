#!/usr/bin/env ts-node

/**
 * Script para testar conexão com Neon
 * 
 * Uso:
 *   npm run db:test
 */

import { testConnection, getDatabaseInfo, closeConnection } from '../config/database';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🔌 Testando conexão com Neon...\n');
  
  try {
    const connected = await testConnection();
    
    if (connected) {
      const info = await getDatabaseInfo();
      console.log('\n📊 Informações do banco:');
      console.log('  - Versão:', info.version.split(' ')[0] + ' ' + info.version.split(' ')[1]);
      console.log('  - Database:', info.database);
      console.log('  - User:', info.user);
      console.log('\n✅ Conexão estabelecida com sucesso!');
    } else {
      console.log('\n❌ Falha ao conectar com o banco de dados');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro ao testar conexão:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

main();

