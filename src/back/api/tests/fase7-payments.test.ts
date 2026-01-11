#!/usr/bin/env ts-node

/**
 * Testes da FASE 7 - Pagamentos
 * 
 * Uso:
 *   npm run api:test:fase7
 * 
 * Nota: Testes básicos de estrutura e validações.
 * Testes de integração com Mercado Pago requerem credenciais válidas.
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, cartoesPagamento } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase7() {
  console.log('🧪 Testando FASE 7 - Pagamentos\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-payments-${Date.now()}@test.com`;
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

    // Teste 1: Listar cartões vazios
    console.log('1️⃣  Testando GET /api/payment-cards (vazio)...');
    const emptyCardsResponse = await request(app)
      .get('/api/payment-cards')
      .set('Authorization', `Bearer ${authToken}`);
    const emptyCardsPassed = emptyCardsResponse.status === 200 &&
                            emptyCardsResponse.body.success === true &&
                            Array.isArray(emptyCardsResponse.body.data.cartoes);
    results.push({ 
      test: 'Listar cartões vazios', 
      passed: emptyCardsPassed,
      details: `Status: ${emptyCardsResponse.status}, Cartões: ${emptyCardsResponse.body.data?.cartoes?.length || 0}`
    });
    console.log(emptyCardsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Validar dados de cartão inválido
    console.log('\n2️⃣  Testando validação de cartão inválido...');
    const invalidCardResponse = await request(app)
      .post('/api/payment-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cardNumber: '123', // Inválido
        cardholderName: 'Test',
        cardExpirationMonth: '13', // Inválido
        cardExpirationYear: '2020', // Passado
        securityCode: '12', // Inválido
        identificationType: 'CPF',
        identificationNumber: '123',
      });
    const invalidCardPassed = invalidCardResponse.status === 400 &&
                             invalidCardResponse.body.success === false;
    results.push({ 
      test: 'Validar dados de cartão inválido', 
      passed: invalidCardPassed,
      details: `Status: ${invalidCardResponse.status}`
    });
    console.log(invalidCardPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Validar processamento de pagamento sem dados
    console.log('\n3️⃣  Testando POST /api/payments/process (sem dados)...');
    const invalidPaymentResponse = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    const invalidPaymentPassed = invalidPaymentResponse.status === 400 &&
                                invalidPaymentResponse.body.success === false;
    results.push({ 
      test: 'Validar processamento de pagamento sem dados', 
      passed: invalidPaymentPassed,
      details: `Status: ${invalidPaymentResponse.status}`
    });
    console.log(invalidPaymentPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Acesso sem autenticação
    console.log('\n4️⃣  Testando acesso sem autenticação...');
    const noAuthResponse = await request(app)
      .get('/api/payment-cards');
    const noAuthPassed = noAuthResponse.status === 401 &&
                        noAuthResponse.body.success === false;
    results.push({ 
      test: 'Acesso sem autenticação retorna 401', 
      passed: noAuthPassed,
      details: `Status: ${noAuthResponse.status}`
    });
    console.log(noAuthPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Endpoints existem
    console.log('\n5️⃣  Testando se endpoints existem...');
    let endpointsPassed = true;
    
    // Testar GET /api/payment-cards
    const getCardsResponse = await request(app)
      .get('/api/payment-cards')
      .set('Authorization', `Bearer ${authToken}`);
    if (getCardsResponse.status === 404) endpointsPassed = false;
    
    // Testar POST /api/payment-cards (vai falhar validação, mas endpoint existe)
    const postCardsResponse = await request(app)
      .post('/api/payment-cards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    if (postCardsResponse.status === 404) endpointsPassed = false;
    
    // Testar POST /api/payments/process (vai falhar validação, mas endpoint existe)
    const processResponse = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    if (processResponse.status === 404) endpointsPassed = false;
    
    // Testar POST /api/webhooks/mercadopago (endpoint público)
    const webhookResponse = await request(app)
      .post('/api/webhooks/mercadopago')
      .send({});
    if (webhookResponse.status === 404) endpointsPassed = false;

    results.push({ 
      test: 'Endpoints de pagamento existem', 
      passed: endpointsPassed,
      details: `Todos os endpoints respondem (não 404)`
    });
    console.log(endpointsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
    
    console.log('ℹ️  Nota: Testes de integração com Mercado Pago requerem:');
    console.log('   - Credenciais válidas configuradas');
    console.log('   - Ambiente de testes (sandbox)');
    console.log('   - Testes manuais ou com mocks\n');
    
    if (passed === total) {
      console.log('🎉 Todos os testes básicos da FASE 7 passaram!');
      console.log('✅ Estrutura da FASE 7 está pronta.\n');
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
      await db.delete(cartoesPagamento).where(eq(cartoesPagamento.usuarioId, testUserId));
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
  }
}

// Executar testes
testFase7();

