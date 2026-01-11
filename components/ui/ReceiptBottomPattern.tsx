import { View, StyleSheet, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface ReceiptBottomPatternProps {
  width?: number | string;
  height?: number;
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="12" viewBox="0 0 360 12" fill="none">
  <path d="M41.5371 12L27.6914 0L13.8457 12L0 0H55.3838L41.5371 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M96.9219 12L83.0762 0L69.2305 12L55.3838 0H110.769L96.9219 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M152.307 12L138.461 0L124.615 12L110.769 0H166.153L152.307 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M207.691 12L193.846 0L180 12L166.153 0H221.538L207.691 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M263.076 12L249.23 0L235.385 12L221.538 0H276.923L263.076 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M318.461 12L304.615 0L290.77 12L276.923 0H332.308L318.461 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M360.001 0L346.154 12L332.308 0H360.001Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
</svg>`;

export function ReceiptBottomPattern({ width = '100%', height = 12 }: ReceiptBottomPatternProps) {
  const containerStyle: ViewStyle = {
    width: typeof width === 'string' ? (width as any) : width,
    height: height || 12,
    overflow: 'hidden',
  };

  return (
    <View style={containerStyle}>
      <SvgXml xml={svgContent} width={width} height={height} />
    </View>
  );
}


