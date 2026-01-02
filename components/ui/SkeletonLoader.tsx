import { View, StyleSheet, ViewStyle } from 'react-native';
import { Skeleton } from './Skeleton';
import { spacing, combineStyles } from '../../src/lib/styles';

interface SkeletonLoaderProps {
  type?: 'list' | 'card' | 'detail' | 'grid';
  itemCount?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  type = 'list',
  itemCount = 3,
  style
}: SkeletonLoaderProps) {
  const containerStyle = combineStyles(
    styles.container,
    style
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return (
          <View style={styles.listContainer}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <View key={index} style={styles.listItem}>
                <Skeleton variant="circular" width={50} height={50} />
                <View style={styles.listItemContent}>
                  <Skeleton width="80%" height={16} style={styles.listItemTitle} />
                  <Skeleton width="60%" height={14} />
                </View>
              </View>
            ))}
          </View>
        );

      case 'card':
        return (
          <View style={styles.cardContainer}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <View key={index} style={styles.card}>
                <Skeleton width="100%" height={150} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Skeleton width="90%" height={16} style={styles.cardTitle} />
                  <Skeleton width="70%" height={14} style={styles.cardSubtitle} />
                  <Skeleton width="50%" height={18} style={styles.cardPrice} />
                </View>
              </View>
            ))}
          </View>
        );

      case 'detail':
        return (
          <View style={styles.detailContainer}>
            <Skeleton width="100%" height={200} style={styles.detailImage} />
            <View style={styles.detailContent}>
              <Skeleton width="90%" height={24} style={styles.detailTitle} />
              <Skeleton width="100%" height={16} style={styles.detailText} />
              <Skeleton width="100%" height={16} style={styles.detailText} />
              <Skeleton width="80%" height={16} style={styles.detailText} />
              <View style={styles.detailSection}>
                <Skeleton width="60%" height={20} style={styles.detailSectionTitle} />
                <Skeleton width="100%" height={14} style={styles.detailText} />
                <Skeleton width="100%" height={14} style={styles.detailText} />
              </View>
            </View>
          </View>
        );

      case 'grid':
        return (
          <View style={styles.gridContainer}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <View key={index} style={styles.gridItem}>
                <Skeleton width="100%" height={100} style={styles.gridImage} />
                <Skeleton width="80%" height={14} style={styles.gridTitle} />
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={containerStyle}>
      {renderSkeleton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  listItemTitle: {
    marginBottom: spacing.xs,
  },
  cardContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardImage: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    gap: spacing.xs,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    marginBottom: spacing.xs,
  },
  cardPrice: {
    marginTop: spacing.xs,
  },
  detailContainer: {
    flex: 1,
  },
  detailImage: {
    marginBottom: spacing.lg,
  },
  detailContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailTitle: {
    marginBottom: spacing.sm,
  },
  detailText: {
    marginBottom: spacing.xs,
  },
  detailSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  detailSectionTitle: {
    marginBottom: spacing.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    gap: spacing.sm,
  },
  gridImage: {
    marginBottom: spacing.xs,
  },
  gridTitle: {
    alignSelf: 'center',
  },
});

