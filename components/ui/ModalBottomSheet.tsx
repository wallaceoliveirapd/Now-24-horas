import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Modal, Animated, PanResponder, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { Button } from './Button';
import { Overlay } from './Overlay';
import { ReactNode, useRef, useEffect } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.9; // 90vh
const DRAG_THRESHOLD = 50; // Distância mínima para fechar ao arrastar

interface ModalBottomSheetProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  primaryButtonLabel?: string;
  primaryButtonOnPress?: () => void;
  secondaryButtonLabel?: string;
  secondaryButtonOnPress?: () => void;
  showPrimaryButton?: boolean;
  showSecondaryButton?: boolean;
  style?: ViewStyle;
}

export function ModalBottomSheet({
  visible,
  onClose,
  title = 'Title',
  description = 'Description',
  children,
  primaryButtonLabel = 'Finalizar pedido',
  primaryButtonOnPress,
  secondaryButtonLabel = 'Finalizar pedido',
  secondaryButtonOnPress,
  showPrimaryButton = true,
  showSecondaryButton = false,
  style
}: ModalBottomSheetProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só responder se o movimento for principalmente vertical e para baixo
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        translateY.setOffset((translateY as any)._value);
      },
      onPanResponderMove: (_, gestureState) => {
        // Só permite arrastar para baixo (valores positivos)
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        
        // Se arrastou mais que o threshold, fecha o modal
        if (gestureState.dy > DRAG_THRESHOLD) {
          handleClose();
        } else {
          // Volta para a posição original
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Resetar valores após animação completar
      translateY.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
      // Chamar onClose após resetar
      if (onClose) {
        onClose();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      // Inicia o modal fora da tela
      translateY.setValue(SCREEN_HEIGHT);
      overlayOpacity.setValue(0);
      
      // Anima o overlay com fade in
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Anima o modal subindo
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
    // Não resetar quando fecha - deixar o handleClose fazer isso
  }, [visible]);

  const containerStyle = combineStyles(
    styles.container,
    style
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalWrapper}>
        {/* Overlay com fade in/out */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View style={[styles.overlayAnimated, { opacity: overlayOpacity }]}>
            <Overlay
              visible={true}
              blurIntensity={2}
              backgroundColor="rgba(0, 0, 0, 0.3)"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Modal Container com animação de slide */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={containerStyle}>
            {/* Close Bar - Área arrastável */}
            <View
              style={styles.closeBarContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.closeBar} />
            </View>

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {description && (
                <Text style={styles.description} numberOfLines={1}>
                  {description}
                </Text>
              )}
            </View>

            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              {/* Content Section */}
              <ScrollView
                style={styles.contentScrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
                {children || (
                  <Text style={styles.defaultContent} numberOfLines={1}>
                    swap content
                  </Text>
                )}
              </ScrollView>

              {/* Actions Section - Fixo dentro do KeyboardAvoidingView */}
              {(showPrimaryButton || showSecondaryButton) && (
                <View style={styles.actionsContainer}>
                  {showPrimaryButton && (
                    <Button
                      title={primaryButtonLabel}
                      variant="primary"
                      size="lg"
                      onPress={primaryButtonOnPress}
                      style={styles.actionButton}
                    />
                  )}
                  {showSecondaryButton && (
                    <Button
                      title={secondaryButtonLabel}
                      variant="outline"
                      size="lg"
                      onPress={secondaryButtonOnPress}
                      style={styles.actionButton}
                    />
                  )}
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
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
  overlayAnimated: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    maxHeight: MAX_MODAL_HEIGHT,
    minHeight: 400, // Altura mínima para garantir que o conteúdo apareça
    flexDirection: 'column',
  },
  closeBarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
    // Área maior para facilitar o arrasto
    minHeight: 44,
  },
  closeBar: {
    width: 100,
    height: 5,
    backgroundColor: '#d9d9d9',
    borderRadius: 99,
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 4,
    paddingTop: 0, // 28px (aumentado para não cortar)
    paddingBottom: spacing.sm + 4, // 8px
    paddingHorizontal: spacing.lg, // 20px
  },
  title: {
    fontSize: 18,
    lineHeight: 24, // Ajustado para ser maior que o fontSize
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  description: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    height: 12,
  },
  contentScrollView: {
    maxHeight: MAX_MODAL_HEIGHT - 300, // Altura máxima menos header, título e botão
  },
  contentContainer: {
    width: '100%',
    padding: spacing.lg, // 20px
    flexGrow: 1,
  },
  defaultContent: {
    fontSize: 18,
    lineHeight: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.md, // 16px
    paddingTop: 4,
    padding: spacing.lg, // 20px
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    width: '100%',
  },
  keyboardAvoidingView: {
    width: '100%',
    flexShrink: 1,
  },
});

