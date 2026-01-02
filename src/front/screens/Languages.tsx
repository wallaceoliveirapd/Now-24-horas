import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { PageTitle } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { CircleCheck, ChevronRight } from 'lucide-react-native';

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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Language = {
  id: string;
  flag: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  {
    id: 'pt-BR',
    flag: '🇧🇷',
    name: 'Português (Brasil)',
    nativeName: 'Portuguese (Brazil)',
  },
  {
    id: 'en-US',
    flag: '🇺🇸',
    name: 'Inglês (Estados Unidos)',
    nativeName: 'English (United States)',
  },
  {
    id: 'es',
    flag: '🇪🇸',
    name: 'Espanhol',
    nativeName: 'Spanish',
  },
];

export function Languages() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('pt-BR');

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
            title="Idiomas"
            showCounter={false}
            onBackPress={() => navigation.goBack()}
          />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              {/* Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Selecione o idioma do aplicartivo
                </Text>
              </View>

              {/* Languages List */}
              <View style={styles.languagesList}>
                {languages.map((language) => {
                  const isSelected = language.id === selectedLanguageId;
                  return (
                    <TouchableOpacity
                      key={language.id}
                      style={[
                        styles.languageItem,
                        isSelected && styles.languageItemSelected,
                      ]}
                      onPress={() => setSelectedLanguageId(language.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.languageItemContent}>
                        <View style={styles.languageFlagContainer}>
                          <Text style={styles.languageFlag}>{language.flag}</Text>
                        </View>
                        <View style={styles.languageTextContent}>
                          <Text style={styles.languageName}>
                            {language.name}
                          </Text>
                          <Text style={styles.languageNativeName}>
                            {language.nativeName}
                          </Text>
                        </View>
                      </View>
                      {isSelected ? (
                        <CircleCheck size={24} color={colors.primary} strokeWidth={2} />
                      ) : (
                        <ChevronRight size={24} color={colors.black} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
  },
  sectionHeader: {
    paddingVertical: spacing.md, // 16px
    paddingHorizontal: 0,
  },
  sectionTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 18, // 16px font, 18px lineHeight
  },
  languagesList: {
    gap: spacing.md, // 16px gap between items
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md - 2, // 14px
    borderRadius: borderRadius.md, // 8px
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: colors.white,
  },
  languageItemSelected: {
    backgroundColor: 'rgba(230, 28, 97, 0.06)',
    borderColor: colors.primary,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8px
    flex: 1,
  },
  languageFlagContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageFlag: {
    fontSize: 24,
    lineHeight: 24,
  },
  languageTextContent: {
    flex: 1,
    gap: spacing.xs, // 4px
  },
  languageName: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 16,
  },
  languageNativeName: {
    ...typography.xs,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
});

