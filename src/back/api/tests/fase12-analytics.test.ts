#!/usr/bin/env ts-node

/**
 * Testes da FASE 12 - Analytics e Relatórios
 * 
 * Uso:
 *   npm run api:test:fase12
 */

import request from 'supertest';
import { createApp } from '../app';
import { db } from '../../config/database';
import { usuarios, categorias, produtos } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

const app = createApp();

async function testFase12() {
  console.log('🧪 Testando FASE 12 - Analytics e Relatórios\n');
  console.log('='.repeat(60));

  const results: Array<{ test: string; passed: boolean; details?: string }> = [];
  let adminToken: string | null = null;
  let adminUserId: string | null = null;
  let clientToken: string | null = null;
  let clientUserId: string | null = null;
  let testCategoryId: string | null = null;
  let testProductId: string | null = null;

  try {
    // Criar usuário admin
    console.log('\n👤 Criando usuário admin de teste...');
    const adminEmail = `admin-analytics-${Date.now()}@test.com`;
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

    const [admin] = await db
      .insert(usuarios)
      .values({
        email: adminEmail,
        telefone: `11999999999`,
        nomeCompleto: 'Admin Analytics',
        senhaHash: adminPasswordHash,
        tipoUsuario: 'administrador',
        emailVerificado: true,
        telefoneVerificado: true,
      })
      .returning();

    adminUserId = admin.id;

    // Login admin
    console.log('🔐 Fazendo login como admin...');
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        emailOuTelefone: adminEmail,
        senha: 'Admin123!',
      });

    if (adminLoginResponse.status !== 200) {
      throw new Error(`Login admin falhou: ${JSON.stringify(adminLoginResponse.body)}`);
    }

    adminToken = adminLoginResponse.body.data.tokens.accessToken;

    // Criar usuário cliente
    console.log('👤 Criando usuário cliente de teste...');
    const clientEmail = `client-analytics-${Date.now()}@test.com`;
    const clientPasswordHash = await bcrypt.hash('Client123!', 10);

    const [client] = await db
      .insert(usuarios)
      .values({
        email: clientEmail,
        telefone: `11888888888`,
        nomeCompleto: 'Client Analytics',
        senhaHash: clientPasswordHash,
        tipoUsuario: 'cliente',
        emailVerificado: true,
        telefoneVerificado: true,
      })
      .returning();

    clientUserId = client.id;

    // Login cliente
    console.log('🔐 Fazendo login como cliente...');
    const clientLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        emailOuTelefone: clientEmail,
        senha: 'Client123!',
      });

    if (clientLoginResponse.status !== 200) {
      throw new Error(`Login cliente falhou: ${JSON.stringify(clientLoginResponse.body)}`);
    }

    clientToken = clientLoginResponse.body.data.tokens.accessToken;

    // Criar categoria de teste
    console.log('📦 Criando categoria de teste...');
    const [category] = await db
      .insert(categorias)
      .values({
        nome: `Categoria Analytics ${Date.now()}`,
        slug: `categoria-analytics-${Date.now()}`,
        ativo: true,
      })
      .returning();

    testCategoryId = category.id;

    // Criar produto de teste
    console.log('📦 Criando produto de teste...');
    const [product] = await db
      .insert(produtos)
      .values({
        categoriaId: testCategoryId,
        nome: `Produto Analytics ${Date.now()}`,
        slug: `produto-analytics-${Date.now()}`,
        precoBase: 10000, // R$ 100,00
        precoFinal: 10000,
        estoque: 100,
        statusEstoque: 'disponivel',
        ativo: true,
      })
      .returning();

    testProductId = product.id;

    // ========================================================================
    // TESTES
    // ========================================================================

    console.log('\n📊 Testando GET /api/admin/analytics/dashboard...');
    try {
      const response = await request(app)
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.vendas && data.pedidos && data.produtosMaisVendidos && data.usuarios) {
          results.push({ test: 'GET /api/admin/analytics/dashboard (admin)', passed: true });
          console.log('  ✅ Dashboard retornado com sucesso');
        } else {
          throw new Error('Dados do dashboard incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/analytics/dashboard (admin)', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n🔒 Testando acesso negado para cliente...');
    try {
      const response = await request(app)
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);

      if (response.body.success === false && response.body.error?.code === 'FORBIDDEN') {
        results.push({ test: 'GET /api/admin/analytics/dashboard (cliente - acesso negado)', passed: true });
        console.log('  ✅ Acesso negado corretamente');
      } else {
        throw new Error('Resposta de erro inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/analytics/dashboard (cliente)', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📊 Testando GET /api/admin/analytics/products...');
    try {
      const response = await request(app)
        .get('/api/admin/analytics/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.produtosMaisVendidos && data.produtosBaixoEstoque && data.produtosSemVendas) {
          results.push({ test: 'GET /api/admin/analytics/products', passed: true });
          console.log('  ✅ Analytics de produtos retornado');
        } else {
          throw new Error('Dados incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/analytics/products', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📊 Testando GET /api/admin/analytics/users...');
    try {
      const response = await request(app)
        .get('/api/admin/analytics/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.usuariosPorTipo && data.usuariosMaisAtivos && data.novosUsuariosPorPeriodo) {
          results.push({ test: 'GET /api/admin/analytics/users', passed: true });
          console.log('  ✅ Analytics de usuários retornado');
        } else {
          throw new Error('Dados incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/analytics/users', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📊 Testando GET /api/admin/analytics/orders...');
    try {
      const response = await request(app)
        .get('/api/admin/analytics/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.pedidosPorStatus && data.pedidosPorPeriodo && typeof data.ticketMedio === 'number' && typeof data.taxaCancelamento === 'number') {
          results.push({ test: 'GET /api/admin/analytics/orders', passed: true });
          console.log('  ✅ Analytics de pedidos retornado');
        } else {
          throw new Error('Dados incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/analytics/orders', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📄 Testando GET /api/admin/reports/sales...');
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/admin/reports/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=json`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.periodo && typeof data.totalRegistros === 'number' && data.vendas) {
          results.push({ test: 'GET /api/admin/reports/sales (JSON)', passed: true });
          console.log('  ✅ Relatório de vendas retornado');
        } else {
          throw new Error('Dados incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/reports/sales', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📄 Testando GET /api/admin/reports/sales sem datas...');
    try {
      const response = await request(app)
        .get('/api/admin/reports/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      if (response.body.success === false && response.body.error?.code === 'MISSING_REQUIRED_PARAMS') {
        results.push({ test: 'GET /api/admin/reports/sales (validação)', passed: true });
        console.log('  ✅ Validação funcionando');
      } else {
        throw new Error('Validação não funcionou');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/reports/sales (validação)', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

    console.log('\n📄 Testando GET /api/admin/reports/products...');
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/admin/reports/products?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=json`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        if (data.periodo && typeof data.totalRegistros === 'number' && data.produtos) {
          results.push({ test: 'GET /api/admin/reports/products', passed: true });
          console.log('  ✅ Relatório de produtos retornado');
        } else {
          throw new Error('Dados incompletos');
        }
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error: any) {
      results.push({ test: 'GET /api/admin/reports/products', passed: false, details: error.message });
      console.log(`  ❌ Erro: ${error.message}`);
    }

  } catch (error: any) {
    console.error('\n❌ Erro fatal nos testes:', error);
    results.push({ test: 'Setup inicial', passed: false, details: error.message });
  } finally {
    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    try {
      if (testProductId) {
        await db.delete(produtos).where(eq(produtos.id, testProductId));
      }
      if (testCategoryId) {
        await db.delete(categorias).where(eq(categorias.id, testCategoryId));
      }
      if (adminUserId) {
        await db.delete(usuarios).where(eq(usuarios.id, adminUserId));
      }
      if (clientUserId) {
        await db.delete(usuarios).where(eq(usuarios.id, clientUserId));
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  // ========================================================================
  // RESULTADOS
  // ========================================================================

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS DOS TESTES\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (!result.passed && result.details) {
      console.log(`   └─ ${result.details}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`📈 Total: ${total} | ✅ Passou: ${passed} | ❌ Falhou: ${failed}`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Executar testes
testFase12().catch((error) => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
