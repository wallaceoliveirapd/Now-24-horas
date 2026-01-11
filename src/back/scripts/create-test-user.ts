#!/usr/bin/env ts-node

/**
 * Script para criar usuário cliente de teste
 * 
 * Uso:
 *   npm run db:create-test-user
 */

import { db, closeConnection } from '../config/database';
import { usuarios } from '../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTestUser() {
  console.log('👤 Criando usuário cliente de teste...');

  try {
    // Verificar se usuário já existe
    const existingUser = await db.select().from(usuarios).where(
      eq(usuarios.email, 'cliente@teste.com')
    ).limit(1);

    if (existingUser.length > 0) {
      console.log('⚠️  Usuário cliente@teste.com já existe.');
      console.log('💡 Para recriar, delete o usuário manualmente primeiro.');
      return;
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash('cliente123', 10);

    // Criar usuário cliente
    const [testUser] = await db.insert(usuarios).values({
      email: 'cliente@teste.com',
      telefone: '(83) 98888-8888',
      nomeCompleto: 'Cliente Teste',
      cpf: '123.456.789-00',
      senhaHash: hashedPassword,
      tipoUsuario: 'cliente',
      emailVerificado: true,
      telefoneVerificado: true,
      ativo: true,
    }).returning();

    console.log('✅ Usuário cliente criado com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('   Email: cliente@teste.com');
    console.log('   Senha: cliente123');
    console.log('   Telefone: (83) 98888-8888');
    console.log(`   ID: ${testUser.id}`);
    console.log('\n💡 Use essas credenciais para testar o login no app.');

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    throw error;
  }
}

createTestUser()
  .then(async () => {
    console.log('🎉 Script concluído!');
    await closeConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Erro fatal:', error);
    await closeConnection();
    process.exit(1);
  });

