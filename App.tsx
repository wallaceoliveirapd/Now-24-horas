import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/front/navigation/AppNavigator';
import { useAppFonts } from './src/hooks/useFonts';
import { colors } from './src/lib/styles';
import { CartProvider } from './src/contexts/CartContext';

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
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}
