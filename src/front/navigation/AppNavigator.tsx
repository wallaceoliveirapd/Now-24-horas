import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useRef } from 'react';
import { Home } from '../screens/Home';
import { ComponentShowcase } from '../screens/ComponentShowcase';
import { Cart } from '../screens/Cart';
import { Cupons } from '../screens/Cupons';
import { Search } from '../screens/Search';
import { Checkout } from '../screens/Checkout';
import { OrderProcessing } from '../screens/OrderProcessing';
import { OrderConfirmation } from '../screens/OrderConfirmation';
import { OrderDetails } from '../screens/OrderDetails';
import { MyOrders } from '../screens/MyOrders';
import { Profile } from '../screens/Profile';
import { Addresses } from '../screens/Addresses';
import { PaymentMethods } from '../screens/PaymentMethods';
import { Favorites } from '../screens/Favorites';
import { Settings } from '../screens/Settings';
import { Languages } from '../screens/Languages';
import { TermsOfUse } from '../screens/TermsOfUse';
import { PrivacyPolicy } from '../screens/PrivacyPolicy';
import { ChangePassword } from '../screens/ChangePassword';
import { Help } from '../screens/Help';
import { EditProfile } from '../screens/EditProfile';
import { ProductDetails } from '../screens/ProductDetails';
import { ProductListScreen } from '../screens/ProductListScreen';
import { StoriesViewer } from '../screens/StoriesViewer';
import { Login } from '../screens/Login';
import { SignUp } from '../screens/SignUp';
import { VerifyOtp } from '../screens/VerifyOtp';
import { CompleteProfile } from '../screens/CompleteProfile';
import { Success } from '../screens/Success';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../lib/styles';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  VerifyOtp: {
    emailOuTelefone: string;
  };
  CompleteProfile: undefined;
  Success: undefined;
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: {
    categoryId?: string;
    focusInput?: boolean;
  };
  Checkout: undefined;
  OrderProcessing: {
    orderNumber: string;
    deliveryTime: string;
    totalPaid: number;
  };
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
  ProductDetails: {
    productId: string;
  };
  ProductList: {
    title: string;
    filterType?: 'offer' | 'popular' | 'category';
    categoryId?: string;
  };
  StoriesViewer: {
    stories: Array<{
      id: string;
      imageSource: any;
      title?: string;
      hasStory: boolean;
    }>;
    initialIndex?: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Componente interno para monitorar mudanças na autenticação
 * e navegar programaticamente quando necessário
 * 
 * IMPORTANTE: Só redireciona em casos específicos:
 * - Quando usuário faz LOGOUT (de autenticado para não autenticado)
 * - Quando usuário faz LOGIN COMPLETO (de não autenticado para autenticado)
 * 
 * NÃO redireciona durante fluxo de autenticação (OTP, registro, etc.)
 */
function NavigationHandler() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, loading } = useAuth();
  const prevAuthState = useRef<boolean | null>(null);
  const isInAuthFlow = useRef(false);

  // Telas de autenticação que não devem ser redirecionadas
  const authScreens = ['Login', 'SignUp', 'VerifyOtp', 'CompleteProfile', 'Success'];

  // Monitorar mudanças de navegação para detectar quando estamos em fluxo de autenticação
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      try {
        const state = e.data.state;
        if (state) {
          const route = state.routes[state.index];
          const routeName = route?.name;
          
          console.log('📍 NavigationHandler: Mudança de rota detectada:', routeName);
          
          if (routeName && authScreens.includes(routeName)) {
            console.log('🚫 NavigationHandler: Detectada navegação para tela de autenticação:', routeName);
            isInAuthFlow.current = true;
            // Resetar flag após um tempo maior para garantir que a navegação completou
            setTimeout(() => {
              console.log('🔄 NavigationHandler: Resetando flag de fluxo de autenticação');
              isInAuthFlow.current = false;
            }, 10000); // 10 segundos de proteção para OTP
          } else {
            // Se saiu de uma tela de autenticação, resetar flag após um tempo
            if (isInAuthFlow.current) {
              setTimeout(() => {
                console.log('🔄 NavigationHandler: Saindo de fluxo de autenticação');
                isInAuthFlow.current = false;
              }, 2000);
            }
          }
        }
      } catch (error) {
        // Ignorar erros
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Se estamos em fluxo de autenticação, não fazer nada
    if (isInAuthFlow.current) {
      console.log('🚫 NavigationHandler: Em fluxo de autenticação, ignorando');
      return;
    }

    // Só processar se não estiver carregando
    if (loading) {
      return;
    }

    // Verificar rota atual
    let currentRouteName: string | null = null;
    try {
      const currentRoute = navigation.getCurrentRoute();
      currentRouteName = currentRoute?.name || null;
    } catch (error) {
      // Ignorar erros
    }

    // Se está em uma tela de autenticação, NUNCA redirecionar
    if (currentRouteName && authScreens.includes(currentRouteName)) {
      console.log('🚫 NavigationHandler: Em tela de autenticação, ignorando');
      prevAuthState.current = isAuthenticated;
      return;
    }

    // Só redirecionar se o estado REALMENTE mudou (não é a primeira vez)
    if (prevAuthState.current !== null && prevAuthState.current !== isAuthenticated) {
      console.log('🔄 NavigationHandler: Estado mudou', {
        isAuthenticated,
        prevAuthState: prevAuthState.current,
        currentRoute: currentRouteName,
        isInAuthFlow: isInAuthFlow.current,
      });

      // Se estamos em fluxo de autenticação, não redirecionar
      if (isInAuthFlow.current) {
        console.log('🚫 NavigationHandler: Cancelando (em fluxo de autenticação)');
        prevAuthState.current = isAuthenticated;
        return;
      }

      // Usar setTimeout para dar tempo da navegação manual acontecer
      const timeoutId = setTimeout(() => {
        // Verificar novamente se ainda estamos em fluxo de autenticação
        if (isInAuthFlow.current) {
          console.log('🚫 NavigationHandler: Cancelando timeout (ainda em fluxo de autenticação)');
          prevAuthState.current = isAuthenticated;
          return;
        }

        // Verificar novamente a rota antes de redirecionar
        let routeName: string | null = null;
        try {
          const route = navigation.getCurrentRoute();
          routeName = route?.name || null;
          console.log('📍 NavigationHandler: Verificando rota antes de redirecionar:', routeName);
        } catch (error) {
          // Ignorar
        }

        // Se está em uma tela de autenticação, NUNCA redirecionar
        if (routeName && authScreens.includes(routeName)) {
          console.log('🚫 NavigationHandler: Cancelando (ainda em tela de autenticação):', routeName);
          prevAuthState.current = isAuthenticated;
          return;
        }

        // Só redirecionar em casos específicos:
        if (isAuthenticated && prevAuthState.current === false) {
          // Usuário acabou de fazer login COMPLETO (não OTP), navegar para Home
          // Mas só se não estiver em uma tela de autenticação
          console.log('✅ NavigationHandler: Login completo, navegando para Home');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else if (!isAuthenticated && prevAuthState.current === true) {
          // Usuário acabou de fazer LOGOUT REAL, navegar para Login
          console.log('🚪 NavigationHandler: Logout detectado, navegando para Login');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 1000); // Aumentar delay para dar mais tempo da navegação completar

      return () => clearTimeout(timeoutId);
    }
    
    // Atualizar estado anterior
    prevAuthState.current = isAuthenticated;
  }, [isAuthenticated, loading, navigation]);

  return null;
}

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <NavigationHandler />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
        <Stack.Screen name="Success" component={Success} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ComponentShowcase" component={ComponentShowcase} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Cupons" component={Cupons} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="OrderProcessing" component={OrderProcessing} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="MyOrders" component={MyOrders} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Addresses" component={Addresses} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Languages" component={Languages} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUse} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Help" component={Help} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen
          name="StoriesViewer"
          component={StoriesViewer}
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

