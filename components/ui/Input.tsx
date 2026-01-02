import { View, Text, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Search, CheckCircle2, XCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useState } from 'react';

interface InputProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
  label?: string;
  required?: boolean;
  status?: 'default' | 'error' | 'success';
  errorMessage?: string;
  successMessage?: string;
  state?: 'Default' | 'Focus' | 'Disabled';
  showSearchIcon?: boolean;
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
  state = 'Default',
  showSearchIcon = true,
  containerStyle,
  inputStyle,
  editable,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Determinar o estado real (se state for 'Focus' ou se o input estiver focado)
  const actualState = state === 'Disabled' ? 'Disabled' : (state === 'Focus' || isFocused ? 'Focus' : 'Default');
  
  // Se state for 'Disabled', forçar editable como false
  const isEditable = actualState === 'Disabled' ? false : (editable !== undefined ? editable : true);

  // Determinar cor da borda baseado no status
  const getBorderColor = () => {
    if (actualState === 'Disabled') return colors.disabled;
    if (status === 'error') return colors.red[600];
    if (status === 'success') return colors.green[700];
    if (actualState === 'Focus') return colors.primary;
    return colors.gray[500];
  };

  const containerStyles = combineStyles(
    styles.container,
    actualState === 'Focus' && status === 'default' && styles.containerFocus,
    actualState === 'Disabled' && styles.containerDisabled,
    status === 'error' && styles.containerError,
    status === 'success' && styles.containerSuccess,
    { borderColor: getBorderColor() },
    containerStyle
  );

  const inputStyles = combineStyles(
    styles.input,
    actualState === 'Focus' && styles.inputFocus,
    actualState === 'Disabled' && styles.inputDisabled,
    inputStyle
  );

  const iconColor = actualState === 'Disabled' ? colors.disabled : colors.black;
  const showStatusIcon = (status === 'error' || status === 'success') && !showSearchIcon;

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
        {showStatusIcon && (
          <View style={styles.statusIconContainer}>
            {status === 'error' && (
              <XCircle size={20} color={colors.red[600]} strokeWidth={2} />
            )}
            {status === 'success' && (
              <CheckCircle2 size={20} color={colors.green[700]} strokeWidth={2} />
            )}
          </View>
        )}
      </View>
      {errorMessage && status === 'error' && (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      )}
      {successMessage && status === 'success' && (
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
    marginBottom: spacing.xs, // 4px
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
  },
  required: {
    color: colors.red[600],
  },
  container: {
    backgroundColor: colors.gray[500], // #F9FAFB
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: 12,
    borderRadius: borderRadius.md, // 8px
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray[500], // Mesma cor do fundo para evitar jump no focus
    minHeight: 52, // Altura mínima consistente
  },
  containerFocus: {
    backgroundColor: colors.gray[500], // #F9FAFB
    borderColor: colors.primary, // #E61C61
  },
  containerDisabled: {
    backgroundColor: colors.disabled, // #c5c5c5
    opacity: 0.4,
  },
  containerError: {
    borderColor: colors.red[600],
  },
  containerSuccess: {
    borderColor: colors.green[700],
  },
  iconContainer: {
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
    fontSize: typography.base.fontSize,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.black,
    padding: 0,
    margin: 0,
    lineHeight: 20, // LineHeight menor para subir o placeholder
    textAlignVertical: 'center', // Alinha o texto verticalmente
    includeFontPadding: false, // Remove padding extra da fonte
  },
  inputFocus: {
    color: colors.black,
  },
  inputDisabled: {
    color: colors.mutedForeground,
  },
  errorMessage: {
    ...typography.xs,
    color: colors.red[600],
    marginTop: spacing.xs, // 4px
  },
  successMessage: {
    ...typography.xs,
    color: colors.green[700],
    marginTop: spacing.xs, // 4px
  },
});

