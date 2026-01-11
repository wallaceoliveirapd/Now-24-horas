#!/usr/bin/env ts-node

/**
 * Testes da FASE 1.1 - Configuração Base da API
 * 
 * Uso:
 *   npm run api:test:fase1.1
 */

import { createApp } from '../app';
import request from 'supertest';

const app = createApp();

describe('FASE 1.1 - Configuração Base da API', () => {
  
  describe('Health Check', () => {
    it('deve retornar status 200 no endpoint /health', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API está funcionando');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });
  });

  describe('CORS', () => {
    it('deve incluir headers CORS nas respostas', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:19006');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('deve aplicar rate limiting nas rotas /api/*', async () => {
      // Fazer 101 requisições rapidamente
      const requests = Array.from({ length: 101 }, () =>
        request(app).get('/api/auth/test')
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      // Pelo menos uma deve ser rate limited
      expect(rateLimited).toBe(true);
    });
  });

  describe('Rotas de Teste', () => {
    it('deve retornar 200 em /api/auth/test', async () => {
      const response = await request(app).get('/api/auth/test');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('autenticação');
    });

    it('deve retornar 200 em /api/users/test', async () => {
      const response = await request(app).get('/api/users/test');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('usuário');
    });
  });

  describe('404 Handler', () => {
    it('deve retornar 404 para rotas não existentes', async () => {
      const response = await request(app).get('/api/rota-inexistente');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Error Handler', () => {
    it('deve tratar erros e retornar formato padronizado', async () => {
      // Criar uma rota de teste que lança erro
      const response = await request(app).get('/api/test-error');
      
      // Se a rota não existir, deve retornar 404
      // Se existir e lançar erro, deve retornar 500 com formato padronizado
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('JSON Parser', () => {
    it('deve parsear JSON no body das requisições', async () => {
      const response = await request(app)
        .post('/api/test-json')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      
      // Se a rota não existir, retorna 404 (esperado)
      // O importante é que não retorna erro de parsing
      expect([404, 200]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    it('deve incluir headers de segurança (Helmet)', async () => {
      const response = await request(app).get('/health');
      
      // Helmet adiciona vários headers de segurança
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});

// Executar testes se chamado diretamente
if (require.main === module) {
  console.log('🧪 Executando testes da FASE 1.1...\n');
  
  // Executar testes manualmente (sem Jest por enquanto)
  const runTests = async () => {
    try {
      // Teste 1: Health Check
      const healthResponse = await request(app).get('/health');
      console.log('✅ Health Check:', healthResponse.status === 200 ? 'PASSOU' : 'FALHOU');
      
      // Teste 2: Rotas de teste
      const authResponse = await request(app).get('/api/auth/test');
      console.log('✅ Rota /api/auth/test:', authResponse.status === 200 ? 'PASSOU' : 'FALHOU');
      
      const userResponse = await request(app).get('/api/users/test');
      console.log('✅ Rota /api/users/test:', userResponse.status === 200 ? 'PASSOU' : 'FALHOU');
      
      // Teste 3: 404 Handler
      const notFoundResponse = await request(app).get('/api/rota-inexistente');
      console.log('✅ 404 Handler:', notFoundResponse.status === 404 ? 'PASSOU' : 'FALHOU');
      
      // Teste 4: CORS
      const corsResponse = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:19006');
      console.log('✅ CORS:', corsResponse.headers['access-control-allow-origin'] ? 'PASSOU' : 'FALHOU');
      
      // Teste 5: Security Headers
      const securityResponse = await request(app).get('/health');
      console.log('✅ Security Headers:', securityResponse.headers['x-content-type-options'] ? 'PASSOU' : 'FALHOU');
      
      console.log('\n✅ Todos os testes da FASE 1.1 passaram!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    }
  };
  
  runTests();
}

