/**
 * Traduz mensagens de erro em inglês para português
 */
function translateEnglishError(message: string): string {
  const translations: Record<string, string> = {
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
    'User cancelled': 'Usuário cancelou o login',
    'Permissions error': 'Erro de permissões',
    'Network error': 'Erro de conexão',
    'Request failed with status code': 'Erro na comunicação com o servidor',
    'timeout of': 'Tempo de espera esgotado',
    'Network Error': 'Erro de conexão',
    'ECONNREFUSED': 'Servidor não disponível',
    'ENOTFOUND': 'Servidor não encontrado',
    'Unknown error': 'Erro desconhecido',
    'Failed': 'Falhou',
    'Cancelled': 'Cancelado',
    'Cancelled by user': 'Cancelado pelo usuário',
    
    // Erros de configuração OAuth
    'Missing required parameter: client_id': 'Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env',
    'Missing required parameter': 'Parâmetro obrigatório não informado',
    'Invalid App ID': 'Facebook App ID inválido ou não configurado. Configure EXPO_PUBLIC_FACEBOOK_APP_ID',
    'Invalid application ID': 'ID da aplicação inválido',
    'Error 400: invalid_request': 'Solicitação inválida. Verifique as configurações do app.',
    'invalid_request': 'Solicitação inválida',
    'Google Client ID não configurado': 'Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env',
    'Facebook App ID não configurado': 'Facebook App ID não configurado. Configure EXPO_PUBLIC_FACEBOOK_APP_ID no arquivo .env',
    'ID do cliente não configurado': 'Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID no arquivo .env',
  };

  // Verificar tradução exata
  if (translations[message]) {
    return translations[message];
  }

  // Verificar tradução parcial (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
}

/**
 * Traduz códigos de erro da API em mensagens amigáveis para o usuário
 */

