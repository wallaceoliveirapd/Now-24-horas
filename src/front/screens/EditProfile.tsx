import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { PageTitle, Input, Button } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { Camera } from 'lucide-react-native';
import { maskCPF, maskPhone, validateEmail, validateCPF, validatePhone, validateFullName } from '../../lib/utils';

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
  Help: undefined;
  EditProfile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function EditProfile() {
  const navigation = useNavigation<NavigationProp>();
  
  // Dados mockados - em produção viriam de um contexto/state management
  const [formData, setFormData] = useState({
    fullName: 'Nome do usuário',
    email: 'example@email.com',
    phone: '(99) 99999-9999',
    cpf: '999.999.999-99',
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    phone?: boolean;
    cpf?: boolean;
  }>({});

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permissões necessárias',
          'Precisamos de permissão para acessar a câmera e a galeria para alterar sua foto de perfil.'
        );
        return false;
      }
    }
    return true;
  };

  const handleChangePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Alterar foto',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível abrir a câmera');
            }
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível abrir a galeria');
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangeFullName = (value: string) => {
    setFormData({ ...formData, fullName: value });
    if (touched.fullName) {
      const validation = validateFullName(value);
      if (!validation.valid) {
        setErrors({ ...errors, fullName: 'Digite seu nome completo (nome e sobrenome)' });
      } else {
        setErrors({ ...errors, fullName: undefined });
      }
    }
  };

  const handleChangeEmail = (value: string) => {
    setFormData({ ...formData, email: value });
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
    setFormData({ ...formData, phone: masked });
    if (touched.phone) {
      if (!validatePhone(masked)) {
        setErrors({ ...errors, phone: 'Digite um telefone válido' });
      } else {
        setErrors({ ...errors, phone: undefined });
      }
    }
  };

  const handleChangeCPF = (value: string) => {
    const masked = maskCPF(value);
    setFormData({ ...formData, cpf: masked });
    if (touched.cpf) {
      if (!validateCPF(masked)) {
        setErrors({ ...errors, cpf: 'Digite um CPF válido' });
      } else {
        setErrors({ ...errors, cpf: undefined });
      }
    }
  };

  const handleBlur = (field: 'fullName' | 'email' | 'phone' | 'cpf') => {
    setTouched({ ...touched, [field]: true });
    
    let error: string | undefined;
    switch (field) {
      case 'fullName':
        const nameValidation = validateFullName(formData.fullName);
        if (!nameValidation.valid) {
          error = 'Digite seu nome completo (nome e sobrenome)';
        }
        break;
      case 'email':
        if (!validateEmail(formData.email)) {
          error = 'Digite um email válido';
        }
        break;
      case 'phone':
        if (!validatePhone(formData.phone)) {
          error = 'Digite um telefone válido';
        }
        break;
      case 'cpf':
        if (!validateCPF(formData.cpf)) {
          error = 'Digite um CPF válido';
        }
        break;
    }
    
    setErrors({ ...errors, [field]: error });
  };

  const handleSave = () => {
    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      cpf: true,
    });

    // Validate all fields
    const nameValidation = validateFullName(formData.fullName);
    const emailValid = validateEmail(formData.email);
    const phoneValid = validatePhone(formData.phone);
    const cpfValid = validateCPF(formData.cpf);

    const newErrors: typeof errors = {};
    if (!nameValidation.valid) {
      newErrors.fullName = 'Digite seu nome completo (nome e sobrenome)';
    }
    if (!emailValid) {
      newErrors.email = 'Digite um email válido';
    }
    if (!phoneValid) {
      newErrors.phone = 'Digite um telefone válido';
    }
    if (!cpfValid) {
      newErrors.cpf = 'Digite um CPF válido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Salvar dados no backend
      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
      navigation.goBack();
    }
  };

  const getInputStatus = (field: 'fullName' | 'email' | 'phone' | 'cpf'): 'default' | 'error' | 'success' => {
    if (!touched[field]) return 'default';
    if (errors[field]) return 'error';
    return 'default';
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
            title="Editar Perfil"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Photo Section */}
            <View style={styles.photoSection}>
              <View style={styles.photoContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder} />
                )}
                <View style={styles.cameraIconContainer}>
                  <Camera size={14} color={colors.white} strokeWidth={2} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleChangePhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.changePhotoText}>Alterar foto</Text>
              </TouchableOpacity>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dados pessoais</Text>
              </View>

              <View style={styles.inputsContainer}>
                {/* Nome completo */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Nome completo</Text>
                  <Input
                    placeholder="Nome do usuário"
                    value={formData.fullName}
                    onChangeText={handleChangeFullName}
                    onBlur={() => handleBlur('fullName')}
                    showSearchIcon={false}
                    status={getInputStatus('fullName')}
                    errorMessage={errors.fullName}
                  />
                </View>

                {/* Email */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>E-mail</Text>
                  <Input
                    placeholder="example@email.com"
                    value={formData.email}
                    onChangeText={handleChangeEmail}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    showSearchIcon={false}
                    status={getInputStatus('email')}
                    errorMessage={errors.email}
                  />
                </View>

                {/* Telefone */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Telefone</Text>
                  <Input
                    placeholder="(99) 99999-9999"
                    value={formData.phone}
                    onChangeText={handleChangePhone}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                    showSearchIcon={false}
                    status={getInputStatus('phone')}
                    errorMessage={errors.phone}
                  />
                </View>

                {/* CPF */}
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>CPF</Text>
                  <Input
                    placeholder="999.999.999-99"
                    value={formData.cpf}
                    onChangeText={handleChangeCPF}
                    onBlur={() => handleBlur('cpf')}
                    keyboardType="numeric"
                    showSearchIcon={false}
                    status={getInputStatus('cpf')}
                    errorMessage={errors.cpf}
                  />
                </View>

                {/* Save Button */}
                <Button
                  title="Salvar dados"
                  variant="primary"
                  size="lg"
                  onPress={handleSave}
                  style={styles.saveButton}
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
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  photoSection: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  photoContainer: {
    position: 'relative',
    width: 78,
    height: 78,
  },
  profileImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  profileImagePlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.gray[50],
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    padding: spacing.md,
  },
  changePhotoText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  formSection: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24,
  },
  inputsContainer: {
    gap: spacing.md,
  },
  inputField: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  saveButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
});

