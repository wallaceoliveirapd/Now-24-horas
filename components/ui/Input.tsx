import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps, TouchableOpacity } from 'react-native';
import { Search, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useState } from 'react';

interface InputProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
  label?: string;
  required?: boolean;
  status?: 'default' | 'error' | 'success';
  errorMessage?: string;
  successMessage?: string;
  message?: string; // Mensagem geral abaixo do input (conforme Figma)
  showMessage?: boolean; // Se deve mostrar a mensagem (conforme Figma)
  state?: 'Default' | 'Focus' | 'Disabled' | 'Error' | 'Success'; // Estados conforme Figma
  showSearchIcon?: boolean;
  showPasswordEye?: boolean; // Ícone de olho para mostrar/ocultar senha (conforme Figma: passwordEye)
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

export function Input({
  placeholder = 'Buscar itens',
  label,
  required = false,
  status = 'default',
  errorMessage,
  successMessage,
  message,
  showMessage = false,
  state = 'Default',
  showSearchIcon = true,
  showPasswordEye = false,
  containerStyle,
  inputStyle,
  editable,
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Determinar o estado real
  // Se state for explícito (Focus, Disabled, Error, Success), usar ele
  // Senão, determinar baseado em status e focus
  let actualState = state;
  if (state === 'Default') {
    if (status === 'error') {
      actualState = 'Error';
    } else if (status === 'success') {
      actualState = 'Success';
    } else if (isFocused) {
      actualState = 'Focus';
    } else {
      actualState = 'Default';
    }
  }
  
  // Se state for 'Disabled', forçar editable como false
  const isEditable = actualState === 'Disabled' ? false : (editable !== undefined ? editable : true);
  
  // Para password, usar o estado interno se showPasswordEye estiver ativo
  const actualSecureTextEntry = showPasswordEye ? !isPasswordVisible : secureTextEntry;

  // Cores conforme Figma
  const errorColor = '#e68b1c'; // Warning color do Figma
  const successColor = colors.green[700]; // #449200

  // Determinar cor da borda e background baseado no estado
  const getBorderColor = () => {
    if (actualState === 'Disabled') return colors.disabled;
    if (actualState === 'Error') return errorColor; // Error: borda warning
    if (actualState === 'Success') return successColor; // Success: borda verde
    if (actualState === 'Focus') return colors.primary; // #E61C61
    return 'transparent'; // Default: sem borda visível
  };

  const getBackgroundColor = () => {
    if (actualState === 'Disabled') return colors.disabled; // #c5c5c5
    return colors.gray[50]; // #F9FAFB (todos os outros estados)
  };

  const getTextColor = () => {
    if (actualState === 'Disabled') return colors.mutedForeground;
    if (actualState === 'Error') return errorColor; // Error: texto warning
    return colors.black; // Default, Focus, Success
  };

  const getMessageColor = () => {
    if (actualState === 'Error') return errorColor; // Error: mensagem warning
    if (actualState === 'Success') return successColor; // Success: mensagem verde
    return colors.mutedForeground; // Default
  };

  const containerStyles = combineStyles(
    styles.container,
    actualState === 'Focus' && styles.containerFocus,
    actualState === 'Disabled' && styles.containerDisabled,
    actualState === 'Error' && styles.containerError,
    actualState === 'Success' && styles.containerSuccess,
    { 
      borderColor: getBorderColor(),
      backgroundColor: getBackgroundColor(),
    },
    containerStyle
  );

  const inputStyles = combineStyles(
    styles.input,
    actualState === 'Disabled' && styles.inputDisabled,
    { color: getTextColor() },
    inputStyle
  );

  const iconColor = actualState === 'Disabled' ? colors.disabled : (actualState === 'Error' ? errorColor : colors.black);
  const showStatusIcon = (actualState === 'Error' || actualState === 'Success') && !showSearchIcon && !showPasswordEye;

  // Determinar qual mensagem mostrar
  const displayMessage = errorMessage || successMessage || message;
  const shouldShowMessage = showMessage && displayMessage;

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      <View style={containerStyles}>
        {showSearchIcon && (
          <View style={styles.iconContainer}>
            <Search size={24} color={iconColor} strokeWidth={2} />
          </View>
        )}
        <TextInput
          style={inputStyles}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          editable={isEditable}
          secureTextEntry={actualSecureTextEntry}
          onFocus={() => {
            if (state === 'Default') {
              setIsFocused(true);
            }
            textInputProps.onFocus?.();
          }}
          onBlur={() => {
            if (state === 'Default') {
              setIsFocused(false);
            }
            textInputProps.onBlur?.();
          }}
          {...textInputProps}
        />
        {showPasswordEye && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIconContainer}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={24} color={iconColor} strokeWidth={2} />
            ) : (
              <Eye size={24} color={iconColor} strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
        {showStatusIcon && (
          <View style={styles.statusIconContainer}>
            {actualState === 'Error' && (
              <XCircle size={20} color={errorColor} strokeWidth={2} />
            )}
            {actualState === 'Success' && (
              <CheckCircle2 size={20} color={successColor} strokeWidth={2} />
            )}
          </View>
        )}
      </View>
      {shouldShowMessage && (
        <Text style={[styles.message, { color: getMessageColor() }]}>
          {displayMessage}
        </Text>
      )}
      {errorMessage && (actualState === 'Error' || status === 'error') && !showMessage && (
        <Text style={[styles.errorMessage, { color: errorColor }]}>{errorMessage}</Text>
      )}
      {successMessage && (actualState === 'Success' || status === 'success') && !showMessage && (
        <Text style={styles.successMessage}>{successMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: spacing.sm, // 8px
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  required: {
    color: colors.red[600],
  },
  container: {
    backgroundColor: colors.gray[50], // #F9FAFB
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14, // 14px conforme Figma
    paddingVertical: 0,
    borderRadius: borderRadius.md, // 8px
    width: '100%',
    borderWidth: 1,
    height: 52, // Altura fixa conforme Figma
    justifyContent: 'center',
  },
  containerFocus: {
    backgroundColor: colors.gray[50], // #F9FAFB
    borderColor: colors.primary, // #E61C61
  },
  containerDisabled: {
    backgroundColor: colors.disabled, // #c5c5c5
    opacity: 0.4,
  },
  containerError: {
    backgroundColor: colors.gray[50], // #F9FAFB (não muda no Error)
  },
  containerSuccess: {
    backgroundColor: colors.gray[50], // #F9FAFB
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.black,
    padding: 0,
    margin: 0,
    lineHeight: 18, // Conforme Figma
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputDisabled: {
    color: colors.mutedForeground,
  },
  message: {
    fontSize: 12,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    marginTop: spacing.sm, // 8px gap conforme Figma
    lineHeight: 16,
  },
  errorMessage: {
    ...typography.xs,
    marginTop: spacing.xs, // 4px (fallback quando não usa showMessage)
  },
  successMessage: {
    ...typography.xs,
    color: colors.green[700],
    marginTop: spacing.xs, // 4px (fallback quando não usa showMessage)
  },
});
