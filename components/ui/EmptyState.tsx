import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../src/lib/styles';
import { Button } from './Button';
import { Package, Search, Heart, ShoppingCart, Receipt } from 'lucide-react-native';

export interface EmptyStateProps {
  /** Ícone a ser exibido (opcional, padrão baseado no tipo) */
  icon?: LucideIcon;
  /** Tipo de empty state para usar ícone padrão */
  type?: 'search' | 'favorites' | 'cart' | 'orders' | 'generic';
  /** Título principal */
  title: string;
  /** Descrição/texto secundário */
  description?: string;
  /** Texto do botão de ação (opcional) */
  actionLabel?: string;
  /** Callback quando o botão é pressionado */
  onActionPress?: () => void;
  /** Estilos customizados */
  style?: ViewStyle;
  /** Tamanho do ícone */
  iconSize?: number;
}

const defaultIcons: Record<string, LucideIcon> = {
  search: Search,
  favorites: Heart,
  cart: ShoppingCart,
  orders: Receipt,
  generic: Package,
};

export function EmptyState({
  icon,
  type = 'generic',
  title,
  description,
  actionLabel,
  onActionPress,
  style,
  iconSize = 64,
}: EmptyStateProps) {
  const IconComponent = icon || defaultIcons[type];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <IconComponent 
          size={iconSize} 
          color={colors.mutedForeground} 
          strokeWidth={1.5}
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {actionLabel && onActionPress && (
        <View style={styles.actionContainer}>
          <Button
            title={actionLabel}
            variant="primary"
            size="md"
            onPress={onActionPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.base,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
});

