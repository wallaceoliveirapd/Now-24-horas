/**
 * Engine simples para processar templates de email
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TemplateVariables {
  [key: string]: string | number | undefined;
}

/**
 * Processar template HTML substituindo variáveis
 */
export function processTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let processed = template;
  
  // Adicionar variáveis padrão
  const allVariables = {
    year: new Date().getFullYear(),
    subject: 'Now 24 Horas',
    ...variables,
  };
  
  // Substituir variáveis no formato {{variavel}}
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  }
  
  return processed;
}

/**
 * Carregar template de arquivo
 */
export async function loadTemplate(
  templatePath: string
): Promise<string> {
  try {
    // Obter diretório atual do arquivo
    const currentDir = __dirname;
    const fullPath = path.join(currentDir, templatePath);
    
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    console.error(`Erro ao carregar template ${templatePath}:`, error);
    throw new Error(`Template não encontrado: ${templatePath}`);
  }
}

/**
 * Carregar template base e aplicar conteúdo
 */
export async function renderEmailTemplate(
  contentHtmlPath: string,
  contentTextPath: string,
  variables: TemplateVariables
): Promise<{ html: string; text: string }> {
  // Carregar templates
  const [baseTemplate, contentHtml, contentText] = await Promise.all([
    loadTemplate('templates/base.html'),
    loadTemplate(contentHtmlPath),
    loadTemplate(contentTextPath),
  ]);
  
  // Processar conteúdo HTML
  const processedContentHtml = processTemplate(contentHtml, variables);
  
  // Aplicar conteúdo no template base
  const html = processTemplate(baseTemplate, {
    ...variables,
    content: processedContentHtml,
  });
  
  // Processar versão texto
  const text = processTemplate(contentText, variables);
  
  return {
    html,
    text,
  };
}
