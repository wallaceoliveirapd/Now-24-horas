import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, borderRadius, combineStyles } from '../../src/lib/styles';
import { Button } from './Button';
import { X } from 'lucide-react-native';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryButtonLabel?: string;
  primaryButtonOnPress?: () => void;
  primaryButtonVariant?: 'primary' | 'error';
  primaryButtonDisabled?: boolean;
  primaryButtonLoading?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonOnPress?: () => void;
  secondaryButtonVariant?: 'ghost' | 'outline';
  showCloseButton?: boolean;
  style?: ViewStyle;
}

export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  primaryButtonLabel,
  primaryButtonOnPress,
  primaryButtonVariant = 'primary',
  primaryButtonDisabled = false,
  primaryButtonLoading = false,
  secondaryButtonLabel,
  secondaryButtonOnPress,
  secondaryButtonVariant = 'ghost',
  showCloseButton = true,
  style,
}: DialogProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, style]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={20} color={colors.mutedForeground} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Content */}
          {children && (
            <View style={styles.content}>{children}</View>
          )}

          {/* Actions */}
          {(primaryButtonLabel || secondaryButtonLabel) && (
            <View style={styles.actions}>
              {secondaryButtonLabel && (
                <Button
                  title={secondaryButtonLabel}
                  variant={secondaryButtonVariant}
                  size="lg"
                  onPress={secondaryButtonOnPress || onClose}
                  style={styles.secondaryButton}
                />
              )}
              {primaryButtonLabel && (
                <Button
                  title={primaryButtonLabel}
                  variant="primary"
                  size="lg"
                  onPress={primaryButtonOnPress}
                  disabled={primaryButtonDisabled}
                  loading={primaryButtonLoading}
                  style={[
                    styles.primaryButton,
                    primaryButtonVariant === 'error' && { backgroundColor: colors.red[600] || '#dc2626' }
                  ]}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl || 16,
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    margin: -spacing.xs,
  },
  description: {
    ...typography.base,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
});

