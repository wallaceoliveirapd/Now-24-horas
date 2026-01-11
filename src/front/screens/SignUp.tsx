import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { Button, Input, Toast, GoogleIcon, AppleIcon, FacebookIcon } from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { maskCPF, maskPhone, validateEmail, validateCPF, validatePhone, validateFullName, validatePassword } from '../../lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../lib/errorMessages';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  VerifyOtp: {
    emailOuTelefone: string;
  };
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SignUp() {
  const navigation = useNavigation<NavigationProp>();
  const { register, loginWithGoogle, loginWithApple, loginWithFacebook } = useAuth();
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const headerRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Estados de erro
  const [errors, setErrors] = useState<{
    fullName?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  // Estados de touched (se o campo foi focado)
  const [touched, setTouched] = useState<{
    fullName: boolean;
    cpf: boolean;
    email: boolean;
    phone: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    fullName: false,
    cpf: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  
  // Handlers com máscaras e validações
  const handleChangeFullName = (value: string) => {
    setFullName(value);
    if (touched.fullName) {
      const validation = validateFullName(value);
      if (!validation.valid) {
        setErrors({ ...errors, fullName: 'Digite seu nome completo (nome e sobrenome)' });
      } else {
        setErrors({ ...errors, fullName: undefined });
      }
    }
  };
  
  const handleChangeCPF = (value: string) => {
    const masked = maskCPF(value);
    setCpf(masked);
    if (touched.cpf) {
      if (!validateCPF(masked)) {
        setErrors({ ...errors, cpf: 'Digite um CPF válido' });
      } else {
        setErrors({ ...errors, cpf: undefined });
      }
    }
  };
  
  const handleChangeEmail = (value: string) => {
    setEmail(value);
    if (touched.email) {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: 'Digite um email válido' });
      } else {
        setErrors({ ...errors, email: undefined });
      }
    }
  };
  
  const handleChangePhone = (value: string) => {
    const masked = maskPhone(value);
    setPhone(masked);
    if (touched.phone) {
      if (!validatePhone(masked)) {
        setErrors({ ...errors, phone: 'Digite um telefone válido' });
      } else {
        setErrors({ ...errors, phone: undefined });
      }
    }
  };
  
  const handleChangePassword = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const validation = validatePassword(value);
      if (!validation.valid) {
        setErrors({ ...errors, password: validation.message });
      } else {
        setErrors({ ...errors, password: undefined });
      }
    }
    // Validar confirmação também se já foi preenchida
    if (touched.confirmPassword && confirmPassword) {
      if (value !== confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'As senhas não coincidem' });
      } else {
        setErrors({ ...errors, confirmPassword: undefined });
      }
    }
  };
  
  const handleChangeConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      if (value !== password) {
        setErrors({ ...errors, confirmPassword: 'As senhas não coincidem' });
      } else {
        setErrors({ ...errors, confirmPassword: undefined });
      }
    }
  };
  
  const handleBlur = (field: 'fullName' | 'cpf' | 'email' | 'phone' | 'password' | 'confirmPassword') => {
    setTouched({ ...touched, [field]: true });
    
    let error: string | undefined;
    switch (field) {
      case 'fullName':
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.valid) {
          error = 'Digite seu nome completo (nome e sobrenome)';
        }
        break;
      case 'cpf':
        if (!validateCPF(cpf)) {
          error = 'Digite um CPF válido';
        }
        break;
      case 'email':
        if (!validateEmail(email)) {
          error = 'Digite um email válido';
        }
        break;
      case 'phone':
        if (!validatePhone(phone)) {
          error = 'Digite um telefone válido';
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          error = passwordValidation.message;
        }
        break;
      case 'confirmPassword':
        if (confirmPassword !== password) {
          error = 'As senhas não coincidem';
        }
        break;
    }
    
    setErrors({ ...errors, [field]: error });
  };
  
  const getInputStatus = (field: 'fullName' | 'cpf' | 'email' | 'phone' | 'password' | 'confirmPassword'): 'default' | 'error' | 'success' => {
    if (!touched[field]) return 'default';
    return errors[field] ? 'error' : 'success';
  };
  
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const headerVisible = scrollY < headerHeight - 50; // 50px de margem
    setIsHeaderVisible(headerVisible);
  };

  const handleHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const handleSignUp = async () => {
    // Marcar todos os campos como touched
    setTouched({
      fullName: true,
      cpf: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    
    // Validar todos os campos
    const nameValidation = validateFullName(fullName);
    const cpfValid = validateCPF(cpf);
    const emailValid = validateEmail(email);
    const phoneValid = validatePhone(phone);
    const passwordValidation = validatePassword(password);
    const passwordsMatch = password === confirmPassword;
    
    const newErrors: typeof errors = {};
    
    if (!nameValidation.valid) {
      newErrors.fullName = 'Digite seu nome completo (nome e sobrenome)';
    }
    if (!cpfValid) {
      newErrors.cpf = 'Digite um CPF válido';
    }
    if (!emailValid) {
      newErrors.email = 'Digite um email válido';
    }
    if (!phoneValid) {
      newErrors.phone = 'Digite um telefone válido';
    }
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }
    if (!passwordsMatch) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    
    // Se houver erros, não prosseguir
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Preparar dados para registro
      // O backend espera os dados formatados (o validador remove a formatação internamente)
      const phoneClean = phone.replace(/\D/g, ''); // Para usar na navegação
      const cpfClean = cpf.replace(/\D/g, ''); // Para usar se necessário
      
      // Preparar objeto de registro
      const registerData: {
        nomeCompleto: string;
        email: string;
        telefone: string;
        senha: string;
        cpf?: string;
      } = {
        nomeCompleto: fullName.trim(),
        email: email.trim(),
        telefone: phone, // Enviar formatado: (XX) XXXXX-XXXX
        senha: password,
      };
      
      // Adicionar CPF apenas se preenchido e válido
      if (cpf && cpf.trim().length > 0) {
        registerData.cpf = cpf; // Enviar formatado: XXX.XXX.XXX-XX
      }
      
      // Debug: log dos dados que serão enviados
      console.log('Dados de registro:', {
        nomeCompleto: registerData.nomeCompleto,
        email: registerData.email,
        telefone: registerData.telefone,
        senha: '***',
        cpf: registerData.cpf || 'não informado',
      });
      
      await register(registerData);
      
      // Após cadastro bem-sucedido, navegar para tela de OTP
      // Usar email ou telefone (sem máscara) para verificação
      const emailOuTelefone = email.trim() || phoneClean;
      navigation.navigate('VerifyOtp', { emailOuTelefone });
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      
      // Tratar erros de validação do backend
      if (error?.code === 'VALIDATION_ERROR' && error?.details?.errors) {
        const validationErrors: typeof errors = {};
        let toastMessage = 'Verifique os campos abaixo:';
        
        // Mapear erros de validação para os campos do formulário
        error.details.errors.forEach((err: { field: string; message: string }) => {
          const fieldMap: Record<string, keyof typeof errors> = {
            'nomeCompleto': 'fullName',
            'email': 'email',
            'telefone': 'phone',
            'cpf': 'cpf',
            'senha': 'password',
            'confirmPassword': 'confirmPassword',
          };
          
          const field = fieldMap[err.field];
          if (field) {
            validationErrors[field] = err.message;
          }
        });
        
        setErrors({ ...errors, ...validationErrors });
        setToastMessage(toastMessage);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
        return;
      }
      
      // Obter mensagem amigável
      const errorMessage = getErrorMessage(error);
      
      // Mostrar toast com erro
      setToastMessage(errorMessage);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      
      // Se erro é de email/telefone já existente, mostrar no campo específico
      if (error?.code === 'EMAIL_ALREADY_EXISTS' || error?.code === 'USER_ALREADY_EXISTS') {
        setErrors({ ...errors, email: 'Este email já está cadastrado' });
      } else if (error?.code === 'PHONE_ALREADY_EXISTS') {
        setErrors({ ...errors, phone: 'Este telefone já está cadastrado' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (provider: 'google' | 'apple' | 'facebook') => {
    return async () => {
      try {
        setLoading(true);
        
        let result: { precisaCompletarPerfil?: boolean } | void;
        
        // O backend já cria automaticamente se o usuário não existir
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

        // Navegar para Home após cadastro/login bem-sucedido
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error: any) {
        console.error(`Erro ao fazer cadastro com ${provider}:`, error);
        
        // Obter mensagem amigável
        const errorMessage = getErrorMessage(error);
        
        // Mostrar toast com erro
        setToastMessage(errorMessage);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <>
      <StatusBar 
        style={isHeaderVisible ? "light" : "dark"}
        backgroundColor={isHeaderVisible ? colors.primary : colors.white}
        translucent={false}
      />
      <SafeAreaView 
        style={[styles.safeArea, { backgroundColor: isHeaderVisible ? colors.primary : colors.white }]} 
        edges={['top']}
      >
        <View style={[styles.container, { backgroundColor: isHeaderVisible ? colors.primary : colors.white }]}>
          <ScrollView
            ref={scrollViewRef}
            style={[styles.scrollView, { backgroundColor: isHeaderVisible ? colors.primary : colors.white }]}
            contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.white }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
              {/* Header rosa - dentro do scroll */}
              <View 
                ref={headerRef}
                onLayout={handleHeaderLayout}
                style={styles.header}
              >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <ChevronLeft size={32} color={colors.white} strokeWidth={2} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>
                  Comece sua jornada no Now 24 horas
                </Text>
                <Text style={styles.headerSubtitle}>
                  Crie sua conta e aproveite!
                </Text>
              </View>
            </View>

            {/* Card branco com formulário - com overlap */}
            <View style={styles.cardWrapper}>
              <View style={styles.card}>
              {/* Form */}
              <View style={styles.formContainer}>
                {/* Input Nome completo */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome completo</Text>
                  <Input
                    placeholder="Informe seu nome completo"
                    value={fullName}
                    onChangeText={handleChangeFullName}
                    onBlur={() => handleBlur('fullName')}
                    autoCapitalize="words"
                    state={getInputStatus('fullName') === 'error' ? 'Error' : getInputStatus('fullName') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    errorMessage={errors.fullName}
                    editable={!loading}
                  />
                </View>

                {/* Input CPF */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>CPF</Text>
                  <Input
                    placeholder="999.999.999-99"
                    value={cpf}
                    onChangeText={handleChangeCPF}
                    onBlur={() => handleBlur('cpf')}
                    keyboardType="numeric"
                    maxLength={14}
                    state={getInputStatus('cpf') === 'error' ? 'Error' : getInputStatus('cpf') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    errorMessage={errors.cpf}
                    editable={!loading}
                  />
                </View>

                {/* Input E-mail */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>E-mail</Text>
                  <Input
                    placeholder="Informe seu e-mail"
                    value={email}
                    onChangeText={handleChangeEmail}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    state={getInputStatus('email') === 'error' ? 'Error' : getInputStatus('email') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    errorMessage={errors.email}
                    editable={!loading}
                  />
                </View>

                {/* Input Telefone */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Telefone</Text>
                  <Input
                    placeholder="(99) 99999-9999"
                    value={phone}
                    onChangeText={handleChangePhone}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                    maxLength={15}
                    state={getInputStatus('phone') === 'error' ? 'Error' : getInputStatus('phone') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    errorMessage={errors.phone}
                    editable={!loading}
                  />
                </View>

                {/* Input Senha */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Senha</Text>
                  <Input
                    placeholder="Informe sua senha"
                    value={password}
                    onChangeText={handleChangePassword}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    state={getInputStatus('password') === 'error' ? 'Error' : getInputStatus('password') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    showPasswordEye={true}
                    errorMessage={errors.password}
                    editable={!loading}
                  />
                </View>

                {/* Input Confirme sua senha */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirme sua senha</Text>
                  <Input
                    placeholder="Informe sua senha"
                    value={confirmPassword}
                    onChangeText={handleChangeConfirmPassword}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    state={getInputStatus('confirmPassword') === 'error' ? 'Error' : getInputStatus('confirmPassword') === 'success' ? 'Success' : 'Default'}
                    showSearchIcon={false}
                    showPasswordEye={true}
                    errorMessage={errors.confirmPassword}
                    editable={!loading}
                  />
                </View>

                {/* Botão Cadastrar */}
                <Button
                  title={loading ? "Cadastrando..." : "Cadastrar"}
                  variant="primary"
                  size="lg"
                  onPress={handleSignUp}
                  style={styles.signUpButton}
                  disabled={loading}
                  loading={loading}
                />

                {/* Botão Já tenha uma conta */}
                <Button
                  title="Já tenha uma conta"
                  variant="ghost"
                  size="lg"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginButton}
                />
              </View>

              {/* Separador e Social Sign Up */}
              <View style={styles.socialContainer}>
                {/* Separador com texto */}
                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>Ou cadastre-se com:</Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* Ícones de cadastro social */}
                <View style={styles.socialIconsContainer}>
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialSignUp('google')}
                    disabled={loading}
                  >
                    <GoogleIcon size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialSignUp('apple')}
                    disabled={loading}
                  >
                    <AppleIcon size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    activeOpacity={0.7}
                    onPress={handleSocialSignUp('facebook')}
                    disabled={loading}
                  >
                    <FacebookIcon size={24} />
                  </TouchableOpacity>
                </View>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary, // #E61C61
    padding: spacing.xl, // 40px
    paddingTop: spacing.md, // 16px (SafeAreaView já cuida do espaço da status bar)
    paddingBottom: spacing.xl, // 40px (sem o extra de 30px, o overlap será feito apenas pelo marginTop negativo do card)
    gap: spacing.md, // 14px gap conforme Figma
    minHeight: 266, // Altura mínima conforme Figma (h-[266px])
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerContent: {
    gap: spacing.md, // 14px gap conforme Figma
  },
  headerTitle: {
    ...typography['3xl'], // 32px conforme Figma
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 40,
  },
  headerSubtitle: {
    ...typography.sm, // 14px conforme Figma
    fontWeight: fontWeights.normal,
    color: colors.white,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30, // Padding bottom para não colar no final
    backgroundColor: colors.white, // Cor branca para o conteúdo
  },
  cardWrapper: {
    marginTop: -30, // Negative margin para overlap visual com o header (conforme Figma top-[236px] com header h-[266px])
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl, // 40px
    paddingBottom: 30,
    gap: spacing.lg,
  },
  formContainer: {
    gap: 10, // 10px gap entre inputs conforme Figma
  },
  inputContainer: {
    gap: spacing.sm, // 8px gap entre label e input conforme Figma
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  signUpButton: {
    width: '100%',
  },
  loginButton: {
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

