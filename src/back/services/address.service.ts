import { db } from '../config/database';
import { enderecos } from '../models/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar endereços
 */
export class AddressService {
  /**
   * Listar endereços do usuário
   */
  async getUserAddresses(userId: string) {
    return await db
      .select()
      .from(enderecos)
      .where(
        and(
          eq(enderecos.usuarioId, userId),
          eq(enderecos.ativo, true)
        )
      )
      .orderBy(desc(enderecos.enderecoPadrao), desc(enderecos.criadoEm));
  }

  /**
   * Obter endereço específico
   */
  async getAddressById(addressId: string, userId: string) {
    const [address] = await db
      .select()
      .from(enderecos)
      .where(
        and(
          eq(enderecos.id, addressId),
          eq(enderecos.usuarioId, userId),
          eq(enderecos.ativo, true)
        )
      )
      .limit(1);

    if (!address) {
      throw createError('Endereço não encontrado', 404, 'ADDRESS_NOT_FOUND');
    }

    return address;
  }

  /**
   * Criar novo endereço
   */
  async createAddress(userId: string, data: {
    tipo: 'casa' | 'trabalho' | 'outro';
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude?: number;
    longitude?: number;
    enderecoPadrao?: boolean;
  }) {
    // Se este endereço será padrão, remover padrão dos outros
    if (data.enderecoPadrao) {
      await db
        .update(enderecos)
        .set({ enderecoPadrao: false })
        .where(
          and(
            eq(enderecos.usuarioId, userId),
            eq(enderecos.ativo, true)
          )
        );
    }

    // Criar endereço
    const [address] = await db
      .insert(enderecos)
      .values({
        usuarioId: userId,
        tipo: data.tipo,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado.toUpperCase(),
        cep: data.cep,
        latitude: data.latitude?.toString(),
        longitude: data.longitude?.toString(),
        enderecoPadrao: data.enderecoPadrao || false,
        ativo: true,
      })
      .returning();

    return address;
  }

  /**
   * Atualizar endereço
   */
  async updateAddress(addressId: string, userId: string, data: Partial<{
    tipo: 'casa' | 'trabalho' | 'outro';
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude?: number;
    longitude?: number;
    enderecoPadrao?: boolean;
  }>) {
    // Verificar se endereço existe e pertence ao usuário
    await this.getAddressById(addressId, userId);

    // Se este endereço será padrão, remover padrão dos outros
    if (data.enderecoPadrao) {
      await db
        .update(enderecos)
        .set({ enderecoPadrao: false })
        .where(
          and(
            eq(enderecos.usuarioId, userId),
            eq(enderecos.id, addressId) // Não atualizar o próprio endereço ainda
          )
        );
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (data.tipo) updateData.tipo = data.tipo;
    if (data.rua) updateData.rua = data.rua;
    if (data.numero) updateData.numero = data.numero;
    if (data.complemento !== undefined) updateData.complemento = data.complemento;
    if (data.bairro) updateData.bairro = data.bairro;
    if (data.cidade) updateData.cidade = data.cidade;
    if (data.estado) updateData.estado = data.estado.toUpperCase();
    if (data.cep) updateData.cep = data.cep;
    if (data.latitude !== undefined) updateData.latitude = data.latitude.toString();
    if (data.longitude !== undefined) updateData.longitude = data.longitude.toString();
    if (data.enderecoPadrao !== undefined) updateData.enderecoPadrao = data.enderecoPadrao;
    updateData.atualizadoEm = new Date();

    const [updatedAddress] = await db
      .update(enderecos)
      .set(updateData)
      .where(
        and(
          eq(enderecos.id, addressId),
          eq(enderecos.usuarioId, userId)
        )
      )
      .returning();

    return updatedAddress;
  }

  /**
   * Deletar endereço (soft delete)
   */
  async deleteAddress(addressId: string, userId: string) {
    // Verificar se endereço existe e pertence ao usuário
    const address = await this.getAddressById(addressId, userId);

    // Verificar se é o último endereço
    const allAddresses = await this.getUserAddresses(userId);
    if (allAddresses.length === 1) {
      throw createError('Não é possível deletar o último endereço', 400, 'CANNOT_DELETE_LAST_ADDRESS');
    }

    // Soft delete (marcar como inativo)
    await db
      .update(enderecos)
      .set({ ativo: false, atualizadoEm: new Date() })
      .where(
        and(
          eq(enderecos.id, addressId),
          eq(enderecos.usuarioId, userId)
        )
      );

    // Se era o padrão, definir outro como padrão
    if (address.enderecoPadrao) {
      const remainingAddresses = await this.getUserAddresses(userId);
      if (remainingAddresses.length > 0) {
        await db
          .update(enderecos)
          .set({ enderecoPadrao: true })
          .where(eq(enderecos.id, remainingAddresses[0].id));
      }
    }

    return { success: true };
  }

  /**
   * Definir endereço como padrão
   */
  async setDefaultAddress(addressId: string, userId: string) {
    // Verificar se endereço existe e pertence ao usuário
    await this.getAddressById(addressId, userId);

    // Remover padrão de todos os endereços do usuário
    await db
      .update(enderecos)
      .set({ enderecoPadrao: false })
      .where(eq(enderecos.usuarioId, userId));

    // Definir este como padrão
    const [updatedAddress] = await db
      .update(enderecos)
      .set({ enderecoPadrao: true, atualizadoEm: new Date() })
      .where(
        and(
          eq(enderecos.id, addressId),
          eq(enderecos.usuarioId, userId)
        )
      )
      .returning();

    return updatedAddress;
  }
}

export const addressService = new AddressService();

