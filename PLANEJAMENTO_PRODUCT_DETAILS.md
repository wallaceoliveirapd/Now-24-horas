# Planejamento - Página de Detalhes do Produto

## Visão Geral
Implementação da página de detalhes do produto com sistema de configurações personalizáveis, baseada no design do Figma (node-id: 149-4836).

## Componentes a Criar

### 1. **ProductDetailHeader** (`components/ui/ProductDetailHeader.tsx`)
**Propósito**: Header com imagem do produto, gradiente linear e botão de voltar sobreposto.

**Props:**
- `imageSource?: ImageSourcePropType` - Imagem do produto
- `onBackPress: () => void` - Callback ao pressionar voltar
- `style?: ViewStyle` - Estilos customizados

**Características:**
- Imagem ocupa toda largura e vai até o topo (por baixo do status bar)
- Gradiente linear de cima para baixo (preto com opacidade)
- Botão voltar sobreposto com ícone chevron-left e texto "Voltar"
- Status bar transparente/light quando sobre a imagem

---

### 2. **ProductDetailInfo** (`components/ui/ProductDetailInfo.tsx`)
**Propósito**: Exibe informações básicas do produto (nome, descrição, preço).

**Props:**
- `title: string` - Nome do produto
- `description?: string` - Descrição do produto
- `basePrice?: string` - Preço original (riscado)
- `finalPrice: string` - Preço final
- `discountValue?: string` - Valor do desconto (para badge verde)
- `showDiscount?: boolean` - Se deve mostrar badge de desconto
- `unitLabel?: string` - Label da unidade (ex: "/un")

**Variants:**
- Com desconto: mostra preço riscado + badge verde + preço final verde
- Sem desconto: mostra apenas preço final

---

### 3. **SelectionOption** (`components/ui/SelectionOption.tsx`)
**Propósito**: Item individual de seleção (radio ou checkbox).

**Props:**
- `id: string` - ID único da opção
- `title: string` - Título da opção
- `description?: string` - Descrição opcional
- `price?: number` - Preço adicional em centavos (opcional)
- `isSelected: boolean` - Se está selecionado
- `onSelect: (id: string) => void` - Callback ao selecionar
- `type: 'radio' | 'checkbox'` - Tipo de seleção
- `showQuantity?: boolean` - Se mostra contador de quantidade
- `quantity?: number` - Quantidade atual (quando showQuantity = true)
- `onQuantityChange?: (id: string, quantity: number) => void` - Callback ao mudar quantidade

**Variants:**
- **Marcado**: Fundo rosa claro (`rgba(230,28,97,0.06)`), borda rosa, ícone check
- **Desmarcado**: Fundo branco, borda cinza, ícone circle vazio
- **Com quantidade**: Adiciona contador inline (mesmo estilo do ProductCard)
- **Preço**: 
  - "Grátis" (verde) quando price = 0 ou undefined
  - "+ R$ X,XX" (cinza) quando tem preço

**Estados:**
- Normal
- Selecionado
- Com quantidade (múltipla escolha com contador)

---

### 4. **SelectionSection** (`components/ui/SelectionSection.tsx`)
**Propósito**: Seção completa de seleção com título, badges e lista de opções.

**Props:**
- `title: string` - Título da seção
- `options: SelectionOptionData[]` - Lista de opções
- `selectionType: 'single' | 'multiple'` - Tipo de seleção (radio ou checkbox)
- `isRequired: boolean` - Se a seleção é obrigatória
- `minSelection?: number` - Seleção mínima (ex: "1/2")
- `maxSelection?: number` - Seleção máxima (ex: "1/2")
- `onOptionSelect: (optionId: string) => void` - Callback ao selecionar opção
- `onQuantityChange?: (optionId: string, quantity: number) => void` - Callback ao mudar quantidade
- `allowQuantity?: boolean` - Se permite quantidade nas opções

**Badges:**
- "1/1" - Single choice obrigatório
- "1/2" - Multiple choice opcional (mínimo 1, máximo 2)
- "Obrigatório" - Badge rosa quando isRequired = true

**Lógica:**
- Single choice: apenas uma opção selecionada por vez
- Multiple choice: múltiplas opções podem ser selecionadas
- Validação de min/max selections
- Atualiza badges dinamicamente (ex: "2/3" quando 2 de 3 selecionados)

---

### 5. **QuantitySelector** (`components/ui/QuantitySelector.tsx`)
**Propósito**: Seletor de quantidade reutilizável (para quantidade principal do produto).

**Props:**
- `quantity: number` - Quantidade atual
- `onQuantityChange: (quantity: number) => void` - Callback ao mudar quantidade
- `min?: number` - Quantidade mínima (padrão: 1)
- `max?: number` - Quantidade máxima
- `style?: ViewStyle` - Estilos customizados

**Características:**
- Mesmo estilo visual do contador do ProductCard
- Botões animados
- Validação de min/max

---

### 6. **ProductObservations** (`components/ui/ProductObservations.tsx`)
**Propósito**: Campo de texto para observações do cliente.

