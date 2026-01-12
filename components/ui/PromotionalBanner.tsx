import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { ChevronRight } from 'lucide-react-native';

interface PromotionalBannerProps {
  title?: string;
  description?: string;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
}

export function PromotionalBanner({
  title = 'Cupons para você',
  description = 'Economiza utilizando os cupons disponíveis',
  imageSource,
  onPress,
  style
}: PromotionalBannerProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  // Usar a imagem padrão do cupom se não fornecida
  const couponImage = imageSource || require('../../src/front/images/home/icon-cupon.png');

  const content = (
    <View style={styles.content}>
      {/* Coupon Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={couponImage}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>

      {/* Chevron Icon */}
      <View style={styles.chevronContainer}>
        <ChevronRight size={24} color={colors.mutedForeground} strokeWidth={2} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
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
    backgroundColor: colors.gray[50], // muted background
    borderRadius: borderRadius.xl, // 24px
    paddingHorizontal: spacing.md, // 16px (ajustado de 24px conforme padrão do projeto)
    paddingVertical: spacing.md, // 16px
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 16px
  },
  iconContainer: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: typography.lg.fontSize, // 18px
    lineHeight: typography.lg.lineHeight,
    fontFamily: typography.lg.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  description: {
    fontSize: typography.sm.fontSize, // 14px
    lineHeight: typography.sm.lineHeight * 1.3, // Ajustado para 1.3 conforme design
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
