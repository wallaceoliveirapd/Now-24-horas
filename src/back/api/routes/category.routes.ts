import { Router, Request, Response, NextFunction } from 'express';
import { categoryService } from '../../services/category.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

/**
 * GET /api/categories
 * Listar categorias ativas
 * Query params:
 *   - principais: true/false - Se true, retorna apenas as 7 principais (para Home)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apenasPrincipais = req.query.principais === 'true';
    
    const categories = apenasPrincipais
      ? await categoryService.getPrincipalCategories()
      : await categoryService.getActiveCategories();

    res.json({
      success: true,
      data: {
        categorias: categories,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/:id
 * Obter categoria específica por ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    res.json({
      success: true,
      data: {
        categoria: category,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/slug/:slug
 * Obter categoria específica por slug
 */
router.get('/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.json({
      success: true,
      data: {
        categoria: category,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as categoryRoutes };

