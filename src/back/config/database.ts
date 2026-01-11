import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Configurar WebSocket para Neon (necessário para serverless)
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

// Obter string de conexão do ambiente
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente. Crie um arquivo .env.local com DATABASE_URL.');
}

// Criar função de query do Neon
export const sql = neon(connectionString);

// Criar instância do Drizzle ORM
export const db = drizzle(sql);

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT NOW()`;
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Neon:', error);
    return false;
  }
}

// Função para obter informações do banco
export async function getDatabaseInfo() {
  const version = await sql`SELECT version()`;
  const currentDatabase = await sql`SELECT current_database()`;
  const currentUser = await sql`SELECT current_user`;
  
  return {
    version: (version[0] as { version: string }).version,
    database: (currentDatabase[0] as { current_database: string }).current_database,
    user: (currentUser[0] as { current_user: string }).current_user,
  };
}

// Função para fechar conexão (Neon serverless não precisa fechar explicitamente)
export async function closeConnection(): Promise<void> {
  console.log('🔌 Conexão com Neon (serverless não requer fechamento)');
}

