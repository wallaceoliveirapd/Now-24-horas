import { useFonts } from 'expo-font';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'Instrument Sans': InstrumentSans_400Regular,
    'Instrument Sans_400': InstrumentSans_400Regular,
    'Instrument Sans_500': InstrumentSans_500Medium,
    'InstrumentSans_600': InstrumentSans_600SemiBold,
    'Instrument Sans_700': InstrumentSans_700Bold,
  });

  return { fontsLoaded, fontError };
}

