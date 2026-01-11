import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middlewares/validate';
import { registerSchema, verifyOtpSchema, loginSchema, refreshTokenSchema, googleAuthSchema, appleAuthSchema, facebookAuthSchema, resendOtpSchema } from '../validators/auth.validator';
import { authService } from '../../services/auth.service';
import { otpService } from '../../services/otp.service';
import { jwtService } from '../../services/jwt.service';
import { socialAuthService } from '../../services/social-auth.service';
import { createError } from '../middlewares/error-handler';
import { db } from '../../config/database';
import { usuarios } from '../../models/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/auth/register
 * Registro de novo usuário
 */
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nomeCompleto, email, telefone, senha, cpf } = req.body;

      // Criar usuário
      const usuario = await authService.createUser({
        nomeCompleto,
        email,
        telefone,
        senha,
        cpf,
      });

      // Retornar resposta (sem dados sensíveis)
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso. Verifique seu telefone para o código OTP.',
        data: {
          id: usuario.id,
          email: usuario.email,
          telefone: usuario.telefone,
          nomeCompleto: usuario.nomeCompleto,
          emailVerificado: usuario.emailVerificado,
          telefoneVerificado: usuario.telefoneVerificado,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-otp
 * Verificar código OTP
 */
router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emailOuTelefone, codigo, tipo = 'verificacao' } = req.body;

      // Extrair telefone (pode vir como email ou telefone)
      // Se for email, precisamos buscar o telefone do usuário
      let telefoneLimpo: string;
      
      if (emailOuTelefone.includes('@')) {
        // É um email, buscar telefone do usuário
        const { db } = await import('../../config/database');
        const { usuarios } = await import('../../models/schema');
        const { eq } = await import('drizzle-orm');
        
        const [usuario] = await db
          .select({ telefone: usuarios.telefone })
          .from(usuarios)
          .where(eq(usuarios.email, emailOuTelefone.toLowerCase()))
          .limit(1);
        
        if (!usuario) {
          throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        
        telefoneLimpo = usuario.telefone.replace(/\D/g, '');
      } else {
        // É um telefone, limpar formatação
        telefoneLimpo = emailOuTelefone.replace(/\D/g, '');
      }

      // Validar OTP
      const validation = await otpService.validateOtp(telefoneLimpo, codigo, tipo);

      if (!validation.valid) {
        throw createError('Código OTP inválido ou expirado', 400, 'INVALID_OTP');
      }

      // Se for verificação de registro, marcar telefone como verificado
      if (tipo === 'verificacao' && validation.usuarioId) {
        const { db } = await import('../../config/database');
        const { usuarios } = await import('../../models/schema');
        const { eq } = await import('drizzle-orm');

        await db
          .update(usuarios)
          .set({ telefoneVerificado: true })
          .where(eq(usuarios.id, validation.usuarioId));

        // Buscar usuário atualizado
        const [usuario] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.id, validation.usuarioId))
          .limit(1);

        if (!usuario) {
          throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }

        // Gerar tokens JWT
        const tokens = await jwtService.generateTokenPair(
          {
            userId: usuario.id,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
          },
          req.headers['user-agent'],
          req.ip
        );

        res.json({
          success: true,
          message: 'Telefone verificado com sucesso',
          data: {
            usuario: {
              id: usuario.id,
              email: usuario.email,
              telefone: usuario.telefone,
              nomeCompleto: usuario.nomeCompleto,
              tipoUsuario: usuario.tipoUsuario,
              emailVerificado: usuario.emailVerificado,
              telefoneVerificado: true,
            },
            tokens,
          },
        });
      } else {
        res.json({
          success: true,
          message: 'Código OTP verificado com sucesso',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/resend-otp
 * Reenviar código OTP
 */
router.post(
  '/resend-otp',
  validate(resendOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('📧 Reenvio de OTP solicitado');
      console.log('   Body recebido:', req.body);
      
      const { emailOuTelefone, tipo = 'verificacao' } = req.body;

      console.log(`   EmailOuTelefone: ${emailOuTelefone}`);
      console.log(`   Tipo: ${tipo}`);

      // Buscar usuário por email ou telefone
      console.log('   Buscando usuário...');
      const usuario = await authService.findByEmailOrTelefone(emailOuTelefone);

      if (!usuario) {
        console.error('   ❌ Usuário não encontrado');
        throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      console.log(`   ✅ Usuário encontrado: ${usuario.email}`);

      // Limpar telefone se necessário
      const telefoneLimpo = usuario.telefone.replace(/\D/g, '');
      console.log(`   Telefone limpo: ${telefoneLimpo}`);

      // Gerar novo código OTP
      console.log('   Gerando novo código OTP...');
      await otpService.createOtp(
        telefoneLimpo,
        tipo,
        usuario.id,
        usuario.email,
        usuario.nomeCompleto
      );

      console.log('   ✅ Código OTP reenviado com sucesso');

      res.json({
        success: true,
        message: 'Código OTP reenviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login de usuário
 */
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emailOuTelefone, senha } = req.body;

      // Buscar usuário
      const usuario = await authService.findByEmailOrTelefone(emailOuTelefone);

      if (!usuario) {
        throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
      }

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        throw createError('Usuário inativo', 403, 'USER_INACTIVE');
      }

      // Verificar senha
      const senhaValida = await authService.verifyPassword(senha, usuario.senhaHash);

      if (!senhaValida) {
        throw createError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
      }

      // Verificar se telefone está verificado (telefone é obrigatório para login)
      // Email pode ser verificado posteriormente, mas telefone é necessário
      const precisaVerificarOtp = !usuario.telefoneVerificado;
      
      // Gerar tokens JWT (sempre, mesmo se precisar verificar OTP)
      const tokens = await jwtService.generateTokenPair(
        {
          userId: usuario.id,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
        },
        req.headers['user-agent'],
        req.ip
      );
      
      // Se não estiver verificado, gerar novo código OTP mas ainda retornar tokens
      if (precisaVerificarOtp) {
        const telefoneLimpo = usuario.telefone.replace(/\D/g, '');
        await otpService.createOtp(
          telefoneLimpo,
          'verificacao',
          usuario.id,
          usuario.email,
          usuario.nomeCompleto
        );

        res.json({
          success: true,
          message: 'Login realizado, mas é necessário verificar o código OTP',
          data: {
            precisaVerificarOtp: true,
            emailOuTelefone: usuario.email || usuario.telefone,
            usuario: {
              id: usuario.id,
              email: usuario.email,
              telefone: usuario.telefone,
              nomeCompleto: usuario.nomeCompleto,
              tipoUsuario: usuario.tipoUsuario,
              emailVerificado: usuario.emailVerificado,
              telefoneVerificado: usuario.telefoneVerificado,
            },
            tokens, // Retornar tokens mesmo quando precisa verificar
          },
        });
        return;
      }

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          precisaVerificarOtp: false,
          usuario: {
            id: usuario.id,
            email: usuario.email,
            telefone: usuario.telefone,
            nomeCompleto: usuario.nomeCompleto,
            tipoUsuario: usuario.tipoUsuario,
            emailVerificado: usuario.emailVerificado,
            telefoneVerificado: usuario.telefoneVerificado,
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Gerar novo access token
      const tokens = await jwtService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          tokens,
        },
      });
    } catch (error: any) {
      if (error.message.includes('inválido') || error.message.includes('expirado') || error.message.includes('não encontrado')) {
        return next(createError(error.message, 401, 'INVALID_REFRESH_TOKEN'));
      }
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout do usuário (invalidar refresh token)
 */
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        throw createError('Refresh token é obrigatório', 400, 'REFRESH_TOKEN_REQUIRED');
      }

      // Invalidar refresh token
      await jwtService.invalidateRefreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/social/google
 * Login com Google
 */
router.post(
  '/social/google',
  validate(googleAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;

      const result = await socialAuthService.authenticateWithGoogle(
        idToken,
        req.headers['user-agent'],
        req.ip
      );

      res.json({
        success: true,
        message: result.precisaCompletarPerfil 
          ? 'Login realizado, mas é necessário completar o perfil' 
          : 'Login com Google realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/social/apple
 * Login com Apple
 */
router.post(
  '/social/apple',
  validate(appleAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identityToken, authorizationCode, email, fullName } = req.body;

      const result = await socialAuthService.authenticateWithApple(
        identityToken,
        authorizationCode,
        email,
        fullName,
        req.headers['user-agent'],
        req.ip
      );

      res.json({
        success: true,
        message: result.precisaCompletarPerfil 
          ? 'Login realizado, mas é necessário completar o perfil' 
          : 'Login com Apple realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/social/facebook
 * Login com Facebook
 */
router.post(
  '/social/facebook',
  validate(facebookAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken } = req.body;

      const result = await socialAuthService.authenticateWithFacebook(
        accessToken,
        req.headers['user-agent'],
        req.ip
      );

      res.json({
        success: true,
        message: result.precisaCompletarPerfil 
          ? 'Login realizado, mas é necessário completar o perfil' 
          : 'Login com Facebook realizado com sucesso',
        data: result,
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
    message: 'Rotas de autenticação funcionando',
  });
});

export { router as authRoutes };

