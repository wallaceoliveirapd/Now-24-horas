#!/usr/bin/env ts-node

/**
 * Runner de testes manual para a API
 * 
 * Uso:
 *   npm run api:test:fase1.1
 */

import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

async function testFase1_1() {
  console.log('🧪 Testando FASE 1.1 - Configuração Base da API\n');
  console.log('=' .repeat(60));
  
  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  try {
    // Teste 1: Health Check
    console.log('\n1️⃣  Testando Health Check...');
    const healthResponse = await request(app).get('/health');
    const healthPassed = healthResponse.status === 200 && healthResponse.body.success === true;
    results.push({ 
      test: 'Health Check', 
      passed: healthPassed,
      details: `Status: ${healthResponse.status}, Success: ${healthResponse.body.success}`
    });
    console.log(healthPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    if (!healthPassed) console.log(`   Detalhes: ${JSON.stringify(healthResponse.body)}`);

    // Teste 2: Rotas de teste - Auth
    console.log('\n2️⃣  Testando Rota /api/auth/test...');
    const authResponse = await request(app).get('/api/auth/test');
    const authPassed = authResponse.status === 200 && authResponse.body.success === true;
    results.push({ 
      test: 'Rota /api/auth/test', 
      passed: authPassed,
      details: `Status: ${authResponse.status}`
    });
    console.log(authPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Rotas de teste - User
    console.log('\n3️⃣  Testando Rota /api/users/test...');
    const userResponse = await request(app).get('/api/users/test');
    const userPassed = userResponse.status === 200 && userResponse.body.success === true;
    results.push({ 
      test: 'Rota /api/users/test', 
      passed: userPassed,
      details: `Status: ${userResponse.status}`
    });
    console.log(userPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: 404 Handler
    console.log('\n4️⃣  Testando 404 Handler...');
    const notFoundResponse = await request(app).get('/api/rota-inexistente-12345');
    const notFoundPassed = notFoundResponse.status === 404 && 
                           notFoundResponse.body.success === false &&
                           notFoundResponse.body.error?.code === 'NOT_FOUND';
    results.push({ 
      test: '404 Handler', 
      passed: notFoundPassed,
      details: `Status: ${notFoundResponse.status}, Code: ${notFoundResponse.body.error?.code}`
    });
    console.log(notFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: CORS Headers
    console.log('\n5️⃣  Testando CORS Headers...');
    const corsResponse = await request(app)
      .options('/health')
      .set('Origin', 'http://localhost:19006');
    const corsPassed = !!corsResponse.headers['access-control-allow-origin'];
    results.push({ 
      test: 'CORS Headers', 
      passed: corsPassed,
      details: `Header presente: ${!!corsResponse.headers['access-control-allow-origin']}`
    });
    console.log(corsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Security Headers (Helmet)
    console.log('\n6️⃣  Testando Security Headers (Helmet)...');
    const securityResponse = await request(app).get('/health');
    const securityPassed = securityResponse.headers['x-content-type-options'] === 'nosniff';
    results.push({ 
      test: 'Security Headers', 
      passed: securityPassed,
      details: `X-Content-Type-Options: ${securityResponse.headers['x-content-type-options']}`
    });
    console.log(securityPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: JSON Parser
    console.log('\n7️⃣  Testando JSON Parser...');
    const jsonResponse = await request(app)
      .post('/api/test-json-parser')
      .send({ test: 'data', number: 123 })
      .set('Content-Type', 'application/json');
    // Não deve retornar erro de parsing (mesmo que retorne 404)
    const jsonPassed = jsonResponse.status !== 500 && !jsonResponse.text.includes('Unexpected token');
    results.push({ 
      test: 'JSON Parser', 
      passed: jsonPassed,
      details: `Status: ${jsonResponse.status} (não deve ser 500 por erro de parsing)`
    });
    console.log(jsonPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 8: Error Handler Format
    console.log('\n8️⃣  Testando Formato de Erro...');
    const errorResponse = await request(app).get('/api/rota-inexistente-12345');
    const errorFormatPassed = errorResponse.body.success === false &&
                              errorResponse.body.error &&
                              errorResponse.body.error.code &&
                              errorResponse.body.error.message;
    results.push({ 
      test: 'Formato de Erro', 
      passed: errorFormatPassed,
      details: `Tem success: ${errorResponse.body.success}, Tem error.code: ${!!errorResponse.body.error?.code}`
    });
    console.log(errorFormatPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
      console.log('🎉 Todos os testes da FASE 1.1 passaram!');
      console.log('✅ FASE 1.1 está pronta para produção.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Alguns testes falharam. Revise a implementação.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error);
    process.exit(1);
  }
}

// Executar testes
testFase1_1();

