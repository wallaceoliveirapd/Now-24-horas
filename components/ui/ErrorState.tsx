import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights } from '../../src/lib/styles';
import { Button } from './Button';
import { 
  WifiOff, 
  AlertCircle, 
  Server, 
  Lock, 
  FileX, 
  CreditCard, 
  Package, 
  Search,
  Receipt,
  AlertTriangle,
  Clock,
  XCircle
} from 'lucide-react-native';

export type ErrorType = 
  | 'network'
  | 'server'
  | 'auth'
  | 'validation'
  | 'not_found'
  | 'payment'
  | 'product'
  | 'search'
  | 'orders'
  | 'generic'
  | 'rate_limit';

export interface ErrorStateProps {
  /** Tipo de erro para usar ícone e estilo padrão */
  type?: ErrorType;
  /** Ícone customizado (opcional, sobrescreve o ícone do tipo) */
  icon?: LucideIcon;
  /** Título do erro */
  title: string;
  /** Descrição/texto secundário */
  description?: string;
  /** Texto do botão de retry (padrão: "Tentar novamente") */
  retryLabel?: string;
  /** Callback quando o botão de retry é pressionado */
  onRetry?: () => void;
  /** Texto do botão de ação secundária */
  actionLabel?: string;
  /** Callback quando o botão de ação é pressionado */
  onAction?: () => void;
  /** Estilos customizados */
  style?: ViewStyle;
  /** Tamanho do ícone */
  iconSize?: number;
}

const defaultIcons: Record<ErrorType, LucideIcon> = {
  network: WifiOff,
  server: Server,
  auth: Lock,
  validation: AlertCircle,
  not_found: FileX,
  payment: CreditCard,
  product: Package,
  search: Search,
  orders: Receipt,
  generic: AlertTriangle,
  rate_limit: Clock,
};

const defaultColors: Record<ErrorType, string> = {
  network: colors.mutedForeground,
  server: colors.mutedForeground,
  auth: colors.primary,
  validation: colors.red[600],
  not_found: colors.mutedForeground,
  payment: colors.red[600],
  product: colors.mutedForeground,
  search: colors.mutedForeground,
  orders: colors.mutedForeground,
  generic: colors.orange[500],
  rate_limit: colors.mutedForeground,
};

export function ErrorState({
  type = 'generic',
  icon,
  title,
  description,
  retryLabel = 'Tentar novamente',
  onRetry,
  actionLabel,
  onAction,
  style,
  iconSize = 64,
}: ErrorStateProps) {
  const IconComponent = icon || defaultIcons[type];
  const iconColor = defaultColors[type];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { opacity: 0.6 }]}>
        <IconComponent 
          size={iconSize} 
          color={iconColor} 
          strokeWidth={1.5}
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {(onRetry || onAction) && (
        <View style={styles.actionsContainer}>
          {onRetry && (
            <Button
              title={retryLabel}
              variant="primary"
              size="md"
              onPress={onRetry}
              style={styles.button}
            />
          )}
          {onAction && actionLabel && (
            <Button
              title={actionLabel}
              variant="ghost"
              size="md"
              onPress={onAction}
              style={styles.button}
            />
          )}
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
  },
  title: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.black,
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
  actionsContainer: {
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 280,
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});

