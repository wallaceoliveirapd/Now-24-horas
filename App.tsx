import { useState, useEffect } from 'react';
import { AppNavigator } from './src/front/navigation/AppNavigator';
import { useAppFonts } from './src/hooks/useFonts';
import { CartProvider } from './src/contexts/CartContext';
import { AddressProvider } from './src/contexts/AddressContext';
import { PaymentCardProvider } from './src/contexts/PaymentCardContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SplashScreen } from './src/front/screens/SplashScreen';

// Componente interno que verifica se o AuthContext terminou de carregar
function AppContent() {
  const { loading: authLoading } = useAuth();
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false);

  // Minimum splash screen duration (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashTimePassed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar splash enquanto AuthContext está carregando ou tempo mínimo não passou
  if (authLoading || !minSplashTimePassed) {
    return <SplashScreen />;
  }

  return (
    <CartProvider>
      <AddressProvider>
        <PaymentCardProvider>
          <AppNavigator />
        </PaymentCardProvider>
      </AddressProvider>
    </CartProvider>
  );
}

export default function App() {
  const { fontsLoaded } = useAppFonts();

  // Mostrar splash enquanto fontes não carregaram
  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
