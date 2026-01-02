import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, combineStyles } from '../../src/lib/styles';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  width?: number | string;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function Separator({ 
  orientation = 'horizontal',
  width,
  height,
  color,
  style
}: SeparatorProps) {
  const separatorStyle = combineStyles(
    styles.separator,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    width && { width: typeof width === 'string' ? width : width },
    height && { height },
    color && { backgroundColor: color },
    style
  );

  return <View style={separatorStyle} />;
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: colors.gray[200],
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});

