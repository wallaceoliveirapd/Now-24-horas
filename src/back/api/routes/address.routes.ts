import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import { addressService } from '../../services/address.service';
import { cepService } from '../../services/cep.service';
import { ibgeService } from '../../services/ibge.service';
import { orderService } from '../../services/order.service';
import { createError } from '../middlewares/error-handler';

const router = Router();

// Endpoints públicos (antes do middleware de autenticação)

/**
 * GET /api/addresses/cep/:cep
 * Buscar dados do endereço pelo CEP usando ViaCEP
 */
router.get('/cep/:cep', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cep } = req.params;

    if (!cep) {
      throw createError('CEP é obrigatório', 400, 'CEP_REQUIRED');
    }

    const dadosCep = await cepService.buscarCepFormatado(cep);

    if (!dadosCep) {
      res.status(404).json({
        success: false,
        message: 'CEP não encontrado',
        error: {
          code: 'CEP_NOT_FOUND',
          message: 'O CEP informado não foi encontrado na base de dados',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        cep: dadosCep.cep,
        rua: dadosCep.rua,
        bairro: dadosCep.bairro,
        cidade: dadosCep.cidade,
        estado: dadosCep.estado,
        complemento: dadosCep.complemento,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/addresses/estados
 * Listar todos os estados do Brasil (IBGE)
 */
router.get('/estados', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estados = await ibgeService.buscarEstadosFormatados();

    res.json({
      success: true,
      data: {
        estados,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/addresses/estados/:sigla
 * Obter dados de um estado específico (IBGE)
 */
router.get('/estados/:sigla', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sigla } = req.params;

    if (!sigla || sigla.length !== 2) {
      throw createError('Sigla do estado deve ter 2 caracteres', 400, 'INVALID_STATE_SIGLA');
    }

    const estado = await ibgeService.buscarEstadoPorSigla(sigla);

    if (!estado) {
      res.status(404).json({
        success: false,
        message: 'Estado não encontrado',
        error: {
          code: 'ESTADO_NOT_FOUND',
          message: 'O estado informado não foi encontrado',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        estado: {
          id: estado.id,
          sigla: estado.sigla,
          nome: estado.nome,
          regiao: estado.regiao.nome,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/addresses/estados/:sigla/municipios
 * Listar municípios de um estado (IBGE)
 */
router.get('/estados/:sigla/municipios', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sigla } = req.params;

    if (!sigla || sigla.length !== 2) {
      throw createError('Sigla do estado deve ter 2 caracteres', 400, 'INVALID_STATE_SIGLA');
    }

    const municipios = await ibgeService.buscarMunicipiosFormatados(sigla);

    res.json({
      success: true,
      data: {
        municipios,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Todos os outros endpoints requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/addresses
 * Listar endereços do usuário logado
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    const addresses = await addressService.getUserAddresses(req.user.id);

    res.json({
      success: true,
      data: {
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/addresses/:id
 * Obter endereço específico
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    const address = await addressService.getAddressById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/addresses
 * Criar novo endereço
 */
router.post(
  '/',
  validate(createAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const address = await addressService.createAddress(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Endereço criado com sucesso',
        data: {
          address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/addresses/:id
 * Atualizar endereço
 */
router.put(
  '/:id',
  validate(updateAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const address = await addressService.updateAddress(req.params.id, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Endereço atualizado com sucesso',
        data: {
          address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/addresses/:id
 * Deletar endereço
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    await addressService.deleteAddress(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Endereço deletado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/addresses/:id/set-default
 * Definir endereço como padrão
 */
router.patch('/:id/set-default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    const address = await addressService.setDefaultAddress(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Endereço definido como padrão',
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/addresses/:id/delivery-time
 * Calcular tempo de entrega para um endereço
 */
router.get('/:id/delivery-time', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    // Verificar se o endereço pertence ao usuário
    await addressService.getAddressById(req.params.id, req.user.id);

    // Calcular tempo de entrega
    const deliveryTime = await orderService.calculateDeliveryTime(req.params.id);

    res.json({
      success: true,
      data: {
        deliveryTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as addressRoutes };

