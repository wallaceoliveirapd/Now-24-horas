import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageTitle } from '../../../components/ui';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';
import { Clock } from 'lucide-react-native';

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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PrivacyPolicy() {
  const navigation = useNavigation<NavigationProp>();

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
            title="Política de privacidade"
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
              {/* Update Date */}
              <View style={styles.updateDateContainer}>
                <Clock size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.updateDateText}>
                  Última atualização: 2 de janeiro de 2025
                </Text>
              </View>

              <Text style={styles.sectionTitle}>1. Informações que Coletamos</Text>
              <Text style={styles.paragraph}>
                Coletamos informações que você nos fornece diretamente, como nome, endereço de e-mail, número de telefone, endereço de entrega e informações de pagamento. Também coletamos informações automaticamente sobre seu dispositivo e como você usa nosso aplicativo.
              </Text>

              <Text style={styles.sectionTitle}>2. Como Usamos suas Informações</Text>
              <Text style={styles.paragraph}>
                Utilizamos suas informações para processar pedidos, fornecer suporte ao cliente, enviar comunicações sobre seus pedidos, melhorar nossos serviços e personalizar sua experiência. Também podemos usar suas informações para fins de marketing, sempre com seu consentimento.
              </Text>

              <Text style={styles.sectionTitle}>3. Compartilhamento de Informações</Text>
              <Text style={styles.paragraph}>
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações com prestadores de serviços que nos ajudam a operar nosso negócio, como empresas de entrega e processadores de pagamento, sempre sob contratos que protegem sua privacidade.
              </Text>

              <Text style={styles.sectionTitle}>4. Segurança dos Dados</Text>
              <Text style={styles.paragraph}>
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.
              </Text>

              <Text style={styles.sectionTitle}>5. Seus Direitos</Text>
              <Text style={styles.paragraph}>
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Você também pode se opor ao processamento de suas informações ou solicitar a portabilidade dos seus dados. Para exercer esses direitos, entre em contato conosco.
              </Text>

              <Text style={styles.sectionTitle}>6. Alterações nesta Política</Text>
              <Text style={styles.paragraph}>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas publicando a nova política nesta página e atualizando a data de "última atualização". Recomendamos que você revise esta política regularmente.
              </Text>

              <Text style={styles.sectionTitle}>7. Contato</Text>
              <Text style={styles.paragraph}>
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco através dos canais de atendimento disponíveis no aplicativo.
              </Text>
            </View>

            {/* Copyright */}
            <Text style={styles.copyright}>
              © 2025 Now 24 horas. Todos os direitos reservados.
            </Text>
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
    paddingHorizontal: spacing.lg, // 20px
    paddingTop: spacing.sm, // 8px
    paddingBottom: spacing.lg, // 20px
  },
  updateDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8px
    paddingBottom: spacing.md, // 16px
  },
  updateDateText: {
    fontSize: 14,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginBottom: spacing.md, // 16px
  },
  paragraph: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginBottom: spacing.md, // 16px
  },
  copyright: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginTop: spacing.md, // 16px
    paddingHorizontal: spacing.lg, // 20px
  },
});
