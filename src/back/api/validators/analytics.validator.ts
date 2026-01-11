import { z } from 'zod';

/**
 * Schema para validar filtros de data
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Schema para validar formato de relatório
 */
export const reportFormatSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});

/**
 * Schema para relatório de vendas
 */
export const salesReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['json', 'csv']).default('json'),
});

/**
 * Schema para relatório de produtos
 */
export const productsReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['json', 'csv']).default('json'),
});

