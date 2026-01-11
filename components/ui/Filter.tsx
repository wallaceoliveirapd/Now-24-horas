import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, fontWeights, combineStyles } from '../../src/lib/styles';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react-native';

interface FilterProps {
  label?: string;
  filterApplied?: string;
  state?: 'Default' | 'Applied';
  onPress?: () => void;
  onClose?: () => void;
  style?: ViewStyle;
}

export function Filter({
  label = 'Label',
  filterApplied,
  state = 'Default',
  onPress,
  onClose,
  style
}: FilterProps) {
  const isApplied = state === 'Applied';

  const containerStyle = combineStyles(
    styles.container,
    isApplied ? styles.containerApplied : styles.containerDefault,
    style
  );

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleClose = (e: any) => {
    if (e) {
      e.stopPropagation();
    }
    if (onClose) {
      onClose();
    }
  };

  const content = (
    <View style={styles.content}>
      {/* Filter Icon */}
      <SlidersHorizontal 
        size={8.167} 
        color={isApplied ? colors.black : colors.mutedForeground} 
        strokeWidth={2} 
      />

      {!isApplied ? (
        <>
          {/* Label */}
          <Text 
            style={styles.labelDefault} 
            numberOfLines={1}
          >
            {label}
          </Text>

          {/* Dropdown Icon */}
          <ChevronDown 
            size={8.167} 
            color={colors.mutedForeground} 
            strokeWidth={2} 
          />
        </>
      ) : (
        <>
          {/* Label (Semibold when applied) */}
          <Text 
            style={styles.labelApplied} 
            numberOfLines={1}
          >
            {label}
          </Text>

          {/* Filter Applied Text */}
          <Text 
            style={styles.filterAppliedText} 
            numberOfLines={1}
          >
            {filterApplied || ''}
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <X 
              size={14} 
              color={colors.mutedForeground} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (onPress || !isApplied) {
    return (
      <TouchableOpacity
        onPress={handlePress}
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
    backgroundColor: colors.gray[100], // #F9FAFB
    borderRadius: 999, // Fully rounded
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  containerDefault: {
    paddingHorizontal: 14, // 14px padding horizontal
  },
  containerApplied: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary, // #E61C61
    paddingLeft: 14, // 14px padding left
    paddingRight: 5, // 5px padding right
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // 6px gap between elements
  },
  labelDefault: {
    fontSize: 13,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground, // #787f8c
    fontFamily: typography.xs.fontFamily,
  },
  labelApplied: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.semibold,
    color: colors.black, // #020202
    fontFamily: typography.xs.fontFamily,
  },
  filterAppliedText: {
    fontSize: 12,
    lineHeight: 14.4, // 12px * 1.2
    fontWeight: fontWeights.normal,
    color: colors.black, // #020202
    fontFamily: typography.xs.fontFamily,
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 99, // Circular
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

