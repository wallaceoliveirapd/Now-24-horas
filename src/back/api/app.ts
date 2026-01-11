import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

import { env } from '../config/env';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';

// Importar rotas
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { addressRoutes } from './routes/address.routes';
import { categoryRoutes } from './routes/category.routes';
import { productRoutes } from './routes/product.routes';
import { cartRoutes } from './routes/cart.routes';
import { couponRoutes } from './routes/coupon.routes';
import { orderRoutes } from './routes/order.routes';
import { paymentCardRoutes } from './routes/payment-card.routes';
import { paymentRoutes } from './routes/payment.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { favoriteRoutes } from './routes/favorite.routes';
import { reviewRoutes } from './routes/review.routes';
import { notificationRoutes } from './routes/notification.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { reportsRoutes } from './routes/reports.routes';
import { storyRoutes } from './routes/story.routes';

/**
 * Criar e configurar aplicação Express
 */
export function createApp(): Express {
  const app = express();

  // ============================================================================
  // MIDDLEWARES GLOBAIS
  // ============================================================================

  // Segurança
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN?.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Parsing de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging de requisições (em desenvolvimento)
  if (env.NODE_ENV === 'development') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // ============================================================================
  // ROTAS
  // ============================================================================

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'API está funcionando',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Rotas da API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment-cards', paymentCardRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/admin/analytics', analyticsRoutes);
  app.use('/api/admin/reports', reportsRoutes);

  // ============================================================================
  // HANDLERS DE ERRO
  // ============================================================================

  // 404 - Rota não encontrada
  app.use(notFoundHandler);

  // Error handler global
  app.use(errorHandler);

  return app;
}

