import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { addressService, Address as BackendAddress } from '../services/address.service';
import { useAuth } from './AuthContext';

export type AddressType = 'Casa' | 'Trabalho' | 'Outro';

export interface Address {
  id: string;
  type: AddressType;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

/**
 * Converter endereço do backend para formato do context
 */
function convertBackendToContext(backendAddress: BackendAddress): Address {
  return {
    id: backendAddress.id,
    type: backendAddress.tipo,
    street: backendAddress.rua + (backendAddress.numero ? `, ${backendAddress.numero}` : ''),
    complement: backendAddress.complemento || '',
    neighborhood: backendAddress.bairro,
    city: backendAddress.cidade,
    state: backendAddress.estado,
    zipCode: backendAddress.cep,
    isDefault: backendAddress.isDefault || false,
  };
}

interface AddressContextType {
  addresses: Address[];
  selectedAddressId: string | null;
  selectedAddress: Address | null;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setSelectedAddressId: (id: string) => void;
  getAddressDisplay: (address: Address) => string;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId) || addresses.find(addr => addr.id) || null;

  /**
   * Carregar endereços do backend
   */
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    try {
      setLoading(true);
      const backendAddresses = await addressService.getAddresses();
      const converted = backendAddresses.map(convertBackendToContext);
      setAddresses(converted);

      // Selecionar endereço padrão ou primeiro
      const defaultAddr = converted.find(addr => addr.isDefault) || converted[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      // Em caso de erro, manter array vazio
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Carregar endereços quando autenticação mudar
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Converter para formato do backend
      const [street, ...numberParts] = address.street.split(', ');
      const numero = numberParts.join(', ') || undefined;
      
      // Converter tipo para minúsculas (backend espera: 'casa', 'trabalho', 'outro')
      const tipoMap: Record<string, 'casa' | 'trabalho' | 'outro'> = {
        'Casa': 'casa',
        'Trabalho': 'trabalho',
        'Outro': 'outro',
      };
      const tipo = tipoMap[address.type] || 'casa';
      
      // Garantir que estado está em maiúsculas e tem 2 caracteres
      const estado = address.state.toUpperCase().slice(0, 2);
      
      // Formatar CEP (remover formatação, backend vai validar)
      const cep = address.zipCode.replace(/\D/g, '');
      
      // Validar número (backend exige número)
      if (!numero || numero.trim() === '') {
        throw new Error('Número do endereço é obrigatório');
      }
      
      const backendAddress = await addressService.createAddress({
        tipo,
        rua: street,
        numero: numero.trim(),
        complemento: address.complement || undefined,
        bairro: address.neighborhood,
        cidade: address.city,
        estado,
        cep,
        isDefault: addresses.length === 0, // Primeiro endereço é padrão
      });

      const converted = convertBackendToContext(backendAddress);
      setAddresses(prev => [...prev, converted]);
      setSelectedAddressId(converted.id);
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      throw error;
    }
  }, [isAuthenticated, addresses.length]);

  const updateAddress = useCallback(async (id: string, address: Omit<Address, 'id'>) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Converter para formato do backend
      const [street, ...numberParts] = address.street.split(', ');
      const numero = numberParts.join(', ') || undefined;

      // Converter tipo para minúsculas (backend espera: 'casa', 'trabalho', 'outro')
      const tipoMap: Record<string, 'casa' | 'trabalho' | 'outro'> = {
        'Casa': 'casa',
        'Trabalho': 'trabalho',
        'Outro': 'outro',
      };
      const tipo = tipoMap[address.type] || 'casa';
      
      // Garantir que estado está em maiúsculas e tem 2 caracteres
      const estado = address.state.toUpperCase().slice(0, 2);
      
      // Formatar CEP (remover formatação, backend vai validar)
      const cep = address.zipCode.replace(/\D/g, '');
      
      // Validar número (backend exige número)
      if (!numero || numero.trim() === '') {
        throw new Error('Número do endereço é obrigatório');
      }

      const backendAddress = await addressService.updateAddress(id, {
        tipo,
        rua: street,
        numero: numero.trim(),
        complemento: address.complement || undefined,
        bairro: address.neighborhood,
        cidade: address.city,
        estado,
        cep,
      });

      const converted = convertBackendToContext(backendAddress);
      setAddresses(prev =>
        prev.map(addr => (addr.id === id ? converted : addr))
      );
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await addressService.deleteAddress(id);
      
      setAddresses(prev => {
        const filtered = prev.filter(addr => addr.id !== id);
        // Se o endereço deletado era o selecionado, selecionar o primeiro disponível
        if (selectedAddressId === id) {
          if (filtered.length > 0) {
            setSelectedAddressId(filtered[0].id);
          } else {
            setSelectedAddressId(null);
          }
        }
        return filtered;
      });
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    }
  }, [isAuthenticated, selectedAddressId]);

  const setDefaultAddress = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const backendAddress = await addressService.setDefaultAddress(id);
      const converted = convertBackendToContext(backendAddress);
      
      // Atualizar todos os endereços: apenas o selecionado será isDefault = true
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );

      // Selecionar o endereço padrão
      setSelectedAddressId(id);
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const setSelectedAddressIdCallback = useCallback((id: string) => {
    setSelectedAddressId(id);
  }, []);

  const getAddressDisplay = useCallback((address: Address) => {
    return address.street;
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        selectedAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        setSelectedAddressId: setSelectedAddressIdCallback,
        getAddressDisplay,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}

