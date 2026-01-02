import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ReceiptTopPatternProps {
  width?: number | string;
  height?: number;
}

export function ReceiptTopPattern({ width = '100%', height = 12 }: ReceiptTopPatternProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width="100%" height={height} viewBox="0 0 360 12" fill="none">
        <Path d="M13.8457 0L0 12H27.6924L13.8457 0Z" fill="#FEFCEA" />
        <Path d="M41.5381 0L27.6924 12H55.3848L41.5381 0Z" fill="#FEFCEA" />
        <Path d="M69.2305 0L55.3848 12H83.0771L69.2305 0Z" fill="#FEFCEA" />
        <Path d="M96.9229 0L83.0771 12H110.77L96.9229 0Z" fill="#FEFCEA" />
        <Path d="M124.615 0L110.77 12H138.462L124.615 0Z" fill="#FEFCEA" />
        <Path d="M152.308 0L138.462 12H166.154L152.308 0Z" fill="#FEFCEA" />
        <Path d="M207.691 0L193.846 12L180 0L166.154 12H221.538L207.691 0Z" fill="#FEFCEA" />
        <Path d="M235.384 0L221.538 12H249.23L235.384 0Z" fill="#FEFCEA" />
        <Path d="M263.076 0L249.23 12H276.923L263.076 0Z" fill="#FEFCEA" />
        <Path d="M290.769 0L276.923 12H304.615L290.769 0Z" fill="#FEFCEA" />
        <Path d="M318.461 0L304.615 12H332.308L318.461 0Z" fill="#FEFCEA" />
        <Path d="M360 12L346.153 0L332.308 12H360Z" fill="#FEFCEA" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

