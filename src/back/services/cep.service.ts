import axios from 'axios';
import { createError } from '../api/middlewares/error-handler';

/**
 * Interface para resposta da API ViaCEP
 */
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean | string; // ViaCEP pode retornar "true" (string) ou true (boolean)
}

/**
 * Serviço para consultar CEP na API ViaCEP
 * Documentação: https://viacep.com.br/
 */
export class CepService {
  private readonly viaCepBaseUrl = 'https://viacep.com.br/ws';

  /**
   * Buscar dados do endereço pelo CEP
   * @param cep CEP no formato XXXXX-XXX ou XXXXXXXX
   * @returns Dados do endereço ou null se não encontrado
   */
  async buscarCep(cep: string): Promise<ViaCepResponse | null> {
    // Remover formatação do CEP (apenas números)
    const cepLimpo = cep.replace(/\D/g, '');

    // Validar formato (deve ter 8 dígitos)
    if (!cepLimpo || cepLimpo.length !== 8) {
      throw createError('CEP deve ter 8 dígitos', 400, 'INVALID_CEP_FORMAT');
    }

    try {
      const response = await axios.get<ViaCepResponse>(
        `${this.viaCepBaseUrl}/${cepLimpo}/json/`,
        {
          timeout: 5000, // Timeout de 5 segundos
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      // ViaCEP retorna { erro: "true" } (string) quando CEP não existe
      if (response.data.erro === true || response.data.erro === 'true') {
        return null;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw createError('CEP inválido', 400, 'INVALID_CEP_FORMAT');
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw createError('Timeout ao buscar CEP. Tente novamente.', 504, 'CEP_SERVICE_TIMEOUT');
        }
        throw createError('Erro ao buscar CEP. Tente novamente.', 500, 'CEP_SERVICE_ERROR');
      }
      throw createError('Erro desconhecido ao buscar CEP', 500, 'CEP_SERVICE_ERROR');
    }
  }

  /**
   * Buscar CEP e retornar dados formatados para nosso sistema
   */
  async buscarCepFormatado(cep: string): Promise<{
    cep: string;
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    complemento?: string;
  } | null> {
    const dados = await this.buscarCep(cep);

    if (!dados) {
      return null;
    }

    // ViaCEP retorna cep formatado (com hífen), remover formatação
    const cepLimpo = dados.cep ? dados.cep.replace(/\D/g, '') : cep.replace(/\D/g, '');

    return {
      cep: cepLimpo,
      rua: dados.logradouro || '',
      bairro: dados.bairro || '',
      cidade: dados.localidade || '',
      estado: dados.uf || '',
      complemento: dados.complemento && dados.complemento.trim() !== '' ? dados.complemento : undefined,
    };
  }
}

export const cepService = new CepService();

