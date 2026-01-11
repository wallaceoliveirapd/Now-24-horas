# ⚡ Instalação Rápida - Neon Database

## 📦 1. Instalar Dependências

```bash
npm install @neondatabase/serverless drizzle-orm drizzle-kit pg ws zod bcryptjs
npm install --save-dev @types/pg @types/ws @types/bcryptjs ts-node dotenv
```

## 🔑 2. Criar Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
API_PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

**Obtenha a DATABASE_URL em:** [console.neon.tech](https://console.neon.tech)

## 🗃️ 3. Gerar e Aplicar Migrations

```bash
# Gerar migrations baseadas no schema
npm run db:generate

# Aplicar migrations ao banco
npm run db:migrate
```

## ✅ 4. Testar Conexão

```bash
npm run db:test
```

## 🌱 5. Popular Banco (Opcional)

```bash
npm run db:seed
```

---

## 📖 Documentação Completa

Veja [SETUP_NEON.md](./SETUP_NEON.md) para documentação detalhada.

