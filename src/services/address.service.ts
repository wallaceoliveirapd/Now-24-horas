/**
 * Service de Endereços
 */

import { apiClient } from './api/client';

export interface Address {
  id: string;
  tipo: 'Casa' | 'Trabalho' | 'Outro';
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
  referencia?: string;
}

export const addressService = {
  /**
   * Listar endereços do usuário
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<{ addresses: Address[] }>('/api/addresses');
    return response.data!.addresses;
  },

  /**
   * Obter endereço por ID
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get<{ address: Address }>(`/api/addresses/${id}`);
    return response.data!.address;
  },

  /**
   * Criar novo endereço
   */
  async createAddress(data: {
    tipo: 'Casa' | 'Trabalho' | 'Outro';
    rua: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    referencia?: string;
    isDefault?: boolean;
  }): Promise<Address> {
    const response = await apiClient.post<{ address: Address }>('/api/addresses', data);
    return response.data!.address;
  },

  /**
   * Atualizar endereço
   */
  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const response = await apiClient.put<{ address: Address }>(`/api/addresses/${id}`, data);
    return response.data!.address;
  },

  /**
   * Deletar endereço
   */
  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/api/addresses/${id}`);
  },

  /**
   * Definir endereço como padrão
   */
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.patch<{ address: Address }>(`/api/addresses/${id}/set-default`);
    return response.data!.address;
  },

  /**
   * Buscar endereço por CEP
   */
  async searchCep(cep: string): Promise<{
    cep: string;
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento?: string;
  }> {
    const cepLimpo = cep.replace(/\D/g, '');
    const response = await apiClient.get<{
      cep: {
        cep: string;
        rua: string;
        bairro: string;
        cidade: string;
        estado: string;
        complemento?: string;
      };
    }>(`/api/addresses/cep/${cepLimpo}`);
    return response.data!.cep;
  },

  /**
   * Calcular tempo de entrega para um endereço
   */
  async getDeliveryTime(addressId: string): Promise<string> {
    const response = await apiClient.get<{
      deliveryTime: string;
    }>(`/api/addresses/${addressId}/delivery-time`);
    return response.data!.deliveryTime;
  },
};

