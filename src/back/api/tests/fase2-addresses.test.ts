#!/usr/bin/env ts-node

/**
 * Testes da FASE 2 - Endereços
 * 
 * Uso:
 *   npm run api:test:fase2
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, enderecos } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { jwtService } from '../../services/jwt.service';

const app = createApp();

async function testFase2() {
  console.log('🧪 Testando FASE 2 - Endereços\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let accessToken: string | null = null;
  let testAddressId: string | null = null;

  try {
    // Limpar dados de teste anteriores
    await db.delete(usuarios).where(eq(usuarios.email, 'endereco@teste.com'));

    // Criar usuário de teste
    const senhaHash = await bcrypt.hash('Senha123', 10);
    const [usuario] = await db
      .insert(usuarios)
      .values({
        email: 'endereco@teste.com',
        telefone: '83977777777',
        nomeCompleto: 'Usuário Endereço Teste',
        senhaHash,
        tipoUsuario: 'cliente',
        emailVerificado: true,
        telefoneVerificado: true,
        ativo: true,
      })
      .returning();

    testUserId = usuario.id;

    // Gerar token para autenticação
    const tokens = await jwtService.generateTokenPair({
      userId: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });
    accessToken = tokens.accessToken;

    // Teste 1: Criar endereço
    console.log('\n1️⃣  Testando Criar endereço...');
    const createResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipo: 'casa',
        rua: 'Rua Teste',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        enderecoPadrao: true,
      });

    const createPassed =
      createResponse.status === 201 &&
      createResponse.body.success === true &&
      createResponse.body.data?.address?.id;

    if (createPassed) {
      testAddressId = createResponse.body.data.address.id;
    }

    results.push({
      test: 'Criar endereço',
      passed: createPassed,
      details: `Status: ${createResponse.status}, ID: ${testAddressId || 'não criado'}`,
    });
    console.log(createPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Listar endereços
    console.log('\n2️⃣  Testando Listar endereços...');
    const listResponse = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${accessToken}`);

    const listPassed =
      listResponse.status === 200 &&
      listResponse.body.success === true &&
      Array.isArray(listResponse.body.data?.addresses) &&
      listResponse.body.data.addresses.length > 0;

    results.push({
      test: 'Listar endereços',
      passed: listPassed,
      details: `Status: ${listResponse.status}, Quantidade: ${listResponse.body.data?.addresses?.length || 0}`,
    });
    console.log(listPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Obter endereço específico
    console.log('\n3️⃣  Testando Obter endereço específico...');
    if (testAddressId) {
      const getResponse = await request(app)
        .get(`/api/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const getPassed =
        getResponse.status === 200 &&
        getResponse.body.success === true &&
        getResponse.body.data?.address?.id === testAddressId;

      results.push({
        test: 'Obter endereço específico',
        passed: getPassed,
        details: `Status: ${getResponse.status}`,
      });
      console.log(getPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Obter endereço específico',
        passed: false,
        details: 'Endereço não foi criado',
      });
      console.log('   ❌ FALHOU (endereço não criado)');
    }

    // Teste 4: Atualizar endereço
    console.log('\n4️⃣  Testando Atualizar endereço...');
    if (testAddressId) {
      const updateResponse = await request(app)
        .put(`/api/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          rua: 'Rua Atualizada',
          numero: '456',
        });

      const updatePassed =
        updateResponse.status === 200 &&
        updateResponse.body.success === true &&
        updateResponse.body.data?.address?.rua === 'Rua Atualizada';

      results.push({
        test: 'Atualizar endereço',
        passed: updatePassed,
        details: `Status: ${updateResponse.status}`,
      });
      console.log(updatePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Atualizar endereço',
        passed: false,
        details: 'Endereço não foi criado',
      });
      console.log('   ❌ FALHOU (endereço não criado)');
    }

    // Teste 5: Criar segundo endereço e definir como padrão
    console.log('\n5️⃣  Testando Definir endereço como padrão...');
    if (testAddressId) {
      // Criar segundo endereço
      const secondAddressResponse = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tipo: 'trabalho',
          rua: 'Rua Trabalho',
          numero: '789',
          bairro: 'Bairro Trabalho',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-890',
          enderecoPadrao: false,
        });

      if (secondAddressResponse.status === 201) {
        const secondAddressId = secondAddressResponse.body.data.address.id;

        // Definir como padrão
        const setDefaultResponse = await request(app)
          .patch(`/api/addresses/${secondAddressId}/set-default`)
          .set('Authorization', `Bearer ${accessToken}`);

        const setDefaultPassed =
          setDefaultResponse.status === 200 &&
          setDefaultResponse.body.success === true &&
          setDefaultResponse.body.data?.address?.enderecoPadrao === true;

        // Verificar se o primeiro endereço não é mais padrão
        const listAfterResponse = await request(app)
          .get('/api/addresses')
          .set('Authorization', `Bearer ${accessToken}`);

        const firstNotDefault = listAfterResponse.body.data?.addresses?.find(
          (a: any) => a.id === testAddressId
        )?.enderecoPadrao === false;

        results.push({
          test: 'Definir endereço como padrão',
          passed: setDefaultPassed && firstNotDefault,
          details: `Status: ${setDefaultResponse.status}, Primeiro não é mais padrão: ${firstNotDefault}`,
        });
        console.log(setDefaultPassed && firstNotDefault ? '   ✅ PASSOU' : '   ❌ FALHOU');
      } else {
        results.push({
          test: 'Definir endereço como padrão',
          passed: false,
          details: 'Não foi possível criar segundo endereço',
        });
        console.log('   ❌ FALHOU');
      }
    } else {
      results.push({
        test: 'Definir endereço como padrão',
        passed: false,
        details: 'Endereço não foi criado',
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 6: Validação - CEP inválido
    console.log('\n6️⃣  Testando Validação - CEP inválido...');
    const invalidCepResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipo: 'casa',
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '123', // CEP inválido
      });

    const invalidCepPassed =
      invalidCepResponse.status === 400 &&
      invalidCepResponse.body.success === false &&
      invalidCepResponse.body.error?.code === 'VALIDATION_ERROR';

    results.push({
      test: 'Validação - CEP inválido',
      passed: invalidCepPassed,
      details: `Status: ${invalidCepResponse.status}`,
    });
    console.log(invalidCepPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Validação - Estado inválido
    console.log('\n7️⃣  Testando Validação - Estado inválido...');
    const invalidStateResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipo: 'casa',
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SPA', // Estado inválido (deve ser 2 caracteres)
        cep: '01234-567',
      });

    const invalidStatePassed =
      invalidStateResponse.status === 400 &&
      invalidStateResponse.body.success === false;

    results.push({
      test: 'Validação - Estado inválido',
      passed: invalidStatePassed,
      details: `Status: ${invalidStateResponse.status}`,
    });
    console.log(invalidStatePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 8: Acesso sem autenticação
    console.log('\n8️⃣  Testando Acesso sem autenticação...');
    const noAuthResponse = await request(app).get('/api/addresses');

    const noAuthPassed =
      noAuthResponse.status === 401 &&
      noAuthResponse.body.success === false &&
      noAuthResponse.body.error?.code === 'AUTH_TOKEN_REQUIRED';

    results.push({
      test: 'Acesso sem autenticação',
      passed: noAuthPassed,
      details: `Status: ${noAuthResponse.status}`,
    });
    console.log(noAuthPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 9: Tentar acessar endereço de outro usuário
    console.log('\n9️⃣  Testando Acesso a endereço de outro usuário...');
    // Criar outro usuário
    const senhaHash2 = await bcrypt.hash('Senha123', 10);
    const [usuario2] = await db
      .insert(usuarios)
      .values({
        email: 'outro@teste.com',
        telefone: '83966666666',
        nomeCompleto: 'Outro Usuário',
        senhaHash: senhaHash2,
        tipoUsuario: 'cliente',
        emailVerificado: true,
        telefoneVerificado: true,
        ativo: true,
      })
      .returning();

    const tokens2 = await jwtService.generateTokenPair({
      userId: usuario2.id,
      email: usuario2.email,
      tipoUsuario: usuario2.tipoUsuario,
    });

    if (testAddressId) {
      const unauthorizedResponse = await request(app)
        .get(`/api/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${tokens2.accessToken}`);

      const unauthorizedPassed =
        unauthorizedResponse.status === 404 &&
        unauthorizedResponse.body.error?.code === 'ADDRESS_NOT_FOUND';

      results.push({
        test: 'Acesso a endereço de outro usuário',
        passed: unauthorizedPassed,
        details: `Status: ${unauthorizedResponse.status}`,
      });
      console.log(unauthorizedPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

      // Limpar usuário 2
      await db.delete(usuarios).where(eq(usuarios.id, usuario2.id));
    } else {
      results.push({
        test: 'Acesso a endereço de outro usuário',
        passed: false,
        details: 'Endereço não foi criado',
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 10: Deletar endereço
    console.log('\n🔟 Testando Deletar endereço...');
    // Criar endereço para deletar (não pode deletar o último)
    const deleteAddressResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipo: 'outro',
        rua: 'Rua para Deletar',
        numero: '999',
        bairro: 'Bairro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-999',
      });

    if (deleteAddressResponse.status === 201) {
      const deleteAddressId = deleteAddressResponse.body.data.address.id;

      const deleteResponse = await request(app)
        .delete(`/api/addresses/${deleteAddressId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const deletePassed = deleteResponse.status === 200;

      // Verificar se endereço foi deletado (soft delete)
      const listAfterDelete = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${accessToken}`);

      const addressDeleted = !listAfterDelete.body.data?.addresses?.find(
        (a: any) => a.id === deleteAddressId
      );

      results.push({
        test: 'Deletar endereço',
        passed: deletePassed && addressDeleted,
        details: `Status: ${deleteResponse.status}, Endereço removido da lista: ${addressDeleted}`,
      });
      console.log(deletePassed && addressDeleted ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Deletar endereço',
        passed: false,
        details: 'Não foi possível criar endereço para deletar',
      });
      console.log('   ❌ FALHOU');
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
      await db.delete(enderecos).where(eq(enderecos.usuarioId, testUserId));
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }

    if (passed === total) {
      console.log('🎉 Todos os testes da FASE 2 passaram!');
      console.log('✅ FASE 2 está pronta.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Alguns testes falharam. Revise a implementação.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error);

    // Limpar dados em caso de erro
    if (testUserId) {
      await db.delete(enderecos).where(eq(enderecos.usuarioId, testUserId));
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }

    process.exit(1);
  }
}

// Executar testes
testFase2();

