#!/usr/bin/env ts-node

/**
 * Testes da FASE 9 - Avaliações
 * 
 * Uso:
 *   npm run api:test:fase9
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, produtos, categorias, pedidos, itensPedido, avaliacoesProdutos, avaliacoesPedidos, enderecos, carrinhos, itensCarrinho } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase9() {
  console.log('🧪 Testando FASE 9 - Avaliações\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let testUserId: string | null = null;
  let authToken: string | null = null;
  let categoryId: string | null = null;
  let productId: string | null = null;
  let orderId: string | null = null;
  let addressId: string | null = null;

  try {
    // Criar usuário de teste
    console.log('\n👤 Criando usuário de teste...');
    const email = `test-reviews-${Date.now()}@test.com`;
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
        nome: 'Produto Teste Avaliações',
        slug: `produto-teste-avaliacoes-${Date.now()}`,
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

    // Criar endereço
    const [address] = await db
      .insert(enderecos)
      .values({
        usuarioId: testUserId,
        tipo: 'casa',
        cep: '58053015',
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'João Pessoa',
        estado: 'PB',
        enderecoPadrao: true,
        ativo: true,
      })
      .returning();

    addressId = address.id;

    // Criar pedido entregue para testes
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: productId,
        quantidade: 1,
      });

    const createOrderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enderecoId: addressId,
        metodoPagamento: 'pix',
      });

    if (createOrderResponse.status === 201 && createOrderResponse.body.data?.pedido?.id) {
      orderId = createOrderResponse.body.data.pedido.id;
      
      // Marcar pedido como entregue para testes
      if (orderId) {
        await db
          .update(pedidos)
          .set({ status: 'entregue' })
          .where(eq(pedidos.id, orderId));
      }
    }

    console.log('✅ Dados de teste criados\n');

    // Teste 1: Listar avaliações de produto (vazio)
    console.log('1️⃣  Testando GET /api/reviews/products/:productId (vazio)...');
    const emptyReviewsResponse = await request(app)
      .get(`/api/reviews/products/${productId}`);
    const emptyReviewsPassed = emptyReviewsResponse.status === 200 &&
                              emptyReviewsResponse.body.success === true &&
                              Array.isArray(emptyReviewsResponse.body.data.avaliacoes) &&
                              emptyReviewsResponse.body.data.avaliacoes.length === 0;
    results.push({ 
      test: 'Listar avaliações de produto (vazio)', 
      passed: emptyReviewsPassed,
      details: `Status: ${emptyReviewsResponse.status}, Avaliações: ${emptyReviewsResponse.body.data?.avaliacoes?.length || 0}`
    });
    console.log(emptyReviewsPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 2: Criar avaliação de produto
    console.log('\n2️⃣  Testando POST /api/reviews/products/:productId...');
    const createReviewResponse = await request(app)
      .post(`/api/reviews/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nota: 5,
        comentario: 'Produto excelente!',
        pedidoId: orderId,
      });
    const createReviewPassed = createReviewResponse.status === 201 &&
                              createReviewResponse.body.success === true &&
                              createReviewResponse.body.data.avaliacao?.nota === 5;
    results.push({ 
      test: 'Criar avaliação de produto', 
      passed: createReviewPassed,
      details: `Status: ${createReviewResponse.status}, Nota: ${createReviewResponse.body.data?.avaliacao?.nota}`
    });
    console.log(createReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    let reviewId: string | null = null;
    if (createReviewPassed && createReviewResponse.body.data?.avaliacao?.id) {
      reviewId = createReviewResponse.body.data.avaliacao.id;
    }

    // Teste 3: Validar nota inválida
    console.log('\n3️⃣  Testando validação de nota inválida...');
    const invalidRatingResponse = await request(app)
      .post(`/api/reviews/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nota: 6, // Inválido
      });
    const invalidRatingPassed = invalidRatingResponse.status === 400 &&
                               invalidRatingResponse.body.success === false;
    results.push({ 
      test: 'Validar nota inválida', 
      passed: invalidRatingPassed,
      details: `Status: ${invalidRatingResponse.status}`
    });
    console.log(invalidRatingPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Validar avaliação duplicada
    console.log('\n4️⃣  Testando avaliação duplicada...');
    const duplicateReviewResponse = await request(app)
      .post(`/api/reviews/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nota: 4,
      });
    const duplicateReviewPassed = duplicateReviewResponse.status === 409 &&
                                 duplicateReviewResponse.body.success === false &&
                                 duplicateReviewResponse.body.error?.code === 'REVIEW_ALREADY_EXISTS';
    results.push({ 
      test: 'Validar avaliação duplicada', 
      passed: duplicateReviewPassed,
      details: `Status: ${duplicateReviewResponse.status}, Code: ${duplicateReviewResponse.body.error?.code}`
    });
    console.log(duplicateReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Atualizar avaliação (criar nova avaliação para atualizar)
    console.log('\n5️⃣  Testando PUT /api/reviews/:id...');
    // Primeiro, deletar a avaliação anterior se existir para poder criar uma nova
    if (reviewId) {
      try {
        await db.delete(avaliacoesProdutos).where(eq(avaliacoesProdutos.id, reviewId));
      } catch (e) {
        // Ignorar erro se não existir
      }
    }
    
    // Criar nova avaliação para atualizar
    const createReviewForUpdateResponse = await request(app)
      .post(`/api/reviews/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nota: 3,
        comentario: 'Para atualizar',
      });
    
    if (createReviewForUpdateResponse.status === 201 && createReviewForUpdateResponse.body.data?.avaliacao?.id) {
      const reviewToUpdateId = createReviewForUpdateResponse.body.data.avaliacao.id;
      
      const updateReviewResponse = await request(app)
        .put(`/api/reviews/${reviewToUpdateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nota: 4,
          comentario: 'Atualizado',
        });
      const updateReviewPassed = updateReviewResponse.status === 200 &&
                               updateReviewResponse.body.success === true &&
                               updateReviewResponse.body.data.avaliacao?.nota === 4;
      results.push({ 
        test: 'Atualizar avaliação', 
        passed: updateReviewPassed,
        details: `Status: ${updateReviewResponse.status}, Nova nota: ${updateReviewResponse.body.data?.avaliacao?.nota}`
      });
      console.log(updateReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
      if (!updateReviewPassed) console.log(`   Resposta: ${JSON.stringify(updateReviewResponse.body).substring(0, 200)}`);
    } else {
      results.push({ test: 'Atualizar avaliação', passed: false, details: 'Não foi possível criar avaliação para atualizar' });
      console.log('   ⚠️  PULADO (não foi possível criar avaliação)');
    }

    // Teste 6: Criar avaliação de pedido
    if (orderId) {
      console.log('\n6️⃣  Testando POST /api/reviews/orders/:orderId...');
      const createOrderReviewResponse = await request(app)
        .post(`/api/reviews/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notaProdutos: 5,
          notaEntrega: 4,
          notaAtendimento: 5,
          comentario: 'Pedido excelente!',
        });
      const createOrderReviewPassed = createOrderReviewResponse.status === 201 &&
                                     createOrderReviewResponse.body.success === true &&
                                     createOrderReviewResponse.body.data.avaliacao?.notaProdutos === 5;
      results.push({ 
        test: 'Criar avaliação de pedido', 
        passed: createOrderReviewPassed,
        details: `Status: ${createOrderReviewResponse.status}, Nota produtos: ${createOrderReviewResponse.body.data?.avaliacao?.notaProdutos}`
      });
      console.log(createOrderReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Criar avaliação de pedido', passed: false, details: 'Pedido não foi criado' });
      console.log('   ⚠️  PULADO (pedido não criado)');
    }

    // Teste 7: Obter avaliação de pedido
    if (orderId) {
      console.log('\n7️⃣  Testando GET /api/reviews/orders/:orderId...');
      const getOrderReviewResponse = await request(app)
        .get(`/api/reviews/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const getOrderReviewPassed = getOrderReviewResponse.status === 200 &&
                                  getOrderReviewResponse.body.success === true &&
                                  getOrderReviewResponse.body.data.avaliacao?.pedidoId === orderId;
      results.push({ 
        test: 'Obter avaliação de pedido', 
        passed: getOrderReviewPassed,
        details: `Status: ${getOrderReviewResponse.status}, Pedido ID: ${getOrderReviewResponse.body.data?.avaliacao?.pedidoId}`
      });
      console.log(getOrderReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Obter avaliação de pedido', passed: false, details: 'Pedido não foi criado' });
      console.log('   ⚠️  PULADO (pedido não criado)');
    }

    // Teste 8: Validar pedido não entregue
    console.log('\n8️⃣  Testando validação de pedido não entregue...');
    // Adicionar item ao carrinho primeiro
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        produtoId: productId,
        quantidade: 1,
      });
    
    // Criar pedido não entregue
    const createOrderResponse2 = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enderecoId: addressId,
        metodoPagamento: 'pix',
      });

    if (createOrderResponse2.status === 201 && createOrderResponse2.body.data?.pedido?.id) {
      const pendingOrderId = createOrderResponse2.body.data.pedido.id;
      
      const pendingOrderReviewResponse = await request(app)
        .post(`/api/reviews/orders/${pendingOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notaProdutos: 5,
        });
      const pendingOrderReviewPassed = pendingOrderReviewResponse.status === 400 &&
                                      pendingOrderReviewResponse.body.success === false &&
                                      pendingOrderReviewResponse.body.error?.code === 'ORDER_NOT_DELIVERED';
      results.push({ 
        test: 'Validar pedido não entregue', 
        passed: pendingOrderReviewPassed,
        details: `Status: ${pendingOrderReviewResponse.status}, Code: ${pendingOrderReviewResponse.body.error?.code}`
      });
      console.log(pendingOrderReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    } else {
      results.push({ test: 'Validar pedido não entregue', passed: false, details: 'Não foi possível criar pedido' });
      console.log('   ⚠️  PULADO (não foi possível criar pedido)');
    }

    // Teste 9: Deletar avaliação (usar avaliação criada no teste 5 se existir)
    console.log('\n9️⃣  Testando DELETE /api/reviews/:id...');
    // Buscar avaliação existente no banco
    const [existingReview] = await db
      .select()
      .from(avaliacoesProdutos)
      .where(eq(avaliacoesProdutos.usuarioId, testUserId))
      .limit(1);
    
    if (existingReview) {
      const deleteReviewResponse = await request(app)
        .delete(`/api/reviews/${existingReview.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      const deleteReviewPassed = deleteReviewResponse.status === 200 &&
                                deleteReviewResponse.body.success === true;
      results.push({ 
        test: 'Deletar avaliação', 
        passed: deleteReviewPassed,
        details: `Status: ${deleteReviewResponse.status}`
      });
      console.log(deleteReviewPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
      if (!deleteReviewPassed) console.log(`   Resposta: ${JSON.stringify(deleteReviewResponse.body).substring(0, 200)}`);
    } else {
      results.push({ test: 'Deletar avaliação', passed: false, details: 'Nenhuma avaliação encontrada para deletar' });
      console.log('   ⚠️  PULADO (nenhuma avaliação encontrada)');
    }

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
      console.log('🎉 Todos os testes da FASE 9 passaram!');
      console.log('✅ FASE 9 está pronta.\n');
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
      await db.delete(avaliacoesPedidos).where(eq(avaliacoesPedidos.usuarioId, testUserId));
      await db.delete(avaliacoesProdutos).where(eq(avaliacoesProdutos.usuarioId, testUserId));
      
      const [cart] = await db.select().from(carrinhos).where(eq(carrinhos.usuarioId, testUserId)).limit(1);
      if (cart) {
        await db.delete(itensCarrinho).where(eq(itensCarrinho.carrinhoId, cart.id));
        await db.delete(carrinhos).where(eq(carrinhos.id, cart.id));
      }
      
      if (orderId) {
        await db.delete(itensPedido).where(eq(itensPedido.pedidoId, orderId!));
        await db.delete(pedidos).where(eq(pedidos.id, orderId!));
      }
      
      if (addressId) {
        await db.delete(enderecos).where(eq(enderecos.id, addressId));
      }
      
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
testFase9();

