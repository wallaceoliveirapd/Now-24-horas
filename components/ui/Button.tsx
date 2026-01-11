import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle, Animated, View, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, LucideIcon } from 'lucide-react-native';

// Figma design props
type ButtonSize = 'Default' | 'Medium' | 'Small';
type ButtonType = 'Filled' | 'Outline' | 'Ghost';
type ButtonTheme = 'White' | 'Primary';

// Legacy props for backward compatibility
type LegacyVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type LegacySize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  // New Figma design props
  showIconRight?: boolean;
  showIconLeft?: boolean;
  size?: ButtonSize | LegacySize;
  type?: ButtonType;
  theme?: ButtonTheme;
  // Legacy props for backward compatibility
  variant?: LegacyVariant;
  // Custom icon support
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  // Loading state
  loading?: boolean;
  // Custom text color
  textColor?: string;
  textStyle?: TextStyle;
}

export function Button({ 
  title, 
  // New props
  showIconRight = false,
  showIconLeft = false,
  size,
  type,
  theme,
  // Legacy props
  variant,
  // Custom icons
  iconLeft: IconLeft,
  iconRight: IconRight,
  style,
  onPress,
  disabled,
  loading = false,
  textColor,
  textStyle,
  ...props 
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  
  // Map legacy props to new props for backward compatibility
  const normalizedSize: ButtonSize = size === 'sm' ? 'Small' : 
                                     size === 'md' ? 'Medium' : 
                                     size === 'lg' ? 'Default' : 
                                     size || 'Default';
  
  const normalizedType: ButtonType = type || 
    (variant === 'outline' ? 'Outline' : 
     variant === 'ghost' ? 'Ghost' : 
     'Filled');
  
  const normalizedTheme: ButtonTheme = theme || 
    (variant === 'secondary' ? 'White' : 'Primary');

  const animatedStyle = {
    transform: [{ scale }],
  };
  
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scale, disabled]);
  
  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scale, disabled]);
  
  const handlePress = useCallback((event: any) => {
    if (disabled || loading) return;
    if (onPress) {
      onPress(event);
    }
  }, [onPress, disabled, loading]);

  // Icon sizes based on button size (from Figma)
  const iconSizes: Record<ButtonSize, number> = {
    Default: 15.042,
    Medium: 12.042,
    Small: 9.375,
  };

  // Padding styles based on size (from Figma)
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    Default: { padding: spacing.md }, // 16px all sides
    Medium: { paddingHorizontal: spacing.md, paddingVertical: 12 }, // 16px horizontal, 12px vertical
    Small: { paddingHorizontal: spacing.md, paddingVertical: 10 }, // 16px horizontal, 10px vertical
  };

  // Text sizes based on button size (from Figma)
  const textSizeStyles: Record<ButtonSize, TextStyle> = {
    Default: typography.base, // 16px
    Medium: typography.sm, // 14px
    Small: { fontSize: 12, lineHeight: 16, fontFamily: typography.sm.fontFamily }, // 12px
  };

  // Background and border styles based on type and theme
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10, // 10px gap between icon and text (from Figma)
    };

    if (normalizedType === 'Filled') {
      if (normalizedTheme === 'Primary') {
        return { ...baseStyle, backgroundColor: colors.primary };
      } else {
        return { ...baseStyle, backgroundColor: colors.white };
      }
    } else if (normalizedType === 'Outline') {
      if (normalizedTheme === 'Primary') {
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.primary 
        };
      } else {
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: colors.white 
        };
      }
    } else {
      // Ghost
      return { 
        ...baseStyle, 
        backgroundColor: 'transparent', 
        borderWidth: 0 
      };
    }
  };

  // Text color based on type and theme
  const getTextColor = (): string => {
    if (normalizedType === 'Filled') {
      return normalizedTheme === 'Primary' ? colors.white : colors.primary;
    } else if (normalizedType === 'Outline') {
      return normalizedTheme === 'Primary' ? colors.primary : colors.white;
    } else {
      // Ghost
      return normalizedTheme === 'Primary' ? colors.primary : colors.white;
    }
  };

  // Icon color based on text color
  const iconColor = getTextColor();

  // Botão está desabilitado se disabled ou loading
  const isDisabled = disabled || loading;

  const buttonStyle = combineStyles(
    styles.button,
    getButtonStyles(),
    sizeStyles[normalizedSize],
    isDisabled && styles.buttonDisabled,
    style
  );

  const finalTextStyle = combineStyles(
    styles.text,
    textSizeStyles[normalizedSize],
    { color: textColor || getTextColor() },
    isDisabled && styles.textDisabled,
    textStyle
  );

  const iconSize = iconSizes[normalizedSize];
  const LeftIcon = IconLeft || ChevronLeft;
  const RightIcon = IconRight || ChevronRight;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={buttonStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
        {...props}
      >
        {/* Spinner de loading no lado esquerdo */}
        {loading && (
          <View style={styles.iconContainer}>
            <ActivityIndicator 
              size="small" 
              color={iconColor}
            />
          </View>
        )}
        
        {/* Ícone esquerdo customizado (só mostra se não estiver loading) */}
        {!loading && (showIconLeft || IconLeft) && (
          <View style={styles.iconContainer}>
            <LeftIcon size={iconSize} color={iconColor} strokeWidth={2} />
          </View>
        )}
        
        <Text style={finalTextStyle}>
          {title}
        </Text>
        
        {/* Ícone direito */}
        {(showIconRight || IconRight) && (
          <View style={styles.iconContainer}>
            <RightIcon size={iconSize} color={iconColor} strokeWidth={2} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
