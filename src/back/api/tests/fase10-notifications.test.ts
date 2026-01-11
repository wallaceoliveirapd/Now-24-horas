#!/usr/bin/env ts-node

/**
 * Testes da FASE 10 - Notificações
 * 
 * Uso:
 *   npm run api:test:fase10
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, notificacoes, preferenciasNotificacao } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase10() {
  console.log('🧪 Testando FASE 10 - Notificações\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;
  let notificationId: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-notifications-${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    const [user] = await db
      .insert(usuarios)
      .values({
        email,
        senhaHash: hashedPassword,
        nomeCompleto: 'Test User',
        telefone: `551199999${Math.floor(Math.random() * 10000)}`,
        telefoneVerificado: true,
        ativo: true,
      })
      .returning();

    testUserId = user.id;

    // Fazer login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        emailOuTelefone: email,
        senha: 'Test123!@#',
      });

    if (loginResponse.status !== 200 || !loginResponse.body.data?.tokens?.accessToken) {
      throw new Error(`Login falhou: ${JSON.stringify(loginResponse.body)}`);
    }

    authToken = loginResponse.body.data.tokens.accessToken;
    console.log('✅ Usuário criado e autenticado\n');

    // Criar notificação de teste
    const [notification] = await db
      .insert(notificacoes)
      .values({
        usuarioId: testUserId,
        tipo: 'sistema',
        titulo: 'Notificação de Teste',
        mensagem: 'Esta é uma notificação de teste',
        lida: false,
        enviadaPush: false,
        enviadaEmail: false,
      })
      .returning();

    notificationId = notification.id;
    console.log('✅ Dados de teste criados\n');

    // Teste 1: Listar notificações
    console.log('1️⃣  Testando GET /api/notifications...');
    const listResponse = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`);
    const listPassed = listResponse.status === 200 &&
                      listResponse.body.success === true &&
                      Array.isArray(listResponse.body.data.notificacoes);
    results.push({ 
      test: 'Listar notificações', 
      passed: listPassed,
      details: `Status: ${listResponse.status}, Notificações: ${listResponse.body.data?.notificacoes?.length || 0}`
    });
    console.log(listPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Contador de não lidas
    console.log('\n2️⃣  Testando GET /api/notifications/unread-count...');
    const countResponse = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${authToken}`);
    const countPassed = countResponse.status === 200 &&
                       countResponse.body.success === true &&
                       typeof countResponse.body.data.total === 'number';
    results.push({ 
      test: 'Obter contador de não lidas', 
      passed: countPassed,
      details: `Status: ${countResponse.status}, Total: ${countResponse.body.data?.total}`
    });
    console.log(countPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Marcar notificação como lida
    if (notificationId) {
      console.log('\n3️⃣  Testando PATCH /api/notifications/:id/read...');
      const markReadResponse = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);
      const markReadPassed = markReadResponse.status === 200 &&
                            markReadResponse.body.success === true &&
                            markReadResponse.body.data.notificacao?.lida === true;
      results.push({ 
        test: 'Marcar notificação como lida', 
        passed: markReadPassed,
        details: `Status: ${markReadResponse.status}, Lida: ${markReadResponse.body.data?.notificacao?.lida}`
      });
      console.log(markReadPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Marcar notificação como lida', passed: false, details: 'Notificação não foi criada' });
      console.log('   ⚠️  PULADO (notificação não criada)');
    }

    // Teste 4: Criar mais notificações para testar marcar todas como lidas
    console.log('\n4️⃣  Testando PATCH /api/notifications/read-all...');
    await db
      .insert(notificacoes)
      .values([
        {
          usuarioId: testUserId,
          tipo: 'sistema',
          titulo: 'Notificação 1',
          mensagem: 'Mensagem 1',
          lida: false,
        },
        {
          usuarioId: testUserId,
          tipo: 'sistema',
          titulo: 'Notificação 2',
          mensagem: 'Mensagem 2',
          lida: false,
        },
      ]);

    const markAllReadResponse = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${authToken}`);
    const markAllReadPassed = markAllReadResponse.status === 200 &&
                             markAllReadResponse.body.success === true;
    
    // Verificar que todas foram marcadas como lidas
    const verifyCountResponse = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${authToken}`);
    const verifyCountPassed = verifyCountResponse.body.data.total === 0;
    
    const finalPassed = markAllReadPassed && verifyCountPassed;
    results.push({ 
      test: 'Marcar todas como lidas', 
      passed: finalPassed,
      details: `Status: ${markAllReadResponse.status}, Não lidas restantes: ${verifyCountResponse.body.data?.total}`
    });
    console.log(finalPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Obter preferências (criação automática)
    console.log('\n5️⃣  Testando GET /api/notifications/preferences...');
    const getPrefsResponse = await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', `Bearer ${authToken}`);
    const getPrefsPassed = getPrefsResponse.status === 200 &&
                          getPrefsResponse.body.success === true &&
                          getPrefsResponse.body.data.preferencias !== null;
    results.push({ 
      test: 'Obter preferências de notificação', 
      passed: getPrefsPassed,
      details: `Status: ${getPrefsResponse.status}, Preferências criadas: ${!!getPrefsResponse.body.data?.preferencias}`
    });
    console.log(getPrefsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Atualizar preferências
    console.log('\n6️⃣  Testando PUT /api/notifications/preferences...');
    const updatePrefsResponse = await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        promocoesOfertas: false,
        pushAtivado: false,
      });
    const updatePrefsPassed = updatePrefsResponse.status === 200 &&
                             updatePrefsResponse.body.success === true &&
                             updatePrefsResponse.body.data.preferencias?.promocoesOfertas === false &&
                             updatePrefsResponse.body.data.preferencias?.pushAtivado === false;
    results.push({ 
      test: 'Atualizar preferências de notificação', 
      passed: updatePrefsPassed,
      details: `Status: ${updatePrefsResponse.status}, Promoções: ${updatePrefsResponse.body.data?.preferencias?.promocoesOfertas}, Push: ${updatePrefsResponse.body.data?.preferencias?.pushAtivado}`
    });
    console.log(updatePrefsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Acesso sem autenticação
    console.log('\n7️⃣  Testando acesso sem autenticação...');
    const noAuthResponse = await request(app)
      .get('/api/notifications');
    const noAuthPassed = noAuthResponse.status === 401 &&
                        noAuthResponse.body.success === false;
    results.push({ 
      test: 'Acesso sem autenticação retorna 401', 
      passed: noAuthPassed,
      details: `Status: ${noAuthResponse.status}`
    });
    console.log(noAuthPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO DOS TESTES\n');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${result.test}`);
      if (!result.passed && result.details) {
        console.log(`   ${result.details}`);
      }
    });
    
    console.log(`\n📈 Resultado: ${passed}/${total} testes passaram\n`);
    
    if (passed === total) {
      console.log('🎉 Todos os testes da FASE 10 passaram!');
      console.log('✅ FASE 10 está pronta.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Alguns testes falharam. Revise a implementação.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error);
    process.exit(1);
  } finally {
    // Limpar dados de teste
    if (testUserId) {
      await db.delete(notificacoes).where(eq(notificacoes.usuarioId, testUserId));
      await db.delete(preferenciasNotificacao).where(eq(preferenciasNotificacao.usuarioId, testUserId));
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
  }
}

// Executar testes
testFase10();

