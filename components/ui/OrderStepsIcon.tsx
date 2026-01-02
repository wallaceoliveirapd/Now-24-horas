import { View, StyleSheet, ViewStyle } from 'react-native';
import { Check, Box, Bike, Smile } from 'lucide-react-native';
import { colors } from '../../src/lib/styles';

export type OrderStep = 'Confirmação' | 'Preparação' | 'Entrega' | 'Entregue';
export type OrderStepState = 'Default' | 'Current' | 'Complete';

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
  // Determinar cor de fundo baseado no estado
  const getBackgroundColor = () => {
    if (state === 'Complete') return colors.green[700];
    if (state === 'Current') return colors.primary;
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

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
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
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

