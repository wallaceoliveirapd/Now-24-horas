#!/usr/bin/env ts-node

/**
 * Testes das FASES 1.5, 1.6 e 1.7 - JWT, Refresh Token, Logout e Middleware
 * 
 * Uso:
 *   npm run api:test:fase1.5-1.7
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, tokensAutenticacao } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase1_5_1_7() {
  console.log('🧪 Testando FASES 1.5, 1.6 e 1.7 - JWT, Refresh Token, Logout e Middleware\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    // Limpar dados de teste anteriores
    await db.delete(usuarios).where(eq(usuarios.email, 'jwt@teste.com'));

    // Criar usuário de teste
    const senhaHash = await bcrypt.hash('Senha123', 10);
    const [usuario] = await db
      .insert(usuarios)
      .values({
        email: 'jwt@teste.com',
        telefone: '83988888888',
        nomeCompleto: 'Usuário JWT Teste',
        senhaHash,
        tipoUsuario: 'cliente',
        emailVerificado: true,
        telefoneVerificado: true,
        ativo: true,
      })
      .returning();

    testUserId = usuario.id;

    // Teste 1: Login gera tokens
    console.log('\n1️⃣  Testando Login gera tokens JWT...');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        emailOuTelefone: 'jwt@teste.com',
        senha: 'Senha123',
      });

    const loginPassed =
      loginResponse.status === 200 &&
      loginResponse.body.success === true &&
      loginResponse.body.data?.tokens?.accessToken &&
      loginResponse.body.data?.tokens?.refreshToken;

    if (loginPassed) {
      accessToken = loginResponse.body.data.tokens.accessToken;
      refreshToken = loginResponse.body.data.tokens.refreshToken;
    }

    results.push({
      test: 'Login gera tokens JWT',
      passed: loginPassed,
      details: `Status: ${loginResponse.status}, Tem accessToken: ${!!accessToken}, Tem refreshToken: ${!!refreshToken}`,
    });
    console.log(loginPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Refresh token funciona
    console.log('\n2️⃣  Testando Refresh token...');
    if (refreshToken) {
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      const refreshPassed =
        refreshResponse.status === 200 &&
        refreshResponse.body.success === true &&
        refreshResponse.body.data?.tokens?.accessToken &&
        refreshResponse.body.data?.tokens?.refreshToken;

      if (refreshPassed) {
        accessToken = refreshResponse.body.data.tokens.accessToken; // Atualizar com novo token
        refreshToken = refreshResponse.body.data.tokens.refreshToken; // Novo refresh token
      }

      results.push({
        test: 'Refresh token',
        passed: refreshPassed,
        details: `Status: ${refreshResponse.status}`,
      });
      console.log(refreshPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Refresh token',
        passed: false,
        details: 'Refresh token não foi gerado no teste anterior',
      });
      console.log('   ❌ FALHOU (refresh token não gerado)');
    }

    // Teste 3: Middleware de autenticação - Acesso sem token
    console.log('\n3️⃣  Testando Middleware - Acesso sem token...');
    const noTokenResponse = await request(app).get('/api/users/me');

    const noTokenPassed =
      noTokenResponse.status === 401 &&
      noTokenResponse.body.success === false &&
      noTokenResponse.body.error?.code === 'AUTH_TOKEN_REQUIRED';

    results.push({
      test: 'Middleware - Acesso sem token',
      passed: noTokenPassed,
      details: `Status: ${noTokenResponse.status}`,
    });
    console.log(noTokenPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Middleware de autenticação - Acesso com token válido
    console.log('\n4️⃣  Testando Middleware - Acesso com token válido...');
    if (accessToken) {
      const withTokenResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      const withTokenPassed =
        withTokenResponse.status === 200 &&
        withTokenResponse.body.success === true &&
        withTokenResponse.body.data?.usuario?.id === testUserId;

      results.push({
        test: 'Middleware - Acesso com token válido',
        passed: withTokenPassed,
        details: `Status: ${withTokenResponse.status}`,
      });
      console.log(withTokenPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'Middleware - Acesso com token válido',
        passed: false,
        details: 'Access token não foi gerado',
      });
      console.log('   ❌ FALHOU (token não gerado)');
    }

    // Teste 5: GET /api/users/me funciona
    console.log('\n5️⃣  Testando GET /api/users/me...');
    if (accessToken) {
      const meResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      const mePassed =
        meResponse.status === 200 &&
        meResponse.body.data?.usuario?.email === 'jwt@teste.com' &&
        meResponse.body.data?.usuario?.nomeCompleto === 'Usuário JWT Teste';

      results.push({
        test: 'GET /api/users/me',
        passed: mePassed,
        details: `Status: ${meResponse.status}`,
      });
      console.log(mePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'GET /api/users/me',
        passed: false,
        details: 'Token não disponível',
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 6: PUT /api/users/me funciona
    console.log('\n6️⃣  Testando PUT /api/users/me...');
    if (accessToken) {
      const updateResponse = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nomeCompleto: 'Nome Atualizado',
        });

      const updatePassed =
        updateResponse.status === 200 &&
        updateResponse.body.success === true &&
        updateResponse.body.data?.usuario?.nomeCompleto === 'Nome Atualizado';

      results.push({
        test: 'PUT /api/users/me',
        passed: updatePassed,
        details: `Status: ${updateResponse.status}`,
      });
      console.log(updatePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({
        test: 'PUT /api/users/me',
        passed: false,
        details: 'Token não disponível',
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 7: POST /api/users/change-password funciona
    console.log('\n7️⃣  Testando POST /api/users/change-password...');
    if (accessToken) {
      const changePasswordResponse = await request(app)
        .post('/api/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          senhaAtual: 'Senha123',
          novaSenha: 'NovaSenha123',
        });

      const changePasswordPassed = changePasswordResponse.status === 200;

      // Verificar se senha foi alterada tentando fazer login com nova senha
      if (changePasswordPassed) {
        const newLoginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            emailOuTelefone: 'jwt@teste.com',
            senha: 'NovaSenha123',
          });

        const newLoginPassed = newLoginResponse.status === 200;
        results.push({
          test: 'POST /api/users/change-password',
          passed: changePasswordPassed && newLoginPassed,
          details: `Status: ${changePasswordResponse.status}, Nova senha funciona: ${newLoginPassed}`,
        });
        console.log(newLoginPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
      } else {
        results.push({
          test: 'POST /api/users/change-password',
          passed: false,
          details: `Status: ${changePasswordResponse.status}`,
        });
        console.log('   ❌ FALHOU');
      }
    } else {
      results.push({
        test: 'POST /api/users/change-password',
        passed: false,
        details: 'Token não disponível',
      });
      console.log('   ❌ FALHOU');
    }

    // Teste 8: Logout invalida refresh token
    console.log('\n8️⃣  Testando Logout...');
    if (refreshToken) {
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      const logoutPassed = logoutResponse.status === 200;

      // Verificar se refresh token foi invalidado
      if (logoutPassed) {
        const refreshAfterLogout = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken });

        const tokenInvalidated = refreshAfterLogout.status === 401;

        results.push({
          test: 'Logout invalida refresh token',
          passed: logoutPassed && tokenInvalidated,
          details: `Logout status: ${logoutResponse.status}, Token invalidado: ${tokenInvalidated}`,
        });
        console.log(tokenInvalidated ? '   ✅ PASSOU' : '   ❌ FALHOU');
      } else {
        results.push({
          test: 'Logout invalida refresh token',
          passed: false,
          details: `Status: ${logoutResponse.status}`,
        });
        console.log('   ❌ FALHOU');
      }
    } else {
      results.push({
        test: 'Logout invalida refresh token',
        passed: false,
        details: 'Refresh token não disponível',
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
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
      await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.usuarioId, testUserId));
    }

    if (passed === total) {
      console.log('🎉 Todos os testes das FASES 1.5, 1.6 e 1.7 passaram!');
      console.log('✅ FASES estão prontas.\n');
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
      await db.delete(tokensAutenticacao).where(eq(tokensAutenticacao.usuarioId, testUserId));
    }

    process.exit(1);
  }
}

// Executar testes
testFase1_5_1_7();

