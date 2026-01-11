# 🚀 Como Iniciar os Servidores

Este guia explica como iniciar corretamente o backend e o frontend do projeto.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Dependências instaladas**: `npm install`
3. **Variáveis de ambiente configuradas**: Veja [VARIAVEIS_AMBIENTE.md](./VARIAVEIS_AMBIENTE.md)
4. **Banco de dados configurado**: Verifique se o `DATABASE_URL` está correto no `.env.local`

## 🔧 Iniciando os Servidores

### Opção 1: Terminal Separados (Recomendado)

Abra **dois terminais** separados:

#### Terminal 1 - Backend (API)
```bash
# Navegue até a raiz do projeto
cd /Users/wallace.andrade/Evoke/Now-24-horas

# Inicie o servidor backend em modo desenvolvimento (com hot-reload)
npm run api:dev
```

O backend estará rodando em: `http://localhost:3000`

#### Terminal 2 - Frontend (Expo)
```bash
# Navegue até a raiz do projeto
cd /Users/wallace.andrade/Evoke/Now-24-horas

# Inicie o servidor Expo
npm start
```

O Expo abrirá o Metro Bundler. Você pode:
- Pressionar `i` para abrir no iOS Simulator
- Pressionar `a` para abrir no Android Emulator
- Escanear o QR code com o app Expo Go no seu dispositivo físico

### Opção 2: Scripts NPM (Alternativa)

Se preferir, você pode usar scripts personalizados (precisa criar):

```bash
# Terminal 1
npm run api:dev

# Terminal 2 (em outro terminal)
npm start
```

## 📝 Scripts Disponíveis

### Backend

| Script | Descrição |
|--------|-----------|
| `npm run api:start` | Inicia o servidor backend (sem hot-reload) |
| `npm run api:dev` | Inicia o servidor backend com nodemon (hot-reload automático) |

### Frontend

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor Expo (Metro Bundler) |
| `npm run ios` | Inicia e abre no iOS Simulator |
| `npm run android` | Inicia e abre no Android Emulator |
| `npm run web` | Inicia e abre no navegador web |

## ✅ Verificando se Está Funcionando

### Backend

Após iniciar o backend, você deve ver no terminal:

```
🚀 Servidor da API iniciado!
📍 Ambiente: development
🌐 Servidor rodando em: http://localhost:3000
📋 Health check: http://localhost:3000/health
🔐 Rotas de autenticação: http://localhost:3000/api/auth
👤 Rotas de usuário: http://localhost:3000/api/users
```

Teste o health check:
```bash
curl http://localhost:3000/health
```

### Frontend

Após iniciar o Expo, você verá:
- QR code no terminal
- Opções para abrir em diferentes plataformas
- Metro Bundler rodando

## 🔗 Configuração da URL da API

Certifique-se de que o arquivo `.env.local` contém:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Importante**: 
- Para dispositivos físicos, use o IP da sua máquina ao invés de `localhost`
- Exemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`
- Para descobrir seu IP: `ifconfig` (Mac/Linux) ou `ipconfig` (Windows)

## 🐛 Troubleshooting

### Backend não inicia

1. **Verifique se a porta 3000 está livre**:
   ```bash
   lsof -i :3000
   # Se estiver em uso, mate o processo ou mude a porta
   ```

2. **Verifique as variáveis de ambiente**:
   ```bash
   # Certifique-se de que .env.local existe e tem DATABASE_URL configurado
   cat .env.local
   ```

3. **Verifique a conexão com o banco**:
   ```bash
   npm run db:test
   ```

### Frontend não conecta com o backend

1. **Verifique a URL da API**:
   - No arquivo `.env.local`, confirme que `EXPO_PUBLIC_API_URL` está correto
   - Para dispositivos físicos, use o IP da máquina, não `localhost`

2. **Reinicie o Expo com cache limpo**:
   ```bash
   npx expo start -c
   ```

3. **Verifique se o backend está rodando**:
   ```bash
   curl http://localhost:3000/health
   ```

### Erro de CORS

Se você ver erros de CORS, verifique se:
- O backend está configurado para aceitar requisições do frontend
- A URL no `.env.local` está correta

## 📚 Ordem Recomendada de Inicialização

1. **Primeiro**: Inicie o backend (`npm run api:dev`)
2. **Segundo**: Aguarde o backend estar rodando (veja as mensagens de sucesso)
3. **Terceiro**: Inicie o frontend (`npm start`)

## 🎯 Dicas

- **Hot Reload**: O backend com `api:dev` tem hot-reload automático (nodemon)
- **Logs**: Mantenha ambos os terminais visíveis para ver logs de erro
- **Portas**: Backend usa porta 3000, Expo usa porta 8081 (Metro Bundler)
- **Banco de Dados**: Certifique-se de que o banco está acessível antes de iniciar o backend

## 🔄 Parar os Servidores

Para parar os servidores:
- **Backend**: Pressione `Ctrl + C` no terminal do backend
- **Frontend**: Pressione `Ctrl + C` no terminal do Expo

