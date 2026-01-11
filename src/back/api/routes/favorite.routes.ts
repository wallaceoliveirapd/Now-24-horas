import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { favoriteService } from '../../services/favorite.service';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/favorites
 * Listar favoritos do usuário
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const favorites = await favoriteService.getUserFavorites(userId);

    res.json({
      success: true,
      data: {
        favoritos: favorites,
        total: favorites.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/favorites/check/:productId
 * Verificar se produto está nos favoritos
 */
router.get('/check/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId;

    const isFavorite = await favoriteService.isFavorite(userId, productId);

    res.json({
      success: true,
      data: {
        favoritado: isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/favorites/:productId
 * Adicionar produto aos favoritos
 */
router.post('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId;

    const favorite = await favoriteService.addFavorite(userId, productId);

    res.status(201).json({
      success: true,
      message: 'Produto adicionado aos favoritos',
      data: {
        favorito: favorite,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/favorites/:productId
 * Remover produto dos favoritos
 */
router.delete('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId;

    await favoriteService.removeFavorite(userId, productId);

    res.json({
      success: true,
      message: 'Produto removido dos favoritos',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/favorites/:productId/toggle
 * Toggle favorito (adicionar se não existe, remover se existe)
 */
router.post('/:productId/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const productId = req.params.productId;

    const result = await favoriteService.toggleFavorite(userId, productId);

    res.json({
      success: true,
      message: result.message,
      data: {
        favoritado: result.favoritado,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/favorites/count
 * Contar favoritos do usuário
 */
router.get('/count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const count = await favoriteService.countUserFavorites(userId);

    res.json({
      success: true,
      data: {
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as favoriteRoutes };

