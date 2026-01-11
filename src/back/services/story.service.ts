import { db } from '../config/database';
import { stories } from '../models/schema';
import { eq, and, asc, desc, gte, lte, or, isNull, sql } from 'drizzle-orm';
import { createError } from '../api/middlewares/error-handler';

/**
 * Serviço para gerenciar stories
 */
export class StoryService {
  /**
   * Listar todas as stories ativas, ordenadas por ordem
   */
  async getActiveStories() {
    const now = new Date();
    return await db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.ativo, true),
          or(
            isNull(stories.dataInicio),
            lte(stories.dataInicio, now)
          ),
          or(
            isNull(stories.dataFim),
            gte(stories.dataFim, now)
          )
        )
      )
      .orderBy(asc(stories.ordem), desc(stories.criadoEm));
  }

  /**
   * Obter story por ID
   */
  async getStoryById(storyId: string) {
    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1);

    if (!story) {
      throw createError('Story não encontrada', 404, 'STORY_NOT_FOUND');
    }

    return story;
  }

  /**
   * Criar nova story (admin)
   */
  async createStory(data: {
    titulo?: string;
    imagemUrl: string;
    ordem?: number;
    dataInicio?: Date;
    dataFim?: Date;
    criadoPor: string;
  }) {
    const [story] = await db
      .insert(stories)
      .values({
        titulo: data.titulo,
        imagemUrl: data.imagemUrl,
        ordem: data.ordem ?? 0,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        criadoPor: data.criadoPor,
      })
      .returning();

    return story;
  }

  /**
   * Atualizar story (admin)
   */
  async updateStory(storyId: string, data: {
    titulo?: string;
    imagemUrl?: string;
    ordem?: number;
    ativo?: boolean;
    dataInicio?: Date;
    dataFim?: Date;
  }) {
    const [story] = await db
      .update(stories)
      .set({
        ...data,
        atualizadoEm: new Date(),
      })
      .where(eq(stories.id, storyId))
      .returning();

    if (!story) {
      throw createError('Story não encontrada', 404, 'STORY_NOT_FOUND');
    }

    return story;
  }

  /**
   * Deletar story (admin)
   */
  async deleteStory(storyId: string) {
    const [story] = await db
      .delete(stories)
      .where(eq(stories.id, storyId))
      .returning();

    if (!story) {
      throw createError('Story não encontrada', 404, 'STORY_NOT_FOUND');
    }

    return story;
  }

  /**
   * Incrementar visualizações de uma story
   */
  async incrementViews(storyId: string) {
    const [story] = await db
      .update(stories)
      .set({
        visualizacoes: sql`${stories.visualizacoes} + 1`,
      })
      .where(eq(stories.id, storyId))
      .returning();

    if (!story) {
      throw createError('Story não encontrada', 404, 'STORY_NOT_FOUND');
    }

    return story;
  }

  /**
   * Listar todas as stories (admin)
   */
  async getAllStories() {
    return await db
      .select()
      .from(stories)
      .orderBy(asc(stories.ordem), desc(stories.criadoEm));
  }
}

export const storyService = new StoryService();

