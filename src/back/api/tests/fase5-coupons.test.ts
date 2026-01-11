#!/usr/bin/env ts-node

/**
 * Testes da FASE 5 - Cupons
 * 
 * Uso:
 *   npm run api:test:fase5
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, cupons } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase5() {
  console.log('🧪 Testando FASE 5 - Cupons\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;
  let couponId: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-coupons-${Date.now()}@test.com`;
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

    // Criar cupom de teste
    const couponCode = `TEST${Date.now()}`;
    const [coupon] = await db
      .insert(cupons)
      .values({
        codigo: couponCode,
        descricao: 'Cupom de teste FASE 5',
        tipoDesconto: 'percentual',
        valorDesconto: 10,
        validoDe: new Date(Date.now() - 86400000), // Ontem
        validoAte: new Date(Date.now() + 86400000), // Amanhã
        limiteUso: 100,
        limiteUsoPorUsuario: 1,
        ativo: true,
      })
      .returning();

    couponId = coupon.id;
    console.log('✅ Dados de teste criados\n');

    // Teste 1: Listar cupons disponíveis
    console.log('1️⃣  Testando GET /api/coupons...');
    const listResponse = await request(app).get('/api/coupons');
    const listPassed = listResponse.status === 200 &&
                      listResponse.body.success === true &&
                      Array.isArray(listResponse.body.data.cupons);
    results.push({ 
      test: 'Listar cupons disponíveis', 
      passed: listPassed,
      details: `Status: ${listResponse.status}, Cupons: ${listResponse.body.data?.cupons?.length || 0}`
    });
    console.log(listPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Obter cupom por código
    console.log('\n2️⃣  Testando GET /api/coupons/:codigo...');
    const getCouponResponse = await request(app).get(`/api/coupons/${couponCode}`);
    const getCouponPassed = getCouponResponse.status === 200 &&
                           getCouponResponse.body.success === true &&
                           getCouponResponse.body.data.cupom?.codigo === couponCode;
    results.push({ 
      test: 'Obter cupom por código', 
      passed: getCouponPassed,
      details: `Status: ${getCouponResponse.status}, Código: ${getCouponResponse.body.data?.cupom?.codigo}`
    });
    console.log(getCouponPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Cupom inexistente
    console.log('\n3️⃣  Testando cupom inexistente...');
    const notFoundResponse = await request(app).get('/api/coupons/INVALIDO123');
    const notFoundPassed = notFoundResponse.status === 404 &&
                          notFoundResponse.body.success === false &&
                          notFoundResponse.body.error?.code === 'COUPON_NOT_FOUND';
    results.push({ 
      test: 'Cupom inexistente retorna 404', 
      passed: notFoundPassed,
      details: `Status: ${notFoundResponse.status}, Code: ${notFoundResponse.body.error?.code}`
    });
    console.log(notFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Validar cupom válido
    console.log('\n4️⃣  Testando POST /api/coupons/validate (cupom válido)...');
    const validateResponse = await request(app)
      .post('/api/coupons/validate')
      .send({
        codigo: couponCode,
        valorPedido: 10000, // R$ 100,00
      });
    const validatePassed = validateResponse.status === 200 &&
                          validateResponse.body.success === true &&
                          validateResponse.body.data?.cupom !== null;
    results.push({ 
      test: 'Validar cupom válido', 
      passed: validatePassed,
      details: `Status: ${validateResponse.status}, Cupom válido: ${!!validateResponse.body.data?.cupom}`
    });
    console.log(validatePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Validar cupom inválido
    console.log('\n5️⃣  Testando POST /api/coupons/validate (cupom inválido)...');
    const invalidValidateResponse = await request(app)
      .post('/api/coupons/validate')
      .send({
        codigo: 'INVALIDO123',
      });
    const invalidValidatePassed = invalidValidateResponse.status === 404 &&
                                invalidValidateResponse.body.success === false;
    results.push({ 
      test: 'Validar cupom inválido', 
      passed: invalidValidatePassed,
      details: `Status: ${invalidValidateResponse.status}`
    });
    console.log(invalidValidatePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Validar cupom expirado
    console.log('\n6️⃣  Testando cupom expirado...');
    // Criar cupom expirado
    const [expiredCoupon] = await db
      .insert(cupons)
      .values({
        codigo: `EXPIRED${Date.now()}`,
        descricao: 'Cupom expirado',
        tipoDesconto: 'percentual',
        valorDesconto: 10,
        validoDe: new Date(Date.now() - 172800000), // 2 dias atrás
        validoAte: new Date(Date.now() - 86400000), // Ontem
        limiteUso: 100,
        limiteUsoPorUsuario: 1,
        ativo: true,
      })
      .returning();

    const expiredResponse = await request(app)
      .post('/api/coupons/validate')
      .send({
        codigo: expiredCoupon.codigo,
      });
    const expiredPassed = expiredResponse.status === 400 &&
                         expiredResponse.body.success === false &&
                         expiredResponse.body.error?.code === 'COUPON_EXPIRED';
    results.push({ 
      test: 'Validar cupom expirado', 
      passed: expiredPassed,
      details: `Status: ${expiredResponse.status}, Code: ${expiredResponse.body.error?.code}`
    });
    console.log(expiredPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Limpar cupom expirado
    await db.delete(cupons).where(eq(cupons.id, expiredCoupon.id));

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
      console.log('🎉 Todos os testes da FASE 5 passaram!');
      console.log('✅ FASE 5 está pronta.\n');
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
    if (couponId) {
      await db.delete(cupons).where(eq(cupons.id, couponId));
    }
    if (testUserId) {
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
  }
}

// Executar testes
testFase5();

