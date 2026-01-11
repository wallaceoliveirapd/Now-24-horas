import { View, Text, StyleSheet, Platform, Image, ImageSourcePropType, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, Input, Toast, GoogleIcon, AppleIcon, FacebookIcon } from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { maskPhone, validateEmail, validatePhone } from '../../lib/utils';
import { getErrorMessage } from '../../lib/errorMessages';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Imagem placeholder - em produção, usar a imagem real do design
const loginImage: ImageSourcePropType = require('../images/login.png');

export function Login() {
  const { login, loginWithGoogle, loginWithApple, loginWithFacebook } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [inputTouched, setInputTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Função para detectar se é telefone ou email
  const detectInputType = (value: string): 'email' | 'phone' | 'unknown' => {
    const trimmed = value.trim();
    if (!trimmed) return 'unknown';
    
    // Remove caracteres de máscara para análise
    const numbersOnly = trimmed.replace(/\D/g, '');
    const hasAtSymbol = trimmed.includes('@');
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    
    // Se tem @, definitivamente é email
    if (hasAtSymbol) return 'email';
    
    // Se tem letras (sem @), pode ser email incompleto
    if (hasLetters) return 'email';
    
    // Se começa com número ou parêntese, é telefone
    if (/^[\d\(]/.test(trimmed)) {
      return 'phone';
    }
    
    // Se tem apenas números e caracteres de máscara de telefone
    if (/^[\d\(\)\s-]+$/.test(trimmed) && numbersOnly.length > 0) {
      return 'phone';
    }
    
    return 'unknown';
  };

  // Função para validar o input
  const validateInput = (value: string): string | undefined => {
    if (!value.trim()) {
      return undefined; // Não mostrar erro se estiver vazio
    }

    const type = detectInputType(value);
    const numbersOnly = value.replace(/\D/g, '');
    
    if (type === 'phone') {
      if (numbersOnly.length < 10) {
        return 'Telefone incompleto. Digite pelo menos 10 dígitos.';
      }
      if (numbersOnly.length > 11) {
        return 'Telefone inválido. Use no máximo 11 dígitos.';
      }
      if (!validatePhone(value)) {
        return 'Telefone inválido. Use o formato (99) 99999-9999.';
      }
      return undefined; // Válido
    } else if (type === 'email') {
      // Se tem @ mas não está completo
      if (value.includes('@') && !value.includes('.')) {
        return 'Email incompleto. Digite um email válido (ex: seu@email.com).';
      }
      if (value.includes('@') && value.split('@')[1] && !value.split('@')[1].includes('.')) {
        return 'Email inválido. Digite um email válido (ex: seu@email.com).';
      }
      if (!validateEmail(value)) {
        return 'Email inválido. Digite um email válido (ex: seu@email.com).';
      }
      return undefined; // Válido
    } else {
      // Tipo desconhecido - dar feedback baseado no que foi digitado
      if (numbersOnly.length >= 2 && numbersOnly.length < 10) {
        return 'Telefone incompleto. Digite pelo menos 10 dígitos.';
      }
      if (numbersOnly.length >= 10 && numbersOnly.length <= 11) {
        // Parece telefone mas não passou na validação
        return 'Telefone inválido. Use o formato (99) 99999-9999.';
      }
      if (value.includes('@')) {
        return 'Email inválido. Digite um email válido (ex: seu@email.com).';
      }
      if (/[a-zA-Z]/.test(value)) {
        return 'Email inválido. Digite um email válido (ex: seu@email.com).';
      }
      // Se tem apenas números mas menos de 2, ainda pode ser telefone
      if (numbersOnly.length > 0 && numbersOnly.length < 2) {
        return undefined; // Ainda digitando, não mostrar erro
      }
      return 'Digite um telefone válido (99) 99999-9999 ou um email válido.';
    }
  };

  // Handler para mudança do input - apenas atualiza o valor, sem aplicar máscara
  const handleEmailOrPhoneChange = (value: string) => {
    // Apenas atualiza o valor, sem aplicar máscara ou detectar tipo
    // A máscara só será aplicada no onBlur
    setEmailOrPhone(value);
    
    // Limpar erro enquanto está digitando (só validar no blur)
    if (inputTouched) {
      setInputError(undefined);
    }
  };

  // Handler para blur (quando sai do campo) - aqui detecta tipo e aplica máscara
  const handleInputBlur = () => {
    setInputTouched(true);
    
    if (!emailOrPhone.trim()) {
      setInputError(undefined);
      setInputType('unknown');
      return;
    }
    
    // Detectar tipo baseado no valor completo
    const type = detectInputType(emailOrPhone);
    setInputType(type);
    
    let finalValue = emailOrPhone;
    
    // Se for telefone, aplicar máscara
    if (type === 'phone') {
      finalValue = maskPhone(emailOrPhone);
      setEmailOrPhone(finalValue);
    }
    
    // Validar o valor final
    const error = validateInput(finalValue);
    setInputError(error);
  };

  // Determinar keyboardType baseado no tipo detectado
  // Se ainda não detectou (unknown), usar default para permitir ambos
  const getKeyboardType = (): 'email-address' | 'phone-pad' | 'default' => {
    // Se já detectou o tipo, usar o teclado apropriado
    if (inputType === 'phone') return 'phone-pad';
    if (inputType === 'email' || emailOrPhone.includes('@')) return 'email-address';
    // Se ainda não detectou, usar default para permitir ambos
    return 'default';
  };

  // Determinar status do input
  const getInputStatus = (): 'default' | 'error' | 'success' => {
    if (!inputTouched || !emailOrPhone.trim()) return 'default';
    if (inputError) return 'error';
    return 'success';
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  const handleLogin = async () => {
    // Validar antes de fazer login
    setInputTouched(true);
    const error = validateInput(emailOrPhone);
    if (error) {
      setInputError(error);
      return;
    }

    if (!emailOrPhone.trim() || !password.trim()) {
      showToast('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setInputError(undefined);
    setPasswordError(undefined);
    
    try {
      // Preparar emailOuTelefone (remover máscara se for telefone)
      const emailOuTelefoneValue = inputType === 'phone' 
        ? emailOrPhone.replace(/\D/g, '') 
        : emailOrPhone.trim();

      await login(emailOuTelefoneValue, password);
      
      // Sempre navegar para Home após login bem-sucedido
      // O modal na Home vai aparecer se o usuário precisar verificar OTP
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      // Obter mensagem amigável
      const errorMessage = getErrorMessage(error);
      
      // Mostrar toast com erro
      showToast(errorMessage);
      
      // Se erro é de credenciais, mostrar nos inputs também
      if (error?.code === 'INVALID_CREDENTIALS' || error?.code === 'USER_NOT_FOUND') {
        setInputError('Email ou telefone incorreto');
        setPasswordError('Senha incorreta');
        setInputTouched(true);
        setPasswordTouched(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    return async () => {
      try {
        setLoading(true);
        
        let result: { precisaCompletarPerfil?: boolean } | void;
        
        switch (provider) {
          case 'google':
            result = await loginWithGoogle();
            break;
          case 'apple':
            result = await loginWithApple();
            break;
          case 'facebook':
            result = await loginWithFacebook();
            break;
        }

        // Se precisa completar perfil, redirecionar para tela de completar perfil
        if (result && 'precisaCompletarPerfil' in result && result.precisaCompletarPerfil) {
          navigation.navigate('CompleteProfile');
          setLoading(false);
          return;
        }

        // Navegar para Home após login bem-sucedido
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error: any) {
        console.error(`Erro ao fazer login com ${provider}:`, error);
        
        // Obter mensagem amigável
        const errorMessage = getErrorMessage(error);
        
        // Mostrar toast com erro
        showToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <>
      <StatusBar 
        style="light"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        {/* Imagem de fundo abaixo da status bar */}
        <View style={styles.imageWrapper}>
          <Image 
            source={loginImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientOverlay}
          />
        </View>

        {/* Card branco com formulário */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
            <View style={styles.card}>
              {/* Título */}
              <Text style={styles.title}>
                Mercado 24 horas por dia? É o Now!
              </Text>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Input Telefone ou e-mail */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Telefone ou e-mail</Text>
                  <Input
                    placeholder="Informe seu telefone ou e-mail"
                    value={emailOrPhone}
                    onChangeText={handleEmailOrPhoneChange}
                    onBlur={handleInputBlur}
                    keyboardType={getKeyboardType()}
                    autoCapitalize="none"
                    autoComplete="email"
                    status={getInputStatus()}
                    errorMessage={inputError}
                    showSearchIcon={false}
                    editable={!loading}
                  />
                </View>

                {/* Input Senha */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Senha</Text>
                  <Input
                    placeholder="Informe sua senha"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      // Limpar erro quando começar a digitar
                      if (passwordError) {
                        setPasswordError(undefined);
                      }
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    status={passwordTouched && passwordError ? 'error' : passwordTouched && password ? 'success' : 'default'}
                    errorMessage={passwordError}
                    showSearchIcon={false}
                    showPasswordEye={true}
                    editable={!loading}
                  />
                </View>

                {/* Botão Entrar */}
                <Button
                  title={loading ? "Entrando..." : "Entrar"}
                  variant="primary"
                  size="lg"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  disabled={loading || !emailOrPhone.trim() || !password.trim() || !!inputError}
                  loading={loading}
                />

                {/* Botão Criar uma conta */}
                <Button
                  title="Criar uma conta"
                  variant="ghost"
                  size="lg"
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.createAccountButton}
                />
              </View>

              {/* Separador e Social Login */}
              <View style={styles.socialContainer}>
                {/* Separador com texto */}
                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>Ou entre com:</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* Ícones de login social */}
                <View style={styles.socialIconsContainer}>
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialLogin('google')}
                    disabled={loading}
                  >
                    <GoogleIcon size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialLogin('apple')}
                    disabled={loading}
                  >
                    <AppleIcon size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialLogin('facebook')}
                    disabled={loading}
                  >
                    <FacebookIcon size={24} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </ScrollView>
      </View>
      
      {/* Toast de erro */}
      <Toast
        message={toastMessage}
        type="error"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%', // Aproximadamente metade da tela
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: '50%', // Espaço para a imagem
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 30,
    gap: spacing.lg,
    marginTop: -30, // Overlap com a imagem
  },
  title: {
    ...typography['3xl'],
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 40,
  },
  formContainer: {
    gap: 10,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  loginButton: {
    width: '100%',
  },
  createAccountButton: {
    width: '100%',
  },
  socialContainer: {
    gap: 14,
    marginTop: spacing.md,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  separatorText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
