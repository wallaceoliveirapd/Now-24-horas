import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import { FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState, useRef, useEffect } from 'react';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';

export type SliderItemType = 'image' | 'gif' | 'lottie';

export interface SliderItem {
  id: string;
  type: SliderItemType;
  source: ImageSourcePropType | string | { uri: string } | any; // Para Lottie pode ser require() ou objeto
  title?: string;
  description?: string;
}

interface ImageSliderProps {
  items: SliderItem[];
  height?: number;
  showDots?: boolean;
  showText?: boolean;
  showDescription?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  style?: ViewStyle;
}

export function ImageSlider({
  items,
  height = 220,
  showDots = true,
  showText = true,
  showDescription = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  style
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const renderItem = ({ item, index }: { item: SliderItem; index: number }) => {
    const isActive = index === currentIndex;
    const hasText = showText && (item.title || item.description);
    const slideWidth = containerWidth > 0 ? containerWidth : 392; // Fallback width

    return (
      <View style={[styles.slide, { height, width: slideWidth }]}>
        {/* Media Content */}
        <View style={styles.mediaContainer}>
          {item.type === 'lottie' ? (
            <LottieView
              source={item.source}
              autoPlay={isActive}
              loop
              style={styles.media}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={typeof item.source === 'string' ? { uri: item.source } : item.source}
              style={styles.media}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Text Overlay with Gradient */}
        {hasText && (
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.9)']}
            locations={[0.575, 1]}
            style={styles.textGradient}
          >
            <View style={styles.textContainer}>
              {item.title && (
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
              )}
              {showDescription && item.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </LinearGradient>
        )}
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // AutoPlay functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1 || containerWidth === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        try {
          flatListRef.current?.scrollToOffset({
            offset: nextIndex * containerWidth,
            animated: true,
          });
        } catch (error) {
          // Ignore scroll errors
        }
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length, containerWidth]);

  return (
    <View 
      style={[styles.container, { height }, style]}
      onLayout={handleLayout}
    >
      {containerWidth > 0 && (
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
        />
      )}

      {/* Dots Indicator */}
      {showDots && items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.md, // 8px
    overflow: 'hidden',
    position: 'relative',
  },
  slide: {
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  textGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 90,
    paddingBottom: spacing.md, // 16px
    paddingHorizontal: spacing.md, // 16px
  },
  textContainer: {
    gap: spacing.xs, // 4px
  },
  title: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.white,
    lineHeight: 16.8, // 14px * 1.2
  },
  description: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontFamily: typography.sm.fontFamily,
    fontWeight: fontWeights.normal,
    color: colors.white,
  },
  dotsContainer: {
    position: 'absolute',
    top: spacing.sm, // 8px
    left: spacing.sm, // 8px
    right: spacing.sm, // 8px
    flexDirection: 'row',
    gap: spacing.xs, // 4px
    paddingHorizontal: spacing.sm, // 8px
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
  },
});

