# 🗄️ Setup Neon Database - Now 24 Horas

Este guia explica como configurar o banco de dados Neon PostgreSQL no projeto.

## 📋 Pré-requisitos

1. Conta no [Neon](https://neon.tech) (gratuita)
2. Node.js 18+ instalado
3. npm ou yarn instalado

---

## 🚀 Passo 1: Criar Projeto no Neon

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Faça login ou crie uma conta
3. Clique em "Create Project"
4. Escolha um nome para o projeto (ex: `now-24-horas`)
5. Selecione a região mais próxima (ex: `São Paulo`)
6. Clique em "Create Project"

---

## 🔑 Passo 2: Obter String de Conexão

Após criar o projeto:

1. No dashboard do Neon, vá para a aba "Connection Details"
2. Copie a **Connection String** (formato: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
3. Guarde essa string - você precisará dela no próximo passo

---

## 📦 Passo 3: Instalar Dependências

Execute os seguintes comandos para instalar as dependências necessárias:

```bash
# Dependências principais
npm install @neondatabase/serverless drizzle-orm drizzle-kit pg ws

# Dependências de desenvolvimento
npm install --save-dev @types/pg @types/ws ts-node dotenv zod bcryptjs

# Para validação de variáveis de ambiente
npm install zod

# Para hash de senhas
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` e adicione sua connection string do Neon:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
API_PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**⚠️ IMPORTANTE:** 
- Nunca commite o arquivo `.env.local` no Git
- Use `.env.example` como template
- A `DATABASE_URL` contém credenciais sensíveis

---

## 📝 Passo 5: Adicionar Scripts ao package.json

Adicione os seguintes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    
    // Scripts do banco de dados
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "ts-node src/back/scripts/migrate.ts",
    "db:seed": "ts-node src/back/scripts/seed.ts",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push:pg"
  }
}
```

---

## 🗃️ Passo 6: Gerar e Aplicar Migrations

1. **Gerar migration baseada no schema:**

```bash
npm run db:generate
```

Isso criará arquivos de migration em `src/back/migrations/`

2. **Aplicar migrations ao banco:**

```bash
npm run db:migrate
```

Isso criará todas as tabelas no banco Neon.

---

## 🌱 Passo 7: Popular Banco com Dados Iniciais (Opcional)

Execute o seed para criar dados iniciais:

```bash
npm run db:seed
```

Isso criará:
- Usuário admin padrão (email: `admin@now24horas.com`, senha: `admin123`)
- Categorias básicas
- Cupons de exemplo

---

## ✅ Passo 8: Verificar Conexão

Crie um arquivo de teste para verificar a conexão:

```typescript
// src/back/scripts/test-connection.ts
import { testConnection, getDatabaseInfo } from '../config/database';

async function main() {
  console.log('🔌 Testando conexão com Neon...');
  
  const connected = await testConnection();
  if (connected) {
    const info = await getDatabaseInfo();
    console.log('📊 Informações do banco:');
    console.log('  - Versão:', info.version);
    console.log('  - Database:', info.database);
    console.log('  - User:', info.user);
  }
}

main();
```

Execute:

```bash
npx ts-node src/back/scripts/test-connection.ts
```

---

## 🎨 Usar Drizzle Studio (Opcional)

Drizzle Studio é uma interface visual para gerenciar o banco:

```bash
npm run db:studio
```

Isso abrirá uma interface web em `http://localhost:4983` onde você pode:
- Ver todas as tabelas
- Inserir/editar/deletar dados
- Executar queries SQL
- Visualizar relacionamentos

---

## 📚 Estrutura de Arquivos Criada

```
src/back/
├── config/
│   ├── database.ts      # Configuração da conexão Neon
│   └── env.ts           # Validação de variáveis de ambiente
├── models/
│   └── schema.ts        # Schema do banco (Drizzle ORM)
├── migrations/          # Migrations geradas pelo Drizzle
├── scripts/
│   ├── migrate.ts       # Script para aplicar migrations
│   └── seed.ts          # Script para popular banco
├── repositories/        # Camada de acesso a dados
├── services/           # Lógica de negócio
└── utils/
    └── db-helpers.ts   # Utilitários do banco
```

---

## 🔍 Schema do Banco

O schema inclui as seguintes tabelas:

- **users** - Usuários do sistema
- **addresses** - Endereços dos usuários
- **payment_cards** - Cartões de pagamento
- **categories** - Categorias de produtos
- **products** - Produtos
- **favorites** - Produtos favoritos
- **coupons** - Cupons de desconto
- **orders** - Pedidos
- **reviews** - Avaliações de produtos

---

## 🛠️ Comandos Úteis

### Gerar nova migration após alterar schema
```bash
npm run db:generate
```

### Aplicar migrations
```bash
npm run db:migrate
```

### Popular banco com dados iniciais
```bash
npm run db:seed
```

### Abrir Drizzle Studio
```bash
npm run db:studio
```

### Fazer push direto do schema (sem migration)
```bash
npm run db:push
```

---

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não está definida"
- Verifique se o arquivo `.env.local` existe
- Verifique se a variável `DATABASE_URL` está definida
- Certifique-se de que o arquivo está na raiz do projeto

### Erro: "Connection refused"
- Verifique se a connection string está correta
- Verifique se o projeto Neon está ativo
- Verifique se não há firewall bloqueando a conexão

### Erro: "SSL required"
- Certifique-se de que a connection string inclui `?sslmode=require`
- Neon sempre requer SSL

### Erro ao executar migrations
- Verifique se o banco está acessível
- Verifique se as migrations anteriores foram aplicadas
- Tente fazer `db:push` ao invés de `db:migrate` para desenvolvimento

---

## 📖 Recursos Adicionais

- [Documentação Neon](https://neon.tech/docs)
- [Documentação Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

1. **Nunca commite** o arquivo `.env.local` no Git
2. Use variáveis de ambiente diferentes para desenvolvimento e produção
3. Rotacione credenciais regularmente
4. Use connection pooling para produção
5. Configure backups automáticos no Neon

---

## 🚀 Próximos Passos

Após configurar o Neon:

1. ✅ Criar repositories para cada entidade
2. ✅ Criar services com lógica de negócio
3. ✅ Criar API REST endpoints
4. ✅ Implementar autenticação JWT
5. ✅ Adicionar validações e tratamento de erros

---

**Última atualização:** 2025-01-XX

