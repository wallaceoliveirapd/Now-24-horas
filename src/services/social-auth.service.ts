/**
 * Service de autenticação social
 */

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { apiClient } from './api/client';
import { AuthResponse } from './auth.service';

/**
 * Obter variável de ambiente do Expo
 * No Expo, variáveis EXPO_PUBLIC_* são injetadas em process.env em tempo de build
 */
const getEnvVar = (key: string): string => {
  // No Expo, variáveis de ambiente são acessadas via process.env
  // Elas são injetadas em tempo de build, então podem estar disponíveis
  const value = process.env[key];
  
  // Log para debug (apenas em desenvolvimento)
  if (__DEV__ && !value) {
    console.warn(`⚠️  Variável de ambiente ${key} não encontrada`);
    console.warn(`   Certifique-se de que o arquivo .env.local existe na raiz do projeto`);
    console.warn(`   E que contém: ${key}=seu-valor-aqui`);
    console.warn(`   Após adicionar, reinicie o servidor Expo: npm start`);
  }
  
  return value || '';
};

class SocialAuthService {
  /**
   * Login com Google
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Obter Client ID dinamicamente (pode não estar disponível na importação)
      const googleClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_ID');
      
      // Verificar se o Client ID está configurado
      if (!googleClientId || googleClientId.trim() === '') {
        throw new Error('Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env');
      }

      // Configurar requisição de autenticação
      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
      });

      // Iniciar autenticação
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type !== 'success') {
        if (result.type === 'cancel') {
          throw new Error('Autenticação com Google cancelada');
        } else if (result.type === 'error') {
          const errorMsg = result.error?.message || result.error?.error_description || 'Erro desconhecido';
          throw new Error(this.translateError(errorMsg));
        }
        throw new Error('Autenticação com Google cancelada');
      }

      // Extrair token ID
      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error('Token ID não recebido do Google');
      }

      // Enviar token para o backend
      const response = await apiClient.post<AuthResponse & { precisaCompletarPerfil?: boolean }>(
        '/api/auth/social/google',
        { idToken }
      );

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Erro ao fazer login com Google';
        throw new Error(this.translateError(errorMsg));
      }

      // Se precisa completar perfil, retornar sem salvar tokens ainda
      if (response.data.precisaCompletarPerfil) {
        return {
          ...response.data,
          precisaCompletarPerfil: true,
        };
      }

      // Salvar tokens apenas se não precisar completar perfil
      if (response.data.tokens) {
        apiClient.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login com Apple
   */
  async loginWithApple(): Promise<AuthResponse> {
    try {
      // Verificar se está disponível (apenas iOS)
      if (Platform.OS !== 'ios') {
        throw new Error('Login com Apple disponível apenas no iOS');
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Login com Apple não está disponível neste dispositivo');
      }

      // Solicitar credenciais
      let credential;
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
      } catch (appleError: any) {
        if (appleError.code === 'ERR_CANCELED') {
          throw new Error('Login com Apple cancelado');
        }
        throw new Error(this.translateError(appleError.message || 'Erro ao fazer login com Apple'));
      }

      if (!credential.identityToken) {
        throw new Error('Token de identidade não recebido da Apple');
      }

      // Enviar credenciais para o backend
      const response = await apiClient.post<AuthResponse & { precisaCompletarPerfil?: boolean }>(
        '/api/auth/social/apple',
        {
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          user: credential.user,
          email: credential.email,
          fullName: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : undefined,
        }
      );

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Erro ao fazer login com Apple';
        throw new Error(this.translateError(errorMsg));
      }

      // Se precisa completar perfil, retornar sem salvar tokens ainda
      if (response.data.precisaCompletarPerfil) {
        return {
          ...response.data,
          precisaCompletarPerfil: true,
        };
      }

      // Salvar tokens apenas se não precisar completar perfil
      if (response.data.tokens) {
        apiClient.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login com Facebook
   */
  async loginWithFacebook(): Promise<AuthResponse> {
    try {
      // Obter App ID dinamicamente (pode não estar disponível na importação)
      const facebookAppId = getEnvVar('EXPO_PUBLIC_FACEBOOK_APP_ID');
      
      // Verificar se o App ID está configurado
      if (!facebookAppId || facebookAppId.trim() === '') {
        throw new Error('Facebook App ID não configurado. Configure EXPO_PUBLIC_FACEBOOK_APP_ID no arquivo .env');
      }

      // Configurar requisição de autenticação
      const request = new AuthSession.AuthRequest({
        clientId: facebookAppId,
        scopes: ['public_profile', 'email'],
        responseType: AuthSession.ResponseType.Token,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
      });

      // Iniciar autenticação
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      });

      if (result.type !== 'success') {
        if (result.type === 'cancel') {
          throw new Error('Autenticação com Facebook cancelada');
        } else if (result.type === 'error') {
          const errorMsg = result.error?.message || result.error?.error_description || 'Erro desconhecido';
          throw new Error(this.translateError(errorMsg));
        }
        throw new Error('Autenticação com Facebook cancelada');
      }

      // Extrair access token
      const accessToken = result.params.access_token;
      if (!accessToken) {
        throw new Error('Access token não recebido do Facebook');
      }

      // Enviar token para o backend
      const response = await apiClient.post<AuthResponse & { precisaCompletarPerfil?: boolean }>(
        '/api/auth/social/facebook',
        { accessToken }
      );

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Erro ao fazer login com Facebook';
        throw new Error(this.translateError(errorMsg));
      }

