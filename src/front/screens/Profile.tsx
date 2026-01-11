import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useRef } from 'react';
import { Button, ProfileHeader, ProfileStats, ProfileMenu, ProfileFooter } from '../../../components/ui';
import { colors, spacing } from '../../lib/styles';
import { MapPin, CreditCard, Heart, Settings, HelpCircle } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

type RootStackParamList = {
  Login: undefined;
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
  Help: undefined;
  EditProfile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  onPress?: () => void;
}

export function Profile() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Dados mockados do usuário
  const userData = {
    name: 'Nome do usuário',
    email: 'emaildousuario@exemplo.com',
    phone: '(99) 99999-9999',
    completedOrders: 23,
    totalSpent: 230494, // R$ 2.304,94 em centavos
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
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

  const menuItems: MenuItem[] = [
    {
      id: 'addresses',
      label: 'Endereços',
      icon: MapPin,
      badge: 3,
      onPress: () => {
        navigation.navigate('Addresses');
      },
    },
    {
      id: 'payment',
      label: 'Formas de pagamento',
      icon: CreditCard,
      onPress: () => {
        navigation.navigate('PaymentMethods');
      },
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      onPress: () => {
        navigation.navigate('Favorites');
      },
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      onPress: () => {
        navigation.navigate('Settings');
      },
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: HelpCircle,
      onPress: () => {
        navigation.navigate('Help');
      },
    },
  ];

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
        <View style={{ backgroundColor: colors.gray[50], flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Header Section */}
            <View 
              ref={headerRef}
              onLayout={handleHeaderLayout}
            >
              <ProfileHeader
                name={userData.name}
                email={userData.email}
                phone={userData.phone}
                onBackPress={() => navigation.goBack()}
                onEditPress={() => {
                  navigation.navigate('EditProfile');
                }}
              />
            </View>
            
            {/* Stats Cards */}
            <View style={styles.statsSection}>
              <ProfileStats
                completedOrders={userData.completedOrders}
                totalSpent={formatCurrency(userData.totalSpent)}
              />
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <ProfileMenu items={menuItems} />
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
              <Button
                title="Sair da conta"
                variant="outline"
                size="lg"
                onPress={() => {
                  logout();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }}
                style={styles.logoutButton}
              />
            </View>

            {/* Footer */}
            <ProfileFooter />
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
  statsSection: {
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    width: '100%',
  },
});
