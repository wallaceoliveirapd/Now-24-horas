#!/usr/bin/env ts-node

/**
 * Testes da FASE 1.2 - Registro de Usuário
 * 
 * Uso:
 *   npm run api:test:fase1.2
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, codigosOtp } from '../../models/schema';
import { eq } from 'drizzle-orm';

const app = createApp();

async function testFase1_2() {
  console.log('🧪 Testando FASE 1.2 - Registro de Usuário\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;

  try {
    // Limpar dados de teste anteriores
    await db.delete(usuarios).where(eq(usuarios.email, 'teste@registro.com'));
    await db.delete(codigosOtp).where(eq(codigosOtp.telefone, '83999999999'));

    // Teste 1: Registro com dados válidos
    console.log('\n1️⃣  Testando Registro com dados válidos...');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nomeCompleto: 'Usuário Teste',
        email: 'teste@registro.com',
        telefone: '(83) 99999-9999',
        senha: 'Senha123',
        cpf: '123.456.789-00',
      })
      .set('Content-Type', 'application/json');

    const registerPassed =
      registerResponse.status === 201 &&
      registerResponse.body.success === true &&
      registerResponse.body.data?.id &&
      registerResponse.body.data?.email === 'teste@registro.com';

    if (registerPassed) {
      testUserId = registerResponse.body.data.id;
    }

    results.push({
      test: 'Registro com dados válidos',
      passed: registerPassed,
      details: `Status: ${registerResponse.status}, ID: ${testUserId || 'não criado'}`,
    });
    console.log(registerPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    if (!registerPassed) {
      console.log(`   Resposta: ${JSON.stringify(registerResponse.body)}`);
    }

    // Teste 2: Validação - Email inválido
    console.log('\n2️⃣  Testando Validação - Email inválido...');
    const invalidEmailResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nomeCompleto: 'Usuário Teste',
        email: 'email-invalido',
        telefone: '(83) 99999-9999',
        senha: 'Senha123',
      });

    const invalidEmailPassed =
      invalidEmailResponse.status === 400 &&
      invalidEmailResponse.body.success === false &&
      invalidEmailResponse.body.error?.code === 'VALIDATION_ERROR';

    results.push({
      test: 'Validação - Email inválido',
      passed: invalidEmailPassed,
      details: `Status: ${invalidEmailResponse.status}`,
    });
    console.log(invalidEmailPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Validação - Senha fraca
    console.log('\n3️⃣  Testando Validação - Senha fraca...');
    const weakPasswordResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nomeCompleto: 'Usuário Teste',
        email: 'teste2@registro.com',
        telefone: '(83) 88888-8888',
        senha: '123', // Senha muito curta
      });

    const weakPasswordPassed =
      weakPasswordResponse.status === 400 &&
      weakPasswordResponse.body.success === false;

    results.push({
      test: 'Validação - Senha fraca',
      passed: weakPasswordPassed,
      details: `Status: ${weakPasswordResponse.status}`,
    });
    console.log(weakPasswordPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Email duplicado
    console.log('\n4️⃣  Testando Email duplicado...');
    const duplicateEmailResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nomeCompleto: 'Outro Usuário',
        email: 'teste@registro.com', // Mesmo email do teste 1
        telefone: '(83) 77777-7777',
        senha: 'Senha123',
      });

    const duplicateEmailPassed =
      duplicateEmailResponse.status === 409 &&
      duplicateEmailResponse.body.success === false &&
      duplicateEmailResponse.body.error?.code === 'EMAIL_ALREADY_EXISTS';

    results.push({
      test: 'Email duplicado',
      passed: duplicateEmailPassed,
      details: `Status: ${duplicateEmailResponse.status}`,
    });
    console.log(duplicateEmailPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Telefone duplicado
    console.log('\n5️⃣  Testando Telefone duplicado...');
    const duplicatePhoneResponse = await request(app)
      .post('/api/auth/register')
      .send({
        nomeCompleto: 'Outro Usuário',
        email: 'outro@registro.com',
        telefone: '(83) 99999-9999', // Mesmo telefone do teste 1
        senha: 'Senha123',
      });

    const duplicatePhonePassed =
      duplicatePhoneResponse.status === 409 &&
      duplicatePhoneResponse.body.error?.code === 'PHONE_ALREADY_EXISTS';

    results.push({
      test: 'Telefone duplicado',
      passed: duplicatePhonePassed,
      details: `Status: ${duplicatePhoneResponse.status}`,
    });
    console.log(duplicatePhonePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Verificar se OTP foi gerado
    console.log('\n6️⃣  Testando Geração de OTP...');
    const otpCodes = await db
      .select()
      .from(codigosOtp)
      .where(eq(codigosOtp.telefone, '83999999999'))
      .limit(1);

    const otpGeneratedPassed = otpCodes.length > 0 && otpCodes[0].codigo.length === 6;

    results.push({
      test: 'Geração de OTP',
      passed: otpGeneratedPassed,
      details: `OTP encontrado: ${otpGeneratedPassed}`,
    });
    console.log(otpGeneratedPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Verificar se senha foi hasheada
    console.log('\n7️⃣  Testando Hash de senha...');
    if (testUserId) {
      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, testUserId))
        .limit(1);

      const senhaHasheadaPassed =
        usuario &&
        usuario.senhaHash !== 'Senha123' &&
        usuario.senhaHash.length > 20; // Bcrypt hash tem pelo menos 20 caracteres

      results.push({
        test: 'Hash de senha',
        passed: senhaHasheadaPassed,
        details: `Hash diferente da senha original: ${senhaHasheadaPassed}`,
      });
      console.log(senhaHasheadaPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Hash de senha',
        passed: false,
        details: 'Usuário não foi criado no teste anterior',
      });
      console.log('   ❌ FALHOU (usuário não criado)');
    }

    // Teste 8: Verificar dados do usuário criado
    console.log('\n8️⃣  Testando Dados do usuário criado...');
    if (testUserId) {
      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, testUserId))
        .limit(1);

      const dadosCorretosPassed =
        usuario &&
        usuario.email === 'teste@registro.com' &&
        usuario.telefone === '83999999999' &&
        usuario.nomeCompleto === 'Usuário Teste' &&
        usuario.tipoUsuario === 'cliente' &&
        usuario.emailVerificado === false &&
        usuario.telefoneVerificado === false;

      results.push({
        test: 'Dados do usuário criado',
        passed: dadosCorretosPassed,
        details: `Todos os campos corretos: ${dadosCorretosPassed}`,
      });
      console.log(dadosCorretosPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Dados do usuário criado',
        passed: false,
        details: 'Usuário não foi criado',
      });
      console.log('   ❌ FALHOU (usuário não criado)');
    }

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

    // Limpar dados de teste
    if (testUserId) {
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
      await db.delete(codigosOtp).where(eq(codigosOtp.telefone, '83999999999'));
    }

    if (passed === total) {
      console.log('🎉 Todos os testes da FASE 1.2 passaram!');
      console.log('✅ FASE 1.2 está pronta.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Alguns testes falharam. Revise a implementação.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error);
    
    // Limpar dados em caso de erro
    if (testUserId) {
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
    
    process.exit(1);
  }
}

// Executar testes
testFase1_2();

