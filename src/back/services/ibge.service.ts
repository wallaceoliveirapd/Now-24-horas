import axios from 'axios';
import { createError } from '../api/middlewares/error-handler';

/**
 * Interface para resposta da API IBGE - Estados
 */
export interface IBGEEstado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

/**
 * Interface para resposta da API IBGE - Municípios
 */
export interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

/**
 * Serviço para consultar dados do IBGE
 * Documentação: https://servicodados.ibge.gov.br/api/docs/localidades
 */
export class IBGEService {
  private readonly ibgeBaseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

  /**
   * Buscar todos os estados do Brasil
   * @returns Lista de estados ordenados por nome
   */
  async buscarEstados(): Promise<IBGEEstado[]> {
    try {
      const response = await axios.get<IBGEEstado[]>(
        `${this.ibgeBaseUrl}/estados`,
        {
          timeout: 10000, // Timeout de 10 segundos
          params: {
            orderBy: 'nome', // Ordenar por nome
          },
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw createError('Timeout ao buscar estados. Tente novamente.', 504, 'IBGE_SERVICE_TIMEOUT');
        }
        throw createError('Erro ao buscar estados. Tente novamente.', 500, 'IBGE_SERVICE_ERROR');
      }
      throw createError('Erro desconhecido ao buscar estados', 500, 'IBGE_SERVICE_ERROR');
    }
  }

  /**
   * Buscar estado por sigla
   * @param sigla Sigla do estado (ex: SP, RJ)
   * @returns Dados do estado ou null se não encontrado
   */
  async buscarEstadoPorSigla(sigla: string): Promise<IBGEEstado | null> {
    try {
      const siglaUpper = sigla.toUpperCase();
      const response = await axios.get<IBGEEstado | IBGEEstado[]>(
        `${this.ibgeBaseUrl}/estados/${siglaUpper}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      // A API pode retornar um objeto ou array
      const estado = Array.isArray(response.data) ? response.data[0] : response.data;
      return estado || null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw createError('Timeout ao buscar estado. Tente novamente.', 504, 'IBGE_SERVICE_TIMEOUT');
        }
        throw createError('Erro ao buscar estado. Tente novamente.', 500, 'IBGE_SERVICE_ERROR');
      }
      throw createError('Erro desconhecido ao buscar estado', 500, 'IBGE_SERVICE_ERROR');
    }
  }

  /**
   * Buscar municípios por estado
   * @param siglaEstado Sigla do estado (ex: SP, RJ)
   * @returns Lista de municípios ordenados por nome
   */
  async buscarMunicipiosPorEstado(siglaEstado: string): Promise<IBGEMunicipio[]> {
    try {
      const siglaUpper = siglaEstado.toUpperCase();
      
      // Primeiro verificar se o estado existe
      const estado = await this.buscarEstadoPorSigla(siglaUpper);
      if (!estado) {
        throw createError('Estado não encontrado', 404, 'ESTADO_NOT_FOUND');
      }

      const response = await axios.get<IBGEMunicipio[]>(
        `${this.ibgeBaseUrl}/estados/${siglaUpper}/municipios`,
        {
          timeout: 10000,
          params: {
            orderBy: 'nome', // Ordenar por nome
          },
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.code === 'ESTADO_NOT_FOUND') {
        throw error; // Re-throw se já é nosso erro customizado
      }
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw createError('Estado não encontrado', 404, 'ESTADO_NOT_FOUND');
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw createError('Timeout ao buscar municípios. Tente novamente.', 504, 'IBGE_SERVICE_TIMEOUT');
        }
        throw createError('Erro ao buscar municípios. Tente novamente.', 500, 'IBGE_SERVICE_ERROR');
      }
      throw createError('Erro desconhecido ao buscar municípios', 500, 'IBGE_SERVICE_ERROR');
    }
  }

  /**
   * Buscar municípios formatados para nosso sistema
   */
  async buscarMunicipiosFormatados(siglaEstado: string): Promise<Array<{
    id: number;
    nome: string;
    estado: string;
  }>> {
    const municipios = await this.buscarMunicipiosPorEstado(siglaEstado);

    return municipios.map((municipio) => ({
      id: municipio.id,
      nome: municipio.nome,
      estado: siglaEstado.toUpperCase(),
    }));
  }

  /**
   * Buscar estados formatados para nosso sistema
   */
  async buscarEstadosFormatados(): Promise<Array<{
    id: number;
    sigla: string;
    nome: string;
    regiao: string;
  }>> {
    const estados = await this.buscarEstados();

    return estados.map((estado) => ({
      id: estado.id,
      sigla: estado.sigla,
      nome: estado.nome,
      regiao: estado.regiao.nome,
    }));
  }
}

export const ibgeService = new IBGEService();

