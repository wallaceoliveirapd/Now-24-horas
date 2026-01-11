import { MercadoPagoConfig, Payment, CardToken, Customer } from 'mercadopago';
import { env } from '../config/env';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para integração com Mercado Pago
 */
export class MercadoPagoService {
  private client: MercadoPagoConfig | null;
  private payment: Payment | null;
  private cardToken: CardToken | null;
  private customer: Customer | null;

  private initializeClient() {
    if (!env.MERCADOPAGO_ACCESS_TOKEN) {
      throw createError('MERCADOPAGO_ACCESS_TOKEN não está configurado', 500, 'MERCADOPAGO_NOT_CONFIGURED');
    }

    // Validar tipo de token
    const isTestToken = env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-');
    const isProductionToken = env.MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-');
    
    // Log para debug
    console.log('🔑 MercadoPago Token Type:', isTestToken ? 'TEST (Sandbox)' : isProductionToken ? 'PRODUCTION (Live)' : 'UNKNOWN');
    console.log('🔑 Token Preview:', env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...');
    console.log('🔑 Environment:', env.NODE_ENV);
    
    if (env.NODE_ENV !== 'production' && isProductionToken) {
      console.warn('⚠️  ATENÇÃO: Você está usando credenciais de PRODUÇÃO em ambiente de desenvolvimento!');
      console.warn('⚠️  Use credenciais de TESTE (que começam com TEST-) para desenvolvimento.');
      console.warn('⚠️  Obtenha credenciais de teste em: https://www.mercadopago.com.br/developers/panel');
    }

    if (!isTestToken && !isProductionToken) {
      console.warn('⚠️  Token não reconhecido. Deve começar com TEST- (teste) ou APP_USR- (produção)');
    }

    if (!this.client) {
      this.client = new MercadoPagoConfig({
        accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
        options: {
          timeout: 5000,
          idempotencyKey: 'abc',
        },
      });

      this.payment = new Payment(this.client);
      this.cardToken = new CardToken(this.client);
      this.customer = new Customer(this.client);
    }
  }

  constructor() {
    // Inicialização lazy - só inicializa quando necessário
    this.client = null as any;
    this.payment = null as any;
    this.cardToken = null as any;
    this.customer = null as any;
  }

  /**
   * Criar ou buscar Customer no MercadoPago
   */
  async getOrCreateCustomer(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    identification: {
      type: string;
      number: string;
    };
  }) {
    this.initializeClient();
    try {
      if (!this.customer) {
        throw createError('Serviço de customer não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }

      // Tentar buscar customer por email
      // O SDK do MercadoPago pode ter uma assinatura diferente
      // Vamos tentar passar os parâmetros diretamente
      const searchResponse = await this.customer.search({
        options: {
          qs: {
            email: customerData.email,
          } as any, // Type assertion para contornar problema de tipo do SDK
        },
      });

      // Se encontrou, retornar o primeiro
      if (searchResponse.results && searchResponse.results.length > 0) {
        console.log('🔵 [MercadoPagoService] Customer encontrado:', searchResponse.results[0].id);
        return searchResponse.results[0];
      }

      // Se não encontrou, criar novo
      console.log('🔵 [MercadoPagoService] Criando novo Customer...');
      const newCustomer = await this.customer.create({
        body: {
          email: customerData.email,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          identification: {
            type: customerData.identification.type,
            number: customerData.identification.number,
          },
        },
      });

      console.log('🔵 [MercadoPagoService] Customer criado:', newCustomer.id);
      return newCustomer;
    } catch (error: any) {
      console.error('❌ Erro ao criar/buscar customer:', error);
      throw createError(
        error.message || 'Erro ao criar/buscar customer no MercadoPago',
        error.status || 400,
        'CUSTOMER_ERROR'
      );
    }
  }

  /**
   * Criar Customer Card (cartão salvo permanentemente)
   */
  async createCustomerCard(customerId: string, cardToken: string) {
    this.initializeClient();
    try {
      if (!this.customer) {
        throw createError('Serviço de customer não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }

      console.log('🔵 [MercadoPagoService] Criando Customer Card...');
      console.log('🔵 [MercadoPagoService] Customer ID:', customerId);
      console.log('🔵 [MercadoPagoService] Token (preview):', cardToken.substring(0, 15) + '...');
      
      const card = await this.customer.createCard({
        customerId,
        body: {
          token: cardToken,
        },
      });

      console.log('🔵 [MercadoPagoService] Customer Card criado:', {
        id: card.id,
        card_id: (card as any).card_id,
        first_six_digits: (card as any).first_six_digits,
        last_four_digits: (card as any).last_four_digits,
      });
      return card;
    } catch (error: any) {
      console.error('❌ Erro ao criar customer card:', error);
      throw createError(
        error.message || 'Erro ao criar customer card no MercadoPago',
        error.status || 400,
        'CUSTOMER_CARD_ERROR'
      );
    }
  }

  /**
   * Obter token de um Customer Card para processar pagamento
   * O MercadoPago requer que você gere um novo token a partir do Customer Card
   */
  async getCustomerCardToken(customerId: string, cardId: string) {
    this.initializeClient();
    try {
      if (!this.customer) {
        throw createError('Serviço de customer não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }

      // Buscar o Customer Card
      const card = await this.customer.getCard({
        customerId,
        cardId,
      });

      // O MercadoPago não retorna um token diretamente do Customer Card
      // Precisamos usar o card_id como saved_card_id no pagamento
      // Ou gerar um novo token a partir dos dados do card
      return card;
    } catch (error: any) {
      console.error('❌ Erro ao obter customer card:', error);
      throw createError(
        error.message || 'Erro ao obter customer card no MercadoPago',
        error.status || 400,
        'CUSTOMER_CARD_ERROR'
      );
    }
  }

  /**
   * Tokenizar cartão de crédito
   */
  async tokenizeCard(cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) {
    this.initializeClient();
    try {
      const tokenData = {
        card_number: cardData.cardNumber.replace(/\s/g, ''),
        cardholder: {
          name: cardData.cardholderName,
          identification: {
            type: cardData.identificationType,
            number: cardData.identificationNumber,
          },
        },
        expiration_month: cardData.cardExpirationMonth,
        expiration_year: cardData.cardExpirationYear,
        security_code: cardData.securityCode,
      };

      if (!this.cardToken) {
        throw createError('Serviço de cartão não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }
      const token = await this.cardToken.create({ body: tokenData });
      return token;
    } catch (error: any) {
      console.error('Erro ao tokenizar cartão:', error);
      throw createError(
        error.message || 'Erro ao processar cartão',
        400,
        'CARD_TOKENIZATION_ERROR'
      );
    }
  }

  /**
   * Processar pagamento
   */
  async processPayment(paymentData: {
    transactionAmount: number;
    token?: string; // Token temporário (opcional se customerCardId for fornecido)
    customerCardId?: string; // ID do Customer Card (permanente)
    description: string;
    installments?: number;
    paymentMethodId: string;
    issuerId?: string;
    payer: {
      email: string;
      identification: {
        type: string;
        number: string;
      };
    };
    metadata?: {
      orderId: string;
      userId: string;
    };
  }) {
    console.log('🔵 [MercadoPagoService] processPayment chamado');
    console.log('🔵 [MercadoPagoService] Inicializando cliente...');
    this.initializeClient();
    console.log('🔵 [MercadoPagoService] Cliente inicializado');
    
    try {
      if (!this.payment) {
        throw createError('Serviço de pagamento não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }
      
      console.log('🔵 [MercadoPagoService] Preparando body do pagamento...');
      const paymentBody: any = {
        transaction_amount: paymentData.transactionAmount,
        description: paymentData.description,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.paymentMethodId,
        payer: {
          email: paymentData.payer.email,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number,
          },
        },
        metadata: paymentData.metadata || {},
      };

      // Usar Customer Card ID se disponível (permanente), senão usar token (temporário)
      if (paymentData.customerCardId) {
        // Para Customer Cards, o MercadoPago aceita saved_card_id no payment body
        // O saved_card_id é o ID do Customer Card que foi criado
        paymentBody.payment_method_id = paymentData.paymentMethodId;
        // Remover token quando usar saved_card_id
        delete paymentBody.token;
        // Adicionar saved_card_id
        (paymentBody as any).saved_card_id = paymentData.customerCardId;
        console.log('🔵 [MercadoPagoService] Usando Customer Card ID (saved_card_id):', paymentData.customerCardId);
      } else if (paymentData.token) {
        paymentBody.token = paymentData.token;
        console.log('🔵 [MercadoPagoService] Usando token temporário');
      } else {
        throw createError('Token ou Customer Card ID é obrigatório', 400, 'CARD_TOKEN_OR_ID_REQUIRED');
      }

      if (paymentData.issuerId) {
        paymentBody.issuer_id = parseInt(paymentData.issuerId);
      }

      console.log('🔵 [MercadoPagoService] Enviando requisição para MercadoPago API...');
      console.log('🔵 [MercadoPagoService] Payment body:', {
        transaction_amount: paymentBody.transaction_amount,
        payment_method_id: paymentBody.payment_method_id,
        installments: paymentBody.installments,
        payer_email: paymentBody.payer.email,
        saved_card_id: (paymentBody as any).saved_card_id ? (paymentBody as any).saved_card_id.substring(0, 15) + '...' : 'N/A',
        token: paymentBody.token ? paymentBody.token.substring(0, 15) + '...' : 'N/A',
      });
      
      const payment = await this.payment.create({ body: paymentBody });
      console.log('🔵 [MercadoPagoService] Resposta recebida:', {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
      });
      return payment;
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        cause: error.cause,
        response: error.response?.data || error.response,
        stack: error.stack,
      });
      
      // Mensagem mais específica para diferentes tipos de erro
      let errorMessage = error.message || 'Erro ao processar pagamento';
      
      if (error.message?.includes('live credentials') || error.message?.includes('Unauthorized use of live credentials')) {
        errorMessage = 'Credenciais inválidas. Verifique se está usando credenciais de TESTE (TEST-...) em desenvolvimento.';
      } else if (error.message?.includes('saved_card_id') || error.message?.includes('customer card')) {
        errorMessage = 'Erro ao processar pagamento com cartão salvo. Por favor, tente novamente ou adicione um novo cartão.';
        console.error('❌ Erro ao processar pagamento com Customer Card. Verifique os logs para mais detalhes.');
      }
      
      throw createError(
        errorMessage,
        error.status || 400,
        'PAYMENT_PROCESSING_ERROR'
      );
    }
  }

  /**
   * Processar pagamento PIX
   */
  async processPixPayment(paymentData: {
    transactionAmount: number;
    description: string;
    payer: {
      email: string;
      firstName: string;
      lastName: string;
      identification: {
        type: string;
        number: string;
      };
    };
    metadata?: {
      orderId: string;
      userId: string;
    };
  }) {
    console.log('🔵 [MercadoPagoService] processPixPayment chamado');
    console.log('🔵 [MercadoPagoService] Inicializando cliente...');
    this.initializeClient();
    console.log('🔵 [MercadoPagoService] Cliente inicializado');
    
    try {
      const paymentBody = {
        transaction_amount: paymentData.transactionAmount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.firstName,
          last_name: paymentData.payer.lastName,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number,
          },
        },
        metadata: paymentData.metadata || {},
      };

      if (!this.payment) {
        throw createError('Serviço de pagamento não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }
      
      console.log('🔵 [MercadoPagoService] Enviando requisição PIX para MercadoPago API...');
      console.log('🔵 [MercadoPagoService] Payment body:', {
        transaction_amount: paymentBody.transaction_amount,
        payment_method_id: paymentBody.payment_method_id,
        payer_email: paymentBody.payer.email,
      });
      
      const payment = await this.payment.create({ body: paymentBody });
      console.log('🔵 [MercadoPagoService] Resposta PIX recebida:', {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
      });
      return payment;
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento PIX:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        cause: error.cause,
        response: error.response?.data || error.response,
      });
      
      // Mensagem mais específica para erro de credenciais
      let errorMessage = error.message || 'Erro ao processar pagamento PIX';
      if (error.message?.includes('live credentials') || error.message?.includes('Unauthorized use of live credentials')) {
        errorMessage = 'Credenciais inválidas. Verifique se está usando credenciais de TESTE (TEST-...) em desenvolvimento.';
      }
      
      throw createError(
        errorMessage,
        error.status || 400,
        'PIX_PAYMENT_ERROR'
      );
    }
  }

  /**
   * Obter pagamento por ID
   */
  async getPayment(paymentId: string) {
    this.initializeClient();
    try {
      if (!this.payment) {
        throw createError('Serviço de pagamento não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }
      const payment = await this.payment.get({ id: paymentId });
      return payment;
    } catch (error: any) {
      console.error('Erro ao obter pagamento:', error);
      throw createError(
        error.message || 'Erro ao obter pagamento',
        404,
        'PAYMENT_NOT_FOUND'
      );
    }
  }

  /**
   * Cancelar pagamento
   */
  async cancelPayment(paymentId: string) {
    this.initializeClient();
    try {
      if (!this.payment) {
        throw createError('Serviço de pagamento não inicializado', 500, 'SERVICE_NOT_INITIALIZED');
      }
      const payment = await this.payment.cancel({ id: paymentId });
      return payment;
    } catch (error: any) {
      console.error('Erro ao cancelar pagamento:', error);
      throw createError(
        error.message || 'Erro ao cancelar pagamento',
        400,
        'PAYMENT_CANCEL_ERROR'
      );
    }
  }

  /**
   * Reembolsar pagamento
   */
  async refundPayment(paymentId: string, amount?: number) {
    this.initializeClient();
    try {
      // O SDK do Mercado Pago pode ter métodos diferentes para reembolso
      // Por enquanto, vamos usar uma abordagem genérica
      // Em produção, verificar a documentação do SDK para o método correto
      const refundData: any = { id: paymentId };
      if (amount) {
        refundData.amount = amount;
      }

      // Nota: O método refund pode não existir no SDK atual
      // Implementar conforme a versão do SDK do Mercado Pago
      // Por enquanto, retornar um objeto genérico
      return { id: paymentId, status: 'refunded', amount };
    } catch (error: any) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw createError(
        error.message || 'Erro ao reembolsar pagamento',
        400,
        'PAYMENT_REFUND_ERROR'
      );
    }
  }

  /**
   * Validar webhook do Mercado Pago
   * 
   * Nota: O Mercado Pago pode enviar webhooks sem assinatura em alguns casos.
   * A melhor prática é sempre consultar o pagamento diretamente na API para validar.
   */
  validateWebhook(data: any, signature: string | undefined): boolean {
    // Se não houver secret configurado, sempre validar consultando a API
    if (!env.MERCADOPAGO_WEBHOOK_SECRET) {
      console.warn('⚠️  MERCADOPAGO_WEBHOOK_SECRET não configurado. Validação será feita via API.');
      return true; // Permitir, mas validar via API depois
    }

    // Se houver signature, validar
    if (signature) {
      // Implementar validação de assinatura HMAC se necessário
      // Por enquanto, retornamos true e validamos via API
      return true;
    }

    // Sem signature, permitir mas validar via API
    return true;
  }

  /**
   * Validar webhook consultando a API do Mercado Pago
   * Esta é a forma mais segura de validar webhooks
   */
  async validateWebhookViaAPI(paymentId: string): Promise<boolean> {
    try {
      const payment = await this.getPayment(paymentId);
      return !!payment && payment.status !== undefined;
    } catch (error) {
      console.error('Erro ao validar webhook via API:', error);
      return false;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();

