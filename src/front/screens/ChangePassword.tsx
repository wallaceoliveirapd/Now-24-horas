import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useMemo } from 'react';
import { PageTitle, Input, Button } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: undefined;
  Checkout: undefined;
  OrderConfirmation: {
    orderNumber: string;
    deliveryTime: string;
    totalPaid: number;
  };
  OrderDetails: {
    orderNumber: string;
    orderDate?: string;
    orderId?: string;
  };
  MyOrders: undefined;
  Profile: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Favorites: undefined;
  Settings: undefined;
  Languages: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  ChangePassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PasswordStrength = {
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
  feedback: string;
};

function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { strength: 'very_weak', score: 0, feedback: '' };
  }

  let score = 0;
  const feedbackMessages: string[] = [];

  // Length checks
  if (password.length < 8) {
    feedbackMessages.push('Mínimo de 8 caracteres');
  } else {
    score++;
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedbackMessages.push('Inclua letras minúsculas');
  }
  
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedbackMessages.push('Inclua letras maiúsculas');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedbackMessages.push('Inclua números');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedbackMessages.push('Inclua caracteres especiais');
  }

  // Determine strength
  let strength: PasswordStrength['strength'] = 'very_weak';
  if (score >= 5) {
    strength = 'very_strong';
  } else if (score >= 4) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  } else if (score >= 1) {
    strength = 'weak';
  }

  let feedback = '';
  if (password.length === 0) {
    feedback = '';
  } else if (score === 0) {
    feedback = 'Senha muito fraca';
  } else if (score === 1) {
    feedback = 'Senha fraca';
  } else if (score === 2) {
    feedback = 'Senha média';
  } else if (score === 3) {
    feedback = 'Senha forte';
  } else {
    feedback = 'Senha muito forte';
  }

  return { strength, score, feedback: feedbackMessages.length > 0 ? feedbackMessages.join(', ') : feedback };
}

export function ChangePassword() {
  const navigation = useNavigation<NavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    currentPassword?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});

  const passwordStrength = useMemo(() => calculatePasswordStrength(newPassword), [newPassword]);

  const validateCurrentPassword = (value: string): string | undefined => {
    if (!value) {
      return 'Senha atual é obrigatória';
    }
    return undefined;
  };

  const validateNewPassword = (value: string): string | undefined => {
    if (!value) {
      return 'Nova senha é obrigatória';
    }
    if (value.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (value === currentPassword) {
      return 'A nova senha deve ser diferente da senha atual';
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) {
      return 'Confirmação de senha é obrigatória';
    }
    if (value !== newPassword) {
      return 'As senhas não coincidem';
    }
    return undefined;
  };

  const handleBlur = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    let error: string | undefined;
    switch (field) {
      case 'currentPassword':
        error = validateCurrentPassword(currentPassword);
        break;
      case 'newPassword':
        error = validateNewPassword(newPassword);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(confirmPassword);
        break;
    }
    
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChangeCurrentPassword = (value: string) => {
    setCurrentPassword(value);
    if (touched.currentPassword) {
      const error = validateCurrentPassword(value);
      setErrors((prev) => ({ ...prev, currentPassword: error }));
    }
  };

  const handleChangeNewPassword = (value: string) => {
    setNewPassword(value);
    if (touched.newPassword) {
      const error = validateNewPassword(value);
      setErrors((prev) => ({ ...prev, newPassword: error }));
    }
    // Reset confirm password error when new password changes
    if (touched.confirmPassword && confirmPassword) {
      const error = validateConfirmPassword(confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const handleChangeConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value);
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const getInputStatus = (field: 'currentPassword' | 'newPassword' | 'confirmPassword'): 'default' | 'error' | 'success' => {
    if (!touched[field]) return 'default';
    if (errors[field]) return 'error';
    
    // For newPassword and confirmPassword, show success when valid
    if (field === 'newPassword' && newPassword && !errors.newPassword) {
      return 'success';
    }
    if (field === 'confirmPassword' && confirmPassword && !errors.confirmPassword) {
      return 'success';
    }
    
    return 'default';
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Validate all fields
    const currentError = validateCurrentPassword(currentPassword);
    const newError = validateNewPassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword);

    setErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError,
    });

    // If there are errors, don't submit
    if (currentError || newError || confirmError) {
      return;
    }

    // TODO: Implement actual password change API call
    Alert.alert(
      'Senha alterada',
      'Sua senha foi alterada com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };


  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor={colors.white}
        translucent={false}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.white }]}
        edges={['top']}
      >
        <View style={{ backgroundColor: colors.gray[50], flex: 1 }}>
          {/* Header */}
          <PageTitle
            title="Alterar senha"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Escolha uma senha forte e única para proteger sua conta
                </Text>
              </View>

              <View style={styles.inputsContainer}>
                {/* Senha atual */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Senha atual</Text>
                  <Input
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChangeText={handleChangeCurrentPassword}
                    onBlur={() => handleBlur('currentPassword')}
                    secureTextEntry
                    showSearchIcon={false}
                    showPasswordEye={true}
                    status={getInputStatus('currentPassword')}
                    errorMessage={errors.currentPassword}
                  />
                </View>

                {/* Nova senha */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Nova senha</Text>
                  <Input
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChangeText={handleChangeNewPassword}
                    onBlur={() => handleBlur('newPassword')}
                    secureTextEntry
                    showSearchIcon={false}
                    showPasswordEye={true}
                    status={getInputStatus('newPassword')}
                    errorMessage={errors.newPassword}
                  />
                  {/* Password strength feedback */}
                  {newPassword && touched.newPassword && passwordStrength.feedback && (
                    <Text style={[
                      styles.strengthFeedback,
                      errors.newPassword ? styles.strengthFeedbackError : styles.strengthFeedbackSuccess
                    ]}>
                      {passwordStrength.feedback}
                    </Text>
                  )}
                </View>

                {/* Confirmar nova senha */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Confirmar nova senha</Text>
                  <Input
                    placeholder="Digite novamente sua nova senha"
                    value={confirmPassword}
                    onChangeText={handleChangeConfirmPassword}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry
                    showSearchIcon={false}
                    showPasswordEye={true}
                    status={getInputStatus('confirmPassword')}
                    errorMessage={errors.confirmPassword}
                    successMessage={
                      touched.confirmPassword && !errors.confirmPassword && confirmPassword
                        ? 'Senhas coincidem'
                        : undefined
                    }
                  />
                </View>

                {/* Submit Button */}
                <Button
                  title="Alterar senha"
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
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
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  content: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm, // 8px
    paddingBottom: spacing.lg, // 20px
    paddingHorizontal: spacing.lg, // 20px
  },
  instructionContainer: {
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: 0,
  },
  instructionText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24,
  },
  inputsContainer: {
    gap: spacing.md, // 16px
  },
  inputField: {
    gap: spacing.sm, // 8px
  },
  inputLabel: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  strengthFeedback: {
    ...typography.xs,
    fontWeight: fontWeights.medium,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  strengthFeedbackSuccess: {
    color: colors.green[700],
  },
  strengthFeedbackError: {
    color: '#e68b1c', // Warning color
  },
  submitButton: {
    width: '100%',
  },
});

