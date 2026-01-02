import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ReceiptBottomPatternProps {
  width?: number | string;
  height?: number;
}

export function ReceiptBottomPattern({ width = '100%', height = 12 }: ReceiptBottomPatternProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width="100%" height={height} viewBox="0 0 360 12" fill="none">
        <Path d="M13.8457 12L0 0H27.6924L13.8457 12Z" fill="#FEFCEA" />
        <Path d="M41.5381 12L27.6924 0H55.3848L41.5381 12Z" fill="#FEFCEA" />
        <Path d="M69.2305 12L55.3848 0H83.0771L69.2305 12Z" fill="#FEFCEA" />
        <Path d="M96.9229 12L83.0771 0H110.77L96.9229 12Z" fill="#FEFCEA" />
        <Path d="M124.615 12L110.77 0H138.462L124.615 12Z" fill="#FEFCEA" />
        <Path d="M152.308 12L138.462 0H166.154L152.308 12Z" fill="#FEFCEA" />
        <Path d="M207.691 12L193.846 0L180 12L166.154 0H221.538L207.691 12Z" fill="#FEFCEA" />
        <Path d="M235.384 12L221.538 0H249.23L235.384 12Z" fill="#FEFCEA" />
        <Path d="M263.076 12L249.23 0H276.923L263.076 12Z" fill="#FEFCEA" />
        <Path d="M290.769 12L276.923 0H304.615L290.769 12Z" fill="#FEFCEA" />
        <Path d="M318.461 12L304.615 0H332.308L318.461 12Z" fill="#FEFCEA" />
        <Path d="M360 0L346.153 12L332.308 0H360Z" fill="#FEFCEA" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

