import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../src/lib/styles';
import { Button } from './Button';
import { Overlay } from './Overlay';
import { 
  WifiOff, 
  AlertCircle, 
  Server, 
  Lock, 
  CreditCard,
  AlertTriangle,
  X
} from 'lucide-react-native';
import { ErrorType } from './ErrorState';

export interface ErrorModalProps {
  /** Se o modal está visível */
  visible: boolean;
  /** Tipo de erro para usar ícone padrão */
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
  /** Texto do botão secundário */
  secondaryLabel?: string;
  /** Callback quando o botão secundário é pressionado */
  onSecondary?: () => void;
  /** Callback quando o modal é fechado */
  onClose?: () => void;
  /** Se permite fechar tocando no overlay */
  dismissible?: boolean;
}

const defaultIcons: Partial<Record<ErrorType, LucideIcon>> = {
  network: WifiOff,
  server: Server,
  auth: Lock,
  payment: CreditCard,
  generic: AlertTriangle,
};

const defaultIconColors: Partial<Record<ErrorType, string>> = {
  network: colors.mutedForeground,
  server: colors.mutedForeground,
  auth: colors.primary,
  payment: colors.red[600],
  generic: colors.orange[500],
};

export function ErrorModal({
  visible,
  type = 'generic',
  icon,
  title,
  description,
  retryLabel = 'Tentar novamente',
  onRetry,
  secondaryLabel,
  onSecondary,
  onClose,
  dismissible = true,
}: ErrorModalProps) {
  const IconComponent = icon || defaultIcons[type] || AlertCircle;
  const iconColor = defaultIconColors[type] || colors.mutedForeground;

  const handleOverlayPress = () => {
    if (dismissible && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalWrapper}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleOverlayPress}
          disabled={!dismissible}
        >
          <Overlay
            visible={true}
            blurIntensity={2}
            backgroundColor="rgba(0, 0, 0, 0.5)"
          />
        </TouchableOpacity>

        <View style={styles.modalContainer}>
          <View style={styles.content}>
            {/* Close Button */}
            {dismissible && onClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}

            {/* Icon */}
            <View style={styles.iconContainer}>
              <IconComponent 
                size={64} 
                color={iconColor} 
                strokeWidth={1.5}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Description */}
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {onRetry && (
                <Button
                  title={retryLabel}
                  variant="primary"
                  size="lg"
                  onPress={onRetry}
                  style={styles.button}
                />
              )}
              {onSecondary && secondaryLabel && (
                <Button
                  title={secondaryLabel}
                  variant="outline"
                  size="lg"
                  onPress={onSecondary}
                  style={styles.button}
                />
              )}
              {!onRetry && !onSecondary && onClose && (
                <Button
                  title="Fechar"
                  variant="primary"
                  size="lg"
                  onPress={onClose}
                  style={styles.button}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  title: {
    ...typography.xl,
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
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});

