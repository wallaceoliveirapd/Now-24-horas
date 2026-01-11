import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { Button, OtpInput, Toast } from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../lib/errorMessages';

type RootStackParamList = {
  Login: undefined;
  VerifyOtp: {
    emailOuTelefone: string;
  };
  Success: undefined;
  Home: undefined;
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function VerifyOtp() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'VerifyOtp'>>();
  const { verifyOtp, resendOtp } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // 60 segundos
  const [canResend, setCanResend] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const emailOuTelefone = route.params?.emailOuTelefone || '';
  // Formatar para exibição (se for telefone, aplicar máscara)
  const displayValue = emailOuTelefone.includes('@') 
    ? emailOuTelefone 
    : emailOuTelefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  // Timer para reenvio
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Animações de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Prevenir que o NavigationHandler redirecione enquanto estamos nesta tela
  useEffect(() => {
    console.log('📱 VerifyOtp: Tela montada, emailOuTelefone:', emailOuTelefone);
    // Esta tela deve permanecer ativa até que o usuário verifique o código ou volte manualmente
  }, [emailOuTelefone]);

  const handleValidateCode = async (codeToValidate?: string) => {
    // SEMPRE usar código passado como parâmetro (vem do onComplete)
    // Se não vier, usar estado (mas isso não deveria acontecer)
    const code = codeToValidate || otpCode;
    
    console.log('🔐 handleValidateCode chamado');
    console.log('   Código do estado:', otpCode);
    console.log('   Código passado:', codeToValidate);
    console.log('   Código a validar:', code);
    console.log('   Tamanho do código:', code.length);
    
    if (!code || code.length !== 4) {
      console.warn('   ⚠️ Código incompleto:', code);
      showToast('Por favor, informe o código completo de 4 dígitos');
      return;
    }

    console.log('   ✅ Código completo, iniciando validação...');
    setLoading(true);

    // Animação do botão
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // SEMPRE usar código passado como parâmetro (vem do onComplete)
      // O estado pode estar desatualizado devido a timing do React
      if (!codeToValidate) {
        console.error('   ❌ Erro: código não foi passado como parâmetro');
        showToast('Erro ao validar código. Tente novamente.');
        setLoading(false);
        return;
      }
      
      console.log('   📤 Enviando código para validação:', codeToValidate);
      await verifyOtp(emailOuTelefone, codeToValidate);
      
      // Navegar para Home após verificação bem-sucedida
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      setLoading(false);
      
      // Obter mensagem amigável
      const errorMessage = getErrorMessage(error);
      showToast(errorMessage);
      
      // Limpar código em caso de erro
      setOtpCode('');
    }
  };

  const handleResendCode = async () => {
    if (!canResend) {
      console.log('⚠️ Reenvio bloqueado: timer ainda ativo');
      return;
    }

    console.log('🔄 VerifyOtp: Iniciando reenvio de código');
    console.log('   EmailOuTelefone:', emailOuTelefone);

    try {
      setLoading(true);

      // Animação do botão
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Chamar API para reenviar código
      console.log('   Chamando resendOtp...');
      await resendOtp(emailOuTelefone);
      console.log('   ✅ resendOtp concluído');

      // Resetar timer
      setResendTimer(60);
      setCanResend(false);
      setOtpCode('');

      console.log('   ✅ Timer resetado, código limpo');
      showToast('Código reenviado com sucesso!');
    } catch (error: any) {
      console.error('❌ VerifyOtp: Erro ao reenviar código:', error);
      const errorMessage = getErrorMessage(error);
      setToastMessage(errorMessage);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <StatusBar 
        style="light"
        backgroundColor={colors.primary}
        translucent={false}
      />
      <SafeAreaView 
        style={styles.safeArea}
        edges={['top', 'bottom']}
      >
        <View style={styles.container}>
          {/* Header com botão voltar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Se veio da Home (usuário autenticado), voltar para Home
              // Se veio do Login/SignUp, voltar normalmente
              const canGoBack = navigation.canGoBack();
              if (canGoBack) {
                navigation.goBack();
              } else {
                // Se não pode voltar, navegar para Home (caso esteja autenticado)
                navigation.navigate('Home');
              }
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={32} color={colors.white} strokeWidth={2} />
          </TouchableOpacity>

          {/* Conteúdo */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Título */}
            <Text style={styles.title}>
              Informe o código de 4 dígitos
            </Text>

            {/* Descrição */}
            <Text style={styles.description}>
              Enviamos um código de confirmação para{' '}
              <Text style={styles.phoneNumber}>{displayValue}</Text>
            </Text>

            {/* OTP Input */}
            <Animated.View 
              style={[
                styles.otpContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <OtpInput
                length={4}
                theme="Dark"
                value={otpCode}
                onChangeText={(text) => {
                  console.log('📝 OtpInput onChangeText:', text);
                  setOtpCode(text);
                }}
                onComplete={(text) => {
                  console.log('✅ OtpInput onComplete chamado com:', text);
                  // IMPORTANTE: Passar o código diretamente para handleValidateCode
                  // Não depender do estado que pode estar desatualizado
                  handleValidateCode(text);
                }}
                autoFocus={true}
              />
            </Animated.View>

            {/* Botões */}
            <View style={styles.buttonsContainer}>
              {/* Botão Validar código */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title={loading ? 'Validando...' : 'Validar código'}
                    type="Filled"
                    theme="White"
                    size="Default"
                    onPress={handleValidateCode}
                    disabled={loading || otpCode.length !== 4}
                    loading={loading}
                    style={[
                      styles.validateButton,
                      (loading || otpCode.length !== 4) && styles.buttonDisabled,
                    ]}
                  />
                  {loading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator 
                        size="small" 
                        color={colors.primary}
                      />
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Botão Reenviar */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={!canResend}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.resendText,
                  !canResend && styles.resendTextDisabled
                ]}>
                  {canResend 
                    ? 'Não recebeu? Reenviar' 
                    : `Não recebeu? Reenviar em ${formatTimer(resendTimer)}`
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Toast de erro */}
        <Toast
          message={toastMessage}
          type="error"
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    padding: 64,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 64,
    left: 64,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    gap: spacing.lg,
  },
  title: {
    ...typography['2xl'],
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 40,
  },
  description: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.white,
    lineHeight: 20,
  },
  phoneNumber: {
    fontWeight: fontWeights.semibold,
  },
  otpContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  buttonsContainer: {
    gap: 8,
    marginTop: spacing.md,
  },
  buttonWrapper: {
    width: '100%',
    position: 'relative',
  },
  validateButton: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  resendText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  resendTextDisabled: {
    opacity: 0.7,
  },
});

