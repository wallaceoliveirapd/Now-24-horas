#!/usr/bin/env ts-node

/**
 * Testes da integração ViaCEP - FASE 2
 * 
 * Uso:
 *   npm run api:test:fase2-cep
 */

import request from 'supertest';
import { createApp } from '../app';
import { cepService } from '../../services/cep.service';

const app = createApp();

async function testCepIntegration() {
  console.log('🧪 Testando Integração ViaCEP - FASE 2\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  try {
    // Teste 1: Buscar CEP válido via endpoint
    console.log('\n1️⃣  Testando Buscar CEP válido via endpoint...');
    const validCepResponse = await request(app)
      .get('/api/addresses/cep/01001000')
      .set('Authorization', 'Bearer fake-token'); // Endpoint não requer auth

    // Remover autenticação do endpoint de CEP (é público)
    const validCepPassed =
      validCepResponse.status === 200 &&
      validCepResponse.body.success === true &&
      validCepResponse.body.data?.rua &&
      validCepResponse.body.data?.cidade === 'São Paulo';

    results.push({
      test: 'Buscar CEP válido via endpoint',
      passed: validCepPassed,
      details: `Status: ${validCepResponse.status}, Cidade: ${validCepResponse.body.data?.cidade || 'não encontrada'}`,
    });
    console.log(validCepPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Buscar CEP válido via serviço
    console.log('\n2️⃣  Testando Buscar CEP válido via serviço...');
    try {
      const dadosCep = await cepService.buscarCep('01310100');
      const servicePassed =
        dadosCep !== null &&
        dadosCep.logradouro !== '' &&
        dadosCep.localidade === 'São Paulo';

      results.push({
        test: 'Buscar CEP válido via serviço',
        passed: servicePassed,
        details: `CEP encontrado: ${servicePassed}, Cidade: ${dadosCep?.localidade || 'não encontrada'}`,
      });
      console.log(servicePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } catch (error) {
      results.push({
        test: 'Buscar CEP válido via serviço',
        passed: false,
        details: `Erro: ${error}`,
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 3: CEP válido fornecido pelo usuário (58053015)
    console.log('\n3️⃣  Testando CEP válido fornecido (58053015)...');
    const validUserCepResponse = await request(app)
      .get('/api/addresses/cep/58053015');

    const validUserCepPassed =
      validUserCepResponse.status === 200 &&
      validUserCepResponse.body.success === true &&
      validUserCepResponse.body.data?.cidade;

    results.push({
      test: 'CEP válido fornecido (58053015)',
      passed: validUserCepPassed,
      details: `Status: ${validUserCepResponse.status}, Cidade: ${validUserCepResponse.body.data?.cidade || 'não encontrada'}`,
    });
    console.log(validUserCepPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: CEP não encontrado
    console.log('\n4️⃣  Testando CEP não encontrado...');
    const notFoundResponse = await request(app)
      .get('/api/addresses/cep/99999999');

    const notFoundPassed =
      notFoundResponse.status === 404 &&
      notFoundResponse.body.success === false &&
      notFoundResponse.body.error?.code === 'CEP_NOT_FOUND';

    results.push({
      test: 'CEP não encontrado',
      passed: notFoundPassed,
      details: `Status: ${notFoundResponse.status}`,
    });
    console.log(notFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: CEP inválido (formato errado)
    console.log('\n5️⃣  Testando CEP inválido (formato errado)...');
    const invalidFormatResponse = await request(app)
      .get('/api/addresses/cep/123');

    const invalidFormatPassed =
      invalidFormatResponse.status === 400 &&
      invalidFormatResponse.body.error?.code === 'INVALID_CEP_FORMAT';

    results.push({
      test: 'CEP inválido (formato errado)',
      passed: invalidFormatPassed,
      details: `Status: ${invalidFormatResponse.status}`,
    });
    console.log(invalidFormatPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: CEP com formatação (com hífen)
    console.log('\n6️⃣  Testando CEP com formatação (com hífen)...');
    const formattedCepResponse = await request(app)
      .get('/api/addresses/cep/01001-000');

    const formattedCepPassed =
      formattedCepResponse.status === 200 &&
      formattedCepResponse.body.success === true;

    results.push({
      test: 'CEP com formatação (com hífen)',
      passed: formattedCepPassed,
      details: `Status: ${formattedCepResponse.status}`,
    });
    console.log(formattedCepPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Formato de retorno correto
    console.log('\n7️⃣  Testando Formato de retorno correto...');
    const formatResponse = await request(app)
      .get('/api/addresses/cep/01310100');

    const formatPassed =
      formatResponse.status === 200 &&
      formatResponse.body.success === true &&
      formatResponse.body.data &&
      typeof formatResponse.body.data.cep === 'string' &&
      typeof formatResponse.body.data.rua === 'string' &&
      typeof formatResponse.body.data.bairro === 'string' &&
      typeof formatResponse.body.data.cidade === 'string' &&
      typeof formatResponse.body.data.estado === 'string';

    results.push({
      test: 'Formato de retorno correto',
      passed: formatPassed,
      details: `Status: ${formatResponse.status}, Campos presentes: ${formatPassed}`,
    });
    console.log(formatPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMO DOS TESTES\n');

    const passed = results.filter((r) => r.passed).length;
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
      console.log('🎉 Todos os testes da integração ViaCEP passaram!');
      console.log('✅ Integração ViaCEP está funcionando.\n');
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
testCepIntegration();

