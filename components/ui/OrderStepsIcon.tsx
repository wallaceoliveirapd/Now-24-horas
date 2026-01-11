import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Check, Box, Bike, Smile } from 'lucide-react-native';
import { colors } from '../../src/lib/styles';

export type OrderStep = 'Confirmação' | 'Preparação' | 'Entrega' | 'Entregue';
export type OrderStepState = 'Default' | 'Current' | 'Complete' | 'Error';

interface OrderStepsIconProps {
  step?: OrderStep;
  state?: OrderStepState;
  showConnector?: boolean;
  style?: ViewStyle;
}

export function OrderStepsIcon({
  step = 'Confirmação',
  state = 'Default',
  showConnector = true,
  style,
}: OrderStepsIconProps) {
  // Animação de pulso para status Current
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (state === 'Current' && state !== 'Error') {
      // Animação de pulso suave do ícone (escala)
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );

      // Animação do anel pulsante ao redor
      const ringAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScaleAnim, {
              toValue: 1.5,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacityAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ringScaleAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacityAnim, {
              toValue: 0.4,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulseAnimation.start();
      ringAnimation.start();

      return () => {
        pulseAnimation.stop();
        ringAnimation.stop();
      };
    } else {
      // Resetar animações quando não for Current
      scaleAnim.setValue(1);
      pulseAnim.setValue(1);
      ringScaleAnim.setValue(1);
      ringOpacityAnim.setValue(0);
    }
  }, [state, scaleAnim, pulseAnim, ringScaleAnim, ringOpacityAnim]);

  // Determinar cor de fundo baseado no estado
  const getBackgroundColor = () => {
    if (state === 'Complete') return colors.green[700];
    if (state === 'Current') return colors.primary;
    if (state === 'Error') return colors.red[600] || '#dc2626';
    return colors.gray[200]; // #e6e7eb
  };

  // Determinar cor do ícone
  const getIconColor = () => {
    if (state === 'Default') return colors.mutedForeground;
    return colors.white;
  };

  // Determinar cor do conector
  const getConnectorColor = () => {
    if (state === 'Complete') return colors.green[700];
    if (state === 'Current') return colors.primary;
    if (state === 'Error') return colors.red[600] || '#dc2626';
    return colors.gray[200];
  };

  // Renderizar ícone baseado no step
  const renderIcon = () => {
    const iconColor = getIconColor();
    const iconSize = 20;

    switch (step) {
      case 'Confirmação':
        return <Check size={iconSize} color={iconColor} strokeWidth={2} />;
      case 'Preparação':
        return <Box size={iconSize} color={iconColor} strokeWidth={2} />;
      case 'Entrega':
        return <Bike size={iconSize} color={iconColor} strokeWidth={2} />;
      case 'Entregue':
        return <Smile size={iconSize} color={iconColor} strokeWidth={2} />;
      default:
        return <Check size={iconSize} color={iconColor} strokeWidth={2} />;
    }
  };

  // Renderizar conector vertical
  const renderConnector = () => {
    if (!showConnector) return null;

    const connectorColor = getConnectorColor();
    const connectorWidth = 2;
    const connectorHeight = 26;

    return (
      <View style={styles.connectorContainer}>
        <View style={[styles.connector, { backgroundColor: connectorColor, width: connectorWidth, height: connectorHeight }]} />
      </View>
    );
  };

  const iconAnimatedStyle = state === 'Current' ? {
    transform: [{ scale: scaleAnim }],
  } : {};

  const ringAnimatedStyle = state === 'Current' ? {
    transform: [{ scale: ringScaleAnim }],
    opacity: ringOpacityAnim,
  } : {};

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      {/* Anel pulsante (só aparece quando Current) */}
      {state === 'Current' && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: getBackgroundColor(),
            },
            ringAnimatedStyle,
          ]}
        />
      )}
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        {renderIcon()}
      </Animated.View>
      {renderConnector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connectorContainer: {
    position: 'absolute',
    left: 17, // (36 - 2) / 2 = 17
    top: 36,
    width: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
  },
});

