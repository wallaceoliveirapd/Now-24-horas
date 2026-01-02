import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  title: string;
  showDriver: boolean;
  driverLabel: string;
  basePrice: number; // em centavos
  finalPrice: number; // em centavos
  discountValue: number; // em centavos
  type: 'Offer' | 'Default';
  quantity: number;
}

export interface AppliedCoupon {
  id: string;
  discountValue: string;
  description: string;
  conditions: string;
  validUntil: string;
  couponCode: string;
  discountAmount: number; // em centavos
}

interface CartContextType {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Inicializar com dados de teste
  const [items, setItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Nome do produto com suas linhas no máximo',
      showDriver: true,
      driverLabel: 'Label',
      basePrice: 998, // R$9,98
      finalPrice: 998, // R$9,98
      discountValue: 1200, // R$12,00
      type: 'Offer',
      quantity: 2,
    },
    {
      id: '2',
      title: 'Nome do produto com suas linhas no máximo',
      showDriver: false,
      driverLabel: '',
      basePrice: 0,
      finalPrice: 900, // R$9,00
      discountValue: 0,
      type: 'Default',
      quantity: 1,
    },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setAppliedCoupon,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

