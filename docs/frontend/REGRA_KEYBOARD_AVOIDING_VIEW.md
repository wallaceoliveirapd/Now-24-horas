# Regra: KeyboardAvoidingView no iOS

## ⚠️ REGRA IMPORTANTE

**NUNCA use `KeyboardAvoidingView` quando você já tem um `ScrollView` na tela.**

## 🎯 Por quê?

No iOS, o sistema nativo já ajusta automaticamente o `ScrollView` quando o teclado aparece. Usar `KeyboardAvoidingView` junto com `ScrollView` causa:

- ❌ Animação "piscante" ou não fluida
- ❌ Conflito entre dois sistemas tentando fazer o mesmo ajuste
- ❌ Performance ruim
- ❌ UX ruim

## ✅ Solução Correta

### Quando você TEM um ScrollView:

```tsx
// ✅ CORRETO - Deixar o iOS fazer o ajuste nativo
<ScrollView
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
  // ... outras props
>
  {/* Conteúdo com inputs */}
</ScrollView>
```

### Quando você NÃO TEM um ScrollView:

```tsx
// ✅ CORRETO - Usar KeyboardAvoidingView apenas quando necessário
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
  <View>
    {/* Conteúdo com inputs, mas SEM ScrollView */}
  </View>
</KeyboardAvoidingView>
```

## 📋 Checklist

Antes de adicionar `KeyboardAvoidingView`, pergunte:

1. ✅ Esta tela tem um `ScrollView`?
   - **SIM** → NÃO use `KeyboardAvoidingView`, use as props do `ScrollView`
   - **NÃO** → Pode usar `KeyboardAvoidingView` se necessário

2. ✅ O ajuste nativo do iOS funciona bem?
   - **SIM** → Não use `KeyboardAvoidingView`
   - **NÃO** → Considere usar apenas se realmente necessário

## 🔧 Props Importantes do ScrollView

Quando você tem um `ScrollView` com inputs:

```tsx
<ScrollView
  // Permite tocar em elementos enquanto o teclado está aberto
  keyboardShouldPersistTaps="handled"
  
  // Fecha o teclado ao arrastar o scroll (melhor UX)
  keyboardDismissMode="on-drag"
  
  // Ajuste automático no iOS (React Native 0.71+)
  automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
>
```

## 📝 Telas Corrigidas

Esta regra foi aplicada nas seguintes telas:

- ✅ `src/front/screens/Search.tsx`
- ✅ `src/front/screens/Login.tsx`
- ✅ `src/front/screens/SignUp.tsx`
- ✅ `src/front/screens/CompleteProfile.tsx`
- ✅ `src/front/screens/Checkout.tsx`
- ✅ `src/front/screens/Addresses.tsx`
- ✅ `src/front/screens/PaymentMethods.tsx`

## 🚨 Lembrete

**SEMPRE verifique se há um `ScrollView` antes de adicionar `KeyboardAvoidingView`.**

Se houver `ScrollView`, use as props do `ScrollView` ao invés de `KeyboardAvoidingView`.

## 📚 Referências

- [React Native KeyboardAvoidingView Docs](https://reactnative.dev/docs/keyboardavoidingview)
- [React Native ScrollView Docs](https://reactnative.dev/docs/scrollview)
- `docs/frontend/FIX_KEYBOARD_ANIMATION.md` - Detalhes técnicos da correção