      // Se precisa completar perfil, retornar sem salvar tokens ainda
      if (response.data.precisaCompletarPerfil) {
        return {
          ...response.data,
          precisaCompletarPerfil: true,
        };
      }

      // Salvar tokens apenas se não precisar completar perfil
      if (response.data.tokens) {
        apiClient.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Traduzir mensagens de erro em inglês para português
   */
  private translateError(message: string): string {
    // Se a mensagem já está em português e contém instruções, não traduzir
    if (message.includes('Configure EXPO_PUBLIC') || message.includes('não configurado')) {
      return message;
    }

    const errorTranslations: Record<string, string> = {
      // Erros do expo-auth-session
      'The authorization attempt failed for an unknown reason': 'A tentativa de autorização falhou por um motivo desconhecido',
      'The request was cancelled': 'A solicitação foi cancelada',
      'The request failed': 'A solicitação falhou',
      'Network request failed': 'Falha na conexão de rede',
      'User cancelled the authentication': 'Usuário cancelou a autenticação',
      'Access denied': 'Acesso negado',
      'Invalid client': 'Cliente inválido',
      'Invalid grant': 'Concessão inválida',
      'Invalid request': 'Solicitação inválida',
      'Invalid scope': 'Escopo inválido',
      'Unauthorized client': 'Cliente não autorizado',
      'Unsupported grant type': 'Tipo de concessão não suportado',
      'Unsupported response type': 'Tipo de resposta não suportado',
      
      // Erros específicos do Google
      'access_denied': 'Acesso negado pelo Google',
      'invalid_request': 'Solicitação inválida ao Google',
      'invalid_client': 'Configuração do Google inválida',
      'invalid_grant': 'Autorização do Google inválida',
      'unauthorized_client': 'Cliente Google não autorizado',
      'unsupported_grant_type': 'Tipo de autorização não suportado',
      'Missing required parameter: client_id': 'Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env',
      'Missing required parameter': 'Parâmetro obrigatório não informado',
      'Error 400: invalid_request': 'Solicitação inválida. Verifique as configurações do Google.',
      
      // Erros específicos do Facebook
      'User cancelled': 'Usuário cancelou o login',
      'Permissions error': 'Erro de permissões do Facebook',
      'Network error': 'Erro de conexão com o Facebook',
      'Invalid App ID': 'Facebook App ID inválido ou não configurado',
      'App ID': 'Facebook App ID não configurado',
      'Invalid application ID': 'ID da aplicação Facebook inválido',
      'Invalid App ID': 'Facebook App ID inválido ou não configurado',
      'App ID': 'Facebook App ID não configurado',
      
      // Erros de resposta HTTP
      'Request failed with status code': 'Erro na comunicação com o servidor',
      'timeout of': 'Tempo de espera esgotado',
      'Network Error': 'Erro de conexão',
      'ECONNREFUSED': 'Servidor não disponível',
      'ENOTFOUND': 'Servidor não encontrado',
      
      // Erros genéricos
      'Unknown error': 'Erro desconhecido',
      'Error': 'Ocorreu um erro',
      'Failed': 'Falhou',
      'Cancelled': 'Cancelado',
      'Cancelled by user': 'Cancelado pelo usuário',
    };

    // Verificar tradução exata
    if (errorTranslations[message]) {
      return errorTranslations[message];
    }

    // Verificar tradução parcial (case insensitive)
    // Mas evitar traduzir mensagens que já estão em português
    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(errorTranslations)) {
      // Não traduzir se a mensagem já contém instruções em português
      if (lowerMessage.includes('configure expo_public') || lowerMessage.includes('não configurado')) {
        return message;
      }
      if (lowerMessage.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Se não encontrou tradução, retornar mensagem genérica
    return 'Erro ao fazer login social. Tente novamente.';
  }

  /**
   * Tratar erros
   */
  private handleError(error: any): Error {
    // Se já é um Error com mensagem em português (não traduzir novamente)
    if (error instanceof Error && error.message) {
      // Se a mensagem já contém instruções de configuração, não traduzir
      if (error.message.includes('Configure EXPO_PUBLIC') || error.message.includes('não configurado')) {
        return error;
      }
    }

    // Se já tem código e mensagem traduzida, usar ela
    if (error.code && error.message) {
      return new Error(this.translateError(error.message));
    }

    // Se tem mensagem, traduzir
    if (error.message) {
      const translatedMessage = this.translateError(error.message);
      return new Error(translatedMessage);
    }

    // Se é um objeto de erro do expo-auth-session
    if (error.error) {
      const errorMsg = error.error.message || error.error.error_description || error.error;
      return new Error(this.translateError(String(errorMsg)));
    }

    return new Error('Erro desconhecido ao fazer login social');
  }
}

export const socialAuthService = new SocialAuthService();

