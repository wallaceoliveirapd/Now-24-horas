import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { colors, spacing, typography, fontWeights } from '../../lib/styles';

type RootStackParamList = {
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
  [key: string]: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OrderProcessingRouteProp = RouteProp<RootStackParamList, 'OrderProcessing'>;

const MESSAGES = [
  'Estamos enviando seu pedido...',
  'Quase lá...',
  'Falta só um pouquinho...',
];

export function OrderProcessing() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderProcessingRouteProp>();
  const { orderNumber, deliveryTime, totalPaid } = route.params;

  const translateY1 = useRef(new Animated.Value(50)).current;
  const translateY2 = useRef(new Animated.Value(50)).current;
  const translateY3 = useRef(new Animated.Value(50)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação do primeiro texto - moveInUp
    Animated.parallel([
      Animated.timing(translateY1, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity1, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout1 = setTimeout(() => {
      // Após 1.5s, moveOutUp do primeiro e moveInUp do segundo
      Animated.parallel([
        Animated.timing(translateY1, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Segundo texto - moveInUp
      Animated.parallel([
        Animated.timing(translateY2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    const timeout2 = setTimeout(() => {
      // Após 3s, moveOutUp do segundo e moveInUp do terceiro
      Animated.parallel([
        Animated.timing(translateY2, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Terceiro texto - moveInUp
      Animated.parallel([
        Animated.timing(translateY3, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    const timeout3 = setTimeout(() => {
      // Após 4.5s, moveOutUp do terceiro e navegar
      Animated.parallel([
        Animated.timing(translateY3, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity3, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace('OrderConfirmation', {
          orderNumber,
          deliveryTime,
          totalPaid,
        });
      });
    }, 4500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [navigation, orderNumber, deliveryTime, totalPaid]);

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} translucent={false} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Messages Container */}
          <View style={styles.messagesContainer}>
            <Animated.View
              style={[
                styles.messageContainer,
                {
                  transform: [{ translateY: translateY1 }],
                  opacity: opacity1,
                },
              ]}
            >
              <Text style={styles.messageText}>{MESSAGES[0]}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.messageContainer,
                {
                  transform: [{ translateY: translateY2 }],
                  opacity: opacity2,
                },
              ]}
            >
              <Text style={styles.messageText}>{MESSAGES[1]}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.messageContainer,
                {
                  transform: [{ translateY: translateY3 }],
                  opacity: opacity3,
                },
              ]}
            >
              <Text style={styles.messageText}>{MESSAGES[2]}</Text>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl * 2, // 64px
    paddingHorizontal: spacing.lg + 4, // 20px
  },
  messagesContainer: {
    position: 'relative',
    minHeight: 150,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  messageText: {
    fontSize: 32,
    lineHeight: 32*1.2, // 24px * 1.2
    fontFamily: typography.base.fontFamily,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
});

