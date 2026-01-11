# Now 24 Horas - App de Delivery

App de delivery desenvolvido com React Native, Expo e TailwindCSS (NativeWind).

## 🚀 Tecnologias

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **TypeScript** - Tipagem estática
- **NativeWind** - TailwindCSS para React Native
- **React Navigation** - Navegação entre telas

## 📦 Instalação

As dependências já estão instaladas. Para iniciar o projeto:

```bash
npm start
```

## 🏗️ Estrutura do Projeto

```
Now-24-horas/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes de UI (Button, Input, etc.)
│   ├── docs/               # Componentes de documentação (Showcase, PropsTable, etc.)
│   └── index.ts            # Exportações centralizadas
├── src/
│   ├── front/              # Código do frontend
│   │   ├── screens/        # Telas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── ComponentShowcase.tsx
│   │   │   └── index.ts
│   │   └── navigation/    # Configuração de navegação
│   │       └── AppNavigator.tsx
│   ├── back/               # Código do backend (quando necessário)
│   │   ├── services/       # Lógica de negócio
│   │   ├── repositories/   # Acesso a dados
│   │   ├── models/         # Modelos de dados
│   │   └── utils/          # Utilitários do backend
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e helpers compartilhados
│   └── types/               # Definições de tipos TypeScript
├── App.tsx                 # Componente principal
├── global.css              # Estilos globais do Tailwind
└── tailwind.config.js      # Configuração do TailwindCSS
```

## 🎨 Componentes

A biblioteca de componentes está organizada em:
- **`components/ui/`** - Componentes de interface reutilizáveis
- **`components/docs/`** - Componentes auxiliares para documentação

Acesse a página de showcase de componentes através da home do app para ver todos os componentes disponíveis, suas variações e exemplos de uso.

## 📱 Executar

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## 📚 Documentação

Toda a documentação do projeto está organizada na pasta [`docs/`](./docs/):

- **[📋 Planejamento](./docs/planning/)** - Roadmap, planejamentos e arquitetura
- **[🚀 Setup](./docs/setup/)** - Guias de instalação e configuração
  - **[Variáveis de Ambiente](./docs/setup/VARIAVEIS_AMBIENTE.md)** - Configuração de variáveis de ambiente
- **[💻 Desenvolvimento](./docs/development/)** - Checklists e guias de desenvolvimento
- **[🔧 Backend](./docs/backend/)** - Documentação do backend

Veja o [README da documentação](./docs/README.md) para mais detalhes.

## ⚙️ Configuração Inicial

Antes de executar o projeto, configure as variáveis de ambiente:

1. Crie um arquivo `.env.local` na raiz do projeto
2. Siga o guia em [Variáveis de Ambiente](./docs/setup/VARIAVEIS_AMBIENTE.md)
3. Configure pelo menos:
   - `EXPO_PUBLIC_API_URL` - URL da API backend
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Para login social com Google (opcional)
   - `RESEND_API_KEY` - Para envio de emails (backend)

