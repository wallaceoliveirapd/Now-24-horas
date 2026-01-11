import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService, User, AuthResponse } from '../services/auth.service';
import { socialAuthService } from '../services/social-auth.service';
import { apiClient } from '../services/api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (emailOuTelefone: string, senha: string) => Promise<{ precisaVerificarOtp?: boolean; emailOuTelefone?: string } | void>;
  register: (data: {
    nomeCompleto: string;
    email: string;
    telefone: string;
    senha: string;
    cpf?: string;
  }) => Promise<void>;
  verifyOtp: (emailOuTelefone: string, codigo: string) => Promise<void>;
  resendOtp: (emailOuTelefone: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ precisaCompletarPerfil?: boolean } | void>;
  loginWithApple: () => Promise<{ precisaCompletarPerfil?: boolean } | void>;
  loginWithFacebook: () => Promise<{ precisaCompletarPerfil?: boolean } | void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Atualizar dados do usuário
   */
  const refreshUser = useCallback(async () => {
    try {
      console.log('📡 Fazendo requisição para /api/users/me...');
      
      // Adicionar timeout de 5 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Requisição demorou mais de 5 segundos')), 5000);
      });
      
      const response = await Promise.race([
        apiClient.get<{ usuario: User }>('/api/users/me'),
        timeoutPromise,
      ]);
      
      console.log('📥 Resposta recebida:', response.success ? 'Sucesso' : 'Erro');
      if (response.success && response.data) {
        console.log('👤 Dados do usuário:', {
          id: response.data.usuario.id,
          nomeCompleto: response.data.usuario.nomeCompleto,
          email: response.data.usuario.email,
        });
        setUser(response.data.usuario);
      } else {
        console.error('❌ Resposta sem sucesso:', response.error);
        throw new Error(response.error?.message || 'Erro ao buscar dados do usuário');
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);
      // Não relançar o erro, apenas logar
      // Isso permite que o app continue funcionando mesmo se a requisição falhar
      throw error;
    }
  }, []);

  /**
   * Carregar estado inicial (verificar se há tokens salvos)
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Verificar se há token salvo
        const token = authService.getAccessToken();
        console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
        if (token) {
          // Tentar carregar dados do usuário com timeout
          try {
            console.log('🔄 Carregando dados do usuário...');
            
            // Timeout de 5 segundos para não travar o app
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Timeout ao carregar usuário')), 5000);
            });
            
            await Promise.race([
              refreshUser(),
              timeoutPromise,
            ]);
            
            setIsAuthenticated(true);
            console.log('✅ Usuário carregado com sucesso');
          } catch (error: any) {
            console.error('❌ Erro ao carregar usuário:', error);
            // Se falhou (timeout, erro de rede, etc), limpar tokens mas não bloquear o app
            try {
              await authService.logout();
            } catch (logoutError) {
              console.warn('Erro ao fazer logout:', logoutError);
            }
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('⚠️ Nenhum token encontrado');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar estado de autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // SEMPRE definir loading como false, mesmo se houver erro
        setLoading(false);
        console.log('✅ AuthContext: Loading finalizado');
      }
    };

    loadAuthState();
  }, [refreshUser]);

  /**
   * Fazer login
   */
  const login = useCallback(async (emailOuTelefone: string, senha: string) => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Iniciando login');
      console.log('   EmailOuTelefone:', emailOuTelefone);
      
      const response: AuthResponse = await authService.login({
        emailOuTelefone,
        senha,
      });

      console.log('📥 AuthContext: Resposta do login recebida');
      console.log('   PrecisaVerificarOtp:', response.precisaVerificarOtp);
      console.log('   EmailOuTelefone:', response.emailOuTelefone);

      // SEMPRE autenticar o usuário, mesmo se precisar verificar OTP
      // O modal na Home vai lidar com a verificação
      console.log('✅ AuthContext: Login bem-sucedido, autenticando usuário');
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Se precisa verificar OTP, ainda autenticar mas retornar flag para a tela saber
      if (response.precisaVerificarOtp) {
        console.log('⚠️ AuthContext: Usuário autenticado mas precisa verificar OTP');
        // Não retornar flag, deixar que o usuário entre na Home e veja o modal
      }
      
      // Recarregar dados completos do usuário após login bem-sucedido
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Não foi possível recarregar dados completos do usuário:', refreshError);
        // Não falhar o login se o refresh falhar
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Erro ao fazer login:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  /**
   * Registrar novo usuário
   */
  const register = useCallback(async (data: {
    nomeCompleto: string;
    email: string;
    telefone: string;
    senha: string;
    cpf?: string;
  }) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      // Não definir como autenticado ainda, precisa verificar OTP
      setIsAuthenticated(false);
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar código OTP
   */
  const verifyOtp = useCallback(async (emailOuTelefone: string, codigo: string) => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.verifyOtp({
        emailOuTelefone,
        codigo,
      });

      setUser(response.user);
      setIsAuthenticated(true);
      
      // Recarregar dados completos do usuário após verificação OTP
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Não foi possível recarregar dados completos do usuário:', refreshError);
        // Não falhar a verificação se o refresh falhar
      }
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  /**
   * Reenviar código OTP
   */
  const resendOtp = useCallback(async (emailOuTelefone: string) => {
    try {
      console.log('🔄 AuthContext: Reenviando OTP');
      console.log('   EmailOuTelefone:', emailOuTelefone);
      
      setLoading(true);
      await authService.resendOtp({
        emailOuTelefone,
        tipo: 'verificacao',
      });
      
      console.log('   ✅ AuthContext: OTP reenviado com sucesso');
    } catch (error: any) {
      console.error('   ❌ AuthContext: Erro ao reenviar OTP:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login com Google
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const response: AuthResponse = await socialAuthService.loginWithGoogle();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login com Apple
   */
  const loginWithApple = useCallback(async () => {
    try {
      setLoading(true);
      const response: AuthResponse = await socialAuthService.loginWithApple();
      
      // Se precisa completar perfil, retornar flag sem autenticar
      if (response.precisaCompletarPerfil) {
        return { precisaCompletarPerfil: true };
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login com Facebook
   */
  const loginWithFacebook = useCallback(async () => {
    try {
      setLoading(true);
      const response: AuthResponse = await socialAuthService.loginWithFacebook();
      
      // Se precisa completar perfil, retornar flag sem autenticar
      if (response.precisaCompletarPerfil) {
        return { precisaCompletarPerfil: true };
      }
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fazer logout
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
        loginWithApple,
        loginWithFacebook,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
