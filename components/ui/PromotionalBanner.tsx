import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

interface PromotionalBannerProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  imageSource?: ImageSourcePropType;
  onButtonPress?: () => void;
  style?: ViewStyle;
}

export function PromotionalBanner({
  title = 'Mercado 24 horas em João Pessoa',
  description = 'Tudo que você precisa tem no Now.',
  buttonLabel = 'Faça seu pedido',
  imageSource,
  onButtonPress,
  style
}: PromotionalBannerProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  // Usar a imagem padrão se não fornecida
  const bannerImage = imageSource || require('../../src/front/images/banners-home/default.png');

  return (
    <View style={containerStyle}>
      <Image
        source={bannerImage}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 398 / 224, // 398x224 conforme especificação
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

