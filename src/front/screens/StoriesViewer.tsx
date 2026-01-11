import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, StatusBar, PanResponder, GestureResponderEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type StoriesViewerRouteProp = RouteProp<RootStackParamList, 'StoriesViewer'>;

export interface StoryItem {
  id: string;
  imageSource: any;
  title?: string;
  hasStory: boolean;
}

interface HeartAnimation {
  id: string;
  translateY: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  x: number;
}

export function StoriesViewer() {
  const navigation = useNavigation();
  const route = useRoute<StoriesViewerRouteProp>();
  const { stories, initialIndex = 0 } = route.params;
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [hearts, setHearts] = useState<HeartAnimation[]>([]);
  const heartIdCounter = useRef(0);
  const lastTap = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = 100;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Swipe horizontal
          if (dx > swipeThreshold && currentIndex > 0) {
            // Swipe right - previous story
            handlePreviousStory();
          } else if (dx < -swipeThreshold) {
            // Swipe left - next story (ou fechar se for o último)
            handleNextStory();
          }
        } else {
          // Swipe vertical
          if (dy > swipeThreshold) {
            // Swipe down - close
            navigation.goBack();
          }
        }
      },
    })
  ).current;

  const handleStoryNavigation = useCallback((index: number) => {
    if (index >= 0 && index < stories.length) {
      setCurrentIndex(index);
    }
  }, [stories.length]);

  const handlePreviousStory = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const handleNextStory = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < stories.length - 1) {
        return prevIndex + 1;
      } else {
        // Fechar viewer quando chegar no final
        navigation.goBack();
        return prevIndex;
      }
    });
  }, [stories.length, navigation]);

  useEffect(() => {
    setIsLiked(false);
    
    // Limpar timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Criar novo timer de 15 segundos
    timerRef.current = setTimeout(() => {
      handleNextStory();
    }, 15000); // 15 segundos
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, handleNextStory]);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    // Create new heart animation on like
    const heartId = `heart-${heartIdCounter.current++}`;
    const translateY = new Animated.Value(SCREEN_HEIGHT * 0.6);
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(0);

    const newHeart: HeartAnimation = {
      id: heartId,
      translateY,
      opacity,
      scale,
      x: SCREEN_WIDTH * 0.5 + (Math.random() - 0.5) * 150, // Random x position around center
    };

    setHearts((prev) => [...prev, newHeart]);

    // Animate heart
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateY, {
        toValue: -200,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove heart after animation
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      handleLike();
    } else {
      lastTap.current = now;
    }
  };

  const currentStory = stories[currentIndex];

  if (!currentStory) {
    return null;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Story Image - below system bar with rounded corners */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={1}
          onPress={handleDoubleTap}
        >
          <Image
            source={currentStory.imageSource}
            style={styles.storyImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Overlay for top controls */}
        <View style={styles.topOverlay} />

        {/* Navigation Bar - Story Indicators (overlay on top) */}
        <View style={styles.navigationBar}>
          {stories.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              style={[
                styles.storyIndicator,
                index === currentIndex && styles.storyIndicatorActive,
              ]}
              onPress={() => handleStoryNavigation(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* Top Actions - Close Button (overlay on top) */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Navigation Areas - Left and Right (overlay) */}
        <TouchableOpacity
          style={styles.leftNavigationArea}
          onPress={handlePreviousStory}
          activeOpacity={0.9}
        />
        <TouchableOpacity
          style={styles.rightNavigationArea}
          onPress={handleNextStory}
          activeOpacity={0.9}
        />

        {/* Bottom Black Area (overlay) */}
        <View style={styles.bottomBlackArea}>
          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {/* Story Title */}
            {currentStory.title && (
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{currentStory.title}</Text>
              </View>
            )}

            {/* Like Button */}
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Heart
                size={24}
                color={colors.white}
                fill={isLiked ? colors.primary : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hearts Animation */}
        {hearts.map((heart) => (
          <Animated.View
            key={heart.id}
            style={[
              styles.heartAnimation,
              {
                left: heart.x - 24,
                transform: [
                  { translateY: heart.translateY },
                  { scale: heart.scale },
                ],
                opacity: heart.opacity,
              },
            ]}
          >
            <Heart size={48} color={colors.primary} fill={colors.primary} strokeWidth={2} />
          </Animated.View>
        ))}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.black,
  },
  imageContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    height: 80,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    zIndex: 8,
    pointerEvents: 'none',
  },
  navigationBar: {
    position: 'absolute',
    top: spacing.xs + 70, // Below system bar
    left: spacing.md + spacing.xs,
    right: spacing.md + spacing.xs,
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
    zIndex: 10,
  },
  storyIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  storyIndicatorActive: {
    backgroundColor: colors.white,
  },
  topActions: {
    position: 'absolute',
    top: spacing.xs + 100, // Below system bar
    right: spacing.md + spacing.xs,
    zIndex: 11,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftNavigationArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.33,
    zIndex: 5,
  },
  rightNavigationArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.33,
    zIndex: 5,
  },
  bottomBlackArea: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.black,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    zIndex: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartAnimation: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.6,
    zIndex: 20,
  },
});
