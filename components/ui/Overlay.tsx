import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, combineStyles } from '../../src/lib/styles';

interface OverlayProps {
  visible?: boolean;
  onPress?: () => void;
  blurIntensity?: number;
  backgroundColor?: string;
  opacity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Overlay({
  visible = true,
  onPress,
  blurIntensity = 12,
  backgroundColor = 'rgba(0, 0, 0, 0.3)',
  opacity = 1,
  style,
  children
}: OverlayProps) {
  if (!visible) return null;

  const containerStyle = combineStyles(
    styles.container,
    { opacity },
    style
  );

  const content = (
    <BlurView
      intensity={blurIntensity}
      tint="dark"
      style={[styles.blurView, { backgroundColor }]}
    >
      {children}
    </BlurView>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={containerStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  blurView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

