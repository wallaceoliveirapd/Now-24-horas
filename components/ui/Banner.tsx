import { View, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { TicketPercent } from 'lucide-react-native';

interface BannerProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconSource?: ImageSourcePropType;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function Banner({
  title = 'Economize mais!',
  description = 'Selecione um cupom para o seu pedido',
  icon,
  iconSource,
  backgroundColor = colors.primary,
  textColor = colors.white,
  style
}: BannerProps) {
  const containerStyle = combineStyles(
    styles.container,
    { backgroundColor },
    style
  );

  return (
    <View style={containerStyle}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {icon || (
          <TicketPercent 
            size={34} 
            color={textColor} 
            strokeWidth={2} 
          />
        )}
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text 
          style={[styles.title, { color: textColor }]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text 
          style={[styles.description, { color: textColor }]} 
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2, // 10px
    padding: spacing.lg, // 20px
    borderRadius: borderRadius.md,
    width: '100%',
  },
  iconContainer: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs, // 4px
    minWidth: 0,
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    lineHeight: 16,
    height: 16,
  },
  description: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    lineHeight: 16,
  },
});

