import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { addCartItemSchema, updateCartItemQuantitySchema, applyCouponSchema } from '../validators/cart.validator';
import { cartService } from '../../services/cart.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

// Todos os endpoints requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/cart
 * Obter carrinho completo do usuário logado
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    const cart = await cartService.getCart(req.user.id);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/items
 * Adicionar item ao carrinho
 */
router.post(
  '/items',
  validate(addCartItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const item = await cartService.addItem(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Item adicionado ao carrinho',
        data: {
          item,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/cart/items/:id
 * Atualizar quantidade de um item
 */
router.put(
  '/items/:id',
  validate(updateCartItemQuantitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const item = await cartService.updateItemQuantity(
        req.user.id,
        req.params.id,
        req.body.quantidade
      );

      res.json({
        success: true,
        message: 'Quantidade atualizada',
        data: {
          item,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/cart/items/:id
 * Remover item do carrinho
 */
router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    await cartService.removeItem(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Item removido do carrinho',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart
 * Limpar carrinho (remover todos os itens)
 */
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    await cartService.clearCart(req.user.id);

    res.json({
      success: true,
      message: 'Carrinho limpo',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/apply-coupon
 * Aplicar cupom ao carrinho
 */
router.post(
  '/apply-coupon',
  validate(applyCouponSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const cupom = await cartService.applyCoupon(req.user.id, req.body.codigo);

      res.json({
        success: true,
        message: 'Cupom aplicado com sucesso',
        data: {
          cupom,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/cart/coupon
 * Remover cupom do carrinho
 */
router.delete('/coupon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    await cartService.removeCoupon(req.user.id);

    res.json({
      success: true,
      message: 'Cupom removido do carrinho',
    });
  } catch (error) {
    next(error);
  }
});

export { router as cartRoutes };

