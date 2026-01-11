import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';

type RootStackParamList = {
  Success: undefined;
  Home: undefined;
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function Success() {
  const navigation = useNavigation<NavigationProp>();
  const [autoNavigate, setAutoNavigate] = useState(true);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Animações de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-navegação após 3 segundos
  useEffect(() => {
    if (autoNavigate) {
      const timer = setTimeout(() => {
        navigation.navigate('Home');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [autoNavigate, navigation]);

  const handleGoFaster = () => {
    setAutoNavigate(false);
    
    // Animação do botão
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Home');
    });
  };

  return (
    <>
      <StatusBar 
        style="light"
        backgroundColor={colors.green[700]}
        translucent={false}
      />
      <SafeAreaView 
        style={styles.safeArea}
        edges={['top', 'bottom']}
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Check Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <CheckCircle2 size={80} color={colors.white} strokeWidth={2} />
            </Animated.View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Uhu! Deu tudo certo!
              </Text>
              <Text style={styles.description}>
                Você está cadastrado! Estamos te levando para a página inicial.
              </Text>
            </View>

            {/* Button */}
            <Animated.View 
              style={[
                styles.buttonContainer,
                {
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={handleGoFaster}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>
                  Clique aqui para ir mais rápido
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.green[700],
  },
  container: {
    flex: 1,
    padding: spacing.xl * 2, // 64px
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg, // 24px
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    gap: 14, // 14px gap conforme Figma
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32, // 32px conforme Figma
    lineHeight: 40,
    fontFamily: typography['3xl'].fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  description: {
    ...typography.sm, // 14px conforme Figma
    fontWeight: fontWeights.normal,
    color: colors.white,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.sm, // 8px gap conforme Figma
  },
  button: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: borderRadius.md, // 8px conforme Figma
    padding: spacing.md, // 16px conforme Figma
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    ...typography.base, // 16px conforme Figma
    fontWeight: fontWeights.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});

