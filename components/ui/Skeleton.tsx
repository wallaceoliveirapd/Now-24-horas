import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors, spacing, borderRadius, combineStyles } from '../../src/lib/styles';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius,
  style,
  variant = 'rectangular'
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;
    switch (variant) {
      case 'circular':
        return height / 2;
      case 'text':
        return borderRadius.sm;
      default:
        return borderRadius.md;
    }
  };

  const skeletonStyle = combineStyles(
    styles.skeleton,
    {
      width,
      height,
      borderRadius: getBorderRadius(),
    },
    style
  );

  return (
    <Animated.View style={[skeletonStyle, { opacity }]} />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[300],
  },
});

