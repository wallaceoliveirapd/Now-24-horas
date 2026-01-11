#!/usr/bin/env ts-node

/**
 * Testes da FASE 3 - Produtos e Catálogo
 * 
 * Uso:
 *   npm run api:test:fase3
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, produtos, categorias } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase3() {
  console.log('🧪 Testando FASE 3 - Produtos e Catálogo\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let categoryId: string | null = null;
  let productId: string | null = null;

  try {
    // Limpar dados de teste anteriores
    const testSlug = `categoria-teste-${Date.now()}`;
    
    // Criar categoria de teste
    console.log('\n📦 Criando dados de teste...');
    const [category] = await db
      .insert(categorias)
      .values({
        nome: `Categoria Teste FASE 3 ${Date.now()}`,
        descricao: 'Descrição da categoria teste',
        slug: testSlug,
        ativo: true,
      })
      .returning();

    categoryId = category.id;

    // Criar produto de teste
    const [product] = await db
      .insert(produtos)
      .values({
        nome: 'Produto Teste FASE 3',
        slug: `produto-teste-fase3-${Date.now()}`,
        descricao: 'Descrição do produto teste',
        categoriaId: categoryId,
        precoBase: 2000, // R$ 20,00
        precoFinal: 1500, // R$ 15,00
        valorDesconto: 500, // R$ 5,00
        estoque: 100,
        statusEstoque: 'disponivel',
        ativo: true,
      })
      .returning();

    productId = product.id;
    console.log('✅ Dados de teste criados\n');

    // Teste 1: Listar produtos
    console.log('1️⃣  Testando GET /api/products...');
    const listResponse = await request(app).get('/api/products');
    const listPassed = listResponse.status === 200 && 
                      listResponse.body.success === true &&
                      Array.isArray(listResponse.body.data.produtos);
    results.push({ 
      test: 'Listar produtos', 
      passed: listPassed,
      details: `Status: ${listResponse.status}, Produtos: ${listResponse.body.data?.produtos?.length || 0}`
    });
    console.log(listPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    if (!listPassed) console.log(`   Resposta: ${JSON.stringify(listResponse.body).substring(0, 200)}`);

    // Teste 2: Paginação
    console.log('\n2️⃣  Testando paginação...');
    const paginationResponse = await request(app).get('/api/products?pagina=1&limite=5');
    const paginationPassed = paginationResponse.status === 200 &&
                            paginationResponse.body.data?.paginacao?.pagina === 1 &&
                            paginationResponse.body.data?.paginacao?.limite === 5;
    results.push({ 
      test: 'Paginação de produtos', 
      passed: paginationPassed,
      details: `Página: ${paginationResponse.body.data?.paginacao?.pagina}, Limite: ${paginationResponse.body.data?.paginacao?.limite}`
    });
    console.log(paginationPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 3: Filtrar por categoria
    console.log('\n3️⃣  Testando filtro por categoria...');
    const categoryFilterResponse = await request(app).get(`/api/products?categoriaId=${categoryId}`);
    const categoryFilterPassed = categoryFilterResponse.status === 200 &&
                                categoryFilterResponse.body.success === true;
    results.push({ 
      test: 'Filtrar produtos por categoria', 
      passed: categoryFilterPassed,
      details: `Status: ${categoryFilterResponse.status}`
    });
    console.log(categoryFilterPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 4: Buscar produtos
    console.log('\n4️⃣  Testando busca de produtos...');
    const searchResponse = await request(app).get('/api/products?busca=Produto');
    const searchPassed = searchResponse.status === 200 &&
                        searchResponse.body.success === true;
    results.push({ 
      test: 'Buscar produtos', 
      passed: searchPassed,
      details: `Status: ${searchResponse.status}`
    });
    console.log(searchPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 5: Obter produto por ID
    console.log('\n5️⃣  Testando GET /api/products/:id...');
    const productResponse = await request(app).get(`/api/products/${productId}`);
    const productPassed = productResponse.status === 200 &&
                         productResponse.body.success === true &&
                         (productResponse.body.data.produto?.id === productId || productResponse.body.data.product?.id === productId);
    results.push({ 
      test: 'Obter produto por ID', 
      passed: productPassed,
      details: `Status: ${productResponse.status}, ID: ${productResponse.body.data?.produto?.id || productResponse.body.data?.product?.id}`
    });
    console.log(productPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    if (!productPassed) console.log(`   Resposta: ${JSON.stringify(productResponse.body).substring(0, 200)}`);

    // Teste 6: Produto inexistente
    console.log('\n6️⃣  Testando produto inexistente...');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const notFoundResponse = await request(app).get(`/api/products/${fakeId}`);
    const notFoundPassed = notFoundResponse.status === 404 &&
                          notFoundResponse.body.success === false &&
                          notFoundResponse.body.error?.code === 'PRODUCT_NOT_FOUND';
    results.push({ 
      test: 'Produto inexistente retorna 404', 
      passed: notFoundPassed,
      details: `Status: ${notFoundResponse.status}, Code: ${notFoundResponse.body.error?.code}`
    });
    console.log(notFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 7: Produtos populares
    console.log('\n7️⃣  Testando GET /api/products/popular...');
    const popularResponse = await request(app).get('/api/products/popular');
    const popularPassed = popularResponse.status === 200 &&
                         popularResponse.body.success === true &&
                         Array.isArray(popularResponse.body.data.produtos);
    results.push({ 
      test: 'Listar produtos populares', 
      passed: popularPassed,
      details: `Status: ${popularResponse.status}`
    });
    console.log(popularPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 8: Produtos em oferta
    console.log('\n8️⃣  Testando GET /api/products/offers...');
    const offersResponse = await request(app).get('/api/products/offers');
    const offersPassed = offersResponse.status === 200 &&
                        offersResponse.body.success === true &&
                        Array.isArray(offersResponse.body.data.produtos);
    results.push({ 
      test: 'Listar produtos em oferta', 
      passed: offersPassed,
      details: `Status: ${offersResponse.status}`
    });
    console.log(offersPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 9: Produtos novos
    console.log('\n9️⃣  Testando GET /api/products/new...');
    const newResponse = await request(app).get('/api/products/new');
    const newPassed = newResponse.status === 200 &&
                     newResponse.body.success === true &&
                     Array.isArray(newResponse.body.data.produtos);
    results.push({ 
      test: 'Listar produtos novos', 
      passed: newPassed,
      details: `Status: ${newResponse.status}`
    });
    console.log(newPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 10: Listar categorias
    console.log('\n🔟 Testando GET /api/categories...');
    const categoriesResponse = await request(app).get('/api/categories');
    const categoriesPassed = categoriesResponse.status === 200 &&
                             categoriesResponse.body.success === true &&
                             (Array.isArray(categoriesResponse.body.data.categorias) || Array.isArray(categoriesResponse.body.data.categories));
    results.push({ 
      test: 'Listar categorias', 
      passed: categoriesPassed,
      details: `Status: ${categoriesResponse.status}, Categorias: ${categoriesResponse.body.data?.categorias?.length || categoriesResponse.body.data?.categories?.length || 0}`
    });
    console.log(categoriesPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');
    if (!categoriesPassed) console.log(`   Resposta: ${JSON.stringify(categoriesResponse.body).substring(0, 200)}`);

    // Teste 11: Obter categoria por ID
    console.log('\n1️⃣1️⃣  Testando GET /api/categories/:id...');
    const categoryResponse = await request(app).get(`/api/categories/${categoryId}`);
    const categoryPassed = categoryResponse.status === 200 &&
                          categoryResponse.body.success === true &&
                          (categoryResponse.body.data.categoria?.id === categoryId || categoryResponse.body.data.category?.id === categoryId);
    results.push({ 
      test: 'Obter categoria por ID', 
      passed: categoryPassed,
      details: `Status: ${categoryResponse.status}, ID: ${categoryResponse.body.data?.categoria?.id || categoryResponse.body.data?.category?.id}`
    });
    console.log(categoryPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

    // Teste 12: Categoria inexistente
    console.log('\n1️⃣2️⃣  Testando categoria inexistente...');
    const categoryNotFoundResponse = await request(app).get(`/api/categories/${fakeId}`);
    const categoryNotFoundPassed = categoryNotFoundResponse.status === 404 &&
                                  categoryNotFoundResponse.body.success === false &&
                                  categoryNotFoundResponse.body.error?.code === 'CATEGORY_NOT_FOUND';
    results.push({ 
      test: 'Categoria inexistente retorna 404', 
      passed: categoryNotFoundPassed,
      details: `Status: ${categoryNotFoundResponse.status}, Code: ${categoryNotFoundResponse.body.error?.code}`
    });
    console.log(categoryNotFoundPassed ? '   ✅ PASSOU' : '   ❌ FALHOU');

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
      console.log('🎉 Todos os testes da FASE 3 passaram!');
      console.log('✅ FASE 3 está pronta.\n');
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
    if (productId) {
      await db.delete(produtos).where(eq(produtos.id, productId));
    }
    if (categoryId) {
      await db.delete(categorias).where(eq(categorias.id, categoryId));
    }
  }
}

// Executar testes
testFase3();
