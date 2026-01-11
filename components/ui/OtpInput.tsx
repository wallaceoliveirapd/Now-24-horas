import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useState, useRef, useEffect } from 'react';

export type OtpInputState = 'Default' | 'Focus' | 'Typed';
export type OtpInputTheme = 'Dark' | 'Light';

interface OtpInputCellProps {
  value: string;
  state: OtpInputState;
  theme: OtpInputTheme;
  onFocus: () => void;
  onBlur: () => void;
  onChangeText: (text: string) => void;
  onKeyPress?: (e: any) => void;
  inputRef?: React.RefObject<TextInput>;
  autoFocus?: boolean;
}

function OtpInputCell({
  value,
  state,
  theme,
  onFocus,
  onBlur,
  onChangeText,
  onKeyPress,
  inputRef,
  autoFocus,
}: OtpInputCellProps) {
  const isDark = theme === 'Dark';
  const isTyped = state === 'Typed' && value !== '';
  const isFocused = state === 'Focus';

  // Estilos baseados no tema e estado
  const getBorderColor = (): string => {
    if (isDark) {
      return colors.white;
    }
    return 'rgba(0, 0, 0, 0.1)';
  };

  const getBackgroundColor = (): string => {
    if (isFocused) {
      if (isDark) {
        return 'rgba(255, 255, 255, 0.16)';
      }
      return 'rgba(0, 0, 0, 0.02)';
    }
    return 'transparent';
  };

  const getTextColor = (): string => {
    if (isDark) {
      return colors.white;
    }
    return colors.black;
  };

  const getTextOpacity = (): number => {
    if (isTyped) {
      return 1;
    }
    return 0.2; // Opacity 20% para placeholder
  };

  const containerStyle = combineStyles(
    styles.cell,
    {
      borderBottomColor: getBorderColor(),
      backgroundColor: getBackgroundColor(),
    }
  );

  const textStyle = combineStyles(
    styles.cellText,
    {
      color: getTextColor(),
      opacity: getTextOpacity(),
    }
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => inputRef?.current?.focus()}
      activeOpacity={1}
    >
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType="number-pad"
        maxLength={1}
        autoFocus={autoFocus}
        selectTextOnFocus
        caretHidden={true}
        onKeyPress={onKeyPress}
      />
      <Text style={textStyle}>
        {value || '0'}
      </Text>
    </TouchableOpacity>
  );
}

interface OtpInputProps {
  length?: number;
  theme?: OtpInputTheme;
  value?: string;
  onChangeText?: (text: string) => void;
  onComplete?: (text: string) => void;
  autoFocus?: boolean;
  containerStyle?: ViewStyle;
}

export function OtpInput({
  length = 6,
  theme = 'Dark',
  value: controlledValue,
  onChangeText: controlledOnChangeText,
  onComplete,
  autoFocus = false,
  containerStyle,
}: OtpInputProps) {
  const [internalValue, setInternalValue] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<Array<React.RefObject<TextInput>>>([]);

  // Usar valor controlado se fornecido, senão usar estado interno
  const isControlled = controlledValue !== undefined;
  
  // Inicializar refs
  useEffect(() => {
    inputRefs.current = Array(length)
      .fill(null)
      .map((_, i) => inputRefs.current[i] || React.createRef<TextInput>());
  }, [length]);

  // Atualizar valor interno quando valor controlado mudar
  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      const newValue = controlledValue.split('').slice(0, length);
      const paddedValue = [...newValue, ...Array(length - newValue.length).fill('')];
      setInternalValue(paddedValue.slice(0, length));
    }
  }, [controlledValue, length, isControlled]);

  // Calcular valor atual sincronizado
  const currentValue = isControlled
    ? (() => {
        const valueArray = controlledValue.split('').slice(0, length);
        const padded = [...valueArray, ...Array(length - valueArray.length).fill('')];
        return padded.slice(0, length);
      })()
    : internalValue;

  const handleChangeText = (index: number, text: string) => {
    // Apenas números
    const numericText = text.replace(/\D/g, '');

    if (numericText.length > 0) {
      const newValue = [...currentValue];
      newValue[index] = numericText[0];
      const fullValue = newValue.join('');

      // Atualizar valor primeiro (importante para o último dígito)
      if (isControlled) {
        // Atualizar imediatamente
        controlledOnChangeText?.(fullValue);
        console.log('📝 OtpInput (controlled): Valor atualizado para:', fullValue);
        
        // Chamar onComplete se todos os dígitos estão preenchidos
        if (fullValue.length === length) {
          console.log('✅ OtpInput (controlled): Todos os dígitos preenchidos, chamando onComplete');
          // Usar setTimeout para garantir que o estado foi atualizado
          setTimeout(() => {
            onComplete?.(fullValue);
          }, 50);
        }
      } else {
        setInternalValue(newValue);
        console.log('📝 OtpInput (uncontrolled): Valor atualizado para:', fullValue);
        
        // Chamar onComplete se todos os dígitos estão preenchidos
        if (fullValue.length === length) {
          console.log('✅ OtpInput (uncontrolled): Todos os dígitos preenchidos, chamando onComplete');
          setTimeout(() => {
            onComplete?.(fullValue);
          }, 50);
        }
      }

      // Mover para o próximo campo (se não for o último)
      if (index < length - 1) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.current?.focus();
        }, 0);
      } else {
        // Se for o último campo, remover o foco
        setTimeout(() => {
          inputRefs.current[index]?.current?.blur();
        }, 0);
      }
    } else if (text === '') {
      // Backspace - limpar campo atual
      const newValue = [...currentValue];
      newValue[index] = '';
      const fullValue = newValue.join('');
      
      if (isControlled) {
        controlledOnChangeText?.(fullValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && currentValue[index] === '' && index > 0) {
      // Se o campo atual está vazio e pressionou backspace, voltar para o anterior
      setTimeout(() => {
        inputRefs.current[index - 1]?.current?.focus();
      }, 0);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const getCellState = (index: number): OtpInputState => {
    if (focusedIndex === index) {
      return 'Focus';
    }
    if (currentValue[index] && currentValue[index] !== '') {
      return 'Typed';
    }
    return 'Default';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array(length)
        .fill(null)
        .map((_, index) => (
          <OtpInputCell
            key={index}
            value={currentValue[index] || ''}
            state={getCellState(index)}
            theme={theme}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onChangeText={(text) => handleChangeText(index, text)}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace' && currentValue[index] === '' && index > 0) {
                handleKeyPress(index, 'Backspace');
              }
            }}
            inputRef={inputRefs.current[index]}
            autoFocus={autoFocus && index === 0}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    width: 72,
    minHeight: 72,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  cellText: {
    fontSize: 42,
    lineHeight: 40,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
    position: 'absolute',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

