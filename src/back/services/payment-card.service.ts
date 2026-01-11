import { db } from '../config/database';
import { cartoesPagamento, usuarios } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';
import { mercadoPagoService } from './mercadopago.service';

/**
 * Serviço para gerenciar cartões de pagamento
 */
export class PaymentCardService {
  /**
   * Listar cartões do usuário
   */
  async getUserCards(userId: string) {
    const cards = await db
      .select()
      .from(cartoesPagamento)
      .where(
        and(
          eq(cartoesPagamento.usuarioId, userId),
          eq(cartoesPagamento.ativo, true)
        )
      )
      .orderBy(cartoesPagamento.criadoEm);

    return cards;
  }

  /**
   * Obter cartão por ID
   */
  async getCardById(cardId: string, userId: string) {
    const [card] = await db
      .select()
      .from(cartoesPagamento)
      .where(
        and(
          eq(cartoesPagamento.id, cardId),
          eq(cartoesPagamento.usuarioId, userId),
          eq(cartoesPagamento.ativo, true)
        )
      )
      .limit(1);

    if (!card) {
      throw createError('Cartão não encontrado', 404, 'CARD_NOT_FOUND');
    }

    return card;
  }

  /**
   * Adicionar cartão
   */
  async addCard(userId: string, cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) {
    // Buscar dados do usuário
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (!user.email || !user.cpf) {
      throw createError('Email e CPF são obrigatórios para salvar cartão', 400, 'USER_DATA_MISSING');
    }

    // Criar ou buscar Customer no MercadoPago PRIMEIRO (antes de tokenizar)
    // Isso garante que o Customer existe antes de criar o card
    let customerId: string | null = user.customerIdGateway || null;
    if (!customerId) {
      console.log('💳 [PaymentCardService] Criando Customer no MercadoPago...');
      const customer = await mercadoPagoService.getOrCreateCustomer({
        email: user.email,
        firstName: user.nomeCompleto.split(' ')[0] || '',
        lastName: user.nomeCompleto.split(' ').slice(1).join(' ') || '',
        identification: {
          type: 'CPF',
          number: user.cpf.replace(/\D/g, ''),
        },
      });

      if (!customer.id) {
        throw createError('Erro ao criar customer no MercadoPago: ID não retornado', 500, 'CUSTOMER_ID_MISSING');
      }

      customerId = customer.id;
      console.log('💳 [PaymentCardService] Customer criado/encontrado:', customerId);
      
      // Salvar customerId no usuário
      await db
        .update(usuarios)
        .set({ customerIdGateway: customerId })
        .where(eq(usuarios.id, userId));
    }

    if (!customerId) {
      throw createError('Customer ID não encontrado', 500, 'CUSTOMER_ID_MISSING');
    }

    // Tokenizar cartão no Mercado Pago (token temporário necessário para criar Customer Card)
    // IMPORTANTE: Tokenizar DEPOIS de criar o Customer para garantir que o token seja usado imediatamente
    console.log('💳 [PaymentCardService] Tokenizando cartão...');
    const tokenResponse = await mercadoPagoService.tokenizeCard(cardData);

    if (!tokenResponse.id) {
      throw createError('Erro ao tokenizar cartão', 400, 'CARD_TOKENIZATION_FAILED');
    }

    console.log('💳 [PaymentCardService] Token obtido:', tokenResponse.id.substring(0, 15) + '...');
    console.log('💳 [PaymentCardService] Criando Customer Card imediatamente após tokenização...');

    // Criar Customer Card no MercadoPago (cartão salvo permanentemente)
    // IMPORTANTE: Usar o token IMEDIATAMENTE após tokenização (tokens expiram rapidamente)
    const customerCard = await mercadoPagoService.createCustomerCard(customerId, tokenResponse.id);
    
    // O Customer Card retorna um card_id que usamos como saved_card_id nos pagamentos
    const customerCardId = (customerCard as any).id || (customerCard as any).card_id;
    console.log('💳 [PaymentCardService] Customer Card ID obtido:', customerCardId);

    // Extrair últimos 4 dígitos
    const lastDigits = cardData.cardNumber.replace(/\s/g, '').slice(-4);
    
    // Extrair bandeira do token (se disponível)
    const brand = (tokenResponse as any).card?.first_six_digit || 'unknown';

    // Determinar tipo de cartão
    const cardType = cardData.cardNumber.startsWith('4') ? 'cartao_credito' : 
                     cardData.cardNumber.startsWith('5') ? 'cartao_credito' : 
                     'cartao_debito';

    // Verificar se já existe cartão padrão
    const existingDefault = await db
      .select()
      .from(cartoesPagamento)
      .where(
        and(
          eq(cartoesPagamento.usuarioId, userId),
          eq(cartoesPagamento.cartaoPadrao, true),
          eq(cartoesPagamento.ativo, true)
        )
      )
      .limit(1);

    const isDefault = existingDefault.length === 0;

    // Criar cartão no banco
    const [card] = await db
      .insert(cartoesPagamento)
      .values({
        usuarioId: userId,
        tipo: cardType,
        ultimosDigitos: lastDigits,
        nomeCartao: cardData.cardholderName,
        bandeira: brand,
        mesValidade: parseInt(cardData.cardExpirationMonth),
        anoValidade: parseInt(cardData.cardExpirationYear),
        cartaoPadrao: isDefault,
        tokenGateway: tokenResponse.id, // Manter para compatibilidade, mas não usar mais
        customerCardIdGateway: customerCardId, // ID permanente do Customer Card (usado como saved_card_id)
        ativo: true,
      })
      .returning();

    return card;
  }

