import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { z } from 'zod';
import { db } from '../../config/database';
import { usuarios } from '../../models/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { createError } from '../middlewares/error-handler';
import { pushNotificationService } from '../../services/push-notification.service';

const router = Router();

// Todos os endpoints de usuário requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/users/me
 * Obter dados do usuário logado
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    const [usuario] = await db
      .select({
        id: usuarios.id,
        email: usuarios.email,
        telefone: usuarios.telefone,
        nomeCompleto: usuarios.nomeCompleto,
        cpf: usuarios.cpf,
        tipoUsuario: usuarios.tipoUsuario,
        fotoPerfil: usuarios.fotoPerfil,
        emailVerificado: usuarios.emailVerificado,
        telefoneVerificado: usuarios.telefoneVerificado,
        criadoEm: usuarios.criadoEm,
        atualizadoEm: usuarios.atualizadoEm,
      })
      .from(usuarios)
      .where(eq(usuarios.id, req.user.id))
      .limit(1);

    if (!usuario) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        usuario,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 * Atualizar dados do usuário logado
 */
const updateUserSchema = z.object({
  nomeCompleto: z.string().min(3).max(100).optional(),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  fotoPerfil: z.string().url().optional(),
});

router.put(
  '/me',
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const updateData: any = {};

      if (req.body.nomeCompleto) {
        updateData.nomeCompleto = req.body.nomeCompleto;
      }

      if (req.body.telefone) {
        const telefoneLimpo = req.body.telefone.replace(/\D/g, '');
        
        // Verificar se telefone já está em uso por outro usuário
        const [existingUser] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.telefone, telefoneLimpo))
          .limit(1);

        if (existingUser && existingUser.id !== req.user.id) {
          throw createError('Telefone já está em uso', 409, 'PHONE_ALREADY_EXISTS');
        }

        updateData.telefone = telefoneLimpo;
      }

      if (req.body.cpf) {
        updateData.cpf = req.body.cpf.replace(/\D/g, '');
      }

      if (req.body.fotoPerfil) {
        updateData.fotoPerfil = req.body.fotoPerfil;
      }

      updateData.atualizadoEm = new Date();

      const [usuarioAtualizado] = await db
        .update(usuarios)
        .set(updateData)
        .where(eq(usuarios.id, req.user.id))
        .returning({
          id: usuarios.id,
          email: usuarios.email,
          telefone: usuarios.telefone,
          nomeCompleto: usuarios.nomeCompleto,
          cpf: usuarios.cpf,
          tipoUsuario: usuarios.tipoUsuario,
          fotoPerfil: usuarios.fotoPerfil,
          emailVerificado: usuarios.emailVerificado,
          telefoneVerificado: usuarios.telefoneVerificado,
        });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          usuario: usuarioAtualizado,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/change-password
 * Alterar senha do usuário logado
 */
const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

router.post(
  '/change-password',
  validate(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const { senhaAtual, novaSenha } = req.body;

      // Buscar usuário com senha
      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.id, req.user.id))
        .limit(1);

      if (!usuario) {
        throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);

      if (!senhaValida) {
        throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db
        .update(usuarios)
        .set({
          senhaHash: novaSenhaHash,
          atualizadoEm: new Date(),
        })
        .where(eq(usuarios.id, req.user.id));

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/complete-profile
 * Completar perfil do usuário (CPF e telefone)
 */
const completeProfileSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),
});

router.post(
  '/complete-profile',
  validate(completeProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const { cpf, telefone } = req.body;
      const cpfLimpo = cpf.replace(/\D/g, '');
      const telefoneLimpo = telefone.replace(/\D/g, '');

      // Verificar se CPF já está em uso por outro usuário
      const [existingCpfUser] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.cpf, cpfLimpo))
        .limit(1);

      if (existingCpfUser && existingCpfUser.id !== req.user.id) {
        throw createError('CPF já está em uso', 409, 'CPF_ALREADY_EXISTS');
      }

      // Verificar se telefone já está em uso por outro usuário
      const [existingPhoneUser] = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.telefone, telefoneLimpo))
        .limit(1);

      if (existingPhoneUser && existingPhoneUser.id !== req.user.id) {
        throw createError('Telefone já está em uso', 409, 'PHONE_ALREADY_EXISTS');
      }

      // Atualizar usuário
      const [usuarioAtualizado] = await db
        .update(usuarios)
        .set({
          cpf: cpfLimpo,
          telefone: telefoneLimpo,
          telefoneVerificado: true, // Marcar telefone como verificado ao completar perfil
          atualizadoEm: new Date(),
        })
        .where(eq(usuarios.id, req.user.id))
        .returning({
          id: usuarios.id,
          email: usuarios.email,
          telefone: usuarios.telefone,
          nomeCompleto: usuarios.nomeCompleto,
          cpf: usuarios.cpf,
          tipoUsuario: usuarios.tipoUsuario,
          fotoPerfil: usuarios.fotoPerfil,
          emailVerificado: usuarios.emailVerificado,
          telefoneVerificado: usuarios.telefoneVerificado,
        });

      res.json({
        success: true,
        message: 'Perfil completado com sucesso',
        data: {
          usuario: usuarioAtualizado,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/push-token
 * Salvar token de push notification do usuário
 */
const savePushTokenSchema = z.object({
  expoPushToken: z.string().min(1, 'Token é obrigatório'),
  platform: z.enum(['ios', 'android', 'web']).optional(),
});

router.post(
  '/push-token',
  validate(savePushTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
      }

      const { expoPushToken } = req.body;

      await pushNotificationService.savePushToken(req.user.id, expoPushToken);

      res.json({
        success: true,
        message: 'Token de push notification salvo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Rota de teste (manter para compatibilidade)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rotas de usuário funcionando',
  });
});

export { router as userRoutes };

