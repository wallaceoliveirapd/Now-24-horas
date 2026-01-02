import { View, StyleSheet, ViewStyle, ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import { spacing, combineStyles } from '../../src/lib/styles';
import { CategoryCard } from './CategoryCard';

export interface CategoryItem {
  label: string;
  discountValue?: string;
  discountType?: 'currency' | 'percentage';
  type?: 'Default' | 'Discount';
  iconSource?: ImageSourcePropType;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  columns?: number;
  style?: ViewStyle;
}

export function CategoryGrid({ 
  categories,
  columns = 4,
  style
}: CategoryGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Calcular largura de cada card
  // (largura total - (espaçamento entre cards * (colunas - 1))) / colunas
  const cardWidth = containerWidth > 0
    ? Math.floor((containerWidth - (spacing.md * (columns - 1))) / columns)
    : undefined;

  const gridStyle = combineStyles(
    styles.grid,
    style
  );

  return (
    <View 
      style={gridStyle}
      onLayout={handleLayout}
    >
      {categories.map((category, index) => {
        const isLastInRow = (index + 1) % columns === 0;
        const totalRows = Math.ceil(categories.length / columns);
        const currentRow = Math.floor(index / columns) + 1;
        const isLastRow = currentRow === totalRows;
        
        return (
          <View
            key={index}
            style={[
              styles.cardWrapper,
              cardWidth && cardWidth > 0 && { width: cardWidth },
              !isLastInRow && styles.cardMarginRight,
              !isLastRow && styles.cardMarginBottom,
            ]}
          >
            <CategoryCard
              label={category.label}
              discountValue={category.discountValue}
              discountType={category.discountType}
              type={category.type}
              iconSource={category.iconSource}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    // Wrapper para aplicar margin sem afetar o CategoryCard
  },
  cardMarginRight: {
    marginRight: spacing.md,
  },
  cardMarginBottom: {
    marginBottom: spacing.md,
  },
});

