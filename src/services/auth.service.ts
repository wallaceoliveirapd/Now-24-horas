/**
 * Service de autenticação
 */

import { apiClient } from './api/client';
import { ApiResponse, ApiError } from './api/types';

export interface RegisterData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  senha: string;
  cpf?: string;
}

export interface VerifyOtpData {
  emailOuTelefone: string;
  codigo: string;
}

export interface ResendOtpData {
  emailOuTelefone: string;
  tipo: 'verificacao' | 'recuperacao_senha';
}

export interface LoginData {
  emailOuTelefone: string;
  senha: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  telefone: string;
  nomeCompleto: string;
  cpf?: string;
  tipoUsuario: string;
  fotoPerfil?: string;
  emailVerificado: boolean;
  telefoneVerificado: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  precisaVerificarOtp?: boolean;
  precisaCompletarPerfil?: boolean;
  emailOuTelefone?: string;
}

class AuthService {
  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<{ user: User }> {
    try {
      const response = await apiClient.post<{ id: string; email: string; telefone: string; nomeCompleto: string; emailVerificado: boolean; telefoneVerificado: boolean }>(
        '/api/auth/register',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao registrar usuário');
      }

      return {
        user: {
          id: response.data.id,
          email: response.data.email,
          telefone: response.data.telefone,
          nomeCompleto: response.data.nomeCompleto,
          emailVerificado: response.data.emailVerificado,
          telefoneVerificado: response.data.telefoneVerificado,
          tipoUsuario: 'cliente',
        },
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Verificar código OTP
   */
  async verifyOtp(data: VerifyOtpData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/verify-otp',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao verificar código OTP');
      }

      // Salvar tokens
      apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reenviar código OTP
   */
  async resendOtp(data: ResendOtpData): Promise<void> {
    try {
      console.log('📧 Frontend: Tentando reenviar OTP');
      console.log('   Dados:', data);
      
      const response = await apiClient.post<{ message: string }>(
        '/api/auth/resend-otp',
        data
      );

      console.log('   Resposta recebida:', response);

      if (!response.success) {
        console.error('   ❌ Erro na resposta:', response.error);
        throw new Error(response.error?.message || 'Erro ao reenviar código OTP');
      }

      console.log('   ✅ OTP reenviado com sucesso');
    } catch (error: any) {
      console.error('   ❌ Erro ao reenviar OTP:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Fazer login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{
        precisaVerificarOtp?: boolean;
        emailOuTelefone?: string;
        usuario?: {
          id: string;
          email: string;
          telefone: string;
          nomeCompleto?: string;
          tipoUsuario?: string;
          emailVerificado?: boolean;
          telefoneVerificado?: boolean;
        };
        tokens?: AuthTokens;
      }>(
        '/api/auth/login',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao fazer login');
      }

      const usuarioData = response.data.usuario;
      if (!usuarioData) {
        throw new Error('Resposta inválida do servidor');
      }

      // Sempre salvar tokens se estiverem presentes (agora o backend sempre retorna)
      if (response.data.tokens) {
        apiClient.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }

      return {
        user: {
          id: usuarioData.id,
          email: usuarioData.email,
          telefone: usuarioData.telefone,
          nomeCompleto: usuarioData.nomeCompleto || '',
          tipoUsuario: usuarioData.tipoUsuario || 'cliente',
          emailVerificado: usuarioData.emailVerificado || false,
          telefoneVerificado: usuarioData.telefoneVerificado || false,
        },
        tokens: response.data.tokens || { accessToken: '', refreshToken: '' },
        precisaVerificarOtp: response.data.precisaVerificarOtp || false,
        emailOuTelefone: response.data.emailOuTelefone || data.emailOuTelefone,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Renovar token de acesso
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<{ tokens: AuthTokens }>(
        '/api/auth/refresh',
        { refreshToken }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao renovar token');
      }

      // Salvar novos tokens
      apiClient.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );

      return response.data.tokens;
    } catch (error: any) {
      // Limpar tokens se refresh falhou
      apiClient.clearTokens();
      throw this.handleError(error);
    }
  }

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = apiClient.getAccessToken();
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignorar erros no logout
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpar tokens localmente
      apiClient.clearTokens();
    }
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.getAccessToken() !== null;
  }

  /**
   * Obter token de acesso atual
   */
  getAccessToken(): string | null {
    return apiClient.getAccessToken();
  }

  /**
   * Tratar erros da API
   */
  private handleError(error: any): Error {
    if (error.code && error.message) {
      // Já é um ApiError
      return new Error(error.message);
    }

    if (error.message) {
      return error;
    }

    return new Error('Erro desconhecido ao comunicar com o servidor');
  }
}

export const authService = new AuthService();

