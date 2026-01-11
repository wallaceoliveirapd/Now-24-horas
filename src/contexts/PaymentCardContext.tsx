import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { paymentCardService, PaymentCard, AddCardInput, UpdateCardInput } from '../services/payment-card.service';
import { useAuth } from './AuthContext';

interface PaymentCardContextType {
  cards: PaymentCard[];
  defaultCard: PaymentCard | null;
  loading: boolean;
  addCard: (cardData: AddCardInput) => Promise<PaymentCard>;
  updateCard: (id: string, data: UpdateCardInput) => Promise<PaymentCard>;
  deleteCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<PaymentCard>;
  loadCards: () => Promise<void>;
}

const PaymentCardContext = createContext<PaymentCardContextType | undefined>(undefined);

export function PaymentCardProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultCard = cards.find(card => card.cartaoPadrao && card.ativo) || null;

  /**
   * Carregar cartões do backend
   */
  const loadCards = useCallback(async () => {
    if (!isAuthenticated) {
      setCards([]);
      return;
    }

    try {
      setLoading(true);
      const loadedCards = await paymentCardService.getCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      // Em caso de erro, manter array vazio
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Carregar cartões quando autenticação mudar
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const addCard = useCallback(async (cardData: AddCardInput): Promise<PaymentCard> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const newCard = await paymentCardService.addCard(cardData);
      setCards(prev => [...prev, newCard]);
      return newCard;
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const updateCard = useCallback(async (id: string, data: UpdateCardInput): Promise<PaymentCard> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedCard = await paymentCardService.updateCard(id, data);
      setCards(prev => prev.map(card => card.id === id ? updatedCard : card));
      return updatedCard;
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const deleteCard = useCallback(async (id: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await paymentCardService.deleteCard(id);
      setCards(prev => prev.filter(card => card.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const setDefaultCard = useCallback(async (id: string): Promise<PaymentCard> => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedCard = await paymentCardService.setDefaultCard(id);
      setCards(prev => prev.map(card => 
        card.id === id ? updatedCard : { ...card, cartaoPadrao: false }
      ));
      return updatedCard;
    } catch (error) {
      console.error('Erro ao definir cartão padrão:', error);
      throw error;
    }
  }, [isAuthenticated]);

  return (
    <PaymentCardContext.Provider
      value={{
        cards,
        defaultCard,
        loading,
        addCard,
        updateCard,
        deleteCard,
        setDefaultCard,
        loadCards,
      }}
    >
      {children}
    </PaymentCardContext.Provider>
  );
}

export function usePaymentCard() {
  const context = useContext(PaymentCardContext);
  if (!context) {
    throw new Error('usePaymentCard must be used within a PaymentCardProvider');
  }
  return context;
}

