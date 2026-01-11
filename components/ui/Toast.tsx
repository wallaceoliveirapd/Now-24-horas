import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fontWeights, borderRadius, spacing } from '../../src/lib/styles';
import { useEffect, useRef } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export function Toast({ 
  message, 
  type = 'error', 
  visible, 
  onHide,
  duration = 3000 
}: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animações
      progressAnim.setValue(0);
      
      // Animar entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Animar barra de progresso
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto esconder após duração
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      progressAnim.setValue(0);
      onHide?.();
    });
  };

  const handleClose = () => {
    hideToast();
  };

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: '#ffffff',
          iconBg: colors.green[700], // #449200
          progressColor: colors.green[700],
          icon: CheckCircle2,
        };
      case 'info':
        return {
          iconColor: '#ffffff',
          iconBg: colors.blue[600], // #2563eb
          progressColor: colors.blue[600],
          icon: Info,
        };
      case 'warning':
        return {
          iconColor: '#ffffff',
          iconBg: colors.orange[500], // #f97316
          progressColor: colors.orange[500],
          icon: AlertCircle,
        };
      case 'error':
        return {
          iconColor: '#ffffff',
          iconBg: '#DC6E00', // Cor de erro customizada
          progressColor: '#DC6E00',
          icon: AlertCircle,
        };
      default:
        return {
          iconColor: '#ffffff',
          iconBg: '#DC6E00',
          progressColor: '#DC6E00',
          icon: AlertCircle,
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <SafeAreaView 
      style={styles.safeArea}
      edges={['top']}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Ícone circular colorido */}
        <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
          <IconComponent 
            size={20} 
            color={config.iconColor} 
            strokeWidth={type === 'success' ? 3 : 2.5}
            fill="none"
          />
        </View>

        {/* Mensagem */}
        <Text style={styles.message} numberOfLines={2}>{message}</Text>

        {/* Botão fechar */}
        <TouchableOpacity 
          onPress={handleClose}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X size={18} color={colors.gray[600]} strokeWidth={2} />
        </TouchableOpacity>

        {/* Barra de progresso animada */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: config.progressColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  message: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    flex: 1,
    marginRight: spacing.sm,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.gray[200],
  },
  progressBar: {
    height: '100%',
  },
});
