import { View, StyleSheet, ViewStyle, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { colors, combineStyles } from '../../src/lib/styles';

interface StoryProps {
  hasStory?: boolean;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Story({
  hasStory = true,
  imageSource,
  onPress,
  style
}: StoryProps) {
  const containerStyle = combineStyles(
    styles.container,
    hasStory ? styles.containerWithStory : styles.containerWithoutStory,
    style
  );

  const content = (
    <View style={styles.imageWrapper}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={containerStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    borderRadius: 999, // Fully circular
    borderWidth: 3,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerWithStory: {
    borderColor: colors.primary, // #E61C61
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1, // 10%
    shadowRadius: 20,
    elevation: 8, // Android shadow
  },
  containerWithoutStory: {
    borderColor: '#e8e9ea', // Gray border when no story
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 999, // Fully circular
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
});

