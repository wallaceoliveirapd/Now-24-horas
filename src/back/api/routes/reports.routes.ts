import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/admin';
import { analyticsService } from '../../services/analytics.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

// Todos os endpoints requerem autenticação e permissão de admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/reports/sales
 * Gerar relatório de vendas
 */
router.get('/sales', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const format = (req.query.format as 'json' | 'csv') || 'json';

    if (!startDate || !endDate) {
      throw createError(
        'startDate e endDate são obrigatórios',
        400,
        'MISSING_REQUIRED_PARAMS'
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw createError('Datas inválidas', 400, 'INVALID_DATE');
    }

    const report = await analyticsService.getSalesReport(start, end, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio-vendas-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`
      );
      res.send(report);
    } else {
      res.json({
        success: true,
        data: report,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/reports/products
 * Gerar relatório de produtos
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const format = (req.query.format as 'json' | 'csv') || 'json';

    if (!startDate || !endDate) {
      throw createError(
        'startDate e endDate são obrigatórios',
        400,
        'MISSING_REQUIRED_PARAMS'
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw createError('Datas inválidas', 400, 'INVALID_DATE');
    }

    const report = await analyticsService.getProductsReport(start, end, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio-produtos-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`
      );
      res.send(report);
    } else {
      res.json({
        success: true,
        data: report,
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as reportsRoutes };

