import { Router, Request, Response, NextFunction } from 'express';
import { storyService } from '../../services/story.service';
import { authenticateToken } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/admin';

const router = Router();

/**
 * GET /api/stories
 * Listar stories ativas (público)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeStories = await storyService.getActiveStories();

    res.json({
      success: true,
      data: {
        stories: activeStories,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stories/:id
 * Obter story específica por ID (público)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await storyService.getStoryById(req.params.id);

    res.json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stories/:id/views
 * Incrementar visualizações de uma story (público)
 */
router.post('/:id/views', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await storyService.incrementViews(req.params.id);

    res.json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Todas as rotas abaixo requerem autenticação e admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/stories/admin/all
 * Listar todas as stories (admin)
 */
router.get('/admin/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allStories = await storyService.getAllStories();

    res.json({
      success: true,
      data: {
        stories: allStories,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stories
 * Criar nova story (admin)
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titulo, imagemUrl, ordem, dataInicio, dataFim } = req.body;
    const userId = (req as any).user?.id;

    if (!imagemUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URL da imagem é obrigatória',
        },
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        },
      });
    }

    const story = await storyService.createStory({
      titulo,
      imagemUrl,
      ordem,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
      criadoPor: userId,
    });

    res.status(201).json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/stories/:id
 * Atualizar story (admin)
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titulo, imagemUrl, ordem, ativo, dataInicio, dataFim } = req.body;

    const story = await storyService.updateStory(req.params.id, {
      titulo,
      imagemUrl,
      ordem,
      ativo,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
    });

    res.json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/stories/:id
 * Deletar story (admin)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await storyService.deleteStory(req.params.id);

    res.json({
      success: true,
      data: {
        story,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as storyRoutes };

