# Planejamento: Integração Completa Home e Search com Backend

## Objetivo
Integrar 100% a Home e a tela de Search com o backend, garantindo que:
1. Produtos apareçam corretamente em "Ofertas do dia" e "Mais populares" na Home
2. A tela de Search esteja totalmente integrada com busca, filtros e categorias do backend
3. Os chips de categorias na Search sejam as categorias principais marcadas no banco de dados

## Situação Atual

### Home (src/front/screens/Home.tsx)
- ✅ Já usa `useHomeData` hook que busca dados do backend
- ✅ Já exibe `offersProducts` e `popularProducts` do backend
- ✅ Já usa categorias principais do backend
- ⚠️ **Verificar se os produtos estão sendo exibidos corretamente**

### Search (src/front/screens/Search.tsx)
- ❌ Usa dados mockados (`mockProducts`)
- ❌ Categorias hardcoded (não vem do backend)
- ❌ Busca e filtros são apenas client-side (não usa API)
- ❌ Não tem paginação

### Backend APIs Disponíveis
- ✅ `GET /api/products` - Lista produtos com filtros
- ✅ `GET /api/products/popular` - Produtos populares
- ✅ `GET /api/products/offers` - Produtos em oferta
- ✅ `GET /api/categories?principais=true` - Categorias principais

## Tarefas a Implementar

### 1. Verificar e Ajustar Home (se necessário)
**Arquivo**: `src/front/screens/Home.tsx`

**Verificações**:
- [ ] Confirmar que `offersProducts` está sendo exibido na seção "Ofertas do dia"
- [ ] Confirmar que `popularProducts` está sendo exibido na seção "Mais populares"
- [ ] Verificar se há erros de conversão de dados (preços, imagens, etc.)
- [ ] Testar scroll infinito de produtos populares

**Ajustes possíveis**:
- Se os produtos não aparecem, verificar a função `convertProductToCard`
- Garantir que as imagens estão sendo carregadas corretamente
- Verificar tratamento de erros

### 2. Criar Hook para Search
**Arquivo**: `src/front/hooks/useSearchData.ts` (novo)

**Funcionalidades**:
- Buscar produtos com filtros (categoria, texto, preço, ordenação)
- Paginação
- Loading states
- Error handling
- Refresh

**Interface**:
```typescript
interface UseSearchData {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  hasMore: boolean;
  totalResults: number;
  search: (query: string, filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

### 3. Integrar Search com Backend
**Arquivo**: `src/front/screens/Search.tsx`

**Mudanças necessárias**:

#### 3.1. Substituir categorias hardcoded
- [ ] Remover array `categories` hardcoded
- [ ] Usar categorias do backend (mesmas da Home - principais)
- [ ] Adicionar chip "Todos" no início
- [ ] Mapear categorias do backend para formato do componente

#### 3.2. Integrar busca de produtos
- [ ] Substituir `mockProducts` por dados do backend
- [ ] Usar `useSearchData` hook
- [ ] Implementar debounce na busca (evitar muitas requisições)
- [ ] Atualizar filtros para usar parâmetros da API

#### 3.3. Implementar filtros
- [ ] **Ordenação**: Mapear opções do modal para parâmetros da API
  - "Relevância" → sem ordenarPor ou `nome_asc`
  - "Menor preço" → `preco_asc`
  - "Maior preço" → `preco_desc`
  - "Avaliação" → `popularidade` (por enquanto)
- [ ] **Faixa de preço**: Converter para `precoMin` e `precoMax` (em centavos)
  - "Até R$ 10" → `precoMax: 1000`
  - "R$ 10-25" → `precoMin: 1000, precoMax: 2500`
  - "R$ 25-50" → `precoMin: 2500, precoMax: 5000`
  - "Acima de R$ 50" → `precoMin: 5000`

#### 3.4. Implementar paginação
- [ ] Adicionar scroll infinito ou botão "Carregar mais"
- [ ] Mostrar loading ao carregar mais produtos
- [ ] Desabilitar carregamento quando não houver mais produtos

#### 3.5. Tratamento de estados
- [ ] Loading inicial (skeleton)
- [ ] Empty state quando não há resultados
- [ ] Error state com botão de retry
- [ ] Refresh pull-to-refresh

### 4. Atualizar Serviços (se necessário)
**Arquivo**: `src/services/product.service.ts`

**Verificações**:
- [ ] Confirmar que `getProducts` suporta todos os filtros necessários
- [ ] Verificar mapeamento de parâmetros de ordenação
- [ ] Testar paginação

**Arquivo**: `src/services/category.service.ts`

**Verificações**:
- [ ] Confirmar que `getPrincipalCategories` retorna as categorias corretas
- [ ] Verificar se há campo para identificar categorias da home

### 5. Mapeamento de Dados

#### 5.1. Categorias
**Backend → Frontend**:
```typescript
// Backend
{
  id: string;
  nome: string;
  slug: string;
  icone?: string;
  principal: boolean;
}

