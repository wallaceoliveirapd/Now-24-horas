import { db } from '../config/database';
import { produtos, categorias, imagensProdutos, secoesPersonalizacao, opcoesPersonalizacao } from '../models/schema';
import { eq, and, or, desc, asc, like, ilike, gte, lte, sql } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

export interface ProductFilters {
  categoriaId?: string;
  busca?: string;
  precoMin?: number;
  precoMax?: number;
  emOferta?: boolean;
  maisPopular?: boolean;
  novidade?: boolean;
  ordenarPor?: 'preco_asc' | 'preco_desc' | 'popularidade' | 'novidade' | 'nome_asc' | 'nome_desc';
  pagina?: number;
  limite?: number;
}

/**
 * Serviço para gerenciar produtos
 */
export class ProductService {
  /**
   * Listar produtos com filtros e paginação
   */
  async getProducts(filters: ProductFilters = {}) {
    const {
      categoriaId,
      busca,
      precoMin,
      precoMax,
      emOferta,
      maisPopular,
      novidade,
      ordenarPor = 'nome_asc',
      pagina = 1,
      limite = 20,
    } = filters;

    const offset = (pagina - 1) * limite;

    // Construir condições WHERE
    const conditions = [eq(produtos.ativo, true)];

    if (categoriaId) {
      conditions.push(eq(produtos.categoriaId, categoriaId));
    }

    if (busca) {
      conditions.push(
        or(
          ilike(produtos.nome, `%${busca}%`),
          ilike(produtos.descricao, `%${busca}%`),
          ilike(produtos.descricaoCompleta, `%${busca}%`)
        )!
      );
    }

    if (precoMin !== undefined) {
      conditions.push(gte(produtos.precoFinal, precoMin));
    }

    if (precoMax !== undefined) {
      conditions.push(lte(produtos.precoFinal, precoMax));
    }

    if (emOferta === true) {
      conditions.push(eq(produtos.emOferta, true));
    }

    if (maisPopular === true) {
      conditions.push(eq(produtos.maisPopular, true));
    }

    if (novidade === true) {
      conditions.push(eq(produtos.novidade, true));
    }

    // Construir query base
    const baseQuery = db
      .select()
      .from(produtos)
      .where(and(...conditions));

    // Aplicar ordenação e executar query
    let products;
    switch (ordenarPor) {
      case 'preco_asc':
        products = await baseQuery.orderBy(asc(produtos.precoFinal)).limit(limite).offset(offset);
        break;
      case 'preco_desc':
        products = await baseQuery.orderBy(desc(produtos.precoFinal)).limit(limite).offset(offset);
        break;
      case 'popularidade':
        products = await baseQuery.orderBy(desc(produtos.vendas), desc(produtos.visualizacoes)).limit(limite).offset(offset);
        break;
      case 'novidade':
        products = await baseQuery.orderBy(desc(produtos.criadoEm)).limit(limite).offset(offset);
        break;
      case 'nome_desc':
        products = await baseQuery.orderBy(desc(produtos.nome)).limit(limite).offset(offset);
        break;
      case 'nome_asc':
      default:
        products = await baseQuery.orderBy(asc(produtos.nome)).limit(limite).offset(offset);
        break;
    }

    // Contar total para paginação
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(produtos)
      .where(and(...conditions));

    const total = Number(totalResult[0]?.count || 0);
    const totalPaginas = Math.ceil(total / limite);

    return {
      produtos: products,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
        temProximaPagina: pagina < totalPaginas,
        temPaginaAnterior: pagina > 1,
      },
    };
  }

  /**
   * Obter produto por ID com detalhes completos
   */
  async getProductById(productId: string) {
    const [product] = await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.id, productId),
          eq(produtos.ativo, true)
        )
      )
      .limit(1);

    if (!product) {
      throw createError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    // Buscar imagens do produto
    const images = await db
      .select()
      .from(imagensProdutos)
      .where(eq(imagensProdutos.produtoId, productId))
      .orderBy(asc(imagensProdutos.ordem));

    // Buscar seções de personalização
    const sections = await db
      .select()
      .from(secoesPersonalizacao)
      .where(
        and(
          eq(secoesPersonalizacao.produtoId, productId),
          eq(secoesPersonalizacao.ativo, true)
        )
      )
      .orderBy(asc(secoesPersonalizacao.ordem));

    // Buscar opções de cada seção
    const sectionsWithOptions = await Promise.all(
      sections.map(async (section) => {
        const options = await db
          .select()
          .from(opcoesPersonalizacao)
          .where(
            and(
              eq(opcoesPersonalizacao.secaoId, section.id),
              eq(opcoesPersonalizacao.ativo, true)
            )
          )
          .orderBy(asc(opcoesPersonalizacao.ordem));

        return {
          ...section,
          opcoes: options,
        };
      })
    );

    // Incrementar visualizações
    await db
      .update(produtos)
      .set({ visualizacoes: sql`${produtos.visualizacoes} + 1` })
      .where(eq(produtos.id, productId));

    return {
      ...product,
      imagens: images,
      personalizacoes: sectionsWithOptions,
    };
  }

  /**
   * Obter produtos populares
   */
  async getPopularProducts(limit: number = 10) {
    return await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.ativo, true),
          eq(produtos.maisPopular, true)
        )
      )
      .orderBy(desc(produtos.vendas), desc(produtos.visualizacoes))
      .limit(limit);
  }

  /**
   * Obter produtos em oferta
   */
  async getOffersProducts(limit: number = 10) {
    return await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.ativo, true),
          eq(produtos.emOferta, true)
        )
      )
      .orderBy(desc(produtos.valorDesconto), desc(produtos.vendas))
      .limit(limit);
  }

  /**
   * Obter produtos novos
   */
  async getNewProducts(limit: number = 10) {
    return await db
      .select()
      .from(produtos)
      .where(
        and(
          eq(produtos.ativo, true),
          eq(produtos.novidade, true)
        )
      )
      .orderBy(desc(produtos.criadoEm))
      .limit(limit);
  }
}

export const productService = new ProductService();

