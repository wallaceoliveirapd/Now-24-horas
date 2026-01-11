import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/front/navigation/AppNavigator';
import { useAppFonts } from './src/hooks/useFonts';
import { colors } from './src/lib/styles';
import { CartProvider } from './src/contexts/CartContext';
import { AddressProvider } from './src/contexts/AddressContext';
import { PaymentCardProvider } from './src/contexts/PaymentCardContext';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  const { fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AddressProvider>
          <PaymentCardProvider>
            <AppNavigator />
          </PaymentCardProvider>
        </AddressProvider>
      </CartProvider>
    </AuthProvider>
  );
}
