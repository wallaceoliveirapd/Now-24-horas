import { sql as neonSql } from '../config/database';

/**
 * Utilitários para operações comuns no banco de dados
 */

/**
 * Verifica se uma tabela existe
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const result = await neonSql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    )
  `;
  return (result[0] as { exists: boolean }).exists;
}

/**
 * Limpa todas as tabelas (apenas para desenvolvimento/testes)
 */
export async function clearAllTables(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE 
    reviews,
    favorites,
    orders,
    coupons,
    products,
    categories,
    payment_cards,
    addresses,
    users
    CASCADE`);
}

/**
 * Conta registros em uma tabela
 */
export async function countTable(tableName: string): Promise<number> {
  const result = await db.execute(
    sql.raw(`SELECT COUNT(*) as count FROM ${tableName}`)
  );
  return parseInt((result.rows[0] as { count: string }).count, 10);
}

