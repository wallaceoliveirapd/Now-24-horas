import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { spacing, combineStyles } from '../../src/lib/styles';
import { CategoryCard } from './CategoryCard';
import type { CategoryItem } from './CategoryGrid';

interface CategoryListProps {
  categories: CategoryItem[];
  onCategoryPress?: (categoryId: string, category: CategoryItem) => void;
  style?: ViewStyle;
}

export function CategoryList({ 
  categories,
  onCategoryPress,
  style
}: CategoryListProps) {
  const listStyle = combineStyles(
    styles.list,
    style
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={listStyle}
      decelerationRate="normal"
      scrollEventThrottle={16}
    >
      {categories.map((category, index) => (
        <View
          key={category.id || index}
          style={[
            styles.categoryWrapper,
            index < categories.length - 1 && styles.categoryMarginRight,
          ]}
        >
          <CategoryCard
            label={category.label}
            discountValue={category.discountValue}
            discountType={category.discountType}
            type={category.type}
            iconSource={category.iconSource}
            onPress={category.id && onCategoryPress ? () => onCategoryPress(category.id!, category) : undefined}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryWrapper: {
    width: 86, // Largura fixa para cada categoria conforme design (mesma do CategoryCard)
  },
  categoryMarginRight: {
    marginRight: 12, // 12px gap conforme design do Figma
  },
});

