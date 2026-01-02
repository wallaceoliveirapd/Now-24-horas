import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageTitle, Accordion } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { MessageCircle, Mail } from 'lucide-react-native';

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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WHATSAPP_NUMBER = '5583999999999'; // Número no formato internacional sem símbolos
const EMAIL = 'contato@now24horas.com.br';

const handleWhatsAppPress = () => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
  });
};

const handleEmailPress = () => {
  const url = `mailto:${EMAIL}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email');
  });
};

const faqData = [
  {
    question: 'Como faço um pedido?',
    answer: 'Para fazer um pedido, navegue pelos produtos na tela inicial, adicione os itens desejados ao carrinho e finalize o pedido na página de checkout. Você pode escolher o endereço de entrega e a forma de pagamento antes de confirmar.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartão de crédito, cartão de débito e PIX. Todos os pagamentos são processados de forma segura.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo de entrega varia conforme a região e pode ser consultado antes de finalizar o pedido. Geralmente, as entregas são realizadas em até 60 minutos nas áreas de cobertura.',
  },
  {
    question: 'Posso cancelar meu pedido?',
    answer: 'Sim, você pode cancelar seu pedido antes que ele comece a ser preparado. Após o início do preparo, o cancelamento está sujeito à aprovação do estabelecimento.',
  },
  {
    question: 'Como rastrear meu pedido?',
    answer: 'Você pode acompanhar o status do seu pedido em tempo real na seção "Meus Pedidos" do aplicativo. Também enviamos notificações sobre cada atualização do status.',
  },
  {
    question: 'O que fazer se meu pedido estiver errado?',
    answer: 'Entre em contato conosco imediatamente através do WhatsApp ou email. Vamos resolver o problema o mais rápido possível.',
  },
];

export function Help() {
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
            title="Ajuda"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Contact Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Entre em contato</Text>
              <Text style={styles.sectionDescription}>
                Estamos aqui para ajudar. Escolha a forma de contato preferida.
              </Text>

              <View style={styles.contactButtons}>
                {/* WhatsApp */}
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleWhatsAppPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactButtonIcon}>
                    <MessageCircle size={24} color={colors.white} strokeWidth={2} />
                  </View>
                  <View style={styles.contactButtonContent}>
                    <Text style={styles.contactButtonTitle}>WhatsApp</Text>
                    <Text style={styles.contactButtonSubtitle}>
                      (83) 99999-9999
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleEmailPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactButtonIcon, styles.contactButtonIconEmail]}>
                    <Mail size={24} color={colors.white} strokeWidth={2} />
                  </View>
                  <View style={styles.contactButtonContent}>
                    <Text style={styles.contactButtonTitle}>Email</Text>
                    <Text style={styles.contactButtonSubtitle}>
                      {EMAIL}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
              <Text style={styles.sectionDescription}>
                Encontre respostas para as dúvidas mais comuns.
              </Text>

              <View style={styles.faqContainer}>
                {faqData.map((faq, index) => (
                  <Accordion
                    key={index}
                    title={faq.question}
                    style={index > 0 ? styles.faqItem : undefined}
                  >
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </Accordion>
                ))}
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
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  contactButtons: {
    gap: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  contactButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonIconEmail: {
    backgroundColor: colors.gray[600],
  },
  contactButtonContent: {
    flex: 1,
    gap: spacing.xs,
  },
  contactButtonTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  contactButtonSubtitle: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  faqContainer: {
    gap: spacing.md,
  },
  faqItem: {
    marginTop: spacing.md,
  },
  faqAnswer: {
    ...typography.base,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24,
  },
});

