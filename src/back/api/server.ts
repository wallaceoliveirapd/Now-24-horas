#!/usr/bin/env ts-node

/**
 * Servidor da API
 * 
 * Uso:
 *   npm run api:start
 */

import { createApp } from './app';
import { env } from '../config/env';

const app = createApp();

const PORT = env.API_PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('🚀 Servidor da API iniciado!');
  console.log(`📍 Ambiente: ${env.NODE_ENV}`);
  console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Rotas de autenticação: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Rotas de usuário: http://localhost:${PORT}/api/users`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT recebido. Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
});

