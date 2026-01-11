# Fix: Animação Suave do Teclado no iOS

## 🐛 Problema
Quando o usuário clicava em um input em qualquer tela (Search, Login, SignUp, CompleteProfile, Checkout, Addresses, PaymentMethods), o iOS naturalmente movia o input para cima do teclado, mas a animação não estava fluida - o input "piscava" ao invés de ter uma transição suave como em outros apps.

## 🔍 Causa
O problema era causado por um conflito entre:
1. O comportamento nativo do iOS que ajusta automaticamente o ScrollView quando o teclado aparece
2. O `KeyboardAvoidingView` do React Native que estava tentando fazer o mesmo ajuste
3. Isso causava uma "luta" entre os dois sistemas, resultando em uma animação "piscante"

## ✅ Solução
Removemos o `KeyboardAvoidingView` de todas as telas com inputs e deixamos o iOS fazer o ajuste nativo, que é mais suave e fluido.

### Mudanças Realizadas

#### 1. Removido `KeyboardAvoidingView`
- Removido o componente `KeyboardAvoidingView` que envolvia o conteúdo
- Removido o import não utilizado
- Removido o estilo `keyboardAvoidingView` não utilizado

#### 2. Melhorias no `ScrollView`
- Adicionado `keyboardDismissMode="on-drag"` para melhor UX (teclado fecha ao arrastar)
- Adicionado `automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}` para garantir ajuste automático no iOS (React Native 0.71+)
- Mantido `keyboardShouldPersistTaps="handled"` para permitir toques nos elementos enquanto o teclado está aberto

### Código Antes
```tsx
<KeyboardAvoidingView
  style={styles.keyboardAvoidingView}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
  {/* Conteúdo */}
</KeyboardAvoidingView>
```

### Código Depois
```tsx
<ScrollView
  ref={scrollViewRef}
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
  // ... outras props
>
  {/* Conteúdo */}
</ScrollView>
```

## 📱 Resultado
- ✅ Animação suave e fluida quando o teclado aparece
- ✅ Comportamento nativo do iOS preservado
- ✅ Melhor UX com `keyboardDismissMode="on-drag"`
- ✅ Sem conflitos entre sistemas de ajuste

## 🎯 Notas Técnicas

### Por que isso funciona melhor?
1. **iOS nativo**: O iOS já tem um sistema robusto de ajuste de teclado que funciona perfeitamente com `ScrollView`
2. **Sem conflitos**: Removendo o `KeyboardAvoidingView`, eliminamos o conflito entre dois sistemas tentando fazer a mesma coisa
3. **Performance**: O ajuste nativo é mais performático e suave

### Quando usar `KeyboardAvoidingView`?
- Quando você tem um layout que **não** usa `ScrollView`
- Quando você precisa de controle manual sobre o ajuste
- Em telas com layouts fixos (não scrolláveis)

### Quando NÃO usar `KeyboardAvoidingView`?
- ✅ Quando você já tem um `ScrollView` (como na tela Search)
- ✅ Quando o ajuste nativo do iOS funciona bem
- ✅ Quando você quer a melhor performance e UX

## 🧪 Testes
- [x] Input de busca na tela Search
- [x] Inputs na tela Login
- [x] Inputs na tela SignUp
- [x] Inputs na tela CompleteProfile
- [x] Inputs na tela Checkout
- [x] Inputs na tela Addresses
- [x] Inputs na tela PaymentMethods
- [x] Animação suave ao focar no input
- [x] Teclado fecha ao arrastar o scroll
- [x] Comportamento nativo preservado

## 📝 Arquivos Modificados
- `src/front/screens/Search.tsx`
- `src/front/screens/Login.tsx`
- `src/front/screens/SignUp.tsx`
- `src/front/screens/CompleteProfile.tsx`
- `src/front/screens/Checkout.tsx`
- `src/front/screens/Addresses.tsx`
- `src/front/screens/PaymentMethods.tsx`

