#!/usr/bin/env ts-node

/**
 * Script para popular o banco de dados com dados iniciais
 * 
 * Uso:
 *   npm run db:seed
 */

import { db, closeConnection } from '../config/database';
import { usuarios, categorias, cupons, stories } from '../models/schema';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Verificar se já existe dados
    const existingUsers = await db.select().from(usuarios).limit(1);
    if (existingUsers.length > 0) {
      console.log('⚠️  Banco de dados já possui dados. Pulando seed.');
      return;
    }

    // Criar usuário admin padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(usuarios).values({
      email: 'admin@now24horas.com',
      telefone: '(83) 99999-9999',
      nomeCompleto: 'Administrador',
      senhaHash: hashedPassword,
      emailVerificado: true,
      telefoneVerificado: true,
      tipoUsuario: 'administrador',
    }).returning();

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar categorias
    const categoriesData = [
      { nome: 'Bebidas', slug: 'bebidas', ordem: 1, criadoPor: adminUser.id },
      { nome: 'Vinhos', slug: 'vinhos', ordem: 2, criadoPor: adminUser.id },
      { nome: 'Carnes', slug: 'carnes', ordem: 3, criadoPor: adminUser.id },
      { nome: 'Lanches', slug: 'lanches', ordem: 4, criadoPor: adminUser.id },
      { nome: 'Mercearia', slug: 'mercearia', ordem: 5, criadoPor: adminUser.id },
      { nome: 'Limpeza', slug: 'limpeza', ordem: 6, criadoPor: adminUser.id },
      { nome: 'Frios', slug: 'frios', ordem: 7, criadoPor: adminUser.id },
      { nome: 'Todos', slug: 'todos', ordem: 8, criadoPor: adminUser.id },
    ];

    const insertedCategories = await db.insert(categorias).values(categoriesData).returning();
    console.log(`✅ ${insertedCategories.length} categorias criadas`);

    // Criar cupons de exemplo
    const couponsData = [
      {
        codigo: 'BEMVINDO20',
        descricao: 'Desconto fixo de R$ 20,00',
        tipoDesconto: 'fixo' as const,
        valorDesconto: 2000, // R$ 20,00 em centavos
        valorMinimoPedido: 5000, // R$ 50,00
        descontoEntrega: false,
        entregaObrigatoria: false,
        validoDe: new Date(),
        validoAte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        limiteUso: 1000,
        limiteUsoPorUsuario: 1,
        criadoPor: adminUser.id,
      },
      {
        codigo: 'DESCONTO10',
        descricao: 'Desconto de 10% limitado a R$ 20,00',
        tipoDesconto: 'percentual' as const,
        valorDesconto: 10, // 10%
        valorMinimoPedido: 3000, // R$ 30,00
        valorMaximoDesconto: 2000, // R$ 20,00 máximo
        descontoEntrega: false,
        entregaObrigatoria: false,
        validoDe: new Date(),
        validoAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        limiteUso: 500,
        limiteUsoPorUsuario: 1,
        criadoPor: adminUser.id,
      },
      {
        codigo: 'ENTREGA15',
        descricao: 'Desconto percentual com entrega obrigatória',
        tipoDesconto: 'percentual' as const,
        valorDesconto: 15, // 15%
        valorMinimoPedido: 4000, // R$ 40,00
        descontoEntrega: false,
        entregaObrigatoria: true,
        validoDe: new Date(),
        validoAte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        limiteUso: 300,
        limiteUsoPorUsuario: 1,
        criadoPor: adminUser.id,
      },
    ];

    const insertedCoupons = await db.insert(cupons).values(couponsData).returning();
    console.log(`✅ ${insertedCoupons.length} cupons criados`);

    // Criar stories de exemplo
    const storiesData = [
      {
        titulo: 'Nova promoção',
        imagemUrl: '/images/banners-home/default.png',
        ordem: 1,
        ativo: true,
        criadoPor: adminUser.id,
      },
      {
        titulo: 'Produtos frescos',
        imagemUrl: '/images/banners-home/default.png',
        ordem: 2,
        ativo: true,
        criadoPor: adminUser.id,
      },
      {
        titulo: 'Delivery rápido',
        imagemUrl: '/images/banners-home/default.png',
        ordem: 3,
        ativo: true,
        criadoPor: adminUser.id,
      },
      {
        titulo: 'Ofertas do dia',
        imagemUrl: '/images/banners-home/default.png',
        ordem: 4,
        ativo: true,
        criadoPor: adminUser.id,
      },
      {
        titulo: 'Novidades',
        imagemUrl: '/images/banners-home/default.png',
        ordem: 5,
        ativo: true,
        criadoPor: adminUser.id,
      },
    ];

    const insertedStories = await db.insert(stories).values(storiesData).returning();
    console.log(`✅ ${insertedStories.length} stories criadas`);

    console.log('✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  }
}

seed()
  .then(async () => {
    console.log('🎉 Seed finalizado!');
    await closeConnection();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Erro fatal no seed:', error);
    await closeConnection();
    process.exit(1);
  });

