#!/usr/bin/env ts-node

/**
 * Testes da integração IBGE - FASE 2
 * 
 * Uso:
 *   npm run api:test:fase2-ibge
 */

import request from 'supertest';
import { createApp } from '../app';
import { ibgeService } from '../../services/ibge.service';

const app = createApp();

async function testIBGEIntegration() {
  console.log('🧪 Testando Integração IBGE - FASE 2\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  try {
    // Teste 1: Listar estados
    console.log('\n1️⃣  Testando Listar estados...');
    const estadosResponse = await request(app)
      .get('/api/addresses/estados');

    const estadosPassed =
      estadosResponse.status === 200 &&
      estadosResponse.body.success === true &&
      Array.isArray(estadosResponse.body.data?.estados) &&
      estadosResponse.body.data.estados.length > 0 &&
      estadosResponse.body.data.estados.some((e: any) => e.sigla === 'SP');

    results.push({
      test: 'Listar estados',
      passed: estadosPassed,
      details: `Status: ${estadosResponse.status}, Quantidade: ${estadosResponse.body.data?.estados?.length || 0}`,
    });
    console.log(estadosPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Buscar estado por sigla
    console.log('\n2️⃣  Testando Buscar estado por sigla (SP)...');
    const estadoResponse = await request(app)
      .get('/api/addresses/estados/SP');

    const estadoPassed =
      estadoResponse.status === 200 &&
      estadoResponse.body.success === true &&
      estadoResponse.body.data?.estado?.sigla === 'SP' &&
      estadoResponse.body.data.estado.nome === 'São Paulo';

    results.push({
      test: 'Buscar estado por sigla',
      passed: estadoPassed,
      details: `Status: ${estadoResponse.status}, Estado: ${estadoResponse.body.data?.estado?.nome || 'não encontrado'}`,
    });
    console.log(estadoPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Estado não encontrado
    console.log('\n3️⃣  Testando Estado não encontrado...');
    const estadoNotFoundResponse = await request(app)
      .get('/api/addresses/estados/XX');

    const estadoNotFoundPassed =
      estadoNotFoundResponse.status === 404 &&
      estadoNotFoundResponse.body.success === false &&
      estadoNotFoundResponse.body.error?.code === 'ESTADO_NOT_FOUND';

    results.push({
      test: 'Estado não encontrado',
      passed: estadoNotFoundPassed,
      details: `Status: ${estadoNotFoundResponse.status}`,
    });
    console.log(estadoNotFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Listar municípios por estado
    console.log('\n4️⃣  Testando Listar municípios por estado (SP)...');
    const municipiosResponse = await request(app)
      .get('/api/addresses/estados/SP/municipios');

    const municipiosPassed =
      municipiosResponse.status === 200 &&
      municipiosResponse.body.success === true &&
      Array.isArray(municipiosResponse.body.data?.municipios) &&
      municipiosResponse.body.data.municipios.length > 0 &&
      municipiosResponse.body.data.municipios.some((m: any) => m.nome === 'São Paulo');

    results.push({
      test: 'Listar municípios por estado',
      passed: municipiosPassed,
      details: `Status: ${municipiosResponse.status}, Quantidade: ${municipiosResponse.body.data?.municipios?.length || 0}`,
    });
    console.log(municipiosPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Municípios de estado não encontrado
    console.log('\n5️⃣  Testando Municípios de estado não encontrado...');
    const municipiosNotFoundResponse = await request(app)
      .get('/api/addresses/estados/XX/municipios');

    const municipiosNotFoundPassed =
      municipiosNotFoundResponse.status === 404 &&
      municipiosNotFoundResponse.body.success === false;

    results.push({
      test: 'Municípios de estado não encontrado',
      passed: municipiosNotFoundPassed,
      details: `Status: ${municipiosNotFoundResponse.status}`,
    });
    console.log(municipiosNotFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Formato de retorno de estados
    console.log('\n6️⃣  Testando Formato de retorno de estados...');
    const formatEstadosResponse = await request(app)
      .get('/api/addresses/estados');

    const formatEstadosPassed =
      formatEstadosResponse.status === 200 &&
      formatEstadosResponse.body.data?.estados &&
      formatEstadosResponse.body.data.estados.length > 0 &&
      typeof formatEstadosResponse.body.data.estados[0].id === 'number' &&
      typeof formatEstadosResponse.body.data.estados[0].sigla === 'string' &&
      typeof formatEstadosResponse.body.data.estados[0].nome === 'string' &&
      typeof formatEstadosResponse.body.data.estados[0].regiao === 'string';

    results.push({
      test: 'Formato de retorno de estados',
      passed: formatEstadosPassed,
      details: `Status: ${formatEstadosResponse.status}`,
    });
    console.log(formatEstadosPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Formato de retorno de municípios
    console.log('\n7️⃣  Testando Formato de retorno de municípios...');
    const formatMunicipiosResponse = await request(app)
      .get('/api/addresses/estados/PB/municipios');

    const formatMunicipiosPassed =
      formatMunicipiosResponse.status === 200 &&
      formatMunicipiosResponse.body.data?.municipios &&
      formatMunicipiosResponse.body.data.municipios.length > 0 &&
      typeof formatMunicipiosResponse.body.data.municipios[0].id === 'number' &&
      typeof formatMunicipiosResponse.body.data.municipios[0].nome === 'string' &&
      typeof formatMunicipiosResponse.body.data.municipios[0].estado === 'string';

    results.push({
      test: 'Formato de retorno de municípios',
      passed: formatMunicipiosPassed,
      details: `Status: ${formatMunicipiosResponse.status}`,
    });
    console.log(formatMunicipiosPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
      console.log('🎉 Todos os testes da integração IBGE passaram!');
      console.log('✅ Integração IBGE está funcionando.\n');
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
testIBGEIntegration();

