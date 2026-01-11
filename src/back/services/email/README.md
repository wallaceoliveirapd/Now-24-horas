# Serviço de Email

Sistema organizado de templates de email usando Resend.

## Estrutura de Pastas

```
email/
├── templates/
│   ├── base.html              # Template base reutilizável
│   ├── index.ts                # Exportação de paths dos templates
│   ├── otp/                   # Templates de OTP
│   │   ├── verification.html
│   │   └── verification.text
│   ├── orders/                # Templates de pedidos (futuro)
│   ├── auth/                  # Templates de autenticação (futuro)
│   └── notifications/         # Templates de notificações (futuro)
├── template-engine.ts          # Engine de processamento de templates
├── email.service.ts            # Serviço principal de email
└── README.md                   # Esta documentação
```

## Como Adicionar Novos Templates

### 1. Criar os arquivos de template

Crie dois arquivos na pasta apropriada:
- `nome-do-template.html` - Versão HTML
- `nome-do-template.text` - Versão texto simples

### 2. Adicionar ao index.ts

```typescript
export const TEMPLATE_PATHS = {
  // ... templates existentes
  NOVO_TEMPLATE_HTML: 'templates/pasta/nome-do-template.html',
  NOVO_TEMPLATE_TEXT: 'templates/pasta/nome-do-template.text',
} as const;
```

### 3. Criar método no email.service.ts

```typescript
async sendNovoTemplate(
  email: string,
  variavel1: string,
  variavel2: string
): Promise<void> {
  await this.sendEmail(
    email,
    'Assunto do Email',
    TEMPLATE_PATHS.NOVO_TEMPLATE_HTML,
    TEMPLATE_PATHS.NOVO_TEMPLATE_TEXT,
    {
      variavel1,
      variavel2,
      nome: 'Nome do Usuário',
    }
  );
}
```

## Variáveis Disponíveis nos Templates

### Variáveis Padrão (automáticas)
- `{{year}}` - Ano atual
- `{{subject}}` - Assunto do email

### Variáveis do Template Base
- `{{content}}` - Conteúdo principal do email (preenchido automaticamente)

### Variáveis Customizadas
Passadas no método `sendEmail()` através do objeto `variables`.

## Exemplo de Template

### HTML (templates/otp/verification.html)
```html
<h2>Olá, {{nome}}!</h2>
<p>Seu código é: {{codigo}}</p>
```

### Text (templates/otp/verification.text)
```
Olá, {{nome}}!

Seu código é: {{codigo}}
```

## Uso

```typescript
import { emailService } from './services/email';

// Enviar OTP
await emailService.sendOtpEmail(
  'usuario@email.com',
  '123456',
  'João Silva'
);
```

## Configuração

Variáveis de ambiente necessárias:
- `RESEND_API_KEY` - Chave da API do Resend
- `EMAIL_FROM` - Email remetente (opcional, padrão: noreply@now24horas.com.br)
- `EMAIL_FROM_NAME` - Nome do remetente (opcional, padrão: Now 24 Horas)

