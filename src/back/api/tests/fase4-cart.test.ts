#!/usr/bin/env ts-node

/**
 * Testes da FASE 4 - Carrinho
 * 
 * Uso:
 *   npm run api:test:fase4
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, produtos, categorias, carrinhos, itensCarrinho, cupons } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase4() {
  console.log('🧪 Testando FASE 4 - Carrinho\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;
  let categoryId: string | null = null;
  let productId: string | null = null;
  let couponId: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-cart-${Date.now()}@test.com`;
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
        nome: 'Categoria Teste',
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
        nome: 'Produto Teste Carrinho',
        slug: `produto-teste-carrinho-${Date.now()}`,
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

    // Criar cupom de teste
    const [coupon] = await db
      .insert(cupons)
      .values({
        codigo: `TEST${Date.now()}`,
        descricao: 'Cupom de teste',
        tipoDesconto: 'percentual',
        valorDesconto: 10,
        validoDe: new Date(Date.now() - 86400000),
        validoAte: new Date(Date.now() + 86400000),
        limiteUso: 100,
        limiteUsoPorUsuario: 1,
        ativo: true,
      })
      .returning();

    couponId = coupon.id;
    console.log('✅ Dados de teste criados\n');

    // Teste 1: Obter carrinho vazio
    console.log('1️⃣  Testando GET /api/cart (carrinho vazio)...');
    const emptyCartResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);
    const emptyCartPassed = emptyCartResponse.status === 200 &&
                           emptyCartResponse.body.success === true &&
                           Array.isArray(emptyCartResponse.body.data.itens) &&
                           emptyCartResponse.body.data.itens.length === 0;
    results.push({ 
      test: 'Obter carrinho vazio', 
      passed: emptyCartPassed,
      details: `Status: ${emptyCartResponse.status}, Itens: ${emptyCartResponse.body.data?.itens?.length || 0}`
    });
    console.log(emptyCartPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Adicionar item ao carrinho
    console.log('\n2️⃣  Testando POST /api/cart/items...');
    const addItemResponse = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: productId,
        quantidade: 2,
      });
    const addItemPassed = addItemResponse.status === 201 &&
                         addItemResponse.body.success === true &&
                         addItemResponse.body.data.item?.produtoId === productId &&
                         addItemResponse.body.data.item?.quantidade === 2;
    results.push({ 
      test: 'Adicionar item ao carrinho', 
      passed: addItemPassed,
      details: `Status: ${addItemResponse.status}, Quantidade: ${addItemResponse.body.data?.item?.quantidade}`
    });
    console.log(addItemPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    let itemId: string | null = null;
    if (addItemPassed && addItemResponse.body.data?.item?.id) {
      itemId = addItemResponse.body.data.item.id;
    }

    // Teste 3: Validar produto inexistente
    console.log('\n3️⃣  Testando validação de produto inexistente...');
    const fakeProductId = '00000000-0000-0000-0000-000000000000';
    const invalidProductResponse = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: fakeProductId,
        quantidade: 1,
      });
    const invalidProductPassed = invalidProductResponse.status === 404 &&
                                invalidProductResponse.body.success === false &&
                                invalidProductResponse.body.error?.code === 'PRODUCT_NOT_FOUND';
    results.push({ 
      test: 'Validar produto inexistente', 
      passed: invalidProductPassed,
      details: `Status: ${invalidProductResponse.status}, Code: ${invalidProductResponse.body.error?.code}`
    });
    console.log(invalidProductPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Validar quantidade mínima
    console.log('\n4️⃣  Testando validação de quantidade mínima...');
    const invalidQuantityResponse = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: productId,
        quantidade: 0,
      });
    const invalidQuantityPassed = invalidQuantityResponse.status === 400 &&
                                 invalidQuantityResponse.body.success === false;
    results.push({ 
      test: 'Validar quantidade mínima', 
      passed: invalidQuantityPassed,
      details: `Status: ${invalidQuantityResponse.status}`
    });
    console.log(invalidQuantityPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Atualizar quantidade do item
    if (itemId) {
      console.log('\n5️⃣  Testando PUT /api/cart/items/:id...');
      const updateItemResponse = await request(app)
        .put(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantidade: 3,
        });
      const updateItemPassed = updateItemResponse.status === 200 &&
                              updateItemResponse.body.success === true &&
                              updateItemResponse.body.data.item?.quantidade === 3;
      results.push({ 
        test: 'Atualizar quantidade do item', 
        passed: updateItemPassed,
        details: `Status: ${updateItemResponse.status}, Nova quantidade: ${updateItemResponse.body.data?.item?.quantidade}`
      });
      console.log(updateItemPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Atualizar quantidade do item', passed: false, details: 'Item não foi criado' });
      console.log('   ⚠️  PULADO (item não criado)');
    }

    // Teste 6: Aplicar cupom
    console.log('\n6️⃣  Testando POST /api/cart/apply-coupon...');
    const [couponData] = await db.select().from(cupons).where(eq(cupons.id, couponId!)).limit(1);
    const applyCouponResponse = await request(app)
      .post('/api/cart/apply-coupon')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        codigo: couponData.codigo,
      });
    const applyCouponPassed = applyCouponResponse.status === 200 &&
                             applyCouponResponse.body.success === true &&
                             applyCouponResponse.body.data?.cupom !== null;
    results.push({ 
      test: 'Aplicar cupom válido', 
      passed: applyCouponPassed,
      details: `Status: ${applyCouponResponse.status}, Cupom aplicado: ${!!applyCouponResponse.body.data?.cupom}`
    });
    console.log(applyCouponPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Cupom inválido
    console.log('\n7️⃣  Testando cupom inválido...');
    const invalidCouponResponse = await request(app)
      .post('/api/cart/apply-coupon')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        codigo: 'INVALIDO123',
      });
    const invalidCouponPassed = invalidCouponResponse.status === 404 &&
                                invalidCouponResponse.body.success === false &&
                                invalidCouponResponse.body.error?.code === 'COUPON_NOT_FOUND';
    results.push({ 
      test: 'Validar cupom inválido', 
      passed: invalidCouponPassed,
      details: `Status: ${invalidCouponResponse.status}, Code: ${invalidCouponResponse.body.error?.code}`
    });
    console.log(invalidCouponPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 8: Remover cupom
    console.log('\n8️⃣  Testando DELETE /api/cart/coupon...');
    const removeCouponResponse = await request(app)
      .delete('/api/cart/coupon')
      .set('Authorization', `Bearer ${authToken}`);
    const removeCouponPassed = removeCouponResponse.status === 200 &&
                              removeCouponResponse.body.success === true;
    results.push({ 
      test: 'Remover cupom do carrinho', 
      passed: removeCouponPassed,
      details: `Status: ${removeCouponResponse.status}`
    });
    console.log(removeCouponPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 9: Remover item do carrinho
    if (itemId) {
      console.log('\n9️⃣  Testando DELETE /api/cart/items/:id...');
      const removeItemResponse = await request(app)
        .delete(`/api/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const removeItemPassed = removeItemResponse.status === 200 &&
                               removeItemResponse.body.success === true;
      results.push({ 
        test: 'Remover item do carrinho', 
        passed: removeItemPassed,
        details: `Status: ${removeItemResponse.status}`
      });
      console.log(removeItemPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Remover item do carrinho', passed: false, details: 'Item não foi criado' });
      console.log('   ⚠️  PULADO (item não criado)');
    }

    // Teste 10: Limpar carrinho
    console.log('\n🔟 Testando DELETE /api/cart...');
    // Adicionar item primeiro
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: productId,
        quantidade: 1,
      });

    const clearCartResponse = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);
    const clearCartPassed = clearCartResponse.status === 200 &&
                           clearCartResponse.body.success === true;
    
    // Verificar que carrinho está vazio
    const verifyEmptyResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);
    const verifyEmptyPassed = verifyEmptyResponse.body.data.itens.length === 0;
    
    const finalPassed = clearCartPassed && verifyEmptyPassed;
    results.push({ 
      test: 'Limpar carrinho', 
      passed: finalPassed,
      details: `Status: ${clearCartResponse.status}, Carrinho vazio: ${verifyEmptyPassed}`
    });
    console.log(finalPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
      console.log('🎉 Todos os testes da FASE 4 passaram!');
      console.log('✅ FASE 4 está pronta.\n');
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
      const [cart] = await db.select().from(carrinhos).where(eq(carrinhos.usuarioId, testUserId)).limit(1);
      if (cart) {
        await db.delete(itensCarrinho).where(eq(itensCarrinho.carrinhoId, cart.id));
        await db.delete(carrinhos).where(eq(carrinhos.id, cart.id));
      }
      await db.delete(usuarios).where(eq(usuarios.id, testUserId));
    }
    if (productId) {
      await db.delete(produtos).where(eq(produtos.id, productId));
    }
    if (categoryId) {
      await db.delete(categorias).where(eq(categorias.id, categoryId));
    }
    if (couponId) {
      await db.delete(cupons).where(eq(cupons.id, couponId));
    }
  }
}

// Executar testes
testFase4();
