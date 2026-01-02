import { View, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { colors, combineStyles } from '../../src/lib/styles';
import { useState, useRef, useEffect, useMemo } from 'react';

interface SwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({
  value = false,
  onValueChange,
  disabled = false,
  style
}: SwitchProps) {
  const [isActive, setIsActive] = useState(value);
  const thumbPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const disabledThumbPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsActive(value);
    // Quando disabled, sempre manter thumb à esquerda (0)
    const targetValue = disabled ? 0 : (value ? 1 : 0);
    Animated.spring(thumbPosition, {
      toValue: targetValue,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [value, disabled, thumbPosition]);

  const handlePress = () => {
    if (disabled) return;
    
    const newValue = !isActive;
    setIsActive(newValue);
    onValueChange?.(newValue);
    
    Animated.spring(thumbPosition, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const containerStyle = combineStyles(
    styles.container,
    disabled 
      ? styles.containerDisabled 
      : (isActive ? styles.containerActive : styles.containerInactive),
    style
  );

  // Calcular posição do thumb (track width - thumb size - padding * 2)
  // Quando disabled, thumb sempre à esquerda (0) - usar valor direto
  // Quando enabled, usar interpolação do thumbPosition
  const thumbTranslateX = useMemo(() => {
    if (disabled) {
      return disabledThumbPosition; // Sempre 0 quando disabled
    }
    return thumbPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 13], // 32 (track width) - 15 (thumb size) - 2*2 (padding)
    });
  }, [disabled, thumbPosition, disabledThumbPosition]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={containerStyle}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 19,
    borderRadius: 999, // Fully rounded
    justifyContent: 'center',
    padding: 2,
    position: 'relative',
  },
  containerActive: {
    backgroundColor: colors.primary, // #E61C61
  },
  containerInactive: {
    backgroundColor: '#e6e7eb', // Gray from design
  },
  containerDisabled: {
    backgroundColor: '#ced0d6', // Darker gray for disabled state
  },
  thumb: {
    width: 15,
    height: 15,
    borderRadius: 7.5, // Circular
    backgroundColor: colors.white,
    position: 'absolute',
    left: 2,
  },
});