export function getErrorMessage(error: any): string {
  // Se já é uma mensagem amigável, retornar direto
  if (typeof error === 'string') {
    return error;
  }

  // Se tem mensagem direta, usar ela
  if (error?.message && typeof error.message === 'string') {
    // Verificar se já é uma mensagem amigável (não contém códigos técnicos)
    if (!error.message.includes('Error:') && !error.message.includes('at ')) {
      return error.message;
    }
  }

  // Traduzir códigos de erro conhecidos
  const errorCode = error?.code || error?.error?.code;
  
  const errorMessages: Record<string, string> = {
    // Autenticação
    'INVALID_CREDENTIALS': 'Email ou senha incorretos. Verifique suas credenciais.',
    'USER_NOT_FOUND': 'Usuário não encontrado. Verifique se o email ou telefone está correto.',
    'INVALID_OTP': 'Código inválido. Verifique o código e tente novamente.',
    'OTP_EXPIRED': 'Código expirado. Solicite um novo código.',
    'OTP_ALREADY_VERIFIED': 'Este código já foi utilizado.',
    'USER_ALREADY_EXISTS': 'Este email ou telefone já está cadastrado.',
    'EMAIL_ALREADY_EXISTS': 'Este email já está cadastrado.',
    'PHONE_ALREADY_EXISTS': 'Este telefone já está cadastrado.',
    'INVALID_REFRESH_TOKEN': 'Sessão expirada. Faça login novamente.',
    'NOT_AUTHENTICATED': 'Você precisa estar logado para acessar esta funcionalidade.',
    'FORBIDDEN': 'Você não tem permissão para realizar esta ação.',
    
    // Autenticação Social
    'INVALID_GOOGLE_TOKEN': 'Token do Google inválido. Tente fazer login novamente.',
    'GOOGLE_VERIFICATION_ERROR': 'Erro ao verificar credenciais do Google. Tente novamente.',
    'INVALID_APPLE_TOKEN': 'Token do Apple inválido. Tente fazer login novamente.',
    'APPLE_VERIFICATION_ERROR': 'Erro ao verificar credenciais do Apple. Tente novamente.',
    'INVALID_FACEBOOK_TOKEN': 'Token do Facebook inválido. Tente fazer login novamente.',
    'FACEBOOK_VERIFICATION_ERROR': 'Erro ao verificar credenciais do Facebook. Tente novamente.',
    'SOCIAL_AUTH_CANCELLED': 'Login social cancelado.',
    'SOCIAL_AUTH_FAILED': 'Falha na autenticação social. Tente novamente.',
    'CPF_ALREADY_EXISTS': 'Este CPF já está cadastrado. Faça login com sua conta original.',
    'PHONE_ALREADY_EXISTS': 'Este telefone já está cadastrado. Faça login com sua conta original.',
    
    // Validação
    'VALIDATION_ERROR': 'Dados inválidos. Verifique os campos preenchidos.',
    'MISSING_REQUIRED_PARAMS': 'Campos obrigatórios não preenchidos.',
    'INVALID_EMAIL': 'Email inválido. Digite um email válido.',
    'INVALID_PHONE': 'Telefone inválido. Digite um telefone válido.',
    'INVALID_CPF': 'CPF inválido. Digite um CPF válido.',
    'WEAK_PASSWORD': 'Senha muito fraca. Use pelo menos 6 caracteres com letras e números.',
    
    // Rede
    'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet e tente novamente.',
    'TIMEOUT': 'Tempo de espera esgotado. Tente novamente.',
    
    // Servidor
    'INTERNAL_SERVER_ERROR': 'Erro no servidor. Tente novamente em alguns instantes.',
    'SERVICE_UNAVAILABLE': 'Serviço temporariamente indisponível. Tente mais tarde.',
    
    // Recursos
    'NOT_FOUND': 'Recurso não encontrado.',
    'ALREADY_EXISTS': 'Este item já existe.',
    'OUT_OF_STOCK': 'Produto fora de estoque.',
    'INSUFFICIENT_STOCK': 'Quantidade insuficiente em estoque.',
    
    // Pagamento
    'PAYMENT_FAILED': 'Pagamento não autorizado. Verifique os dados do cartão.',
    'INVALID_CARD': 'Cartão inválido. Verifique os dados do cartão.',
    'INSUFFICIENT_FUNDS': 'Saldo insuficiente.',
    
    // Pedidos
    'ORDER_NOT_FOUND': 'Pedido não encontrado.',
    'ORDER_CANNOT_BE_CANCELLED': 'Este pedido não pode ser cancelado.',
    'CART_EMPTY': 'Carrinho vazio. Adicione produtos antes de finalizar.',
    
    // Cupons
    'INVALID_COUPON': 'Cupom inválido ou expirado.',
    'COUPON_NOT_FOUND': 'Cupom não encontrado. Verifique o código digitado.',
    'COUPON_INACTIVE': 'Este cupom não está mais ativo.',
    'COUPON_EXPIRED': 'Este cupom expirou.',
    'COUPON_NOT_VALID_YET': 'Este cupom ainda não está válido.',
    'COUPON_EXHAUSTED': 'Este cupom esgotou.',
    'COUPON_USER_LIMIT_EXCEEDED': 'Você já utilizou este cupom o máximo de vezes permitido.',
    'COUPON_ALREADY_USED': 'Este cupom já foi utilizado.',
    'MINIMUM_ORDER_VALUE_NOT_MET': 'Valor mínimo do pedido não atingido.',
    
    // Erros de rede
    'NETWORK_ERROR': 'Erro ao conectar com o servidor. Verifique sua conexão.',
    'CONNECTION_FAILED': 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
    'TIMEOUT': 'Tempo de conexão esgotado. Tente novamente.',
    
    // Padrão
    'UNKNOWN_ERROR': 'Ocorreu um erro inesperado. Tente novamente.',
  };

  // Retornar mensagem traduzida ou mensagem padrão
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  // Se tem mensagem genérica, usar ela
  if (error?.message) {
    // Limpar mensagens técnicas
    let message = error.message
      .replace(/Error: /g, '')
      .replace(/at .*$/gm, '')
      .trim();
    
    // Se a mensagem já contém instruções de configuração, não traduzir
    if (message.includes('Configure EXPO_PUBLIC') || message.includes('no arquivo .env')) {
      return message;
    }
    
    // Traduzir mensagens em inglês do login social
    message = translateEnglishError(message);
    
    if (message && message.length < 200) {
      return message;
    }
  }

  // Mensagem padrão
  return 'Ocorreu um erro. Tente novamente.';
}

/**
 * Verificar se erro é de rede/conexão
 */
export function isNetworkError(error: any): boolean {
  const code = error?.code || error?.error?.code;
  return code === 'NETWORK_ERROR' || code === 'TIMEOUT' || error?.status === 0;
}

/**
 * Verificar se erro é de autenticação
 */
export function isAuthError(error: any): boolean {
  const code = error?.code || error?.error?.code;
  return code === 'NOT_AUTHENTICATED' || code === 'INVALID_REFRESH_TOKEN' || error?.status === 401;
}

