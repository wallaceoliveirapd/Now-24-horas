import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '../../lib/styles';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: 'https://lottie.host/8fc9e85e-7c83-4d07-87bf-78e750b1d74e/TwLHEnn3Bz.lottie' }}
        autoPlay
        loop={false}
        style={styles.animation}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '50%',
    height: '50%',
  },
});
