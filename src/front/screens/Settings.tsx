import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { 
  PageTitle,
  Switch,
  Badge,
  Button
} from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { 
  Bell,
  Moon,
  Globe,
  Shield,
  Code,
  ChevronRight
} from 'lucide-react-native';

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

export function Settings() {
  const navigation = useNavigation<NavigationProp>();
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(true);

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
            title="Configurações"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Notificações Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bell size={20} color={colors.primary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Notificações</Text>
              </View>
              
              <View style={styles.sectionContent}>
                {/* Atualizações de pedido */}
                <View style={styles.settingItem}>
                  <View style={styles.settingItemContent}>
                    <Text style={styles.settingItemTitle}>Atualizações de pedido</Text>
                    <Text style={styles.settingItemDescription}>
                      Receba notificações sobre seus pedidos
                    </Text>
                  </View>
                  <Switch
                    value={orderUpdatesEnabled}
                    onValueChange={setOrderUpdatesEnabled}
                  />
                </View>

                {/* Promoções e ofertas */}
                <View style={styles.settingItem}>
                  <View style={styles.settingItemContent}>
                    <Text style={styles.settingItemTitle}>Promoções e ofertas</Text>
                    <Text style={styles.settingItemDescription}>
                      Receba ofertas especiais
                    </Text>
                  </View>
                  <Switch
                    value={promotionsEnabled}
                    onValueChange={setPromotionsEnabled}
                  />
                </View>
              </View>
            </View>

            {/* Aparência Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Moon size={20} color={colors.primary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Aparência</Text>
              </View>
              
              <View style={styles.sectionContent}>
                {/* Modo escuro */}
                <View style={styles.settingItem}>
                  <View style={styles.settingItemContent}>
                    <Text style={[styles.settingItemTitle, styles.settingItemTitleDisabled]}>
                      Modo escuro
                    </Text>
                    <Text style={[styles.settingItemDescription, styles.settingItemDescriptionDisabled]}>
                      Tema escuro para o aplicativo
                    </Text>
                  </View>
                  <View style={styles.settingItemRight}>
                    <Badge
                      label="Em desenvolvimento"
                      type="Default"
                    />
                    <Switch
                      value={false}
                      disabled={true}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Idioma Section */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.section}
              onPress={() => navigation.navigate('Languages')}
            >
              <View style={styles.sectionHeader}>
                <Globe size={20} color={colors.primary} strokeWidth={2} />
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.sectionTitle}>Idioma</Text>
                  <Text style={styles.sectionSubtitle}>Português (Brasil)</Text>
                </View>
                <View style={styles.sectionHeaderRight}>
                  <ChevronRight size={24} color={colors.black} strokeWidth={2} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Privacidade e segurança Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={20} color={colors.primary} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Privacidade e segurança</Text>
              </View>
              
              <View style={styles.sectionSecurity}>
                {/* Termos de uso */}
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('TermsOfUse')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemText}>Termos de uso</Text>
                  <ChevronRight size={24} color={colors.black} strokeWidth={2} />
                </TouchableOpacity>

                {/* Política de privacidade */}
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemText}>Política de privacidade</Text>
                  <ChevronRight size={24} color={colors.black} strokeWidth={2} />
                </TouchableOpacity>

                {/* Alterar senha */}
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigation.navigate('ChangePassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuItemText}>Alterar senha</Text>
                  <ChevronRight size={24} color={colors.black} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Desenvolvido pela Evoke Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Code size={20} color={colors.primary} strokeWidth={2} />
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.sectionTitle}>Desenvolvido pela Evoke</Text>
                  <Text style={styles.sectionSubtitle}>V1.0.0</Text>
                </View>
              </View>
              
              <View style={styles.sectionContent}>
                <TouchableOpacity style={styles.updateButton}>
                  <Text style={styles.updateButtonText}>Verificar atualização</Text>
                </TouchableOpacity>
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
  section: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm, // 8px
    paddingBottom: spacing.lg, // 20px
    paddingHorizontal: spacing.lg, // 20px
    marginBottom: spacing.xs + 4, // 8px gap between sections
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8px
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: 0,
  },
  sectionHeaderContent: {
    flex: 1,
    gap: spacing.xs, // 4px
  },
  sectionHeaderRight: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 22.4, // 18px * 1.2 (16px font but 18px lineHeight in design)
  },
  sectionSubtitle: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 19.6, // 14px * 1.4
  },
  sectionContent: {
    gap: spacing.lg + 2, // 18px gap between items
  },
  sectionSecurity: {
    gap: spacing.sm, // 18px gap between items
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 16px
  },
  settingItemContent: {
    flex: 1,
    gap: 2,
  },
  settingItemTitle: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16,
  },
  settingItemTitleDisabled: {
    opacity: 0.4,
  },
  settingItemDescription: {
    fontSize: 12,
    lineHeight: 15.6, // 12px * 1.3
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
  },
  settingItemDescriptionDisabled: {
    opacity: 0.4,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8px between badge and switch
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2, // 10px
    paddingHorizontal: 0,
  },
  menuItemText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16,
  },
  updateButton: {
    padding: spacing.md, // 16px
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    lineHeight: 19.2, // 16px * 1.2
  },
});

