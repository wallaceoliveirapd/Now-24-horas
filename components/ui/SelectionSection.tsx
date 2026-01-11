import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { SelectionOption } from './SelectionOption';
import { Badge } from './Badge';

export interface SelectionOptionData {
  id: string;
  title: string;
  description?: string;
  price?: number; // em centavos
  quantity?: number; // quantidade padrão (para opções com quantidade)
}

interface SelectionSectionProps {
  id: string;
  title: string;
  options: SelectionOptionData[];
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  selectedIds?: string[];
  optionQuantities?: Record<string, number>; // quantidade por optionId
  onOptionSelect: (sectionId: string, optionId: string) => void;
  onQuantityChange?: (sectionId: string, optionId: string, quantity: number) => void;
  allowQuantity?: boolean;
  style?: ViewStyle;
}

export function SelectionSection({
  id,
  title,
  options,
  selectionType,
  isRequired,
  minSelection,
  maxSelection,
  selectedIds = [],
  optionQuantities = {},
  onOptionSelect,
  onQuantityChange,
  allowQuantity = false,
  style
}: SelectionSectionProps) {
  const containerStyle = combineStyles(styles.container, style);

  const handleOptionSelect = (optionId: string) => {
    onOptionSelect(id, optionId);
  };

  const handleQuantityChange = (optionId: string, quantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(id, optionId, quantity);
    }
  };

  // Determinar quais opções estão selecionadas
  const getSelectedIds = () => {
    if (selectionType === 'single') {
      // Single choice: apenas uma pode estar selecionada
      const selected = selectedIds.length > 0 ? [selectedIds[0]] : [];
      return selected;
    }
    // Multiple choice: várias podem estar selecionadas
    return selectedIds;
  };

  const currentSelectedIds = getSelectedIds();
  const selectedCount = currentSelectedIds.length;

  // Calcular badge text
  const getBadgeText = () => {
    if (selectionType === 'single') {
      if (isRequired) {
        return '1/1';
      }
      return selectedCount > 0 ? '1/1' : '0/1';
    } else {
      // Multiple choice
      if (minSelection !== undefined && maxSelection !== undefined) {
        return `${selectedCount}/${maxSelection}`;
      } else if (maxSelection !== undefined) {
        return `${selectedCount}/${maxSelection}`;
      } else {
        return selectedCount > 0 ? `${selectedCount}` : '';
      }
    }
  };

  const badgeText = getBadgeText();

  return (
    <View style={containerStyle}>
      {/* Section Title */}
      <View style={styles.titleContainer}>
        <View style={styles.titleContent}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.badgesContainer}>
            {badgeText && (
              <Badge
                label={badgeText}
                type="Default"
                style={styles.badge}
              />
            )}
            {isRequired && (
              <Badge
                label="Obrigatório"
                type="Primary"
                style={styles.badge}
              />
            )}
          </View>
        </View>
      </View>

      {/* Options List */}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = currentSelectedIds.includes(option.id);
          const quantity = optionQuantities[option.id] || option.quantity || 1;
          const showQuantity = allowQuantity && isSelected;

          return (
            <SelectionOption
              key={option.id}
              id={option.id}
              title={option.title}
              description={option.description}
              price={option.price}
              isSelected={isSelected}
              onSelect={handleOptionSelect}
              type={selectionType === 'single' ? 'radio' : 'checkbox'}
              showQuantity={showQuantity}
              quantity={quantity}
              onQuantityChange={showQuantity ? handleQuantityChange : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg + 4, // 20px
    paddingTop: 8,
    paddingBottom: spacing.lg + 4, // 20px
    flexDirection: 'column',
    gap: 0,
  },
  titleContainer: {
    width: '100%',
    paddingVertical: spacing.md, // 16px
  },
  titleContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.base,
    flex: 1,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  badge: {
    // Badge component já tem seus próprios estilos
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: spacing.sm,
  },
});

