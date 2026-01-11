# Checklist de Testes - Integração Home e Search

## 🧪 Testes da Home Screen

### Carregamento Inicial
- [ ] Tela carrega sem erros
- [ ] Skeleton aparece durante carregamento
- [ ] Header aparece corretamente
- [ ] Categorias principais aparecem no grid
- [ ] Produtos em oferta aparecem na seção "Ofertas do dia"
- [ ] Produtos populares aparecem na seção "Mais populares"

### Produtos
- [ ] Preços aparecem corretamente (não NaN)
- [ ] Preços promocionais aparecem quando aplicável
- [ ] Descontos calculados corretamente
- [ ] Imagens dos produtos carregam
- [ ] Badge "Popular" aparece nos produtos corretos
- [ ] Badge de desconto aparece quando há oferta

### Interações
- [ ] Clicar em categoria navega para Search
- [ ] Clicar em produto navega para ProductDetails
- [ ] Clicar em "Ver tudo" de ofertas navega para ProductList
- [ ] Clicar em "Ver tudo" de populares navega para ProductList
- [ ] Scroll infinito funciona na seção "Mais populares"
- [ ] Pull-to-refresh funciona

### Estados
- [ ] Empty state aparece quando não há ofertas
- [ ] Empty state aparece quando não há populares
- [ ] Error state aparece em caso de erro
- [ ] Botão "Tentar novamente" funciona

## 🧪 Testes da Search Screen

### Carregamento Inicial
- [ ] Tela carrega sem erros
- [ ] Skeleton aparece durante carregamento
- [ ] Categorias aparecem como chips (7 principais + outras)
- [ ] Chip "Todos" aparece primeiro
- [ ] Produtos aparecem no grid

### Busca
- [ ] Digitar no campo de busca funciona
- [ ] Debounce funciona (não faz muitas requisições)
- [ ] Resultados aparecem após busca
- [ ] Busca vazia mostra todos os produtos

### Filtros de Categoria
- [ ] Clicar em chip de categoria filtra produtos
- [ ] Chip "Todos" mostra todos os produtos
- [ ] Categoria selecionada fica destacada
- [ ] Scroll horizontal dos chips funciona

### Filtros do Modal
- [ ] Modal de filtros abre corretamente
- [ ] Ordenação funciona:
  - [ ] Relevância
  - [ ] Menor preço
  - [ ] Maior preço
  - [ ] Avaliação
- [ ] Faixa de preço funciona:
  - [ ] Até R$ 10
  - [ ] R$ 10-25
  - [ ] R$ 25-50
  - [ ] Acima de R$ 50
- [ ] Aplicar filtros funciona
- [ ] Limpar filtros funciona

### Paginação
- [ ] Scroll infinito funciona
- [ ] Mais produtos carregam ao chegar no final
- [ ] Loading aparece ao carregar mais
- [ ] Não carrega mais quando não há mais produtos

### Estados
- [ ] Empty state aparece quando não há resultados
- [ ] Error state aparece em caso de erro
- [ ] Pull-to-refresh funciona
- [ ] Rate limit é tratado corretamente

## 🧪 Testes da ProductListScreen

### Carregamento por Tipo
- [ ] Filtro "offer" mostra produtos em oferta
- [ ] Filtro "popular" mostra produtos populares
- [ ] Filtro "category" mostra produtos da categoria
- [ ] Título da tela aparece corretamente

### Produtos
- [ ] Produtos aparecem no grid
- [ ] Preços aparecem corretamente
- [ ] Imagens carregam
- [ ] Clicar em produto navega para ProductDetails

### Estados
- [ ] Skeleton aparece durante carregamento
- [ ] Empty state aparece quando não há produtos
- [ ] Error state aparece em caso de erro
- [ ] Pull-to-refresh funciona

## 🧪 Testes de Navegação

### Fluxos
- [ ] Home → Search (via input)
- [ ] Home → Search (via categoria)
- [ ] Home → ProductList (via "Ver tudo")
- [ ] Search → ProductDetails
- [ ] ProductList → ProductDetails
- [ ] Voltar de todas as telas funciona

### Parâmetros
- [ ] Search recebe categoryId corretamente
- [ ] Search recebe focusInput corretamente
- [ ] ProductList recebe filterType corretamente
- [ ] ProductList recebe categoryId corretamente

## 🧪 Testes de Performance

### Requisições
- [ ] Não há requisições duplicadas
- [ ] Debounce funciona corretamente
- [ ] Rate limit não é atingido em uso normal
- [ ] Cache funciona quando apropriado

### UI
- [ ] Animações são suaves
- [ ] Scroll é fluido
- [ ] Loading states aparecem rapidamente
- [ ] Não há travamentos

## 🧪 Testes de Edge Cases

### Dados Vazios
- [ ] Sem categorias principais
- [ ] Sem produtos em oferta
- [ ] Sem produtos populares
- [ ] Sem resultados de busca

### Erros
- [ ] Erro de rede
- [ ] Erro de API
- [ ] Timeout
- [ ] Rate limit

### Dados Inválidos
- [ ] Produtos sem preço
- [ ] Produtos sem imagem
- [ ] Categorias sem ícone
- [ ] Preços NaN (já corrigido)

## 🧪 Testes de Integração

### Backend
- [ ] Todas as requisições funcionam
- [ ] Mapeamento de dados está correto
- [ ] Paginação funciona com backend
- [ ] Filtros funcionam com backend

### Conversão de Dados
- [ ] precoBase → preco
- [ ] precoFinal → precoPromocional
- [ ] imagemPrincipal → imagemUrl
- [ ] Categorias principais ordenadas

## 📝 Notas de Teste

### Ambiente
- Testar em desenvolvimento (__DEV__ = true)
- Testar em produção (__DEV__ = false)
- Testar com dados reais do backend
- Testar com diferentes quantidades de dados

### Dispositivos
- iOS
- Android
- Diferentes tamanhos de tela

### Cenários
- Primeira carga
- Navegação entre telas
- Refresh manual
- Scroll infinito
- Busca e filtros

## ✅ Critérios de Sucesso

- ✅ Todas as telas carregam sem erros
- ✅ Todos os produtos aparecem corretamente
- ✅ Todos os preços aparecem corretamente
- ✅ Todas as navegações funcionam
- ✅ Todos os filtros funcionam
- ✅ Performance é aceitável
- ✅ UX é fluida e responsiva


