import { Router, Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services/notification.service';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { updateNotificationPreferencesSchema } from '../validators/notification.validator';

const router = Router();

/**
 * GET /api/notifications
 * Listar notificações do usuário
 */
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;
      const apenasNaoLidas = req.query.apenasNaoLidas === 'true';

      const result = await notificationService.getUserNotifications(
        userId,
        pagina,
        limite,
        apenasNaoLidas
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/notifications/unread-count
 * Obter contador de notificações não lidas
 */
router.get(
  '/unread-count',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          total: count,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.patch(
  '/:id/read',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: {
          notificacao: notification,
        },
        message: 'Notificação marcada como lida',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/notifications/read-all
 * Marcar todas as notificações como lidas
 */
router.patch(
  '/read-all',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/notifications/preferences
 * Obter preferências de notificação
 */
router.get(
  '/preferences',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const preferences = await notificationService.getNotificationPreferences(userId);

      res.json({
        success: true,
        data: {
          preferencias: preferences,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/notifications/preferences
 * Atualizar preferências de notificação
 */
router.put(
  '/preferences',
  authenticateToken,
  validate(updateNotificationPreferencesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const preferences = await notificationService.updateNotificationPreferences(userId, req.body);

      res.json({
        success: true,
        data: {
          preferencias: preferences,
        },
        message: 'Preferências atualizadas com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as notificationRoutes };

