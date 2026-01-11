/**
 * Exportar todos os templates disponíveis
 * 
 * Estrutura de organização:
 * - Cada grupo de emails tem sua própria pasta (otp/, orders/, auth/, etc.)
 * - Cada template tem duas versões: .html e .text
 * - Use nomes descritivos e consistentes
 */

export const TEMPLATE_PATHS = {
  // Templates base
  BASE: 'templates/base.html',
  
  // Templates OTP (One-Time Password)
  OTP_VERIFICATION_HTML: 'templates/otp/verification.html',
  OTP_VERIFICATION_TEXT: 'templates/otp/verification.text',
  
  // Futuros templates podem ser adicionados aqui:
  // 
  // Templates de Pedidos:
  // ORDER_CONFIRMATION_HTML: 'templates/orders/confirmation.html',
  // ORDER_CONFIRMATION_TEXT: 'templates/orders/confirmation.text',
  // ORDER_SHIPPED_HTML: 'templates/orders/shipped.html',
  // ORDER_SHIPPED_TEXT: 'templates/orders/shipped.text',
  // ORDER_DELIVERED_HTML: 'templates/orders/delivered.html',
  // ORDER_DELIVERED_TEXT: 'templates/orders/delivered.text',
  //
  // Templates de Autenticação:
  // PASSWORD_RESET_HTML: 'templates/auth/password-reset.html',
  // PASSWORD_RESET_TEXT: 'templates/auth/password-reset.text',
  // WELCOME_HTML: 'templates/auth/welcome.html',
  // WELCOME_TEXT: 'templates/auth/welcome.text',
  //
  // Templates de Notificações:
  // NOTIFICATION_HTML: 'templates/notifications/generic.html',
  // NOTIFICATION_TEXT: 'templates/notifications/generic.text',
} as const;

export type TemplatePath = typeof TEMPLATE_PATHS[keyof typeof TEMPLATE_PATHS];