**Props:**
- `value: string` - Valor atual do texto
- `onChangeText: (text: string) => void` - Callback ao mudar texto
- `placeholder?: string` - Texto placeholder
- `hint?: string` - Texto de exemplo abaixo do campo
- `maxLength?: number` - Tamanho máximo
- `style?: ViewStyle` - Estilos customizados

**Características:**
- Textarea com múltiplas linhas
- Placeholder "Escreva aqui..."
- Texto de exemplo abaixo: "Ex: Bem maduro, sem manchas..."
- Estilo consistente com Input existente

---

### 7. **ProductDetailFooter** (`components/ui/ProductDetailFooter.tsx`)
**Propósito**: Barra fixa no final com total e botão adicionar ao carrinho.

**Props:**
- `total: number` - Total em centavos
- `onAddToCart: () => void` - Callback ao adicionar ao carrinho
- `buttonText?: string` - Texto do botão (padrão: "Add ao carrinho")
- `isLoading?: boolean` - Se está carregando
- `style?: ViewStyle` - Estilos customizados

**Características:**
- Fixo no bottom da tela
- Mostra "Total R$X,XX" em destaque (rosa/primary)
- Botão grande e destacado
- Ícone de carrinho no botão

---

## Página Principal

### 8. **ProductDetails** (`src/front/screens/ProductDetails.tsx`)
**Propósito**: Página completa que integra todos os componentes.

**Props (via navigation params):**
- `productId: string` - ID do produto
- `product?: ProductData` - Dados opcionais do produto (se já disponível)

**Estrutura de Dados do Produto:**
```typescript
interface ProductDetailsData {
  id: string;
  title: string;
  description?: string;
  imageSource?: ImageSourcePropType;
  basePrice?: number; // em centavos
  finalPrice: number; // em centavos
  discountValue?: number; // em centavos
  selectionSections?: SelectionSectionConfig[];
}

interface SelectionSectionConfig {
  id: string;
  title: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  allowQuantity?: boolean;
  options: SelectionOptionConfig[];
}

interface SelectionOptionConfig {
  id: string;
  title: string;
  description?: string;
  price?: number; // em centavos (0 = grátis)
  defaultQuantity?: number; // para opções com quantidade
}
```

**Estado:**
- Estado do produto (dados carregados)
- Seleções feitas pelo usuário (por seção)
- Quantidades selecionadas
- Observações do usuário
- Quantidade principal do produto
- Cálculo do total atualizado

**Funcionalidades:**
- Carregar dados do produto
- Gerenciar seleções (single/multiple)
- Validar seleções obrigatórias antes de adicionar ao carrinho
- Calcular total dinâmico (preço base + opções selecionadas + quantidades)
- Adicionar ao carrinho com todas as configurações
- Navegação para voltar

**Layout:**
- SafeAreaView
- StatusBar transparente/light
- ScrollView com todos os componentes
- Footer fixo no bottom

---

## Ordem de Implementação

1. ✅ **QuantitySelector** - Componente mais simples e reutilizável
2. ✅ **ProductDetailHeader** - Header com imagem e gradiente
3. ✅ **ProductDetailInfo** - Informações básicas
4. ✅ **SelectionOption** - Item de seleção individual
5. ✅ **SelectionSection** - Seção completa
6. ✅ **ProductObservations** - Campo de observações
7. ✅ **ProductDetailFooter** - Footer fixo
8. ✅ **ProductDetails** - Página completa

---

## Considerações Técnicas

### Status Bar
- Transparente quando sobre a imagem
- Light content (texto branco)
- Usar `StatusBar` do expo-status-bar com `translucent={true}`

### Gradiente
- Usar `LinearGradient` do `expo-linear-gradient` ou `react-native-linear-gradient`
- Cores: `rgba(0, 0, 0, 0.2)` até `rgba(0, 0, 0, 0)`
- Direção: de cima para baixo

### Imagem por baixo do Status Bar
- Usar `ImageBackground` ou View com imagem absoluta
- Posicionar com `position: 'absolute'` e `top: 0`
- SafeAreaView deve ter `edges={['top']}` para não cortar

### Cálculo de Total
- Preço base do produto
- + Preços das opções selecionadas (multiplicado por quantidade se aplicável)
- Multiplicado pela quantidade principal

### Integração com CartContext
- Ao adicionar ao carrinho, incluir:
  - Todas as configurações selecionadas
  - Quantidades
  - Observações
  - Preço total calculado

---

## Checklist de Validação

- [ ] Header com imagem e gradiente funcionando
- [ ] Botão voltar sobreposto funcionando
- [ ] Informações do produto exibidas corretamente
- [ ] Seções de seleção renderizando corretamente
- [ ] Single choice funcionando
- [ ] Multiple choice funcionando
- [ ] Contador de quantidade nas opções funcionando
- [ ] Validação de seleções obrigatórias
- [ ] Badges dinâmicos (1/2, 2/3, etc.)
- [ ] Cálculo de total atualizado em tempo real
- [ ] Campo de observações funcionando
- [ ] Footer fixo no bottom
- [ ] Adicionar ao carrinho com todas as configurações
- [ ] Navegação funcionando
- [ ] Animações nos botões

