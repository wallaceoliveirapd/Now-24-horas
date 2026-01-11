import { db } from '../config/database';
import { 
  pedidos, 
  produtos, 
  itensPedido, 
  usuarios, 
  transacoesPagamento,
  categorias,
  avaliacoesProdutos,
  cupons,
} from '../models/schema';
import { 
  eq, 
  and, 
  gte, 
  lte, 
  sql, 
  desc, 
  count,
  sum,
  avg,
  inArray,
} from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para analytics e relatórios administrativos
 */
export class AnalyticsService {
  /**
   * Obter dados do dashboard administrativo
   */
  async getDashboardData(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Total de vendas (receita)
    const [salesResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${transacoesPagamento.valor}), 0)`,
        count: count(),
      })
      .from(transacoesPagamento)
      .where(
        and(
          eq(transacoesPagamento.status, 'aprovado'),
          dateFilter ? gte(transacoesPagamento.criadoEm, dateFilter.start) : undefined,
          dateFilter ? lte(transacoesPagamento.criadoEm, dateFilter.end) : undefined
        )
      );

    // Total de pedidos
    const [ordersResult] = await db
      .select({
        total: count(),
        pendentes: sql<number>`COUNT(CASE WHEN ${pedidos.status} = 'pendente' THEN 1 END)`,
        confirmados: sql<number>`COUNT(CASE WHEN ${pedidos.status} = 'confirmado' THEN 1 END)`,
        entregues: sql<number>`COUNT(CASE WHEN ${pedidos.status} = 'entregue' THEN 1 END)`,
        cancelados: sql<number>`COUNT(CASE WHEN ${pedidos.status} = 'cancelado' THEN 1 END)`,
      })
      .from(pedidos)
      .where(
        dateFilter
          ? and(
              gte(pedidos.criadoEm, dateFilter.start),
              lte(pedidos.criadoEm, dateFilter.end)
            )
          : undefined
      );

    // Pedidos do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayOrders] = await db
      .select({
        count: count(),
        total: sql<number>`COALESCE(SUM(${pedidos.total}), 0)`,
      })
      .from(pedidos)
      .where(gte(pedidos.criadoEm, today));

    // Produtos mais vendidos
    const topProducts = await db
      .select({
        produtoId: itensPedido.produtoId,
        nome: produtos.nome,
        quantidade: sql<number>`SUM(${itensPedido.quantidade})`,
        receita: sql<number>`SUM(${itensPedido.precoUnitario} * ${itensPedido.quantidade})`,
      })
      .from(itensPedido)
      .innerJoin(pedidos, eq(itensPedido.pedidoId, pedidos.id))
      .innerJoin(produtos, eq(itensPedido.produtoId, produtos.id))
      .where(
        and(
          dateFilter
            ? and(
                gte(pedidos.criadoEm, dateFilter.start),
                lte(pedidos.criadoEm, dateFilter.end)
              )
            : undefined,
          sql`${pedidos.status} != 'cancelado'`
        )
      )
      .groupBy(itensPedido.produtoId, produtos.nome)
      .orderBy(desc(sql`SUM(${itensPedido.quantidade})`))
      .limit(10);

    // Total de usuários
    const [usersResult] = await db
      .select({
        total: count(),
        novos: sql<number>`COUNT(CASE WHEN ${usuarios.criadoEm} >= ${dateFilter?.start || sql`NOW() - INTERVAL '30 days'`} THEN 1 END)`,
      })
      .from(usuarios)
      .where(
        dateFilter
          ? and(
              gte(usuarios.criadoEm, dateFilter.start),
              lte(usuarios.criadoEm, dateFilter.end)
            )
          : undefined
      );

    // Receita por método de pagamento
    const revenueByMethod = await db
      .select({
        metodo: transacoesPagamento.metodoPagamento,
        total: sql<number>`COALESCE(SUM(${transacoesPagamento.valor}), 0)`,
        count: count(),
      })
      .from(transacoesPagamento)
      .where(
        and(
          eq(transacoesPagamento.status, 'aprovado'),
          dateFilter
            ? and(
                gte(transacoesPagamento.criadoEm, dateFilter.start),
                lte(transacoesPagamento.criadoEm, dateFilter.end)
              )
            : undefined
        )
      )
      .groupBy(transacoesPagamento.metodoPagamento);

    return {
      vendas: {
        total: Number(salesResult?.total || 0),
        quantidade: Number(salesResult?.count || 0),
      },
      pedidos: {
        total: Number(ordersResult?.total || 0),
        pendentes: Number(ordersResult?.pendentes || 0),
        confirmados: Number(ordersResult?.confirmados || 0),
        entregues: Number(ordersResult?.entregues || 0),
        cancelados: Number(ordersResult?.cancelados || 0),
      },
      pedidosHoje: {
        quantidade: Number(todayOrders?.count || 0),
        total: Number(todayOrders?.total || 0),
      },
      produtosMaisVendidos: topProducts.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        quantidade: Number(p.quantidade),
        receita: Number(p.receita),
      })),
      usuarios: {
        total: Number(usersResult?.total || 0),
        novos: Number(usersResult?.novos || 0),
      },
      receitaPorMetodo: revenueByMethod.map((r) => ({
        metodo: r.metodo,
        total: Number(r.total),
        quantidade: Number(r.count),
      })),
    };
  }

  /**
   * Analytics de produtos
   */
  async getProductsAnalytics(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Produtos mais vendidos com detalhes
    const topProducts = await db
      .select({
        produtoId: itensPedido.produtoId,
        nome: produtos.nome,
        categoria: categorias.nome,
        quantidadeVendida: sql<number>`SUM(${itensPedido.quantidade})`,
        receita: sql<number>`SUM(${itensPedido.precoUnitario} * ${itensPedido.quantidade})`,
        avaliacaoMedia: sql<number>`COALESCE(AVG(${avaliacoesProdutos.nota}), 0)`,
        quantidadeAvaliacoes: sql<number>`COUNT(DISTINCT ${avaliacoesProdutos.id})`,
      })
      .from(itensPedido)
      .innerJoin(pedidos, eq(itensPedido.pedidoId, pedidos.id))
      .innerJoin(produtos, eq(itensPedido.produtoId, produtos.id))
      .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
      .leftJoin(avaliacoesProdutos, eq(produtos.id, avaliacoesProdutos.produtoId))
      .where(
        and(
          dateFilter
            ? and(
                gte(pedidos.criadoEm, dateFilter.start),
                lte(pedidos.criadoEm, dateFilter.end)
              )
            : undefined,
          sql`${pedidos.status} != 'cancelado'`
        )
      )
      .groupBy(
        itensPedido.produtoId,
        produtos.nome,
        categorias.nome
      )
      .orderBy(desc(sql`SUM(${itensPedido.quantidade})`))
      .limit(50);

    // Produtos com baixo estoque
    const lowStockProducts = await db
      .select({
        id: produtos.id,
        nome: produtos.nome,
        estoque: produtos.estoque,
        statusEstoque: produtos.statusEstoque,
      })
      .from(produtos)
      .where(
        and(
          eq(produtos.ativo, true),
          sql`${produtos.estoque} < 10 OR ${produtos.statusEstoque} = 'baixo_estoque'`
        )
      )
      .orderBy(produtos.estoque)
      .limit(20);

    // Produtos sem vendas (simplificado - apenas produtos ativos sem itens de pedido)
    const productsWithoutSales = await db
      .select({
        id: produtos.id,
        nome: produtos.nome,
        estoque: produtos.estoque,
      })
      .from(produtos)
      .leftJoin(itensPedido, eq(produtos.id, itensPedido.produtoId))
      .leftJoin(pedidos, eq(itensPedido.pedidoId, pedidos.id))
      .where(
        and(
          eq(produtos.ativo, true),
          sql`${itensPedido.id} IS NULL OR (${pedidos.status} = 'cancelado' OR ${pedidos.status} IS NULL)`
        )
      )
      .groupBy(produtos.id, produtos.nome, produtos.estoque)
      .limit(20);

    return {
      produtosMaisVendidos: topProducts.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        categoria: p.categoria,
        quantidadeVendida: Number(p.quantidadeVendida),
        receita: Number(p.receita),
        avaliacaoMedia: Number(p.avaliacaoMedia),
        quantidadeAvaliacoes: Number(p.quantidadeAvaliacoes),
      })),
      produtosBaixoEstoque: lowStockProducts.map((p) => ({
        id: p.id,
        nome: p.nome,
        estoque: Number(p.estoque),
        statusEstoque: p.statusEstoque,
      })),
      produtosSemVendas: productsWithoutSales.map((p) => ({
        id: p.id,
        nome: p.nome,
        estoque: Number(p.estoque),
      })),
    };
  }

  /**
   * Analytics de usuários
   */
  async getUsersAnalytics(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Total de usuários por tipo
    const usersByType = await db
      .select({
        tipo: usuarios.tipoUsuario,
        total: count(),
      })
      .from(usuarios)
      .where(
        dateFilter
          ? and(
              gte(usuarios.criadoEm, dateFilter.start),
              lte(usuarios.criadoEm, dateFilter.end)
            )
          : undefined
      )
      .groupBy(usuarios.tipoUsuario);

    // Usuários mais ativos (mais pedidos)
    const topUsers = await db
      .select({
        usuarioId: pedidos.usuarioId,
        nome: usuarios.nomeCompleto,
        email: usuarios.email,
        totalPedidos: count(),
        totalGasto: sql<number>`COALESCE(SUM(${pedidos.total}), 0)`,
      })
      .from(pedidos)
      .innerJoin(usuarios, eq(pedidos.usuarioId, usuarios.id))
      .where(
        and(
          dateFilter
            ? and(
                gte(pedidos.criadoEm, dateFilter.start),
                lte(pedidos.criadoEm, dateFilter.end)
              )
            : undefined,
          sql`${pedidos.status} != 'cancelado'`
        )
      )
      .groupBy(pedidos.usuarioId, usuarios.nomeCompleto, usuarios.email)
      .orderBy(desc(count()))
      .limit(20);

    // Novos usuários por período
    const newUsersByPeriod = await db
      .select({
        periodo: sql<string>`DATE_TRUNC('day', ${usuarios.criadoEm})`,
        total: count(),
      })
      .from(usuarios)
      .where(
        dateFilter
          ? and(
              gte(usuarios.criadoEm, dateFilter.start),
              lte(usuarios.criadoEm, dateFilter.end)
            )
          : gte(usuarios.criadoEm, sql`NOW() - INTERVAL '30 days'`)
      )
      .groupBy(sql`DATE_TRUNC('day', ${usuarios.criadoEm})`)
      .orderBy(desc(sql`DATE_TRUNC('day', ${usuarios.criadoEm})`))
      .limit(30);

    return {
      usuariosPorTipo: usersByType.map((u) => ({
        tipo: u.tipo,
        total: Number(u.total),
      })),
      usuariosMaisAtivos: topUsers.map((u) => ({
        usuarioId: u.usuarioId,
        nome: u.nome,
        email: u.email,
        totalPedidos: Number(u.totalPedidos),
        totalGasto: Number(u.totalGasto),
      })),
      novosUsuariosPorPeriodo: newUsersByPeriod.map((u) => ({
        data: u.periodo,
        total: Number(u.total),
      })),
    };
  }

  /**
   * Analytics de pedidos
   */
  async getOrdersAnalytics(startDate?: Date, endDate?: Date) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Pedidos por status
    const ordersByStatus = await db
      .select({
        status: pedidos.status,
        total: count(),
        valorTotal: sql<number>`COALESCE(SUM(${pedidos.total}), 0)`,
      })
      .from(pedidos)
      .where(
        dateFilter
          ? and(
              gte(pedidos.criadoEm, dateFilter.start),
              lte(pedidos.criadoEm, dateFilter.end)
            )
          : undefined
      )
      .groupBy(pedidos.status);

    // Pedidos por período (diário)
    const ordersByPeriod = await db
      .select({
        periodo: sql<string>`DATE_TRUNC('day', ${pedidos.criadoEm})`,
        total: count(),
        valorTotal: sql<number>`COALESCE(SUM(${pedidos.total}), 0)`,
      })
      .from(pedidos)
      .where(
        dateFilter
          ? and(
              gte(pedidos.criadoEm, dateFilter.start),
              lte(pedidos.criadoEm, dateFilter.end)
            )
          : gte(pedidos.criadoEm, sql`NOW() - INTERVAL '30 days'`)
      )
      .groupBy(sql`DATE_TRUNC('day', ${pedidos.criadoEm})`)
      .orderBy(desc(sql`DATE_TRUNC('day', ${pedidos.criadoEm})`))
      .limit(30);

    // Ticket médio
    const [ticketMedio] = await db
      .select({
        ticketMedio: sql<number>`COALESCE(AVG(${pedidos.total}), 0)`,
      })
      .from(pedidos)
      .where(
        and(
          dateFilter
            ? and(
                gte(pedidos.criadoEm, dateFilter.start),
                lte(pedidos.criadoEm, dateFilter.end)
              )
            : undefined,
          sql`${pedidos.status} != 'cancelado'`
        )
      );

    // Taxa de cancelamento
    const [cancellationRate] = await db
      .select({
        total: count(),
        cancelados: sql<number>`COUNT(CASE WHEN ${pedidos.status} = 'cancelado' THEN 1 END)`,
      })
      .from(pedidos)
      .where(
        dateFilter
          ? and(
              gte(pedidos.criadoEm, dateFilter.start),
              lte(pedidos.criadoEm, dateFilter.end)
            )
          : undefined
      );

    const taxaCancelamento =
      Number(cancellationRate?.total || 0) > 0
        ? (Number(cancellationRate?.cancelados || 0) / Number(cancellationRate?.total || 1)) * 100
        : 0;

    return {
      pedidosPorStatus: ordersByStatus.map((o) => ({
        status: o.status,
        quantidade: Number(o.total),
        valorTotal: Number(o.valorTotal),
      })),
      pedidosPorPeriodo: ordersByPeriod.map((o) => ({
        data: o.periodo,
        quantidade: Number(o.total),
        valorTotal: Number(o.valorTotal),
      })),
      ticketMedio: Number(ticketMedio?.ticketMedio || 0),
      taxaCancelamento: Number(taxaCancelamento.toFixed(2)),
    };
  }

  /**
   * Relatório de vendas
   */
  async getSalesReport(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json') {
    const sales = await db
      .select({
        data: pedidos.criadoEm,
        numeroPedido: pedidos.numeroPedido,
        cliente: usuarios.nomeCompleto,
        email: usuarios.email,
        status: pedidos.status,
        subtotal: pedidos.subtotal,
        taxaEntrega: pedidos.taxaEntrega,
        desconto: pedidos.desconto,
        valorTotal: pedidos.total,
        metodoPagamento: transacoesPagamento.metodoPagamento,
        statusPagamento: transacoesPagamento.status,
      })
      .from(pedidos)
      .innerJoin(usuarios, eq(pedidos.usuarioId, usuarios.id))
      .leftJoin(transacoesPagamento, eq(pedidos.id, transacoesPagamento.pedidoId))
      .where(
        and(
          gte(pedidos.criadoEm, startDate),
          lte(pedidos.criadoEm, endDate)
        )
      )
      .orderBy(desc(pedidos.criadoEm));

    if (format === 'csv') {
      return this.convertToCSV(sales, [
        'data',
        'numeroPedido',
        'cliente',
        'email',
        'status',
        'subtotal',
        'taxaEntrega',
        'desconto',
        'valorTotal',
        'metodoPagamento',
        'statusPagamento',
      ]);
    }

    return {
      periodo: {
        inicio: startDate,
        fim: endDate,
      },
      totalRegistros: sales.length,
      vendas: sales.map((s) => ({
        data: s.data,
        numeroPedido: s.numeroPedido,
        cliente: s.cliente,
        email: s.email,
        status: s.status,
        subtotal: Number(s.subtotal),
        taxaEntrega: Number(s.taxaEntrega),
        desconto: Number(s.desconto),
        valorTotal: Number(s.valorTotal),
        metodoPagamento: s.metodoPagamento,
        statusPagamento: s.statusPagamento,
      })),
    };
  }

  /**
   * Relatório de produtos
   */
  async getProductsReport(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json') {
    const products = await db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,
        categoria: categorias.nome,
        precoBase: produtos.precoBase,
        precoFinal: produtos.precoFinal,
        estoque: produtos.estoque,
        quantidadeVendida: sql<number>`COALESCE(SUM(${itensPedido.quantidade}), 0)`,
        receita: sql<number>`COALESCE(SUM(${itensPedido.precoUnitario} * ${itensPedido.quantidade}), 0)`,
        avaliacaoMedia: sql<number>`COALESCE(AVG(${avaliacoesProdutos.nota}), 0)`,
      })
      .from(produtos)
      .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
      .leftJoin(itensPedido, eq(produtos.id, itensPedido.produtoId))
      .leftJoin(pedidos, eq(itensPedido.pedidoId, pedidos.id))
      .leftJoin(avaliacoesProdutos, eq(produtos.id, avaliacoesProdutos.produtoId))
      .where(
        and(
          gte(pedidos.criadoEm, startDate),
          lte(pedidos.criadoEm, endDate),
          sql`${pedidos.status} != 'cancelado' OR ${pedidos.status} IS NULL`
        )
      )
      .groupBy(
        produtos.id,
        produtos.nome,
        categorias.nome,
        produtos.precoBase,
        produtos.precoFinal,
        produtos.estoque
      )
      .orderBy(desc(sql`SUM(${itensPedido.quantidade})`));

    if (format === 'csv') {
      return this.convertToCSV(products, [
        'produtoId',
        'nome',
        'categoria',
        'precoBase',
        'precoFinal',
        'estoque',
        'quantidadeVendida',
        'receita',
        'avaliacaoMedia',
      ]);
    }

    return {
      periodo: {
        inicio: startDate,
        fim: endDate,
      },
      totalRegistros: products.length,
      produtos: products.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        categoria: p.categoria,
        precoBase: Number(p.precoBase),
        precoFinal: Number(p.precoFinal),
        estoque: Number(p.estoque),
        quantidadeVendida: Number(p.quantidadeVendida),
        receita: Number(p.receita),
        avaliacaoMedia: Number(p.avaliacaoMedia),
      })),
    };
  }

  /**
   * Construir filtro de data
   */
  private buildDateFilter(startDate?: Date, endDate?: Date): { start: Date; end: Date } | null {
    if (!startDate && !endDate) {
      return null;
    }

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const end = endDate || new Date();

    // Normalizar para início e fim do dia
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Converter dados para CSV
   */
  private convertToCSV(data: any[], fields: string[]): string {
    const headers = fields.join(',');
    const rows = data.map((item) =>
      fields.map((field) => {
        const value = item[field];
        if (value === null || value === undefined) {
          return '';
        }
        // Escapar vírgulas e aspas
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

export const analyticsService = new AnalyticsService();

