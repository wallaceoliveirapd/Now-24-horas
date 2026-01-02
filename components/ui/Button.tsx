import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useRef, useCallback } from 'react';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'md',
  style,
  onPress,
  ...props 
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  
  const animatedStyle = {
    transform: [{ scale }],
  };
  
  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scale]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scale]);
  
  const handlePress = useCallback((event: any) => {
    if (onPress) {
      onPress(event);
    }
  }, [onPress]);
  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline: { 
      backgroundColor: 'transparent', 
      borderWidth: 1, 
      borderColor: colors.primary 
    },
    ghost: { 
      backgroundColor: 'transparent', 
      borderWidth: 0 
    },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: spacing.sm * 1.5, paddingVertical: spacing.sm },
    md: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm * 1.5 },
    lg: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  };

  const textVariantStyles: Record<string, TextStyle> = {
    primary: { color: colors.white },
    secondary: { color: colors.black },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
  };

  const textSizeStyles: Record<string, TextStyle> = {
    sm: typography.sm,
    md: typography.base,
    lg: typography.base,
  };

  const buttonStyle = combineStyles(
    styles.button,
    variantStyles[variant],
    sizeStyles[size],
    style
  );

  const textStyle = combineStyles(
    styles.text,
    textVariantStyles[variant],
    textSizeStyles[size]
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={buttonStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        {...props}
      >
        <Text style={textStyle}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
});
