import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { processPaymentSchema } from '../validators/payment.validator';
import { paymentService } from '../../services/payment.service';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * POST /api/payments/process
 * Processar pagamento
 */
router.post(
  '/process',
  validate(processPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await paymentService.processPayment(userId, req.body);

      res.json({
        success: true,
        message: 'Pagamento processado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/payments/transaction/:id
 * Obter transação por ID
 */
router.get('/transaction/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id;

    const transaction = await paymentService.getTransaction(transactionId, userId);

    res.json({
      success: true,
      data: {
        transacao: transaction,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as paymentRoutes };