// Frontend (Search)
{
  id: string;
  label: string;
  iconSource?: ImageSourcePropType;
}
```

#### 5.2. Produtos
**Backend → Frontend**:
```typescript
// Backend
{
  id: string;
  nome: string;
  descricao: string;
  preco: number; // centavos
  precoPromocional?: number; // centavos
  emOferta: boolean;
  maisPopular: boolean;
  imagemUrl?: string;
  categoriaId: string;
}

// Frontend (Search)
{
  id: string;
  title: string;
  description: string;
  category?: string;
  showDriver: boolean;
  driverLabel?: string;
  basePrice?: string;
  finalPrice: string;
  discountValue?: string;
  type: 'Offer' | 'Default';
  imageUrl?: string;
}
```

### 6. Debounce na Busca
**Implementação**:
- Usar `useDebounce` hook ou implementar debounce manual
- Delay de 300-500ms após o usuário parar de digitar
- Cancelar requisições anteriores se uma nova for iniciada

### 7. Testes

#### 7.1. Home
- [ ] Produtos em oferta aparecem na seção "Ofertas do dia"
- [ ] Produtos populares aparecem na seção "Mais populares"
- [ ] Scroll infinito funciona
- [ ] Pull-to-refresh funciona
- [ ] Erros são tratados corretamente

#### 7.2. Search
- [ ] Categorias principais aparecem como chips
- [ ] Busca por texto funciona
- [ ] Filtro por categoria funciona
- [ ] Filtros de ordenação funcionam
- [ ] Filtros de preço funcionam
- [ ] Paginação funciona
- [ ] Empty state aparece quando não há resultados
- [ ] Loading states funcionam
- [ ] Erros são tratados corretamente

## Ordem de Implementação

1. **Fase 1: Verificar Home**
   - Testar se produtos aparecem corretamente
   - Corrigir problemas se houver

2. **Fase 2: Criar Hook useSearchData**
   - Implementar busca de produtos
   - Implementar busca de categorias
   - Implementar paginação
   - Implementar filtros

3. **Fase 3: Integrar Search**
   - Substituir dados mockados
   - Integrar categorias do backend
   - Integrar busca e filtros
   - Implementar debounce
   - Implementar paginação

4. **Fase 4: Testes e Ajustes**
   - Testar todos os cenários
   - Corrigir bugs
   - Otimizar performance

## Estrutura de Arquivos

```
src/
├── front/
│   ├── hooks/
│   │   ├── useHomeData.ts (já existe)
│   │   └── useSearchData.ts (novo)
│   └── screens/
│       ├── Home.tsx (ajustar se necessário)
│       └── Search.tsx (integrar completamente)
├── services/
│   ├── product.service.ts (verificar)
│   └── category.service.ts (verificar)
```

## Status de Implementação

### ✅ Concluído
1. **Home**: ✅ Integrada com backend
   - Produtos em oferta aparecem em "Ofertas do dia"
   - Produtos populares aparecem em "Mais populares"
   - Categorias principais do backend
   - Scroll infinito funcionando
   - Pull-to-refresh funcionando
   - Conversão de preços corrigida (precoBase/precoFinal → preco/precoPromocional)

2. **Search**: ✅ Integrada com backend
   - Hook `useSearchData` criado e funcionando
   - Categorias do backend (7 principais + outras)
   - Busca por texto com debounce
   - Filtros de categoria, ordenação e preço
   - Paginação com scroll infinito
   - Empty states e error handling
   - Rate limit handling

3. **Mapeamento de Dados**: ✅ Implementado
   - Preços: precoBase/precoFinal → preco/precoPromocional
   - Imagens: imagemPrincipal → imagemUrl
   - Validação de preços (evita NaN)

### 🔄 Em Progresso
4. **ProductListScreen**: ⚠️ Ainda usa dados mockados
   - Precisa integrar com backend
   - Suportar filtros: offer, popular, category

### 📋 Próximos Passos
1. Integrar ProductListScreen com backend
2. Testes finais de todas as funcionalidades
3. Otimização de performance
4. Redução de logs desnecessários

## Notas Importantes

1. **Categorias Principais**: As categorias que aparecem na Search devem ser as mesmas que aparecem na Home (marcadas como `principal: true` no banco)

2. **Conversão de Preços**: Backend usa centavos, frontend usa strings formatadas. Garantir conversão correta.

3. **Imagens**: Backend retorna URLs, frontend precisa converter para `ImageSourcePropType`

4. **Performance**: 
   - Usar debounce na busca (800ms no useSearchData, 600ms no Search)
   - Implementar paginação para não carregar todos os produtos de uma vez
   - Cache de categorias (não precisa buscar toda vez)
   - Rate limit handling implementado

5. **Error Handling**: Sempre tratar erros e mostrar feedback ao usuário

6. **Loading States**: Manter UX fluida com skeletons/loaders apropriados

