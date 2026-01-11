import { View, StyleSheet, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface ReceiptTopPatternProps {
  width?: number | string;
  height?: number;
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="12" viewBox="0 0 360 12" fill="none">
  <path d="M55.3838 12H0L13.8457 0L27.6914 11.999L41.5371 0L55.3838 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M110.769 12H55.3838L69.2305 0L83.0762 11.999L96.9219 0L110.769 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M166.153 12H110.769L124.615 0L138.461 11.999L152.307 0L166.153 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M221.538 12H166.153L180 0L193.846 11.999L207.691 0L221.538 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M276.923 12H221.538L235.385 0L249.23 11.999L263.076 0L276.923 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M332.308 12H276.923L290.77 0L304.615 11.999L318.461 0L332.308 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
  <path d="M360.001 12H332.308L346.154 0L360.001 12Z" fill="#FDF9CE" style="fill:#FDF9CE;fill:color(display-p3 0.9935 0.9750 0.8093);fill-opacity:1;"/>
</svg>`;

export function ReceiptTopPattern({ width = '100%', height = 12 }: ReceiptTopPatternProps) {
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


