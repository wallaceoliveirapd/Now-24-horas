import { z } from 'zod';

/**
 * Schema de validação para atualizar preferências de notificação
 */
export const updateNotificationPreferencesSchema = z.object({
  atualizacoesPedido: z.boolean().optional(),
  promocoesOfertas: z.boolean().optional(),
  novidadesProdutos: z.boolean().optional(),
  notificacoesSistema: z.boolean().optional(),
  pushAtivado: z.boolean().optional(),
  emailAtivado: z.boolean().optional(),
  smsAtivado: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;

