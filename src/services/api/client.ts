/**
 * Cliente HTTP base para comunicação com a API
 */

import { ApiResponse, ApiError } from './types';

// Obter URL da API dinamicamente
const getApiBaseUrl = (): string => {
  // No Expo, variáveis EXPO_PUBLIC_* são injetadas em process.env em tempo de build
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // Fallback: tentar detectar se está em desenvolvimento
  // Em dispositivos físicos/emuladores, localhost não funciona
  // Use o IP da sua máquina: http://SEU_IP:3000
  // Exemplo: http://192.168.1.100:3000
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

// Log da URL da API (apenas em desenvolvimento)
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  /**
   * Carregar tokens do AsyncStorage
   */
  private async loadTokensFromStorage() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (storedAccessToken) this.accessToken = storedAccessToken;
      if (storedRefreshToken) this.refreshToken = storedRefreshToken;
    } catch (error) {
      console.warn('Erro ao carregar tokens do storage:', error);
    }
  }

  /**
   * Salvar tokens no AsyncStorage
   */
  private async saveTokensToStorage(accessToken: string, refreshToken: string) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);
    } catch (error) {
      console.warn('Erro ao salvar tokens no storage:', error);
    }
  }

  /**
   * Limpar tokens do AsyncStorage
   */
  private async clearTokensFromStorage() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.warn('Erro ao limpar tokens do storage:', error);
    }
  }

  /**
   * Definir tokens
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.saveTokensToStorage(accessToken, refreshToken);
  }

  /**
   * Limpar tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.clearTokensFromStorage();
  }

  /**
   * Obter access token atual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Renovar token usando refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    // Se já existe uma requisição de refresh em andamento, aguardar ela
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    this.refreshPromise = (async () => {
      try {
        // Timeout de 10 segundos para refresh token também
        const timeout = 10000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: this.refreshToken,
            }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          const data: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error?.message || 'Erro ao renovar token');
          }

          const { accessToken, refreshToken } = data.data!.tokens;
          this.setTokens(accessToken, refreshToken);

          return accessToken;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        // Se refresh falhou, limpar tokens e relançar erro
        this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Fazer requisição HTTP com timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Adicionar token de autenticação se disponível
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken && !endpoint.includes('/auth/refresh')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Timeout variável: 30 segundos para login/registro, 10 segundos para outros
    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    const timeout = isAuthEndpoint ? 30000 : 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json();

      // Se recebeu 401 e não é endpoint de refresh, tentar renovar token
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && this.refreshToken) {
        try {
          const newAccessToken = await this.refreshAccessToken();
          // Tentar novamente com novo token (com timeout também)
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
          
          try {
            const retryResponse = await fetch(url, {
              ...options,
              headers,
              signal: retryController.signal,
            });
            clearTimeout(retryTimeoutId);
            return await retryResponse.json();
          } catch (retryError: any) {
            clearTimeout(retryTimeoutId);
            throw retryError;
          }
        } catch (refreshError) {
          // Se refresh falhou, limpar tokens e relançar erro
          this.clearTokens();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      if (!response.ok) {
        const error: ApiError = {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || 'Erro desconhecido',
          details: data.error?.details,
          status: response.status,
        };
        throw error;
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Se já é um ApiError, relançar
      if (error.code && error.message) {
        throw error;
      }

      // Log detalhado do erro em desenvolvimento
      if (__DEV__) {
        console.error('❌ Erro na requisição:', {
          url,
          method: options.method || 'GET',
          error: error.message,
          errorType: error.name,
          baseURL: this.baseURL,
        });
      }

      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao conectar com o servidor';
      let errorCode = 'NETWORK_ERROR';

      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        // Mensagem mais específica baseada no endpoint
        if (endpoint.includes('/auth/login')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://192.168.2.44:3000';
        } else if (endpoint.includes('/auth/register')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://192.168.2.44:3000';
        } else {
          errorMessage = 'Tempo de conexão esgotado. Verifique se o backend está rodando.';
        }
        errorCode = 'TIMEOUT';
      } else if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        errorMessage = `Não foi possível conectar ao servidor em ${this.baseURL}. Verifique se o backend está rodando e se a URL está correta.`;
        errorCode = 'CONNECTION_FAILED';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Tempo de conexão esgotado. Tente novamente.';
        errorCode = 'TIMEOUT';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Erro de rede ou outro erro
      throw {
        code: errorCode,
        message: errorMessage,
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Exportar instância singleton
export const apiClient = new ApiClient();

