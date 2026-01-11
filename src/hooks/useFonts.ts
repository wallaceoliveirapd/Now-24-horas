import { useFonts } from 'expo-font';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'Geist': Geist_400Regular,
    'Geist_400': Geist_400Regular,
    'Geist_500': Geist_500Medium,
    'Geist_600': Geist_600SemiBold,
    'Geist_700': Geist_700Bold,
  });

  return { fontsLoaded, fontError };
}

