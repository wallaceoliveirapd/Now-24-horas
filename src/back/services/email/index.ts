/**
 * Exportar serviço de email e utilitários
 */

export { emailService } from './email.service';
export { TEMPLATE_PATHS } from './templates';
export type { TemplateVariables } from './template-engine';
export { processTemplate, loadTemplate, renderEmailTemplate } from './template-engine';

