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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TermsOfUse() {
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
            title="Termos de uso"
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
              <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
              <Text style={styles.paragraph}>
                Ao acessar e usar o aplicativo Now 24 horas, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso serviço.
              </Text>

              <Text style={styles.sectionTitle}>2. Uso do Serviço</Text>
              <Text style={styles.paragraph}>
                O Now 24 horas é uma plataforma de delivery que permite aos usuários:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Navegar e buscar produtos disponíveis</Text>
                <Text style={styles.bulletItem}>• Fazer pedidos de produtos para entrega</Text>
                <Text style={styles.bulletItem}>• Acompanhar o status de seus pedidos em tempo real</Text>
                <Text style={styles.bulletItem}>• Gerenciar perfil, endereços e formas de pagamento</Text>
              </View>

              <Text style={styles.sectionTitle}>3. Cadastro e Conta</Text>
              <Text style={styles.paragraph}>
                Para usar determinadas funcionalidades do aplicativo, você precisa criar uma conta fornecendo informações precisas e completas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
              </Text>

              <Text style={styles.sectionTitle}>4. Pedidos e Pagamentos</Text>
              <Text style={styles.paragraph}>
                Ao fazer um pedido através do aplicativo:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Você se compromete a pagar o valor total do pedido</Text>
                <Text style={styles.bulletItem}>• Os preços estão sujeitos a alterações sem aviso prévio</Text>
                <Text style={styles.bulletItem}>• Reservamos o direito de recusar ou cancelar pedidos</Text>
                <Text style={styles.bulletItem}>• O pagamento será processado através dos métodos disponíveis</Text>
              </View>

              <Text style={styles.sectionTitle}>5. Cancelamento e Reembolso</Text>
              <Text style={styles.paragraph}>
                Pedidos podem ser cancelados antes do início do preparo. Após esse momento, o cancelamento está sujeito à aprovação do estabelecimento. Reembolsos serão processados de acordo com a política de cada estabelecimento e forma de pagamento utilizada.
              </Text>

              <Text style={styles.sectionTitle}>6. Entrega</Text>
              <Text style={styles.paragraph}>
                Os prazos de entrega são estimativas e podem variar devido a condições externas. Não nos responsabilizamos por atrasos causados por fatores fora de nosso controle, incluindo condições climáticas ou de trânsito.
              </Text>

              <Text style={styles.sectionTitle}>7. Propriedade Intelectual</Text>
              <Text style={styles.paragraph}>
                Todo o conteúdo do aplicativo, incluindo textos, gráficos, logotipos, ícones e imagens, é propriedade do Now 24 horas ou de seus fornecedores de conteúdo e está protegido por leis de propriedade intelectual.
              </Text>

              <Text style={styles.sectionTitle}>8. Conduta do Usuário</Text>
              <Text style={styles.paragraph}>
                Você concorda em não:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Usar o serviço para fins ilegais ou não autorizados</Text>
                <Text style={styles.bulletItem}>• Interferir ou interromper o funcionamento do serviço</Text>
                <Text style={styles.bulletItem}>• Transmitir vírus ou códigos maliciosos</Text>
                <Text style={styles.bulletItem}>• Coletar informações de outros usuários sem permissão</Text>
              </View>

              <Text style={styles.sectionTitle}>9. Limitação de Responsabilidade</Text>
              <Text style={styles.paragraph}>
                O Now 24 horas não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou da impossibilidade de uso do serviço. Isso inclui, mas não se limita a, perda de dados, lucros ou oportunidades de negócio.
              </Text>

              <Text style={styles.sectionTitle}>10. Modificações dos Termos</Text>
              <Text style={styles.paragraph}>
                Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no aplicativo. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
              </Text>

              <Text style={styles.sectionTitle}>11. Lei Aplicável</Text>
              <Text style={styles.paragraph}>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.
              </Text>

              <Text style={styles.sectionTitle}>12. Contato</Text>
              <Text style={styles.paragraph}>
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: contato@now24horas.com.br ou pelo telefone (83) 3333-4444.
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginBottom: spacing.md, // 16px
  },
  firstSectionTitle: {
    marginTop: 0,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginBottom: spacing.md, // 16px
  },
  bulletList: {
    paddingLeft: spacing.md, // 16px
    gap: spacing.xs, // 4px
  },
  bulletItem: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
  },
  copyright: {
    fontSize: 16,
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.black,
    lineHeight: 24, // 16px * 1.5
    marginTop: spacing.md, // 16px
  },
});
