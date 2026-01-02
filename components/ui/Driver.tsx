import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface DriverProps {
  label?: string;
  type?: 'Default' | 'Primary' | 'Secondary' | 'Green' | 'Info' | 'Black';
  style?: ViewStyle;
}

export function Driver({ 
  label = 'Label', 
  type = 'Default',
  style
}: DriverProps) {
  const typeStyles: Record<string, ViewStyle> = {
    Default: { backgroundColor: colors.gray[500] },
    Primary: { backgroundColor: colors.primary },
    Secondary: { backgroundColor: colors.secondary },
    Green: { backgroundColor: colors.green[700] },
    Info: { backgroundColor: colors.blue[650] },
    Black: { backgroundColor: colors.gray[800] },
  };

  const textStyles: Record<string, TextStyle> = {
    Default: { color: colors.black },
    Primary: { color: colors.white },
    Secondary: { color: colors.black },
    Green: { color: colors.white },
    Info: { color: colors.white },
    Black: { color: colors.white },
  };

  const driverStyle = combineStyles(
    styles.driver,
    typeStyles[type],
    style
  );

  const textStyle = combineStyles(
    styles.text,
    textStyles[type]
  );

  return (
    <View style={driverStyle}>
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  driver: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 0,
    height: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: 10, // Line height específico do design (10px)
  },
});

