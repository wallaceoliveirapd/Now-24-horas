import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState } from '../../../components/ui';
import { colors } from '../../lib/styles';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NotFoundScreen() {
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
        edges={['top', 'bottom']}
      >
        <View style={styles.container}>
          <ErrorState
            type="not_found"
            title="Página não encontrada"
            description="A página que você está procurando não existe ou foi removida."
            actionLabel="Ir para o início"
            onAction={() => navigation.navigate('Home')}
          />
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
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

