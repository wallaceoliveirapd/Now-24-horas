import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, optionalAuthenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { validateCouponSchema } from '../validators/coupon.validator';
import { couponService } from '../../services/coupon.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

/**
 * GET /api/coupons
 * Listar cupons disponíveis
 * Endpoint público (não requer autenticação, mas usa userId se autenticado)
 */
router.get('/', optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const coupons = await couponService.getAvailableCoupons(userId);

    res.json({
      success: true,
      data: {
        cupons: coupons,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/coupons/:codigo
 * Obter cupom específico por código
 */
router.get('/:codigo', optionalAuthenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codigo = req.params.codigo.toUpperCase();
    const cupom = await couponService.getCouponByCode(codigo);

    res.json({
      success: true,
      data: {
        cupom,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/coupons/validate
 * Validar cupom para uso
 */
router.post(
  '/validate',
  optionalAuthenticate,
  validate(validateCouponSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { codigo, valorPedido } = req.body;

      const cupom = await couponService.validateCoupon(codigo, userId, valorPedido);

      // Calcular desconto para mostrar ao usuário
      const subtotal = valorPedido || 0;
      const taxaEntrega = 900; // R$9,00
      const desconto = couponService.calculateDiscount(cupom, subtotal, taxaEntrega);

      res.json({
        success: true,
        message: 'Cupom válido',
        data: {
          cupom,
          descontoCalculado: desconto,
          valorComDesconto: subtotal + taxaEntrega - desconto,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as couponRoutes };

