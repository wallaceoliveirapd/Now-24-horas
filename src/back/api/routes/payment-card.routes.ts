import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { addCardSchema, updateCardSchema } from '../validators/payment.validator';
import { paymentCardService } from '../../services/payment-card.service';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/payment-cards
 * Listar cartões do usuário
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cards = await paymentCardService.getUserCards(userId);

    res.json({
      success: true,
      data: {
        cartoes: cards,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payment-cards/:id
 * Obter cartão específico
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cardId = req.params.id;

    const card = await paymentCardService.getCardById(cardId, userId);

    res.json({
      success: true,
      data: {
        cartao: card,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payment-cards
 * Adicionar cartão
 */
router.post(
  '/',
  validate(addCardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const card = await paymentCardService.addCard(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Cartão adicionado com sucesso',
        data: {
          cartao: card,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/payment-cards/:id
 * Atualizar cartão
 */
router.put(
  '/:id',
  validate(updateCardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const cardId = req.params.id;

      const card = await paymentCardService.updateCard(cardId, userId, req.body);

      res.json({
        success: true,
        message: 'Cartão atualizado com sucesso',
        data: {
          cartao: card,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/payment-cards/:id/set-default
 * Definir cartão como padrão
 */
router.patch('/:id/set-default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cardId = req.params.id;

    const card = await paymentCardService.setDefaultCard(cardId, userId);

    res.json({
      success: true,
      message: 'Cartão definido como padrão',
      data: {
        cartao: card,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/payment-cards/:id
 * Remover cartão
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cardId = req.params.id;

    await paymentCardService.removeCard(cardId, userId);

    res.json({
      success: true,
      message: 'Cartão removido com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

export { router as paymentCardRoutes };

