import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductDetailHeaderProps {
  imageSource?: ImageSourcePropType;
  onBackPress: () => void;
  style?: ViewStyle;
}

export function ProductDetailHeader({
  imageSource,
  onBackPress,
  style
}: ProductDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const containerStyle = combineStyles(styles.container, style);

  return (
    <View style={containerStyle}>
      {/* Product Image - faz parte do scroll */}
      <View style={styles.imageContainer}>
        <View style={styles.imageInnerContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        {/* Linear Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
          locations={[0.499, 0.982]}
          style={styles.gradient}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: colors.gray[50], // #F9FAFB
    position: 'relative',
  },
  imageInnerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[50],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[50],
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});
