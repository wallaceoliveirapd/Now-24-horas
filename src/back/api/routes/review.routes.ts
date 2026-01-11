import { Router, Request, Response, NextFunction } from 'express';
import { reviewService } from '../../services/review.service';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import {
  createProductReviewSchema,
  updateProductReviewSchema,
  createOrderReviewSchema,
} from '../validators/review.validator';

const router = Router();

/**
 * GET /api/reviews/products/:productId
 * Listar avaliações de um produto
 */
router.get('/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const limite = parseInt(req.query.limite as string) || 10;

    const result = await reviewService.getProductReviews(productId, pagina, limite);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reviews/products/:productId
 * Criar avaliação de produto
 */
router.post(
  '/products/:productId',
  authenticateToken,
  validate(createProductReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const userId = req.user!.id;

      const review = await reviewService.createProductReview(productId, userId, req.body);

      res.status(201).json({
        success: true,
        data: {
          avaliacao: review,
        },
        message: 'Avaliação criada com sucesso. Aguardando aprovação.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/reviews/:id
 * Atualizar avaliação de produto
 */
router.put(
  '/:id',
  authenticateToken,
  validate(updateProductReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const review = await reviewService.updateProductReview(id, userId, req.body);

      res.json({
        success: true,
        data: {
          avaliacao: review,
        },
        message: 'Avaliação atualizada com sucesso. Aguardando aprovação.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/reviews/:id
 * Deletar avaliação de produto
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await reviewService.deleteProductReview(id, userId);

      res.json({
        success: true,
        message: 'Avaliação deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/reviews/orders/:orderId
 * Criar avaliação de pedido
 */
router.post(
  '/orders/:orderId',
  authenticateToken,
  validate(createOrderReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const userId = req.user!.id;

      const review = await reviewService.createOrderReview(orderId, userId, req.body);

      res.status(201).json({
        success: true,
        data: {
          avaliacao: review,
        },
        message: 'Pedido avaliado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reviews/orders/:orderId
 * Obter avaliação de pedido
 */
router.get(
  '/orders/:orderId',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const userId = req.user!.id;

      const review = await reviewService.getOrderReview(orderId, userId);

      res.json({
        success: true,
        data: {
          avaliacao: review,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as reviewRoutes };

