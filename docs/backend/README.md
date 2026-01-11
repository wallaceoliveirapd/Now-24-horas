# 🔧 Backend

Documentação específica do backend do projeto.

## 📄 Documentos

- **[Backend README](./README.md)** - Documentação do backend, estrutura e comandos

## 🗄️ Banco de Dados

O projeto usa **Neon PostgreSQL** como banco de dados.

### Configuração
- Veja [Setup Neon](../setup/SETUP_NEON.md) para configuração completa
- Veja [Instalação Rápida](../setup/INSTALACAO_NEON.md) para começar rápido

### Comandos Úteis

```bash
# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed

# Testar conexão
npm run db:test

# Abrir Drizzle Studio (interface visual)
npm run db:studio
```

## 📁 Estrutura

```
src/back/
├── config/        # Configurações (banco, env)
├── models/        # Schema do banco (Drizzle ORM)
├── migrations/    # Migrations do banco
├── repositories/  # Camada de acesso a dados
├── services/      # Lógica de negócio
└── scripts/       # Scripts utilitários
```
