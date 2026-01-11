import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createOrderSchema, cancelOrderSchema } from '../validators/order.validator';
import { processPaymentSchema } from '../validators/payment.validator';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * POST /api/orders
 * Criar pedido a partir do carrinho
 */
router.post(
  '/',
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const order = await orderService.createOrder(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: {
          pedido: order,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/orders
 * Listar pedidos do usuário
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as 'pendente' | 'aguardando_pagamento' | 'confirmado' | 'preparando' | 'saiu_para_entrega' | 'entregue' | 'cancelado' | 'reembolsado' | undefined;
    const pagina = req.query.pagina ? parseInt(req.query.pagina as string) : undefined;
    const limite = req.query.limite ? parseInt(req.query.limite as string) : undefined;

    const result = await orderService.getUserOrders(userId, {
      status,
      pagina,
      limite,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:id
 * Obter detalhes de um pedido específico
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orderId = req.params.id;

    const order = await orderService.getOrderById(orderId, userId);

    res.json({
      success: true,
      data: {
        pedido: order,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/orders/:id/pay
 * Processar pagamento de um pedido específico
 * Endpoint conveniente para processar pagamento após criar pedido
 */
router.post(
  '/:id/pay',
  validate(processPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('📥 [OrderRoutes] POST /api/orders/:id/pay recebido');
      const userId = req.user!.id;
      const orderId = req.params.id;
      console.log('📥 [OrderRoutes] Dados recebidos:', {
        pedidoId: orderId,
        metodoPagamento: req.body.metodoPagamento,
        cartaoId: req.body.cartaoId,
        userId,
      });

      // Garantir que o pedidoId da URL corresponde ao do body
      const paymentData = {
        ...req.body,
        pedidoId: orderId,
      };

      const result = await paymentService.processPayment(userId, paymentData);
      console.log('📥 [OrderRoutes] Pagamento processado com sucesso');

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
 * POST /api/orders/:id/cancel
 * Cancelar pedido
 */
router.post(
  '/:id/cancel',
  validate(cancelOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const orderId = req.params.id;
      const motivo = req.body.motivo;

      await orderService.cancelOrder(orderId, userId, motivo);

      res.json({
        success: true,
        message: 'Pedido cancelado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as orderRoutes };

