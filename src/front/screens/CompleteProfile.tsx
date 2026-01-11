import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { Button, Input, Toast } from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { maskCPF, maskPhone, validateCPF, validatePhone } from '../../lib/utils';
import { getErrorMessage } from '../../lib/errorMessages';
import { apiClient } from '../../services/api/client';

type RootStackParamList = {
  CompleteProfile: undefined;
  Home: undefined;
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CompleteProfile() {
  const navigation = useNavigation<NavigationProp>();
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ cpf?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ cpf: boolean; phone: boolean }>({
    cpf: false,
    phone: false,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  const handleChangeCPF = (text: string) => {
    const masked = maskCPF(text);
    setCpf(masked);
    if (touched.cpf) {
      if (!validateCPF(masked)) {
        setErrors({ ...errors, cpf: 'CPF inválido' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.cpf;
        setErrors(newErrors);
      }
    }
  };

  const handleChangePhone = (text: string) => {
    const masked = maskPhone(text);
    setPhone(masked);
    if (touched.phone) {
      if (!validatePhone(masked)) {
        setErrors({ ...errors, phone: 'Telefone inválido' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.phone;
        setErrors(newErrors);
      }
    }
  };

  const handleBlur = (field: 'cpf' | 'phone') => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'cpf' && cpf) {
      if (!validateCPF(cpf)) {
        setErrors({ ...errors, cpf: 'CPF inválido' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.cpf;
        setErrors(newErrors);
      }
    }
    
    if (field === 'phone' && phone) {
      if (!validatePhone(phone)) {
        setErrors({ ...errors, phone: 'Telefone inválido' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.phone;
        setErrors(newErrors);
      }
    }
  };

  const handleCompleteProfile = async () => {
    // Marcar campos como tocados
    setTouched({ cpf: true, phone: true });

    // Validar campos
    const newErrors: typeof errors = {};
    if (!cpf || !validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!phone || !validatePhone(phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<{ usuario: any }>(
        '/api/users/complete-profile',
        {
          cpf,
          telefone: phone,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao completar perfil');
      }

      // Navegar para Home após completar perfil
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setToastMessage(errorMessage);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  const getInputStatus = (field: 'cpf' | 'phone'): 'default' | 'error' | 'success' => {
    if (!touched[field]) return 'default';
    if (errors[field]) return 'error';
    if (field === 'cpf' && cpf && validateCPF(cpf)) return 'success';
    if (field === 'phone' && phone && validatePhone(phone)) return 'success';
    return 'default';
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <ChevronLeft size={32} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

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
                Complete seu perfil
              </Text>

              {/* Descrição */}
              <Text style={styles.description}>
                Para continuar, precisamos de algumas informações adicionais
              </Text>

              {/* Form */}
              <View style={styles.formContainer}>
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

                {/* Botão Completar */}
                <Button
                  title={loading ? "Completando..." : "Completar perfil"}
                  variant="primary"
                  size="lg"
                  onPress={handleCompleteProfile}
                  style={styles.completeButton}
                  disabled={loading || !cpf || !phone || !!errors.cpf || !!errors.phone}
                  loading={loading}
                />
              </View>
            </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Toast */}
      {toastVisible && (
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type="error"
          onClose={() => setToastVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.black,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.base,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  label: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
  },
  completeButton: {
    marginTop: spacing.md,
  },
});

