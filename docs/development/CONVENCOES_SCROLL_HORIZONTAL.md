# 📜 Convenções de Scroll Horizontal

Este documento define as convenções para criar listas horizontais (scroll horizontal) no projeto, garantindo uma experiência de usuário suave e consistente.

## 🎯 Propriedades Padrão

Todas as listas horizontais devem usar as seguintes propriedades para garantir suavidade:

### Para ScrollView horizontal:

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  decelerationRate="normal"
  scrollEventThrottle={16}
  // ... outras props específicas
>
```

### Para FlatList horizontal (quando não usar pagingEnabled):

```tsx
<FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  decelerationRate="normal"
  scrollEventThrottle={16}
  // ... outras props específicas
/>
```

## 🔧 Propriedades Explicadas

### `decelerationRate="normal"`
- **O que faz**: Controla a velocidade de desaceleração após o usuário soltar o scroll
- **Por que usar**: `"normal"` proporciona uma desaceleração natural e suave. Evite `"fast"` que torna a rolagem muito rígida
- **Alternativa**: Se precisar de rolagem mais rápida, use `"normal"`. Nunca use `"fast"` para listas horizontais

### `scrollEventThrottle={16}`
- **O que faz**: Controla quantas vezes o evento de scroll é disparado (em ms)
- **Por que usar**: `16` (≈60fps) garante responsividade suave. Valores maiores (como 100) tornam a rolagem menos responsiva
- **Alternativa**: Use `16` para melhor performance visual

### `showsHorizontalScrollIndicator={false}`
- **O que faz**: Esconde o indicador de scroll horizontal
- **Por que usar**: Melhora a aparência visual (padrão em designs modernos)
- **Alternativa**: Se o design exigir, pode ser `true`

### ❌ Evitar

#### NÃO usar `bounces={false}`
- Remove o bounce natural, tornando a experiência mais rígida
- Permitir bounce leve proporciona feedback visual melhor

#### NÃO usar `snapToInterval` sem necessidade
- Cria encaixe rígido entre itens
- Só use se realmente precisar de snap (ex: carrossel de imagens com paging)

#### NÃO usar `decelerationRate="fast"`
- Torna a rolagem muito rígida e difícil de controlar
- Prefira sempre `"normal"`

## 📍 Onde Aplicar

Aplique essas propriedades em:

- ✅ Listas de categorias (chips)
- ✅ Listas de produtos horizontais
- ✅ Listas de stories
- ✅ Listas de filtros
- ✅ Qualquer lista horizontal de itens
- ❌ Carrosséis com paging (use `pagingEnabled` com FlatList)
- ❌ Listas verticais (use propriedades apropriadas para scroll vertical)

## 📝 Exemplos

### Exemplo 1: Lista de Categorias
```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.chipsContainer}
  style={styles.chipsScroll}
  decelerationRate="normal"
  scrollEventThrottle={16}
>
  {categories.map((category) => (
    <CategoryChip key={category.id} {...category} />
  ))}
</ScrollView>
```

### Exemplo 2: Lista de Produtos Horizontal
```tsx
<ScrollView 
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.productsScroll}
  style={styles.productsScrollView}
  decelerationRate="normal"
  scrollEventThrottle={16}
>
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</ScrollView>
```

### Exemplo 3: Lista de Filtros
```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.filtersContainer}
  style={styles.filtersScroll}
  decelerationRate="normal"
  scrollEventThrottle={16}
>
  {filters.map((filter) => (
    <Filter key={filter.id} {...filter} />
  ))}
</ScrollView>
```

## 🎨 Componentes Já Atualizados

Os seguintes componentes já seguem essas convenções:

- ✅ `CategoryList` (`components/ui/CategoryList.tsx`)
- ✅ Lista de stories na Home (`src/front/screens/Home.tsx`)
- ✅ Lista de ofertas na Home (`src/front/screens/Home.tsx`)
- ✅ Lista de filtros na Home (`src/front/screens/Home.tsx`)
- ✅ Lista de chips de categoria na Search (`src/front/screens/Search.tsx`)

## ✅ Checklist para Novas Listas Horizontais

Ao criar uma nova lista horizontal, verifique:

- [ ] Adicionei `decelerationRate="normal"`?
- [ ] Adicionei `scrollEventThrottle={16}`?
- [ ] Usei `showsHorizontalScrollIndicator={false}`?
- [ ] NÃO usei `bounces={false}` (a menos que haja motivo específico)?
- [ ] NÃO usei `snapToInterval` (a menos que seja necessário)?
- [ ] NÃO usei `decelerationRate="fast"`?

## 📚 Referências

- [React Native ScrollView Docs](https://reactnative.dev/docs/scrollview)
- [React Native FlatList Docs](https://reactnative.dev/docs/flatlist)
- Design System do projeto