  /**
   * Atualizar cartão
   */
  async updateCard(cardId: string, userId: string, updates: {
    nomeCartao?: string;
    mesValidade?: number;
    anoValidade?: number;
  }) {
    await this.getCardById(cardId, userId);

    const [updatedCard] = await db
      .update(cartoesPagamento)
      .set({
        ...updates,
        atualizadoEm: new Date(),
      })
      .where(
        and(
          eq(cartoesPagamento.id, cardId),
          eq(cartoesPagamento.usuarioId, userId)
        )
      )
      .returning();

    return updatedCard;
  }

  /**
   * Definir cartão como padrão
   */
  async setDefaultCard(cardId: string, userId: string) {
    await this.getCardById(cardId, userId);

    // Remover padrão de todos os cartões do usuário
    await db
      .update(cartoesPagamento)
      .set({
        cartaoPadrao: false,
        atualizadoEm: new Date(),
      })
      .where(eq(cartoesPagamento.usuarioId, userId));

    // Definir este cartão como padrão
    const [defaultCard] = await db
      .update(cartoesPagamento)
      .set({
        cartaoPadrao: true,
        atualizadoEm: new Date(),
      })
      .where(
        and(
          eq(cartoesPagamento.id, cardId),
          eq(cartoesPagamento.usuarioId, userId)
        )
      )
      .returning();

    return defaultCard;
  }

  /**
   * Remover cartão
   */
  async removeCard(cardId: string, userId: string) {
    await this.getCardById(cardId, userId);

    // Verificar se é o cartão padrão
    const [card] = await db
      .select()
      .from(cartoesPagamento)
      .where(
        and(
          eq(cartoesPagamento.id, cardId),
          eq(cartoesPagamento.usuarioId, userId)
        )
      )
      .limit(1);

    // Desativar cartão (soft delete)
    await db
      .update(cartoesPagamento)
      .set({
        ativo: false,
        cartaoPadrao: false,
        atualizadoEm: new Date(),
      })
      .where(
        and(
          eq(cartoesPagamento.id, cardId),
          eq(cartoesPagamento.usuarioId, userId)
        )
      );

    // Se era o padrão, definir outro como padrão
    if (card?.cartaoPadrao) {
      const [firstCard] = await db
        .select()
        .from(cartoesPagamento)
        .where(
          and(
            eq(cartoesPagamento.usuarioId, userId),
            eq(cartoesPagamento.ativo, true),
            eq(cartoesPagamento.id, cardId) // Excluir o que acabamos de remover
          )
        )
        .limit(1);

      if (firstCard) {
        await db
          .update(cartoesPagamento)
          .set({
            cartaoPadrao: true,
            atualizadoEm: new Date(),
          })
          .where(eq(cartoesPagamento.id, firstCard.id));
      }
    }

    return { success: true };
  }
}

export const paymentCardService = new PaymentCardService();

