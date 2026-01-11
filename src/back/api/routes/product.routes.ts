import { Router, Request, Response, NextFunction } from 'express';
import { productService, ProductFilters } from '../../services/product.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

/**
 * GET /api/products
 * Listar produtos com filtros e paginação
 * Query params:
 *   - categoriaId: Filtrar por categoria
 *   - busca: Buscar por nome/descrição
 *   - precoMin: Preço mínimo (em centavos)
 *   - precoMax: Preço máximo (em centavos)
 *   - emOferta: true/false
 *   - maisPopular: true/false
 *   - novidade: true/false
 *   - ordenarPor: preco_asc | preco_desc | popularidade | novidade | nome_asc | nome_desc
 *   - pagina: Número da página (padrão: 1)
 *   - limite: Itens por página (padrão: 20)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: ProductFilters = {
      categoriaId: req.query.categoriaId as string | undefined,
      busca: req.query.busca as string | undefined,
      precoMin: req.query.precoMin ? parseInt(req.query.precoMin as string, 10) : undefined,
      precoMax: req.query.precoMax ? parseInt(req.query.precoMax as string, 10) : undefined,
      emOferta: req.query.emOferta === 'true' ? true : req.query.emOferta === 'false' ? false : undefined,
      maisPopular: req.query.maisPopular === 'true' ? true : req.query.maisPopular === 'false' ? false : undefined,
      novidade: req.query.novidade === 'true' ? true : req.query.novidade === 'false' ? false : undefined,
      ordenarPor: req.query.ordenarPor as ProductFilters['ordenarPor'] | undefined,
      pagina: req.query.pagina ? parseInt(req.query.pagina as string, 10) : undefined,
      limite: req.query.limite ? parseInt(req.query.limite as string, 10) : undefined,
    };

    const result = await productService.getProducts(filters);

    res.json({
      success: true,
      data: {
        produtos: result.produtos,
        paginacao: result.paginacao,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/popular
 * Obter produtos populares
 * IMPORTANTE: Esta rota deve vir ANTES da rota /:id
 */
router.get('/popular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const products = await productService.getPopularProducts(limit);

    res.json({
      success: true,
      data: {
        produtos: products,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/offers
 * Obter produtos em oferta
 * IMPORTANTE: Esta rota deve vir ANTES da rota /:id
 */
router.get('/offers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const products = await productService.getOffersProducts(limit);

    res.json({
      success: true,
      data: {
        produtos: products,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/new
 * Obter produtos novos
 * IMPORTANTE: Esta rota deve vir ANTES da rota /:id
 */
router.get('/new', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const products = await productService.getNewProducts(limit);

    res.json({
      success: true,
      data: {
        produtos: products,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Obter detalhes completos de um produto
 * IMPORTANTE: Esta rota deve vir DEPOIS das rotas específicas (popular, offers, new)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.json({
      success: true,
      data: {
        produto: product,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as productRoutes };

