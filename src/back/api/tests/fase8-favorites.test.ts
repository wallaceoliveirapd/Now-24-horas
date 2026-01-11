#!/usr/bin/env ts-node

/**
 * Testes da FASE 8 - Favoritos
 * 
 * Uso:
 *   npm run api:test:fase8
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, produtos, categorias, favoritos } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase8() {
  console.log('🧪 Testando FASE 8 - Favoritos\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;
  let categoryId: string | null = null;
  let productId: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-favorites-${Date.now()}@test.com`;
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

    // Criar categoria
    const [category] = await db
      .insert(categorias)
      .values({
        nome: `Categoria Teste ${Date.now()}`,
        descricao: 'Descrição',
        slug: `categoria-${Date.now()}`,
        ativo: true,
      })
      .returning();

    categoryId = category.id;

    // Criar produto
    const [product] = await db
      .insert(produtos)
      .values({
        nome: 'Produto Teste Favoritos',
        slug: `produto-teste-favoritos-${Date.now()}`,
        descricao: 'Descrição',
        categoriaId: categoryId,
        precoBase: 2000,
        precoFinal: 2000,
        estoque: 100,
        statusEstoque: 'disponivel',
        ativo: true,
      })
      .returning();

    productId = product.id;
    console.log('✅ Dados de teste criados\n');

    // Teste 1: Listar favoritos vazios
    console.log('1️⃣  Testando GET /api/favorites (vazio)...');
    const emptyResponse = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${authToken}`);
    const emptyPassed = emptyResponse.status === 200 &&
                       emptyResponse.body.success === true &&
                       Array.isArray(emptyResponse.body.data.favoritos) &&
                       emptyResponse.body.data.favoritos.length === 0;
    results.push({ 
      test: 'Listar favoritos vazios', 
      passed: emptyPassed,
      details: `Status: ${emptyResponse.status}, Favoritos: ${emptyResponse.body.data?.favoritos?.length || 0}`
    });
    console.log(emptyPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Verificar se produto está favoritado (false)
    console.log('\n2️⃣  Testando GET /api/favorites/check/:productId (não favoritado)...');
    const checkFalseResponse = await request(app)
      .get(`/api/favorites/check/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const checkFalsePassed = checkFalseResponse.status === 200 &&
                            checkFalseResponse.body.success === true &&
                            checkFalseResponse.body.data.favoritado === false;
    results.push({ 
      test: 'Verificar produto não favoritado', 
      passed: checkFalsePassed,
      details: `Status: ${checkFalseResponse.status}, Favoritado: ${checkFalseResponse.body.data?.favoritado}`
    });
    console.log(checkFalsePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Adicionar favorito
    console.log('\n3️⃣  Testando POST /api/favorites/:productId...');
    const addResponse = await request(app)
      .post(`/api/favorites/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const addPassed = addResponse.status === 201 &&
                     addResponse.body.success === true &&
                     addResponse.body.data.favorito?.produtoId === productId;
    results.push({ 
      test: 'Adicionar produto aos favoritos', 
      passed: addPassed,
      details: `Status: ${addResponse.status}, Produto ID: ${addResponse.body.data?.favorito?.produtoId}`
    });
    console.log(addPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Verificar se produto está favoritado (true)
    console.log('\n4️⃣  Testando GET /api/favorites/check/:productId (favoritado)...');
    const checkTrueResponse = await request(app)
      .get(`/api/favorites/check/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const checkTruePassed = checkTrueResponse.status === 200 &&
                           checkTrueResponse.body.success === true &&
                           checkTrueResponse.body.data.favoritado === true;
    results.push({ 
      test: 'Verificar produto favoritado', 
      passed: checkTruePassed,
      details: `Status: ${checkTrueResponse.status}, Favoritado: ${checkTrueResponse.body.data?.favoritado}`
    });
    console.log(checkTruePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Listar favoritos com itens
    console.log('\n5️⃣  Testando GET /api/favorites (com itens)...');
    const listResponse = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${authToken}`);
    const listPassed = listResponse.status === 200 &&
                      listResponse.body.success === true &&
                      Array.isArray(listResponse.body.data.favoritos) &&
                      listResponse.body.data.favoritos.length > 0;
    results.push({ 
      test: 'Listar favoritos com itens', 
      passed: listPassed,
      details: `Status: ${listResponse.status}, Favoritos: ${listResponse.body.data?.favoritos?.length || 0}`
    });
    console.log(listPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 6: Contar favoritos
    console.log('\n6️⃣  Testando GET /api/favorites/count...');
    const countResponse = await request(app)
      .get('/api/favorites/count')
      .set('Authorization', `Bearer ${authToken}`);
    const countPassed = countResponse.status === 200 &&
                       countResponse.body.success === true &&
                       countResponse.body.data.total >= 1;
    results.push({ 
      test: 'Contar favoritos', 
      passed: countPassed,
      details: `Status: ${countResponse.status}, Total: ${countResponse.body.data?.total}`
    });
    console.log(countPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Toggle favorito (remover)
    console.log('\n7️⃣  Testando POST /api/favorites/:productId/toggle (remover)...');
    const toggleRemoveResponse = await request(app)
      .post(`/api/favorites/${productId}/toggle`)
      .set('Authorization', `Bearer ${authToken}`);
    const toggleRemovePassed = toggleRemoveResponse.status === 200 &&
                              toggleRemoveResponse.body.success === true &&
                              toggleRemoveResponse.body.data.favoritado === false;
    results.push({ 
      test: 'Toggle favorito (remover)', 
      passed: toggleRemovePassed,
      details: `Status: ${toggleRemoveResponse.status}, Favoritado: ${toggleRemoveResponse.body.data?.favoritado}`
    });
    console.log(toggleRemovePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 8: Toggle favorito (adicionar)
    console.log('\n8️⃣  Testando POST /api/favorites/:productId/toggle (adicionar)...');
    const toggleAddResponse = await request(app)
      .post(`/api/favorites/${productId}/toggle`)
      .set('Authorization', `Bearer ${authToken}`);
    const toggleAddPassed = toggleAddResponse.status === 200 &&
                           toggleAddResponse.body.success === true &&
                           toggleAddResponse.body.data.favoritado === true;
    results.push({ 
      test: 'Toggle favorito (adicionar)', 
      passed: toggleAddPassed,
      details: `Status: ${toggleAddResponse.status}, Favoritado: ${toggleAddResponse.body.data?.favoritado}`
    });
    console.log(toggleAddPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 9: Remover favorito
    console.log('\n9️⃣  Testando DELETE /api/favorites/:productId...');
    const removeResponse = await request(app)
      .delete(`/api/favorites/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const removePassed = removeResponse.status === 200 &&
                        removeResponse.body.success === true;
    results.push({ 
      test: 'Remover favorito', 
      passed: removePassed,
      details: `Status: ${removeResponse.status}`
    });
    console.log(removePassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 10: Validar produto inexistente
    console.log('\n🔟 Testando produto inexistente...');
    const fakeProductId = '00000000-0000-0000-0000-000000000000';
    const invalidProductResponse = await request(app)
      .post(`/api/favorites/${fakeProductId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const invalidProductPassed = invalidProductResponse.status === 404 &&
                                invalidProductResponse.body.success === false &&
                                invalidProductResponse.body.error?.code === 'PRODUCT_NOT_FOUND';
    results.push({ 
      test: 'Validar produto inexistente', 
      passed: invalidProductPassed,
      details: `Status: ${invalidProductResponse.status}, Code: ${invalidProductResponse.body.error?.code}`
    });
    console.log(invalidProductPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
      console.log('🎉 Todos os testes da FASE 8 passaram!');
      console.log('✅ FASE 8 está pronta.\n');
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
    if (testUserId && productId) {
      await db.delete(favoritos).where(eq(favoritos.usuarioId, testUserId));
    }
    if (testUserId) {
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
    if (productId) {
      await db.delete(produtos).where(eq(produtos.id, productId));
    }
    if (categoryId) {
      await db.delete(categorias).where(eq(categorias.id, categoryId));
    }
  }
}

// Executar testes
testFase8();

