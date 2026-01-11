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
 * GET /api/admin/analytics/dashboard
 * Obter dados do dashboard administrativo
 */
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const data = await analyticsService.getDashboardData(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/analytics/products
 * Obter analytics de produtos
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const data = await analyticsService.getProductsAnalytics(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/analytics/users
 * Obter analytics de usuários
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const data = await analyticsService.getUsersAnalytics(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/analytics/orders
 * Obter analytics de pedidos
 */
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const data = await analyticsService.getOrdersAnalytics(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRoutes };

